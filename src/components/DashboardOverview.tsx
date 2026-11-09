import React from 'react';
import { TunerState, SocProfile, LiveHardwareTelemetry } from '../types/tuner';
import {
  Flame,
  Database,
  Layers,
  Eye,
  Wifi,
  Zap,
  Activity,
  Play,
  ArrowUpRight,
  ShieldCheck,
  BatteryCharging,
  BatteryMedium,
  HeartPulse,
  Radio,
} from 'lucide-react';

interface DashboardOverviewProps {
  state: TunerState;
  soc: SocProfile;
  telemetry: LiveHardwareTelemetry;
  onUpdateState: (partial: Partial<TunerState>) => void;
  onNavigateTab: (tab: string) => void;
  onOpenExport: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  state,
  soc,
  telemetry,
  onUpdateState,
  onNavigateTab,
  onOpenExport,
}) => {
  const isPerfActive = state.cpuGovernor === 'performance';
  const is8GbVramActive = state.zramExpansionGb === 8;
  const isKcalActive = state.enableKcalVivid;
  const isNetActive = state.enableNetworkBoost;

  return (
    <div className="space-y-6">
      {/* Cyberpunk Hero Status Banner */}
      <div className="relative rounded-2xl border border-emerald-500/30 bg-slate-950/90 p-6 sm:p-7 overflow-hidden">
        {/* Dark Terminal Bunker Backdrop */}
        <div className="absolute right-0 top-0 bottom-0 w-2/3 opacity-30 pointer-events-none mix-blend-screen">
          <img
            src="/src/assets/images/dark_matrix_hero_1794259095690.jpg"
            alt="Cybersecurity Command Terminal"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="tracking-widest uppercase font-mono text-[11px]">ROOT SHELL / RED TEAM WARFARE ENGINE // ARMED</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>{soc.name}</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Operating with <strong className="text-emerald-400 font-mono font-medium">{state.cpuGovernor}</strong> governor, <strong className="text-indigo-400 font-mono font-medium">{state.zramExpansionGb}GB Virtual VRAM</strong> pool, <strong className="text-cyan-400 font-mono font-medium">{state.selectedDriver}</strong> graphics pipeline, and display refresh locked at <strong className="text-amber-400 font-mono font-medium">{state.targetRefreshRate}Hz</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('benchmark')}
              className="flex items-center gap-2 rounded-xl bg-slate-800/90 border border-slate-700/80 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:border-slate-600 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] active:scale-95 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              <span>Run GPU Benchmark</span>
            </button>

            <button
              onClick={onOpenExport}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.35)]"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>📱 Get APK on Phone</span>
            </button>
          </div>
        </div>
      </div>

      {/* NEW: Battery Health & Power Supply Monitor Section */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <HeartPulse className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Battery Health & Power Supply Subsystem</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">/sys/class/power_supply/battery</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-400">
              Status: <strong className="text-emerald-400">{telemetry.batteryHealthStatus}</strong>
            </span>
            <span className="text-slate-400">
              Voltage: <strong className="text-slate-200">{(telemetry.batteryVoltageMv / 1000).toFixed(2)} V</strong>
            </span>
            <span className="text-slate-400">
              Flow: <strong className={telemetry.batteryChargeCurrentMa > 0 ? "text-emerald-400" : "text-amber-400"}>
                {telemetry.batteryChargeCurrentMa > 0 ? `+${telemetry.batteryChargeCurrentMa}` : telemetry.batteryChargeCurrentMa} mA
              </strong>
            </span>
          </div>
        </div>

        {/* Battery Health Cards Grid */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Card 1: Current Charge Capacity */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" />
                Capacity
              </span>
              <span className="font-mono text-emerald-400 font-semibold">{telemetry.batteryLevelPct}%</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-slate-100">
                {telemetry.batteryLevelPct}
                <span className="text-xs font-normal text-slate-400 ml-1">%</span>
              </span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {Math.round((telemetry.batteryCurrentCapacityMah * telemetry.batteryLevelPct) / 100)} mAh
              </span>
            </div>
            <div className="mt-2.5 h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-300"
                style={{ width: `${telemetry.batteryLevelPct}%` }}
              />
            </div>
          </div>

          {/* Card 2: Lifetime Cycle Count */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Radio className="h-3.5 w-3.5 text-cyan-400" />
                Cycle Count
              </span>
              <span className="text-[11px] font-mono text-slate-400">cycle_count node</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-slate-100">
                {telemetry.batteryCycleCount}
                <span className="text-xs font-normal text-slate-400 ml-1">Cycles</span>
              </span>
              <span className="text-xs text-cyan-400 font-mono">Rated 800+</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-300"
                style={{ width: `${Math.min(100, (telemetry.batteryCycleCount / 800) * 100)}%` }}
              />
            </div>
          </div>

          {/* Card 3: Health Retention Percentage */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <HeartPulse className="h-3.5 w-3.5 text-indigo-400" />
                Health Rating
              </span>
              <span className="font-mono text-indigo-400 font-semibold">
                {((telemetry.batteryCurrentCapacityMah / telemetry.batteryDesignCapacityMah) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-slate-100">
                {telemetry.batteryCurrentCapacityMah}
                <span className="text-xs font-normal text-slate-400 ml-1">mAh</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">Design {telemetry.batteryDesignCapacityMah}</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-300"
                style={{ width: `${(telemetry.batteryCurrentCapacityMah / telemetry.batteryDesignCapacityMah) * 100}%` }}
              />
            </div>
          </div>

          {/* Card 4: Battery Temperature */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <BatteryMedium className="h-3.5 w-3.5 text-amber-400" />
                Cell Temp
              </span>
              <span className="text-[11px] font-mono text-slate-400">&lt; 45°C Nominal</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono tabular-nums text-amber-400">
                {telemetry.batteryTemp.toFixed(1)}
                <span className="text-xs font-normal text-slate-400 ml-1">°C</span>
              </span>
              <span className="text-xs text-emerald-400 font-mono">Protected</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-300"
                style={{ width: `${Math.min(100, (telemetry.batteryTemp / 50) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cyberpunk Utility Quick-Toggle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Module 1: Overclocking & Governors */}
        <div className={`rounded-xl p-5 flex flex-col justify-between transition-all duration-200 ${
          isPerfActive
            ? 'glass-panel-active'
            : 'rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <Flame className="h-4 w-4" />
              </div>
              <button
                onClick={() =>
                  onUpdateState({
                    cpuGovernor: isPerfActive ? 'schedutil' : 'performance',
                    gpuGovernor: isPerfActive ? 'simple_ondemand' : 'performance',
                    bypassGpuThrottling: !state.bypassGpuThrottling,
                  })
                }
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  isPerfActive ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    isPerfActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <h4 className="mt-3 text-sm font-bold text-slate-100 flex items-center justify-between">
              <span>Max Performance Governor</span>
              {isPerfActive && <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />}
            </h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Locks all CPU cores and {soc.gpuModel} to peak frequencies, bypassing downclock pauses in games.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="font-mono text-emerald-400 tabular-nums">
              {state.cpuOverclockTargetMhz} MHz · {state.gpuOverclockTargetMhz} MHz
            </span>
            <button
              onClick={() => onNavigateTab('overclock')}
              className="text-slate-400 hover:text-emerald-400 font-semibold cursor-pointer"
            >
              Configure →
            </button>
          </div>
        </div>

        {/* Module 2: 8GB VRAM / zRAM Swap */}
        <div className={`rounded-xl p-5 flex flex-col justify-between transition-all duration-200 ${
          is8GbVramActive
            ? 'glass-panel-active-indigo'
            : 'rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                <Database className="h-4 w-4" />
              </div>
              <button
                onClick={() =>
                  onUpdateState({
                    zramExpansionGb: is8GbVramActive ? 4 : 8,
                    swappiness: 100,
                  })
                }
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  is8GbVramActive ? 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    is8GbVramActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <h4 className="mt-3 text-sm font-bold text-slate-100 flex items-center justify-between">
              <span>8GB Virtual VRAM Expansion</span>
              {is8GbVramActive && <span className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />}
            </h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Allocates 8,589,934,592 bytes via compressed zRAM, offloading anonymous pages and preserving physical LPDDR5X for GPU.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="font-mono text-indigo-400 tabular-nums">
              {state.zramExpansionGb}GB {state.zramAlgorithm.toUpperCase()} (Swappiness {state.swappiness})
            </span>
            <button
              onClick={() => onNavigateTab('vram')}
              className="text-slate-400 hover:text-indigo-400 font-semibold cursor-pointer"
            >
              Configure →
            </button>
          </div>
        </div>

        {/* Module 3: Graphics Drivers */}
        <div className={`rounded-xl p-5 flex flex-col justify-between transition-all duration-200 ${
          state.enableVulkanLayerBypass
            ? 'glass-panel-active-cyan'
            : 'rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <Layers className="h-4 w-4" />
              </div>
              <button
                onClick={() =>
                  onUpdateState({
                    enableVulkanLayerBypass: !state.enableVulkanLayerBypass,
                    forceHwUiRendering: !state.forceHwUiRendering,
                  })
                }
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  state.enableVulkanLayerBypass ? 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    state.enableVulkanLayerBypass ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <h4 className="mt-3 text-sm font-bold text-slate-100 flex items-center justify-between">
              <span>Graphics Driver & Vulkan</span>
              {state.enableVulkanLayerBypass && <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />}
            </h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Turnip Vulkan 1.3 / OEM driver blob with hardware EGL composition and SurfaceFlinger zero-latency latching.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="font-mono text-cyan-400 truncate max-w-[150px]">
              {state.selectedDriver}
            </span>
            <button
              onClick={() => onNavigateTab('drivers')}
              className="text-slate-400 hover:text-cyan-400 font-semibold cursor-pointer"
            >
              Configure →
            </button>
          </div>
        </div>

        {/* Module 4: Display Enhancer */}
        <div className={`rounded-xl p-5 flex flex-col justify-between transition-all duration-200 ${
          isKcalActive
            ? 'glass-panel-active-amber'
            : 'rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                <Eye className="h-4 w-4" />
              </div>
              <button
                onClick={() => onUpdateState({ enableKcalVivid: !state.enableKcalVivid })}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  isKcalActive ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    isKcalActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <h4 className="mt-3 text-sm font-bold text-slate-100 flex items-center justify-between">
              <span>KCAL Vivid Display Enhancer</span>
              {isKcalActive && <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />}
            </h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Hardware kernel color calibration: boosts RGB saturation and dynamic contrast for OLED & AMOLED panels.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="font-mono text-amber-400 tabular-nums">
              KCAL Sat {state.kcalSaturation} · {state.targetRefreshRate}Hz
            </span>
            <button
              onClick={() => onNavigateTab('display')}
              className="text-slate-400 hover:text-amber-400 font-semibold cursor-pointer"
            >
              Configure →
            </button>
          </div>
        </div>

        {/* Module 5: Network Booster */}
        <div className={`rounded-xl p-5 flex flex-col justify-between transition-all duration-200 ${
          isNetActive
            ? 'glass-panel-active'
            : 'rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <Wifi className="h-4 w-4" />
              </div>
              <button
                onClick={() => onUpdateState({ enableNetworkBoost: !state.enableNetworkBoost })}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  isNetActive ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    isNetActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <h4 className="mt-3 text-sm font-bold text-slate-100 flex items-center justify-between">
              <span>BBR Low-Latency Network</span>
              {isNetActive && <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />}
            </h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Replaces standard TCP Reno with Google BBR, tunes 64MB socket buffers, and sets direct packet dispatch.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="font-mono text-emerald-400 tabular-nums">
              {state.tcpCongestion.toUpperCase()} · Low Latency {state.tcpLowLatency ? 'ON' : 'OFF'}
            </span>
            <button
              onClick={() => onNavigateTab('network')}
              className="text-slate-400 hover:text-emerald-400 font-semibold cursor-pointer"
            >
              Configure →
            </button>
          </div>
        </div>

        {/* Module 6: Operating System Kernel Tunables */}
        <div className={`rounded-xl p-5 flex flex-col justify-between transition-all duration-200 ${
          state.tuneSchedulerLatency
            ? 'glass-panel-active-indigo'
            : 'rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                <Zap className="h-4 w-4" />
              </div>
              <button
                onClick={() =>
                  onUpdateState({
                    tuneSchedulerLatency: !state.tuneSchedulerLatency,
                    touchSamplingBoost240Hz: !state.touchSamplingBoost240Hz,
                  })
                }
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  state.tuneSchedulerLatency ? 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    state.tuneSchedulerLatency ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <h4 className="mt-3 text-sm font-bold text-slate-100 flex items-center justify-between">
              <span>OS Drivers & EEVDF Scheduler</span>
              {state.tuneSchedulerLatency && <span className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />}
            </h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              6ms scheduler context latency, 240Hz/360Hz touch sampling boost, and noop flash storage I/O queue.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="font-mono text-indigo-400 tabular-nums">
              Scheduler: {state.ioScheduler} · Touch 240Hz
            </span>
            <button
              onClick={() => onNavigateTab('drivers')}
              className="text-slate-400 hover:text-indigo-400 font-semibold cursor-pointer"
            >
              Configure →
            </button>
          </div>
        </div>
      </div>

      {/* Copywriting & Release Studio Hub Banner */}
      <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900/80 to-slate-950/80 p-5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 font-mono uppercase">
              New Service Hub
            </span>
            <h4 className="text-sm font-bold text-slate-100">
              Copywriting & App Store Optimization (ASO) Services
            </h4>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Need high-converting copy for Google Play Store, technical XDA threads, or GitHub release notes for your customized {soc.name} APK? Use our instant copy generator or book professional tech copywriting.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('copywriting')}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
        >
          <span>Open Copywriting Studio →</span>
        </button>
      </div>

      {/* Cyber Diagnostics Strip */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md p-5 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          Kernel Subsystem Mount Nodes
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/90 flex items-center justify-between">
            <span className="text-slate-400">/sys/devices/system/cpu</span>
            <span className="text-emerald-400 font-bold">rw mounted</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/90 flex items-center justify-between">
            <span className="text-slate-400">/sys/block/zram0</span>
            <span className="text-emerald-400 font-bold">{state.zramExpansionGb}GB swap</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/90 flex items-center justify-between">
            <span className="text-slate-400">/sys/class/kgsl/kgsl-3d0</span>
            <span className="text-emerald-400 font-bold">{state.bypassGpuThrottling ? 'unthrottled' : 'managed'}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/90 flex items-center justify-between">
            <span className="text-slate-400">/sys/class/power_supply</span>
            <span className="text-emerald-400 font-bold">{telemetry.batteryLevelPct}% ({telemetry.batteryCycleCount} cyc)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
