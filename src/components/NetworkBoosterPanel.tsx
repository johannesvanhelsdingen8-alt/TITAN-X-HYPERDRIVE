import React from 'react';
import { TunerState, TcpCongestion } from '../types/tuner';
import { Wifi, Zap, Globe, Shield, Activity } from 'lucide-react';

interface NetworkBoosterPanelProps {
  state: TunerState;
  onUpdateState: (partial: Partial<TunerState>) => void;
}

export const NetworkBoosterPanel: React.FC<NetworkBoosterPanelProps> = ({
  state,
  onUpdateState,
}) => {
  const congestionEngines: { id: TcpCongestion; name: string; desc: string; latencyGrade: string }[] = [
    {
      id: 'bbr',
      name: 'Google BBR (Bottleneck Bandwidth & RTT)',
      desc: 'Calculates maximum bandwidth and minimum round-trip time. Drastically lowers latency jitter and mitigates bufferbloat on Wi-Fi and 5G networks.',
      latencyGrade: 'Lowest Latency (Recommended)',
    },
    {
      id: 'cubic',
      name: 'Linux CUBIC',
      desc: 'Standard Linux kernel congestion algorithm optimized for high-throughput symmetric broadband lines.',
      latencyGrade: 'Standard Bandwidth',
    },
    {
      id: 'westwood',
      name: 'TCP Westwood+',
      desc: 'Specifically designed for wireless cellular loss conditions; estimates available bandwidth via ACK return rate.',
      latencyGrade: 'Cellular Mobile Jitter Shield',
    },
    {
      id: 'bbr2',
      name: 'Google BBRv2 Enhanced',
      desc: 'Next-generation BBR with improved queue delay awareness and fair co-existence with legacy TCP streams.',
      latencyGrade: 'Cutting-Edge Gaming',
    },
  ];

  const dnsOptions: { id: TunerState['dnsOptimizer']; name: string; ips: string; provider: string }[] = [
    { id: 'cloudflare_gaming', name: 'Cloudflare 1.1.1.1 Gaming', ips: '1.1.1.1 / 1.0.0.1', provider: 'Global Anycast <10ms' },
    { id: 'google_dns', name: 'Google Public DNS', ips: '8.8.8.8 / 8.8.4.4', provider: 'High Reliability CDN' },
    { id: 'quad9', name: 'Quad9 Low Latency & Security', ips: '9.9.9.9 / 149.112.112.112', provider: 'Malware Filtering DNS' },
    { id: 'stock', name: 'System Default Carrier DNS', ips: 'DHCP Default', provider: 'Cellular / ISP Native' },
  ];

  return (
    <div className="space-y-6">
      {/* Network Stack Overview */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wifi className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Linux TCP Network Stack Booster</h3>
              <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
                Tunes socket buffers, replaces legacy TCP Reno/Cubic with Google BBR congestion control, and enables direct socket packet dispatch (<code className="text-emerald-400 font-mono text-[11px]">tcp_low_latency=1</code>) to eliminate multiplayer ping spikes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Master Switch:</span>
            <button
              onClick={() => onUpdateState({ enableNetworkBoost: !state.enableNetworkBoost })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                state.enableNetworkBoost ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${
                  state.enableNetworkBoost ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Congestion Control Selection */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-slate-100">TCP Congestion Control Algorithm</h4>
          </div>
          <span className="text-xs font-mono text-slate-400">/proc/sys/net/ipv4/tcp_congestion_control</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {congestionEngines.map((engine) => {
            const isSelected = state.tcpCongestion === engine.id;
            return (
              <button
                key={engine.id}
                onClick={() => onUpdateState({ tcpCongestion: engine.id, enableNetworkBoost: true })}
                className={`p-4 text-left rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-slate-100'
                    : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">{engine.name}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {engine.latencyGrade}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                  {engine.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Socket Buffers & Low-Latency Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Socket Memory Buffers */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-slate-100">TCP Read / Write Socket Memory (tcp_rmem / wmem)</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Max Socket Buffer Limit</span>
              <span className="font-mono text-sm font-bold tabular-nums text-emerald-400">
                {state.maxSocketBufferMb} MB ({(state.maxSocketBufferMb * 1024 * 1024).toLocaleString()} bytes)
              </span>
            </div>

            <input
              type="range"
              min={16}
              max={64}
              step={8}
              value={state.maxSocketBufferMb}
              onChange={(e) => onUpdateState({ maxSocketBufferMb: Number(e.target.value), enableNetworkBoost: true })}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>16 MB (Stock Android)</span>
              <span>32 MB (Standard)</span>
              <span className="text-emerald-400 font-semibold">64 MB (Gigabit Wi-Fi 6E/5G)</span>
            </div>

            {/* Direct Socket Low Latency */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">Bypass Kernel Socket Prequeue (tcp_low_latency=1)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Sends incoming packets directly to app threads without waiting for scheduling ticks.
                </div>
              </div>
              <button
                onClick={() => onUpdateState({ tcpLowLatency: !state.tcpLowLatency, enableNetworkBoost: true })}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  state.tcpLowLatency ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    state.tcpLowLatency ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Gaming DNS Booster */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-slate-100">Gaming DNS & Host Lookup Acceleration</h4>
          </div>

          <div className="space-y-2.5">
            {dnsOptions.map((dns) => {
              const isSelected = state.dnsOptimizer === dns.id;
              return (
                <button
                  key={dns.id}
                  onClick={() => onUpdateState({ dnsOptimizer: dns.id, enableNetworkBoost: true })}
                  className={`w-full p-3 text-left rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 text-slate-100'
                      : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{dns.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400">{dns.ips}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">{dns.provider}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
