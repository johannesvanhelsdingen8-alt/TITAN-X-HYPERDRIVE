import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Cpu,
  Zap,
  Terminal,
  Activity,
  Shield,
  Layers,
  MessageSquare,
  AlertCircle,
  Database,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SocProfile, TunerState } from '../types/tuner';
import { AudioTranscriber } from './AudioTranscriber';

interface TitanVoicePanelProps {
  soc: SocProfile;
  state: TunerState;
  onApplyProfileChanges?: (updates: Partial<TunerState>) => void;
}

interface TranscriptTurn {
  sender: 'user' | 'titan';
  text: string;
  timestamp: string;
}

export const TitanVoicePanel: React.FC<TitanVoicePanelProps> = ({ soc, state, onApplyProfileChanges }) => {
  const { user, token, signInWithGoogle } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Voice Core: Standby');
  const [transcripts, setTranscripts] = useState<TranscriptTurn[]>([
    {
      sender: 'titan',
      text: 'TITAN voice synthesis core standing by. Tap "Engage Titan Voice" to initialize real-time audio uplink with Gemini 3.8 Live.',
      timestamp: 'SYSTEM READY',
    },
  ]);
  const [advisorAdvice, setAdvisorAdvice] = useState<string | null>(null);
  const [isAdvising, setIsAdvising] = useState(false);
  const [savedSessionStatus, setSavedSessionStatus] = useState<string | null>(null);

  // Audio Context & WebSocket Refs
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const isMutedRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Convert Float32Array to 16kHz PCM Int16 Base64
  const pcmToBase64 = (channelData: Float32Array): string => {
    const pcm16 = new Int16Array(channelData.length);
    for (let i = 0; i < channelData.length; i++) {
      const s = Math.max(-1, Math.min(1, channelData[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const uint8 = new Uint8Array(pcm16.buffer);
    let binary = '';
    for (let i = 0; i < uint8.byteLength; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    return btoa(binary);
  };

  // Playback 24kHz PCM Audio from Gemini Live API
  const playAudioChunk = (audioCtx: AudioContext, base64Pcm: string) => {
    try {
      const binary = atob(base64Pcm);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const buffer = audioCtx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);

      const currentTime = audioCtx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;
      setIsTalking(true);

      source.onended = () => {
        if (audioCtx.currentTime >= nextStartTimeRef.current - 0.05) {
          setIsTalking(false);
        }
      };
    } catch (e) {
      console.error('Audio chunk playback failure:', e);
    }
  };

  const startVoiceSession = async () => {
    try {
      setStatusMessage('Connecting to Titan Core...');
      
      // Initialize Audio Contexts
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      const outputCtx = new AudioCtx({ sampleRate: 24000 });
      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      // Connect WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        setIsConnected(true);
        setStatusMessage('Titan Live Uplink: Online (Gemini 3.8 Live)');

        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
        mediaStreamRef.current = stream;

        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(inputCtx.destination);

        processor.onaudioprocess = (e) => {
          if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          
          // Calculate mic volume level for visualizer
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += Math.abs(inputData[i]);
          }
          const avg = sum / inputData.length;
          setVolumeLevel(Math.min(100, Math.round(avg * 400)));

          // Send 16kHz PCM audio chunk to backend WebSocket
          const base64 = pcmToBase64(inputData);
          ws.send(JSON.stringify({ type: 'audio', audio: base64 }));
        };
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'audio' && msg.audio && outputAudioCtxRef.current) {
            playAudioChunk(outputAudioCtxRef.current, msg.audio);
          } else if (msg.type === 'transcript') {
            setTranscripts((prev) => [
              ...prev,
              { sender: 'titan', text: msg.text, timestamp: new Date().toLocaleTimeString() },
            ]);
          } else if (msg.type === 'outputTranscript') {
            setTranscripts((prev) => [
              ...prev,
              { sender: 'titan', text: msg.text, timestamp: new Date().toLocaleTimeString() },
            ]);
          } else if (msg.type === 'inputTranscript') {
            setTranscripts((prev) => [
              ...prev,
              { sender: 'user', text: msg.text, timestamp: new Date().toLocaleTimeString() },
            ]);
          } else if (msg.type === 'interrupted') {
            setIsTalking(false);
            nextStartTimeRef.current = outputAudioCtxRef.current?.currentTime || 0;
          }
        } catch (e) {
          console.error('Error handling WebSocket message:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket Error:', e);
        setStatusMessage('Connection interrupted. Check backend status.');
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsTalking(false);
        setStatusMessage('Voice Core: Offline');
        cleanupAudio();
      };
    } catch (err: any) {
      console.error('Failed to engage Titan Voice:', err);
      setStatusMessage(`Error: ${err.message || 'Microphone or Server error'}`);
      cleanupAudio();
    }
  };

  const cleanupAudio = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsTalking(false);
    setVolumeLevel(0);
  };

  const stopVoiceSession = () => {
    cleanupAudio();
    setStatusMessage('Titan Voice Disengaged.');
  };

  const requestQuickAdvisorDirective = async () => {
    setIsAdvising(true);
    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          socName: soc.name,
          gameTitle: 'Competitive Warfare / High-FPS Benchmark',
          currentFps: `${state.targetRefreshRate || 120} FPS (Target)`,
          targetFps: '120 FPS Overdrive',
          batteryTemp: '37.8°C',
        }),
      });
      const data = await res.json();
      setAdvisorAdvice(data.advice || 'Silicon diagnostics ready.');
    } catch (e: any) {
      setAdvisorAdvice('Titan Advisor: Failed to retrieve real-time directives from server.');
    } finally {
      setIsAdvising(false);
    }
  };

  const saveSessionToCloudSql = async () => {
    if (!token) {
      alert('Please sign in with Google to persist your voice session logs to Cloud SQL.');
      return;
    }
    try {
      setSavedSessionStatus('Saving to Cloud SQL...');
      const summary = transcripts
        .map((t) => `${t.sender.toUpperCase()}: ${t.text}`)
        .slice(-6)
        .join('\n');

      const res = await fetch('/api/voice-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Titan Diagnostic (${soc.name}) - ${new Date().toLocaleTimeString()}`,
          transcriptSummary: summary,
          messagesCount: transcripts.length,
          audioTurns: transcripts,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSessionStatus('Saved to PostgreSQL Cloud SQL!');
        setTimeout(() => setSavedSessionStatus(null), 3000);
      }
    } catch (e) {
      setSavedSessionStatus('Save failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Cyberpunk Voice Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {/* Holographic AI Voice Orb */}
            <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-950 shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <img
                src="/src/assets/images/titan_voice_orb_1794258841456.jpg"
                alt="Titan AI Voice Core"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {isConnected && (
                <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                  GEMINI 3.8 LIVE · FULL-DUPLEX SPEECH
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                <span>TITAN VOICE ASSISTANT</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Real-time conversational voice assistant with sub-second latency. Speak naturally to query hardware thermals, adjust CPU/GPU governors, allocate 8GB virtual VRAM, and boost gaming FPS.
              </p>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {!isConnected ? (
              <button
                onClick={startVoiceSession}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer"
              >
                <Mic className="h-5 w-5" />
                <span>ENGAGE TITAN VOICE</span>
              </button>
            ) : (
              <button
                onClick={stopVoiceSession}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer"
              >
                <MicOff className="h-5 w-5" />
                <span>DISCONNECT VOICE</span>
              </button>
            )}

            {isConnected && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`flex items-center gap-2 px-4 py-3.5 rounded-xl border font-bold text-xs transition-colors cursor-pointer ${
                  isMuted
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span>{isMuted ? 'UNMUTE MIC' : 'MUTE MIC'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time Status Waveform & Indicator */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full ${
                isConnected ? (isTalking ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400') : 'bg-slate-600'
              }`}
            />
            <span className="text-slate-300 font-semibold">{statusMessage}</span>
          </div>

          {/* Audio Visualizer Waves */}
          {isConnected && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-2">Mic Input</span>
              {[20, 50, 80, 40, 90, 60, 30, 70, 40].map((height, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-emerald-400 transition-all duration-75"
                  style={{
                    height: `${Math.max(4, Math.min(24, (volumeLevel / 100) * height))}px`,
                    opacity: volumeLevel > 5 ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-slate-400">
            <span>Audio Spec: 16kHz In / 24kHz Out</span>
            <span>Latency: &lt;450ms</span>
          </div>
        </div>
      </div>

      {/* Grid: Live Dialogue Console & Tactical Directives */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Real-time Transcript Console */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col h-[480px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Speech Telemetry &amp; Transcripts
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <button
                  onClick={saveSessionToCloudSql}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-all cursor-pointer"
                >
                  <Database className="h-3.5 w-3.5" />
                  <span>{savedSessionStatus || 'Log to PostgreSQL'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Transcript Feed */}
          <div className="flex-1 overflow-y-auto space-y-3 p-3 my-2 no-scrollbar">
            {transcripts.map((t, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs leading-relaxed max-w-[85%] ${
                  t.sender === 'titan'
                    ? 'bg-slate-950/80 border-emerald-500/30 text-slate-200 mr-auto shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 ml-auto'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] font-mono font-bold">
                  <span className={t.sender === 'titan' ? 'text-emerald-400' : 'text-cyan-400'}>
                    {t.sender === 'titan' ? '⚡ TITAN CORE' : '👤 PILOT'}
                  </span>
                  <span className="text-slate-500">{t.timestamp}</span>
                </div>
                <p>{t.text}</p>
              </div>
            ))}
          </div>

          {/* Spoken Prompts Guide */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-slate-400 font-mono">Suggested commands:</span>
            {[
              '"Titan, optimize my phone for Warzone Mobile"',
              '"Allocate 8GB virtual VRAM and set governor to performance"',
              '"What is the optimal Vulkan driver for Adreno 750?"',
            ].map((cmd, i) => (
              <button
                key={i}
                onClick={() => {
                  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({ type: 'text', text: cmd.replace(/"/g, '') }));
                    setTranscripts((prev) => [
                      ...prev,
                      { sender: 'user', text: cmd.replace(/"/g, ''), timestamp: new Date().toLocaleTimeString() },
                    ]);
                  } else {
                    alert('Please engage Titan Voice first!');
                  }
                }}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono transition-colors cursor-pointer"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Tactical Directives & Quick Advisor */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Hardware Directive Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Titan Tactical Advisor
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                AI CO-PILOT
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Generate an immediate 3-bullet hardware overclocking directive for <strong className="text-white">{soc.name}</strong> calibrated against current thermals and memory limits.
            </p>

            <button
              onClick={requestQuickAdvisorDirective}
              disabled={isAdvising}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition-all cursor-pointer"
            >
              <Cpu className="h-4 w-4" />
              <span>{isAdvising ? 'Synthesizing Directives...' : 'Analyze Hardware with Titan'}</span>
            </button>

            {advisorAdvice && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed animate-in fade-in duration-200">
                {advisorAdvice}
              </div>
            )}
          </div>

          {/* Cloud SQL Persistence Status */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase font-mono">
              <Database className="h-4 w-4 text-cyan-400" />
              <span>Cloud SQL + Auth Sync</span>
            </div>

            {user ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Authenticated: {user.displayName || user.email}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                  All tuning profiles and voice telemetry automatically persist to Cloud SQL (PostgreSQL europe-west1).
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-slate-400 leading-relaxed">
                  Sign in with Google to synchronize your Titan tuning profiles and voice transcripts across your devices.
                </p>
                <button
                  onClick={signInWithGoogle}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Shield className="h-4 w-4" />
                  <span>Sign In with Google</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dedicated Audio Transcription Section (gemini-3.5-transcribe) */}
      <AudioTranscriber
        onApplyTranscriptionToNotes={(text) => {
          setTranscripts((prev) => [
            ...prev,
            { sender: 'user', text: `[Transcribed Audio]: ${text}`, timestamp: new Date().toLocaleTimeString() },
          ]);
        }}
      />
    </div>
  );
};
