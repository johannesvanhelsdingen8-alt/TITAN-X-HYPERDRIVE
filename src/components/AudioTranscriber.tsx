import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Sparkles,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  AlertCircle,
  Database,
  ArrowRight,
  Send,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AudioTranscriberProps {
  onApplyTranscriptionToNotes?: (text: string) => void;
}

export const AudioTranscriber: React.FC<AudioTranscriberProps> = ({ onApplyTranscriptionToNotes }) => {
  const { user, token } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setErrorMsg(null);
      setTranscript('');
      setAudioUrl(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      });

      // Prefer audio/webm or audio/mp4 depending on browser
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else {
          mimeType = '';
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const actualMime = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMime });
        const localUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localUrl);

        // Convert Blob to base64 and transcribe
        await handleTranscribeBlob(audioBlob, actualMime);

        // Stop all microphone tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250); // Record in 250ms time slices
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Failed to start microphone recording:', err);
      setErrorMsg(err.message || 'Microphone access denied. Please grant permission.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleTranscribeBlob = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setErrorMsg(null);
    try {
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          // Strip data url prefix (e.g. data:audio/webm;base64,)
          const base64Data = res.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;

      const response = await fetch('/api/gemini/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64Data,
          mimeType: mimeType.split(';')[0] || 'audio/webm',
          prompt: 'Transcribe this spoken audio word for word into clean, punctuation-accurate text.',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Transcription failed');
      }

      setTranscript(data.transcript);
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMsg(err.message || 'Failed to transcribe audio. Verify your Gemini API credentials.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopyTranscript = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleSaveToCloudSql = async () => {
    if (!token) {
      alert('Please sign in with Google to persist your audio transcriptions to Cloud SQL.');
      return;
    }
    if (!transcript) return;

    try {
      setSaveStatus('Saving to Cloud SQL...');
      const res = await fetch('/api/voice-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Audio Transcription (${new Date().toLocaleTimeString()})`,
          transcriptSummary: transcript,
          messagesCount: 1,
          audioTurns: [{ sender: 'user', text: transcript, timestamp: new Date().toLocaleTimeString() }],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('Saved to PostgreSQL!');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (e) {
      setSaveStatus('Save failed');
    }
  };

  return (
    <div className="rounded-2xl border-2 border-emerald-500/30 bg-slate-900/90 p-6 space-y-6 shadow-[0_0_35px_rgba(16,185,129,0.12)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              MODEL: GEMINI-3.5-TRANSCRIBE · MIC AUDIO INGEST
            </span>
          </div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Speech-to-Text Audio Transcriber</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Record spoken hardware logs, benchmark notes, or gaming feedback directly through your microphone. The audio is transcribed server-side with <strong className="text-emerald-400">gemini-3.5-transcribe</strong>.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isTranscribing}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer disabled:opacity-50"
            >
              <Mic className="h-4 w-4" />
              <span>RECORD MIC AUDIO</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer animate-pulse"
            >
              <Square className="h-4 w-4" />
              <span>STOP RECORDING ({formatSeconds(recordingSeconds)})</span>
            </button>
          )}
        </div>
      </div>

      {/* Recording Visual / Error Banner */}
      {isRecording && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/20 flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
            <div className="text-xs font-mono text-red-200">
              <strong className="text-red-400 font-bold uppercase mr-2">Recording Live:</strong>
              Speak clearly into your microphone... ({formatSeconds(recordingSeconds)})
            </div>
          </div>
          <button
            onClick={stopRecording}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Finish &amp; Transcribe
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-950/30 flex items-center gap-3 text-xs text-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Transcription Status & Audio Player */}
      {isTranscribing && (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/80 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
          <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            Transcribing with gemini-3.5-transcribe...
          </div>
          <p className="text-[11px] text-slate-400 max-w-sm text-center">
            Extracting phonetic acoustic patterns and converting spoken speech into verbatim text.
          </p>
        </div>
      )}

      {/* Completed Transcript View */}
      {transcript && !isTranscribing && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase font-mono">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span>Transcribed Speech Result</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyTranscript}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>

              {user && (
                <button
                  onClick={handleSaveToCloudSql}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Database className="h-3.5 w-3.5" />
                  <span>{saveStatus || 'Save to Cloud SQL'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-500/30 bg-slate-950 text-slate-100 text-sm leading-relaxed font-mono whitespace-pre-wrap select-text">
            {transcript}
          </div>

          {audioUrl && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <span className="text-slate-400 font-mono">Recorded Audio Playback:</span>
              <audio controls src={audioUrl} className="h-7 max-w-xs" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
