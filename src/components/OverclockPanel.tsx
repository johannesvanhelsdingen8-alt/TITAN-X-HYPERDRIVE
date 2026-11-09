import React from 'react';
import { TunerState, SocProfile, CpuGovernor, GpuGovernor } from '../types/tuner';
import { Gauge, Zap, Flame, ShieldAlert, Cpu } from 'lucide-react';

interface OverclockPanelProps {
  state: TunerState;
  soc: SocProfile;
  onUpdateState: (partial: Partial<TunerState>) => void;
}

export const OverclockPanel: React.FC<OverclockPanelProps> = ({ state, soc, onUpdateState }) => {
  const cpuGovernors: { id: CpuGovernor; name: string; desc: string }[] = [
    { id: 'performance', name: 'Performance', desc: 'Locks all CPU cores strictly at maximum frequency. Zero scaling lag.' },
    { id: 'schedutil', name: 'Schedutil (EAS)', desc: 'Energy-Aware Scheduler. Uses kernel task load metrics to scale dynamically.' },
    { id: 'powersave', name: 'Powersave', desc: 'Locks CPU cores at the lowest available frequency to maximize battery life.' },
    { id: 'conservative', name: 'Conservative', desc: 'Gradually ramps clock speeds up and down to minimize thermal spikes.' },
  ];

  const gpuGovernors: { id: GpuGovernor; name: string; desc: string }[] = [
    { id: 'performance', name: 'Performance', desc: 'Forces GPU clocks to peak frequency. Prevents frame drops in 3D titles.' },
    { id: 'msm-adreno-tz', name: 'MSM Adreno TZ', desc: 'Default Qualcomm TrustZone thermal-managed governor.' },
    { id: 'simple_ondemand', name: 'Simple Ondemand', desc: 'Ramps up clock based on frame draw calls without thermal throttle delays.' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Overclocking & Scaling */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-100">CPU Core Governor & Frequencies</h3>
                <p className="text-xs text-slate-400">Control core scaling tables across big and prime clusters</p>
              </div>
            </div>
          </div>

          {/* Governor Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Scaling Governor</label>
            <div className="grid grid-cols-2 gap-2">
              {cpuGovernors.map((gov) => {
                const isSelected = state.cpuGovernor === gov.id;
                return (
                  <button
                    key={gov.id}
                    onClick={() => onUpdateState({ cpuGovernor: gov.id })}
                    className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500/80 bg-emerald-500/15 text-slate-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-100 flex items-center justify-between">
                      <span>{gov.name}</span>
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {gov.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CPU Frequency Slider */}
          <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-300">Target Peak Frequency</span>
                <div className="text-[11px] text-slate-500">Requires unlocked custom kernel or root frequency table</div>
              </div>
              <div className="text-right">
                <span className="font-mono text-base font-bold tabular-nums text-emerald-400">
                  {state.cpuOverclockTargetMhz}
                </span>
                <span className="text-xs font-normal text-slate-400 ml-1">MHz</span>
              </div>
            </div>

            <input
              type="range"
              min={soc.defaultCpuClock - 400}
              max={soc.maxOverclockCpu}
              step={50}
              value={state.cpuOverclockTargetMhz}
              onChange={(e) => onUpdateState({ cpuOverclockTargetMhz: Number(e.target.value) })}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Underclock ({soc.defaultCpuClock - 400} MHz)</span>
              <span>Stock ({soc.defaultCpuClock} MHz)</span>
              <span className="text-emerald-400 font-semibold">Max OC ({soc.maxOverclockCpu} MHz)</span>
            </div>
          </div>
        </div>

        {/* GPU Devfreq & Throttling Override */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-100">GPU Devfreq & Graphics Accelerator</h3>
                <p className="text-xs text-slate-400">{soc.gpuModel} clock states & KGSL bus control</p>
              </div>
            </div>
          </div>

          {/* GPU Governor */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">GPU Scaling Governor</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {gpuGovernors.map((gov) => {
                const isSelected = state.gpuGovernor === gov.id;
                return (
                  <button
                    key={gov.id}
                    onClick={() => onUpdateState({ gpuGovernor: gov.id })}
                    className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500/80 bg-amber-500/15 text-slate-100 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-100 flex items-center justify-between">
                      <span>{gov.name}</span>
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {gov.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GPU Frequency Slider */}
          <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-300">GPU Peak Frequency</span>
                <div className="text-[11px] text-slate-500">Adreno kgsl-3d0 max_gpuclk or Mali DVFS ceiling</div>
              </div>
              <div className="text-right">
                <span className="font-mono text-base font-bold tabular-nums text-amber-400">
                  {state.gpuOverclockTargetMhz}
                </span>
                <span className="text-xs font-normal text-slate-400 ml-1">MHz</span>
              </div>
            </div>

            <input
              type="range"
              min={soc.defaultGpuClock - 200}
              max={soc.maxOverclockGpu}
              step={20}
              value={state.gpuOverclockTargetMhz}
              onChange={(e) => onUpdateState({ gpuOverclockTargetMhz: Number(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Eco ({soc.defaultGpuClock - 200} MHz)</span>
              <span>Stock ({soc.defaultGpuClock} MHz)</span>
              <span className="text-amber-400 font-semibold">Max OC ({soc.maxOverclockGpu} MHz)</span>
            </div>
          </div>

          {/* GPU Throttling Bypass Switch */}
          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 p-3.5">
            <div className="pr-4">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <span>Bypass KGSL Thermal Downclocking</span>
                {state.bypassGpuThrottling && (
                  <span className="text-[10px] text-rose-400 font-mono font-normal">Active (/sys/class/kgsl)</span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Forces <code className="text-slate-300 font-mono text-[10px]">echo 0 &gt; /sys/class/kgsl/kgsl-3d0/throttling</code> to prevent game stutters when ambient heat rises.
              </p>
            </div>
            <button
              onClick={() => onUpdateState({ bypassGpuThrottling: !state.bypassGpuThrottling })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                state.bypassGpuThrottling ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  state.bypassGpuThrottling ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Safety & Thermal Guard */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Automated Thermal Protection Guard</h4>
              <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
                Automatically steps down to <code className="text-slate-300 font-mono text-[11px]">schedutil</code> and restores standard GPU throttling if the SoC thermal sensor crosses safety threshold to safeguard battery and OLED panels.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Cutoff Temp:</span>
              <span className="font-mono text-sm font-bold tabular-nums text-rose-400">
                {state.maxAllowedTempCelsius}°C
              </span>
            </div>
            <button
              onClick={() => onUpdateState({ thermalSafetyCutoff: !state.thermalSafetyCutoff })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                state.thermalSafetyCutoff ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  state.thermalSafetyCutoff ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
