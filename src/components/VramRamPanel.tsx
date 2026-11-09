import React from 'react';
import { TunerState, SocProfile, ZramAlgorithm } from '../types/tuner';
import { Database, HardDrive, Layers, ArrowRightLeft, Sparkles, RefreshCw } from 'lucide-react';

interface VramRamPanelProps {
  state: TunerState;
  soc: SocProfile;
  onUpdateState: (partial: Partial<TunerState>) => void;
  onFlushCaches: () => void;
}

export const VramRamPanel: React.FC<VramRamPanelProps> = ({
  state,
  soc,
  onUpdateState,
  onFlushCaches,
}) => {
  const algorithms: { id: ZramAlgorithm; name: string; latency: string; ratio: string; desc: string }[] = [
    { id: 'lz4', name: 'LZ4 (Recommended for Gaming)', latency: '< 0.05ms', ratio: '2.1:1', desc: 'Ultra-fast decompression. Ideal for high refresh-rate gaming to eliminate micro-stutters.' },
    { id: 'zstd', name: 'Zstandard (ZSTD)', latency: '~ 0.18ms', ratio: '3.3:1', desc: 'Maximum compression density. Fits up to 24GB of uncompressed data into 8GB zRAM.' },
    { id: 'lzo-rle', name: 'LZO-RLE', latency: '~ 0.08ms', ratio: '2.5:1', desc: 'Standard Android kernel compression algorithm with Run-Length Encoding.' },
  ];

  const sizeOptions = [2, 4, 6, 8];

  return (
    <div className="space-y-6">
      {/* Top Explanatory Banner: UMA & VRAM Architecture */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Unified Memory Architecture (UMA) & 8GB VRAM Pool</span>
              </h3>
              <p className="mt-1 text-xs text-slate-300 max-w-3xl leading-relaxed">
                Mobile processors share physical LPDDR5X RAM between CPU and GPU. Allocating an 8GB compressed zRAM block offloads background apps, guaranteeing the GPU up to 8GB of pure physical high-speed bandwidth for 4K textures, Vulkan shaders, and framebuffers.
              </p>
            </div>
          </div>
          <button
            onClick={onFlushCaches}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
            <span>Flush Inactive Caches</span>
          </button>
        </div>

        {/* Visual Memory Map */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium text-slate-300">Memory Allocation Map</span>
            <span className="font-mono tabular-nums text-slate-400">
              Total Memory Space: {(soc.physicalRamGb + state.zramExpansionGb)} GB (LPDDR + Virtual)
            </span>
          </div>

          <div className="grid grid-cols-12 gap-1 h-9 rounded-lg overflow-hidden bg-slate-950 p-1 border border-slate-800">
            {/* System OS Reserve */}
            <div
              className="col-span-2 bg-slate-700/80 rounded flex items-center justify-center text-[10px] font-mono text-slate-300 truncate px-1"
              title="Android Framework & Kernel (2.5 GB)"
            >
              OS Core
            </div>
            {/* Active Apps & UI */}
            <div
              className="col-span-3 bg-indigo-600/70 rounded flex items-center justify-center text-[10px] font-mono text-slate-100 truncate px-1"
              title="Active Apps (3.5 GB)"
            >
              Active RAM
            </div>
            {/* Dedicated GPU VRAM Buffer */}
            <div
              className="col-span-3 bg-amber-500/80 rounded flex items-center justify-center text-[10px] font-mono text-slate-950 font-bold truncate px-1"
              title="GPU Physical Allocation (Up to 6 GB)"
            >
              GPU Textures
            </div>
            {/* 8GB Expanded Virtual VRAM */}
            <div
              className="col-span-4 bg-emerald-500/80 rounded flex items-center justify-center text-[10px] font-mono text-slate-950 font-bold truncate px-1"
              title={`zRAM Virtual VRAM (${state.zramExpansionGb} GB)`}
            >
              +{state.zramExpansionGb}GB Virtual VRAM
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-600" />
              <span>OS Kernel (2.5 GB)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span>Foreground Apps</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>GPU Physical VRAM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Virtual Swap Pool ({state.zramExpansionGb}GB)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expansion Size Selector */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-slate-100">Virtual VRAM Expansion Capacity</h4>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-400 tabular-nums">
              {(state.zramExpansionGb * 1024 * 1024 * 1024).toLocaleString()} Bytes
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Select the allocated zRAM block size configured at <code className="text-slate-300 font-mono text-[11px]">/sys/block/zram0/disksize</code>.
          </p>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {sizeOptions.map((size) => {
              const isSelected = state.zramExpansionGb === size;
              const isTargetMax = size === 8;
              return (
                <button
                  key={size}
                  onClick={() => onUpdateState({ zramExpansionGb: size })}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500/80 bg-indigo-500/20 text-slate-100 shadow-[0_0_20px_rgba(99,102,241,0.3)] ring-1 ring-indigo-400/40'
                      : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-base font-bold font-mono tabular-nums text-slate-100">
                    {size} GB
                  </div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-indigo-300 font-semibold' : 'text-slate-400'}`}>
                    {isTargetMax ? 'Max Capacity' : `${size * 1024} MB`}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Swappiness Slider */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-300">Linux Swappiness Bias</span>
                <div className="text-[11px] text-slate-500">
                  {state.swappiness >= 80 ? 'Aggressive: Offload background apps immediately' : 'Standard balance'}
                </div>
              </div>
              <span className="font-mono text-sm font-bold tabular-nums text-emerald-400">
                {state.swappiness} / 100
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={state.swappiness}
              onChange={(e) => onUpdateState({ swappiness: Number(e.target.value) })}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>0 (Never swap)</span>
              <span>60 (Android default)</span>
              <span className="text-emerald-400 font-semibold">100 (Max GPU Free)</span>
            </div>
          </div>
        </div>

        {/* Compression Algorithm Selection */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <h4 className="text-sm font-semibold text-slate-100">Compression Engine Algorithm</h4>
            </div>
            <span className="text-xs font-mono text-indigo-400">Kernel comp_algorithm</span>
          </div>

          <div className="space-y-2.5">
            {algorithms.map((algo) => {
              const isSelected = state.zramAlgorithm === algo.id;
              return (
                <button
                  key={algo.id}
                  onClick={() => onUpdateState({ zramAlgorithm: algo.id })}
                  className={`w-full p-3.5 text-left rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/10 text-slate-100'
                      : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">{algo.name}</span>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      <span>Ratio: <strong className="text-slate-200">{algo.ratio}</strong></span>
                      <span>Latency: <strong className="text-emerald-400">{algo.latency}</strong></span>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                    {algo.desc}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3 flex items-start gap-2.5">
            <ArrowRightLeft className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When 8GB zRAM is active with <strong className="text-slate-200">LZ4</strong>, anonymous pages are compressed in real time inside RAM without writing to slow UFS flash, avoiding flash memory wear and maintaining full 120 FPS gaming framerates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
