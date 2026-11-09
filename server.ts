import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { requireAuth } from './src/middleware/auth.ts';
import type { AuthRequest } from './src/middleware/auth.ts';
import {
  getUserTuningProfiles,
  createTuningProfile,
  deleteTuningProfile,
  getVoiceSessions,
  recordVoiceSession,
} from './src/db/queries.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI Client (Server-side Only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// REST API Endpoints

// 1. User Sync check
app.post('/api/auth/sync', requireAuth, (req: AuthRequest, res) => {
  res.json({
    success: true,
    user: req.dbUser,
  });
});

// 2. Fetch User's Cloud SQL Saved Tuning Profiles
app.get('/api/profiles', requireAuth, async (req: AuthRequest, res) => {
  try {
    const dbUserId = req.dbUser!.id;
    const profiles = await getUserTuningProfiles(dbUserId);
    res.json({ success: true, profiles });
  } catch (error: any) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch profiles' });
  }
});

// 3. Save a new Tuning Profile to Cloud SQL
app.post('/api/profiles', requireAuth, async (req: AuthRequest, res) => {
  try {
    const dbUserId = req.dbUser!.id;
    const {
      title,
      socId,
      zramGb,
      cpuGovernor,
      gpuGovernor,
      driver,
      tcpCongestion,
      isFavorite,
      notes,
      stateSnapshot,
    } = req.body;

    if (!title || !socId) {
      return res.status(400).json({ error: 'Title and SoC ID are required' });
    }

    const newProfile = await createTuningProfile({
      userId: dbUserId,
      title,
      socId,
      zramGb: Number(zramGb) || 8,
      cpuGovernor: cpuGovernor || 'performance',
      gpuGovernor: gpuGovernor || 'performance',
      driver: driver || 'mesa_turnip',
      tcpCongestion: tcpCongestion || 'bbr',
      isFavorite: Boolean(isFavorite),
      notes,
      stateSnapshot,
    });

    res.json({ success: true, profile: newProfile });
  } catch (error: any) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: error.message || 'Failed to save profile' });
  }
});

// 4. Delete Profile from Cloud SQL
app.delete('/api/profiles/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const dbUserId = req.dbUser!.id;
    const profileId = parseInt(req.params.id, 10);
    const deleted = await deleteTuningProfile(profileId, dbUserId);
    res.json({ success: true, deleted });
  } catch (error: any) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: error.message || 'Failed to delete profile' });
  }
});

// 5. Get Saved Voice Logs
app.get('/api/voice-logs', requireAuth, async (req: AuthRequest, res) => {
  try {
    const dbUserId = req.dbUser!.id;
    const sessions = await getVoiceSessions(dbUserId);
    res.json({ success: true, sessions });
  } catch (error: any) {
    console.error('Error fetching voice logs:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch voice logs' });
  }
});

// 6. Save a Voice Log Session
app.post('/api/voice-logs', requireAuth, async (req: AuthRequest, res) => {
  try {
    const dbUserId = req.dbUser!.id;
    const { title, transcriptSummary, messagesCount, audioTurns } = req.body;
    const logged = await recordVoiceSession({
      userId: dbUserId,
      title: title || 'Titan Voice Session',
      transcriptSummary,
      messagesCount: messagesCount || 0,
      audioTurns,
    });
    res.json({ success: true, session: logged });
  } catch (error: any) {
    console.error('Error saving voice log:', error);
    res.status(500).json({ error: error.message || 'Failed to record voice session' });
  }
});

