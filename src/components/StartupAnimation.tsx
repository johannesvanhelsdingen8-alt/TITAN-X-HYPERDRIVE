import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TitanBrandLogo } from './TitanBrandLogo';
import { Terminal, Zap, FastForward } from 'lucide-react';
import { titanAudio } from '../services/titanAudio';

interface StartupAnimationProps {
  onComplete: () => void;
  targetDeviceName?: string;
}

export const StartupAnimation: React.FC<StartupAnimationProps> = ({
  onComplete,
  targetDeviceName = 'Snapdragon 8 Gen 3',
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  const bootLogs = [
    { text: 'Probing ARM64 Linux Kernel & CPU Core Clusters...', latency: '0.10s' },
    { text: 'Mounting Direct Sysfs Interface (/sys/devices/system/cpu)...', latency: '0.32s' },
    { text: `Negotiating Superuser Root Privileges on ${targetDeviceName}...`, latency: '0.65s' },
    { text: 'Allocating 8GB Compressed zRAM Virtual VRAM Block (/dev/block/zram0)...', latency: '0.98s' },
    { text: 'Injecting Mesa Turnip Vulkan 1.3 & Adreno Direct HAL...', latency: '1.30s' },
    { text: 'Synchronizing Gemini 3.8 Live Voice Core & Cloud SQL Database...', latency: '1.65s' },
    { text: 'Engaging TCP BBR Low-Latency Congestion Control Algorithm...', latency: '1.95s' },
    { text: 'TITAN-X HYPERFORGE WORKSTATION READY.', latency: '2.20s' },
  ];

  useEffect(() => {
    const totalDuration = 2200; // 2.2s boot animation
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      setProgress(pct);

      const step = Math.min(
        bootLogs.length - 1,
        Math.floor((elapsed / totalDuration) * bootLogs.length)
      );
      setCurrentStepIdx(step);

      if (elapsed >= totalDuration) {
        clearInterval(interval);
        titanAudio.playBoostLaunch();
        setTimeout(onComplete, 300);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black p-6 sm:p-10 select-none titan-cyber-bg overflow-hidden"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-950/30 rounded-full blur-[110px] pointer-events-none" />

      {/* Top Header Row with Skip Button */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <Terminal className="h-4 w-4 text-teal-400" />
          <span className="uppercase tracking-wider text-slate-300">TITAN X: HYPERFORGE BIOS v4.2 // KERNEL RUNTIME</span>
        </div>

        <button
          onClick={() => {
            titanAudio.playSelect();
            onComplete();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-950/80 bg-slate-950 text-xs text-slate-300 hover:text-teal-300 hover:border-teal-500/50 transition-colors cursor-pointer"
        >
          <span>Skip</span>
          <FastForward className="h-3.5 w-3.5 text-teal-400" />
        </button>
      </div>

      {/* Center Stage: Logo Assembly & Pulse */}
      <div className="flex flex-col items-center justify-center space-y-6 z-10 my-auto">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Animated Halo Rings */}
          <div className="absolute -inset-4 rounded-2xl border border-teal-500/20 animate-ping opacity-25" />
          <div className="absolute -inset-8 rounded-2xl border border-emerald-500/10 animate-pulse opacity-40" />

          {/* Titan Crest */}
          <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-2xl border border-teal-500/60 bg-black/95 backdrop-blur-xl shadow-[0_0_55px_rgba(20,184,166,0.4)] overflow-hidden">
            <TitanBrandLogo size={96} showText={false} />
          </div>
        </motion.div>

        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2"
          >
            <span>TITAN X</span>
            <span className="text-teal-300 text-lg sm:text-xl font-black px-2.5 py-0.5 rounded bg-teal-500/20 border border-teal-400/50 tracking-widest shadow-[0_0_12px_rgba(20,184,166,0.3)]">
              HYPERFORGE
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-xs font-mono tracking-widest text-teal-400 uppercase font-semibold"
          >
            Silicon Warfare &amp; Hardware Optimization Workstation
          </motion.p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-64 sm:w-80 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">System Initialization</span>
            <span className="text-teal-400 font-bold tabular-nums">{progress}%</span>
          </div>

          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-teal-950">
            <motion.div
              className="h-full bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 shadow-[0_0_14px_rgba(20,184,166,0.9)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Terminal Boot Output */}
      <div className="w-full max-w-2xl rounded-xl border border-teal-950/80 bg-black/85 backdrop-blur-xl p-4 font-mono text-xs z-10 space-y-1.5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-teal-950/90 pb-2 mb-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Zap className="h-3 w-3 text-teal-400" />
            Kernel Initialization Stream
          </span>
          <span className="text-teal-400 font-bold">STAGE {currentStepIdx + 1} / {bootLogs.length}</span>
        </div>

        <div className="space-y-1 h-16 overflow-hidden">
          {bootLogs.slice(Math.max(0, currentStepIdx - 2), currentStepIdx + 1).map((log, idx) => (
            <div key={idx} className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-2 truncate">
                <span className="text-teal-400 font-bold">[ OK ]</span>
                <span className="truncate">{log.text}</span>
              </span>
              <span className="text-slate-500 tabular-nums shrink-0 ml-2">{log.latency}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
