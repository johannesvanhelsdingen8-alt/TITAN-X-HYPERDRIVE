import React from 'react';
import { SocProfile, TunerState } from '../types/tuner';
import { Smartphone, ShieldCheck, Flame, Cpu, Sliders } from 'lucide-react';

interface DeviceSelectorProps {
  socProfiles: SocProfile[];
  currentSoc: SocProfile;
  state: TunerState;
  onSelectSoc: (socId: string) => void;
  onUpdateState: (partial: Partial<TunerState>) => void;
  onApplyProfile: (profile: 'gaming' | 'balanced' | 'powersave') => void;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  socProfiles,
  currentSoc,
  state,
  onSelectSoc,
  onUpdateState,
  onApplyProfile,
}) => {
  return (
    <div className="rounded-xl border border-teal-950/80 bg-black/85 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_4px_25px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(20,184,166,0.1)]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Device & SoC Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-950/60 text-teal-400 border border-teal-500/40 shadow-[0_0_14px_rgba(20,184,166,0.25)]">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Target Hardware SoC</div>
              <select
                value={state.selectedSocId}
                onChange={(e) => onSelectSoc(e.target.value)}
                className="mt-0.5 rounded-lg border border-teal-900/60 bg-slate-950/90 px-3 py-1.5 text-sm font-semibold text-teal-200 focus:border-teal-400 focus:shadow-[0_0_12px_rgba(20,184,166,0.3)] focus:outline-none cursor-pointer"
              >
                {socProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.gpuModel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Root Privilege Manager */}
          <div className="flex items-center gap-2 sm:border-l sm:border-teal-950 sm:pl-4">
            <ShieldCheck className="h-4 w-4 text-teal-400 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400">Root Framework: </span>
              <select
                value={state.rootMode}
                onChange={(e) => onUpdateState({ rootMode: e.target.value as TunerState['rootMode'] })}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer hover:text-teal-300 transition-colors"
              >
                <option value="magisk" className="bg-slate-950 text-slate-200">Magisk v27+</option>
                <option value="kernelsu" className="bg-slate-950 text-slate-200">KernelSU (KSU)</option>
                <option value="apatch" className="bg-slate-950 text-slate-200">APatch (KernelPatch)</option>
                <option value="unrooted_demo" className="bg-slate-950 text-slate-200">Interactive Demo Mode</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Quick Tuning Profiles */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Tuning Preset:</span>
          <button
            onClick={() => onApplyProfile('gaming')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
              state.cpuGovernor === 'performance' && state.bypassGpuThrottling
                ? 'bg-rose-500/90 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] border border-rose-400'
                : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-teal-500/30'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-amber-300" />
            <span>Gaming Ultra</span>
          </button>

          <button
            onClick={() => onApplyProfile('balanced')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
              state.cpuGovernor === 'schedutil' && !state.bypassGpuThrottling
                ? 'bg-teal-600/90 text-slate-950 font-bold shadow-[0_0_15px_rgba(20,184,166,0.45)] border border-teal-400'
                : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-teal-500/30'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Balanced</span>
          </button>

          <button
            onClick={() => onApplyProfile('powersave')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
              state.cpuGovernor === 'powersave'
                ? 'bg-amber-600/90 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-400'
                : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-teal-500/30'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Battery Saver</span>
          </button>
        </div>
      </div>

      {/* Hardware Spec Strip */}
      <div className="mt-4 pt-3 border-t border-teal-950/80 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
        <div>
          <span className="text-slate-500">Architecture: </span>
          <span className="text-slate-200 font-medium">{currentSoc.cpuArchitecture}</span>
        </div>
        <div>
          <span className="text-slate-500">GPU Core: </span>
          <span className="text-slate-200 font-medium">{currentSoc.gpuModel}</span>
        </div>
        <div>
          <span className="text-slate-500">Base Clock: </span>
          <span className="text-teal-300 font-mono font-medium">{currentSoc.defaultCpuClock} MHz</span>
        </div>
        <div>
          <span className="text-slate-500">Overclock Ceiling: </span>
          <span className="text-teal-400 font-mono font-medium drop-shadow-[0_0_6px_rgba(20,184,166,0.35)]">
            {currentSoc.maxOverclockCpu} MHz (+{Math.round(((currentSoc.maxOverclockCpu - currentSoc.defaultCpuClock) / currentSoc.defaultCpuClock) * 100)}%)
          </span>
        </div>
        <div>
          <span className="text-slate-500">Unified RAM: </span>
          <span className="text-slate-200 font-medium">{currentSoc.physicalRamGb} GB LPDDR5X</span>
        </div>
      </div>
    </div>
  );
};