// 7. Text-based fallback Gemini Tuning Intelligence
app.post('/api/gemini/advisor', async (req, res) => {
  try {
    const { socName, gameTitle, currentFps, targetFps, batteryTemp } = req.body;
    const prompt = `You are Titan, an advanced silicon hardware warfare AI and kernel overclocking engine.
The user is playing "${gameTitle || 'an intensive 3D mobile game'}" on "${socName || 'Snapdragon 8 Gen 3'}".
Current FPS: ${currentFps || '48 FPS'} (Target: ${targetFps || '120 FPS'}).
Battery Temperature: ${batteryTemp || '38.5°C'}.

Provide a tactical 3-bullet hardware optimization directive advising on:
1. Virtual VRAM / zRAM allocation (4GB-16GB LZ4 swap).
2. CPU/GPU governor and clock policy (performance, schedutil, thermal limit bypass).
3. Graphics driver selection (Vulkan Turnip vs System Proprietary Adreno/Mali) and thermal dissipation.
Keep it punchy, militaristic/cybernetic, authoritative, and concise.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are Titan, the silicon overdrive AI engine for mobile gaming hardware.',
      },
    });

    res.json({ advice: response.text });
  } catch (error: any) {
    console.error('Gemini advisor error:', error);
    res.status(500).json({ error: error.message || 'Gemini advisor failure' });
  }
});

// 8. Audio Transcription endpoint using gemini-3.5-transcribe
app.post('/api/gemini/transcribe', async (req, res) => {
  try {
    const { audioData, mimeType, prompt } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'Missing audioData (base64 string required)' });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audioData,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: prompt || 'Transcribe this audio precisely. Return only the verbatim transcription text.' },
        ],
      },
    });

    res.json({
      success: true,
      transcript: response.text || '',
    });
  } catch (error: any) {
    console.error('Audio transcription error:', error);
    res.status(500).json({ error: error.message || 'Audio transcription failed' });
  }
});

// WebSocket Server for Gemini 3.8 Live API Voice Conversations (Titan Voice)
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
  if (pathname === '/live' || pathname === '/api/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[Titan Live] Client connected to Titan Voice WebSocket');
  let liveSession: any = null;

  try {
    liveSession = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          // Voice: Fenrir or Zephyr provides an assertive, futuristic, beefy presence for Titan
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } },
        },
        systemInstruction: `You are Titan, the tactical, authoritative, and futuristic Silicon Overdrive & Kernel Warfare AI voice engine for TITAN X: HYPERFORGE.
Your role:
- You speak authoritatively, concisely, and with high-tech military/cybernetic precision.
- You provide real-time hardware diagnostics, advice on CPU/GPU governors, 8GB VRAM expansion, Adreno/Mali Vulkan drivers, thermal throttling, and game performance.
- When the user asks to boost their device, analyze games like Genshin Impact, Warzone Mobile, PUBG, or COD Mobile, or ask about hardware overclocking, guide them directly.
- Keep spoken responses punchy (1 to 3 short sentences) because voice bandwidth is real-time.
- Your name is TITAN.`,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
      callbacks: {
        onmessage: (message: any) => {
          if (clientWs.readyState !== WebSocket.OPEN) return;

          // Forward model audio chunks (24kHz PCM)
          for (const part of message.serverContent?.modelTurn?.parts ?? []) {
            if (part.inlineData?.data) {
              clientWs.send(
                JSON.stringify({
                  type: 'audio',
                  audio: part.inlineData.data,
                })
              );
            }
            if (part.text) {
              clientWs.send(
                JSON.stringify({
                  type: 'transcript',
                  text: part.text,
                })
              );
            }
          }

          // Forward user/model transcription if available
          if (message.serverContent?.inputTranscription?.text) {
            clientWs.send(
              JSON.stringify({
                type: 'inputTranscript',
                text: message.serverContent.inputTranscription.text,
              })
            );
          }
          if (message.serverContent?.outputTranscription?.text) {
            clientWs.send(
              JSON.stringify({
                type: 'outputTranscript',
                text: message.serverContent.outputTranscription.text,
              })
            );
          }

          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }
        },
      },
    });

    clientWs.send(JSON.stringify({ type: 'connected', message: 'Titan Voice Core Online.' }));
  } catch (err: any) {
    console.error('[Titan Live] Session connection error:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: 'error',
          error: err.message || 'Failed to connect to Titan Live Voice Core',
        })
      );
    }
  }

  clientWs.on('message', (data: Buffer | string) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'audio' && msg.audio && liveSession) {
        liveSession.sendRealtimeInput({
          audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' },
        });
      } else if (msg.type === 'text' && msg.text && liveSession) {
        liveSession.sendRealtimeInput({
          text: msg.text,
        });
      }
    } catch (e) {
      console.error('[Titan Live] Error processing incoming client audio frame:', e);
    }
  });

  clientWs.on('close', () => {
    console.log('[Titan Live] Client disconnected');
    if (liveSession) {
      try {
        liveSession.close();
      } catch (e) {
        // ignore
      }
    }
  });
});

// Vite Middleware Integration for Development / Production
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }
}

const PORT = process.env.PORT || 3000;

setupVite().then(() => {
  server.listen(PORT, () => {
    console.log(`[TITAN X] Server online on http://0.0.0.0:${PORT}`);
  });
});
