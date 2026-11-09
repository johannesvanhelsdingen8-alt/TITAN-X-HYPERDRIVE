import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  Check,
  Trash2,
  Bookmark,
  Share2,
  RefreshCw,
  Cpu,
  Zap,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TunerState, SocProfile } from '../types/tuner';

interface CloudSqlProfilesManagerProps {
  currentSoc: SocProfile;
  currentState: TunerState;
  onLoadProfile: (state: Partial<TunerState>, socId: string) => void;
}

export const CloudSqlProfilesManager: React.FC<CloudSqlProfilesManagerProps> = ({
  currentSoc,
  currentState,
  onLoadProfile,
}) => {
  const { user, token, signInWithGoogle } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [voiceLogs, setVoiceLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'profiles' | 'voice_logs'>('profiles');

  const fetchProfiles = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/profiles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.profiles) {
        setProfiles(data.profiles);
      }
    } catch (e) {
      console.error('Failed to fetch profiles:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoiceLogs = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/voice-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.sessions) {
        setVoiceLogs(data.sessions);
      }
    } catch (e) {
      console.error('Failed to fetch voice logs:', e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfiles();
      fetchVoiceLogs();
    }
  }, [token]);

  const handleSaveCurrentProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: saveTitle || `${currentSoc.name} Overdrive Profile`,
          socId: currentSoc.id,
          zramGb: currentState.zramExpansionGb,
          cpuGovernor: currentState.cpuGovernor,
          gpuGovernor: currentState.gpuGovernor,
          driver: currentState.selectedDriver,
          tcpCongestion: currentState.tcpCongestion,
          notes: saveNotes,
          stateSnapshot: currentState,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setSaveTitle('');
        setSaveNotes('');
        setTimeout(() => setSaveSuccess(false), 2500);
        fetchProfiles();
      }
    } catch (e) {
      console.error('Save failed:', e);
    }
  };

  const handleDeleteProfile = async (id: number) => {
    if (!token) return;
    try {
      await fetch(`/api/profiles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProfiles();
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center space-y-4 max-w-xl mx-auto">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <Database className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-white">Cloud SQL PostgreSQL Database Persistence</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sign in with Google using Firebase Authentication to store, query, and synchronize your Titan hardware profiles and Titan voice sessions across all your mobile and desktop devices.
          </p>
        </div>
        <button
          onClick={signInWithGoogle}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs mx-auto transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
        >
          <Shield className="h-4 w-4" />
          <span>Sign In with Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and User Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Cloud SQL Data Hub</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                POSTGRESQL · EUROPE-WEST1
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Connected as <strong className="text-slate-200">{user.email}</strong>
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'profiles' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hardware Profiles ({profiles.length})
          </button>
          <button
            onClick={() => setActiveTab('voice_logs')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'voice_logs' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Titan Voice Sessions ({voiceLogs.length})
          </button>
        </div>
      </div>

      {activeTab === 'profiles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Save current configuration to Cloud SQL */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-emerald-400" />
                <span>Save Active Setup to Cloud SQL</span>
              </h4>
            </div>

            <form onSubmit={handleSaveCurrentProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Profile Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Warzone 120 FPS Ultra Boost"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Notes &amp; Game Target</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Locked performance governor, 8GB zRAM, Mesa Turnip driver"
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="text-slate-400 font-bold">Snapshot Details:</div>
                <div>SoC: <span className="text-emerald-400">{currentSoc.name}</span></div>
                <div>Virtual VRAM: <span className="text-indigo-400">{currentState.zramExpansionGb}GB</span></div>
                <div>CPU: <span className="text-cyan-400">{currentState.cpuGovernor}</span> · GPU: <span className="text-cyan-400">{currentState.gpuGovernor}</span></div>
                <div>Driver: <span className="text-amber-400">{currentState.selectedDriver}</span></div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                {saveSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Saved to PostgreSQL!</span>
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    <span>Commit Profile to Cloud SQL</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right List: Saved Profiles in PostgreSQL */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Cloud className="h-4 w-4 text-cyan-400" />
                <span>Persisted Hardware Profiles ({profiles.length})</span>
              </h4>
              <button
                onClick={fetchProfiles}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {profiles.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-mono">
                No profiles saved yet in Cloud SQL. Save your first configuration using the form on the left.
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[380px] no-scrollbar">
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/70 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{p.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {p.socId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {p.zramGb}GB VRAM · CPU: {p.cpuGovernor} · GPU: {p.gpuGovernor} · Driver: {p.driver}
                      </p>
                      {p.notes && <p className="text-xs text-slate-300 italic">{p.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onLoadProfile(
                            {
                              zramExpansionGb: p.zramGb,
                              cpuGovernor: p.cpuGovernor,
                              gpuGovernor: p.gpuGovernor,
                              selectedDriver: p.driver,
                              tcpCongestion: p.tcpCongestion,
                            },
                            p.socId
                          );
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <span>Apply</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(p.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'voice_logs' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Persisted Titan Live Voice Logs ({voiceLogs.length})
            </h4>
            <button
              onClick={fetchVoiceLogs}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {voiceLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-mono">
              No voice sessions logged yet. Head to the "Titan Voice" tab and tap "Log to PostgreSQL" during or after your conversation!
            </div>
          ) : (
            <div className="space-y-3">
              {voiceLogs.map((vl) => (
                <div key={vl.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{vl.title}</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(vl.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {vl.transcriptSummary || 'Voice session audio logged.'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
