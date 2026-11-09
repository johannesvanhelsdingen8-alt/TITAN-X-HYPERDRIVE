import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, RotateCcw, Volume2, VolumeX, BatteryCharging, LogIn, LogOut, User, Terminal } from 'lucide-react';
import { TitanBrandLogo } from './TitanBrandLogo';
import { titanAudio } from '../services/titanAudio';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenExport: () => void;
  onReplayStartup?: () => void;
  batteryPct?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  onReplayStartup,
  batteryPct = 84,
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const { user, signInWithGoogle, logout } = useAuth();

  const navItems = [
    { id: 'games', label: 'Games & Apps' },
    { id: 'titan_voice', label: 'Titan Voice' },
    { id: 'cloud_sql', label: 'Cloud SQL DB' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'overclock', label: 'Overclock' },
    { id: 'vram', label: '8GB VRAM' },
    { id: 'drivers', label: 'Drivers' },
    { id: 'display', label: 'Display' },
    { id: 'network', label: 'Network' },
    { id: 'benchmark', label: 'Benchmark' },
    { id: 'copywriting', label: 'Copywriting' },
  ];

  const handleTabClick = (tabId: string) => {
    titanAudio.playSelect();
    setActiveTab(tabId);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    titanAudio.soundEnabled = next;
    if (next) titanAudio.playSelect();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-teal-950/80 bg-black/95 backdrop-blur-2xl select-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Titan Brand Lockup */}
        <div className="flex items-center gap-4 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleTabClick('games');
            }}
            className="flex items-center gap-3 text-slate-100 hover:text-teal-300 transition-colors group cursor-pointer"
            title="TITAN X: HYPERFORGE Workstation"
          >
            <TitanBrandLogo size={38} showText={true} />
          </a>
        </div>

        {/* Zone 2: Proprietary Cyber Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs font-semibold">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`relative whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'text-teal-200 font-bold bg-teal-950/70 border border-teal-500/60 shadow-[0_0_14px_rgba(20,184,166,0.35)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="titanActiveTab"
                    className="absolute -bottom-1 left-2 right-2 h-0.5 bg-teal-400 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.9)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Quick Settings & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Cyber SFX Audio Toggle */}
          <button
            onClick={toggleSound}
            title={soundOn ? 'Cyber SFX: Active' : 'Cyber SFX: Muted'}
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-teal-300 hover:border-teal-500/40 transition-colors cursor-pointer"
          >
            {soundOn ? <Volume2 className="h-3.5 w-3.5 text-teal-400" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>

          {/* Battery Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-teal-950/80 bg-slate-950 text-xs font-mono text-slate-300">
            <BatteryCharging className="h-3.5 w-3.5 text-teal-400" />
            <span className="tabular-nums font-bold text-teal-300">{batteryPct}%</span>
          </div>

          {/* Replay Startup Sequence */}
          {onReplayStartup && (
            <button
              onClick={() => {
                titanAudio.playSelect();
                onReplayStartup();
              }}
              title="Re-run Hyperforge Boot Sequence"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-teal-300 hover:border-teal-500/40 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Boot Demo</span>
            </button>
          )}

          {/* User Sign-In / Account */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-teal-500/40 bg-teal-950/30 text-xs font-mono text-teal-300">
                <User className="h-3.5 w-3.5 text-teal-400" />
                <span className="truncate max-w-[100px]">{user.displayName || user.email?.split('@')[0]}</span>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 rounded-lg border border-teal-500/40 bg-slate-900/80 hover:bg-teal-950/40 px-2.5 py-1.5 text-xs font-bold text-teal-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogIn className="h-3.5 w-3.5 text-teal-400" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Primary CTA: Export APK / Install on Phone */}
          <button
            onClick={() => {
              titanAudio.playSelect();
              onOpenExport();
            }}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-[0_0_18px_rgba(20,184,166,0.45)] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Install APK</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Row */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-800/80 px-4 py-2 gap-2 text-xs font-medium no-scrollbar bg-black/90">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === item.id
                ? 'bg-teal-950/80 text-teal-200 font-bold border border-teal-500/60 shadow-[0_0_10px_rgba(20,184,166,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
