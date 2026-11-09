import React from 'react';
import { TunerState, SocProfile, GraphicsDriver } from '../types/tuner';
import { Layers, Cpu, Settings, CheckCircle, Sliders, Monitor } from 'lucide-react';

interface GraphicsDriversPanelProps {
  state: TunerState;
  soc: SocProfile;
  onUpdateState: (partial: Partial<TunerState>) => void;
}

export const GraphicsDriversPanel: React.FC<GraphicsDriversPanelProps> = ({
  state,
  soc,
  onUpdateState,
}) => {
  const drivers: { id: GraphicsDriver; name: string; type: string; version: string; desc: string }[] = [
    {
      id: 'turnip_v24',
      name: 'Mesa Turnip OpenSource Driver',
      type: 'Vulkan 1.3 Mesa',
      version: 'v24.2.0 git-perf',
      desc: 'Community open-source Vulkan driver for Adreno GPUs. Unlocks uncapped framerates and reduces shader compilation stutter in demanding 3D games and emulators.',
    },
    {
      id: 'adreno_v757',
      name: 'Qualcomm Adreno OEM Driver',
      type: 'Proprietary Blob',
      version: 'v0757.0 (UE5 Optimized)',
      desc: 'Official high-performance driver extracted from latest Snapdragon flagship firmware. Features advanced ray tracing pipelines and variable rate shading (VRS).',
    },
    {
      id: 'adreno_v615',
      name: 'Qualcomm Adreno Legacy Stable',
      type: 'Proprietary Blob',
      version: 'v0615.15 Stable',
      desc: 'Maximum compatibility driver for Snapdragon 865, 870, and 888 devices. Recommended for legacy titles.',
    },
    {
      id: 'mali_vulkan',
      name: 'ARM Mali Bifrost/Valhall Vulkan',
      type: 'Mali DDK',
      version: 'r44p0 Vulkan 1.3',
      desc: 'Hardware graphics pipeline driver tuned for MediaTek Dimensity and Google Tensor Mali/Immortalis architectures.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Driver Blob Selector */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">GPU Graphics Driver Module</h3>
              <p className="text-xs text-slate-400">Select active Vulkan/OpenGL user-space driver pipeline for {soc.gpuModel}</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">/vendor/lib64/hw</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {drivers.map((drv) => {
            const isSelected = state.selectedDriver === drv.id;
            return (
              <button
                key={drv.id}
                onClick={() => onUpdateState({ selectedDriver: drv.id })}
                className={`p-4 text-left rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-slate-100'
                    : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-100">{drv.name}</div>
                    <div className="text-[11px] font-mono text-emerald-400 mt-0.5">{drv.version} · {drv.type}</div>
                  </div>
                  {isSelected && <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />}
                </div>
                <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                  {drv.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Driver Pipeline & SurfaceFlinger Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Render Pipeline Optimizations */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-slate-100">Graphics Pipeline & SurfaceFlinger Properties</h4>
          </div>

          <div className="space-y-3">
            {/* Zero Vulkan Overhead */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/40">
              <div className="pr-3">
                <div className="text-xs font-semibold text-slate-200">Bypass Vulkan Debug Validation Layers</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Sets <code className="text-slate-300 font-mono text-[10px]">debug.vulkan.layers=0</code> for direct hardware pass-through.
                </div>
              </div>
              <button
                onClick={() => onUpdateState({ enableVulkanLayerBypass: !state.enableVulkanLayerBypass })}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  state.enableVulkanLayerBypass ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    state.enableVulkanLayerBypass ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Hardware EGL UI */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/40">
              <div className="pr-3">
                <div className="text-xs font-semibold text-slate-200">Force Hardware EGL UI Acceleration</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Forces GPU composition across Android HWUI (<code className="text-slate-300 font-mono text-[10px]">debug.egl.hw=1</code>).
                </div>
              </div>
              <button
                onClick={() => onUpdateState({ forceHwUiRendering: !state.forceHwUiRendering })}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  state.forceHwUiRendering ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    state.forceHwUiRendering ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* SurfaceFlinger Zero Latch */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/40">
              <div className="pr-3">
                <div className="text-xs font-semibold text-slate-200">SurfaceFlinger Zero-Latency Latch</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Enables <code className="text-slate-300 font-mono text-[10px]">debug.sf.latch_unsignaled=1</code> to eliminate frame pacing drops.
                </div>
              </div>
              <button
                onClick={() => onUpdateState({ surfaceFlingerZeroLatch: !state.surfaceFlingerZeroLatch })}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  state.surfaceFlingerZeroLatch ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    state.surfaceFlingerZeroLatch ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 240Hz Touch Sampling */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/40">
              <div className="pr-3">
                <div className="text-xs font-semibold text-slate-200">240Hz / 360Hz Touch Digitizer Boost</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Unlocks touch polling speed (<code className="text-slate-300 font-mono text-[10px]">vendor.perf.gestureopts=1</code>).
                </div>
              </div>
              <button
                onClick={() => onUpdateState({ touchSamplingBoost240Hz: !state.touchSamplingBoost240Hz })}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  state.touchSamplingBoost240Hz ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    state.touchSamplingBoost240Hz ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Operating System Kernel Scheduler Tunables */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-slate-100">Operating System Drivers & Linux Scheduler</h4>
          </div>

          <div className="space-y-3">
            {/* Scheduler Latency */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/40">
              <div className="pr-3">
                <div className="text-xs font-semibold text-slate-200">Linux EEVDF Scheduler Latency Reduction</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Reduces <code className="text-slate-300 font-mono text-[10px]">sched_latency_ns</code> to 6ms for instant foreground thread context switches.
                </div>
              </div>
              <button
                onClick={() => onUpdateState({ tuneSchedulerLatency: !state.tuneSchedulerLatency })}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  state.tuneSchedulerLatency ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    state.tuneSchedulerLatency ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* I/O Storage Block Scheduler */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">UFS 3.1 / 4.0 Flash I/O Scheduler</span>
                <span className="text-[11px] font-mono text-emerald-400">/sys/block/*/queue</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(['none', 'kyber', 'mq-deadline'] as const).map((sched) => (
                  <button
                    key={sched}
                    onClick={() => onUpdateState({ ioScheduler: sched })}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-medium border text-center transition-all cursor-pointer ${
                      state.ioScheduler === sched
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {sched}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                <strong className="text-slate-400">none (noop):</strong> Direct hardware queue bypassing without CPU queue overhead on modern UFS storage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
