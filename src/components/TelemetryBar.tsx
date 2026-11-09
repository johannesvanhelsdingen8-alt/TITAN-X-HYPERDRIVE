import React from 'react';
import { LiveHardwareTelemetry, SocProfile } from '../types/tuner';
import { Cpu, Zap, Thermometer, Database, Activity } from 'lucide-react';

interface TelemetryBarProps {
  telemetry: LiveHardwareTelemetry;
  soc: SocProfile;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({ telemetry, soc }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {/* CPU Clock & Core Load */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-3.5 flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
            CPU Clock
          </span>
          <span className="font-mono tabular-nums text-emerald-400 font-semibold">{telemetry.cpuUsagePct}%</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono tabular-nums text-slate-100">
            {telemetry.currentCpuMhz}
            <span className="text-xs font-normal text-slate-400 ml-1">MHz</span>
          </span>
          <span className="text-xs text-slate-500 font-mono">Max {soc.maxOverclockCpu}</span>
        </div>
        <div className="mt-2.5 h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${Math.min(100, (telemetry.currentCpuMhz / soc.maxOverclockCpu) * 100)}%` }}
          />
        </div>
      </div>

      {/* GPU Clock & Load */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-3.5 flex flex-col justify-between hover:border-amber-500/30 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            GPU Clock
          </span>
          <span className="font-mono tabular-nums text-amber-400 font-semibold">{telemetry.gpuUsagePct}%</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono tabular-nums text-slate-100">
            {telemetry.currentGpuMhz}
            <span className="text-xs font-normal text-slate-400 ml-1">MHz</span>
          </span>
          <span className="text-xs text-slate-500 font-mono">Max {soc.maxOverclockGpu}</span>
        </div>
        <div className="mt-2.5 h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${Math.min(100, (telemetry.currentGpuMhz / soc.maxOverclockGpu) * 100)}%` }}
          />
        </div>
      </div>

      {/* SoC Thermal Zone */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-3.5 flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Thermometer className="h-3.5 w-3.5 text-rose-400" />
            Thermal Zone
          </span>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {telemetry.isThrottled ? 'Throttled' : 'Nominal'}
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className={`text-xl font-bold font-mono tabular-nums ${
            telemetry.socTemp >= 65 ? 'text-rose-400' : telemetry.socTemp >= 50 ? 'text-amber-400' : 'text-slate-100'
          }`}>
            {telemetry.socTemp.toFixed(1)}
            <span className="text-xs font-normal text-slate-400 ml-1">°C</span>
          </span>
          <span className="text-xs text-slate-500 font-mono tabular-nums">Battery {telemetry.batteryTemp.toFixed(1)}°C</span>
        </div>
        <div className="mt-2.5 h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              telemetry.socTemp >= 65 ? 'bg-rose-500' : telemetry.socTemp >= 50 ? 'bg-amber-500' : 'bg-cyan-500'
            }`}
            style={{ width: `${Math.min(100, (telemetry.socTemp / 85) * 100)}%` }}
          />
        </div>
      </div>

      {/* Physical RAM & 8GB VRAM zRAM */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-3.5 flex flex-col justify-between hover:border-indigo-500/30 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Database className="h-3.5 w-3.5 text-indigo-400" />
            Memory &amp; VRAM
          </span>
          <span className="font-mono tabular-nums text-indigo-400 font-semibold">
            {(telemetry.totalZramMb / 1024).toFixed(0)}GB zRAM
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono tabular-nums text-slate-100">
            {(telemetry.usedPhysicalRamMb / 1024).toFixed(1)}
            <span className="text-xs font-normal text-slate-400 ml-1">/ {soc.physicalRamGb} GB</span>
          </span>
          <span className="text-xs text-indigo-400 font-mono tabular-nums">
            {(telemetry.usedZramMb / 1024).toFixed(1)} GB swapped
          </span>
        </div>
        <div className="mt-2.5 h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${Math.min(100, (telemetry.usedPhysicalRamMb / (soc.physicalRamGb * 1024)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Frame Rate & Rendering Latency */}
      <div className="col-span-2 md:col-span-4 lg:col-span-1 rounded-xl border border-slate-800/90 bg-slate-900/70 p-3.5 flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            Display FPS
          </span>
          <span className="text-xs text-emerald-400 font-mono font-semibold">Real-Time</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono tabular-nums text-emerald-400">
            {telemetry.frameRateSimulationFps}
            <span className="text-xs font-normal text-slate-400 ml-1">FPS</span>
          </span>
          <span className="text-xs text-slate-500 font-mono">144Hz Cap</span>
        </div>
        <div className="mt-2.5 h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${Math.min(100, (telemetry.frameRateSimulationFps / 144) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
