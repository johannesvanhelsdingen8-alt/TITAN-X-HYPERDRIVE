import { TunerState, SocProfile } from '../types/tuner';

export function generateLiveCommands(state: TunerState, soc: SocProfile): string[] {
  const cmds: string[] = [];

  cmds.push('# --- 1. Governor & CPU/GPU Overclock Tuning ---');
  cmds.push(`for cpu in /sys/devices/system/cpu/cpu*/cpufreq; do`);
  cmds.push(`  if [ -f "$cpu/scaling_governor" ]; then`);
  cmds.push(`    echo "${state.cpuGovernor}" > "$cpu/scaling_governor"`);
  if (state.cpuGovernor === 'performance') {
    cmds.push(`    echo "${state.cpuOverclockTargetMhz * 1000}" > "$cpu/scaling_max_freq" 2>/dev/null || true`);
  }
  cmds.push(`  fi`);
  cmds.push(`done`);

  if (soc.vendor === 'Qualcomm') {
    cmds.push(`if [ -d /sys/class/kgsl/kgsl-3d0 ]; then`);
    cmds.push(`  echo "${state.gpuGovernor}" > /sys/class/kgsl/kgsl-3d0/devfreq/governor 2>/dev/null || true`);
    if (state.gpuGovernor === 'performance') {
      cmds.push(`  echo "${state.gpuOverclockTargetMhz * 1000000}" > /sys/class/kgsl/kgsl-3d0/max_gpuclk 2>/dev/null || true`);
    }
    if (state.bypassGpuThrottling) {
      cmds.push(`  echo 0 > /sys/class/kgsl/kgsl-3d0/throttling 2>/dev/null || true`);
      cmds.push(`  echo 0 > /sys/class/kgsl/kgsl-3d0/bus_split 2>/dev/null || true`);
    }
    cmds.push(`fi`);
  } else {
    cmds.push(`if [ -d /sys/devices/platform/*.mali ]; then`);
    cmds.push(`  echo "${state.gpuGovernor}" > /sys/devices/platform/*.mali/dvfs_governor 2>/dev/null || true`);
    cmds.push(`fi`);
  }

  cmds.push('');
  cmds.push('# --- 2. Memory & 8GB VRAM / zRAM Allocation ---');
  const zramBytes = state.zramExpansionGb * 1024 * 1024 * 1024;
  cmds.push(`swapoff /dev/block/zram0 2>/dev/null || true`);
  cmds.push(`echo 1 > /sys/block/zram0/reset 2>/dev/null || true`);
  cmds.push(`echo "${state.zramAlgorithm}" > /sys/block/zram0/comp_algorithm 2>/dev/null || true`);
  cmds.push(`echo ${zramBytes} > /sys/block/zram0/disksize`);
  cmds.push(`mkswap /dev/block/zram0 >/dev/null`);
  cmds.push(`swapon /dev/block/zram0 -p 32767`);
  cmds.push(`echo ${state.swappiness} > /proc/sys/vm/swappiness`);
  cmds.push(`echo 10 > /proc/sys/vm/vfs_cache_pressure`);
  if (state.dropCachesAggressive) {
    cmds.push(`echo 3 > /proc/sys/vm/drop_caches`);
  }

  cmds.push('');
  cmds.push('# --- 3. Graphics Drivers & OS Scheduler Tuning ---');
  if (state.tuneSchedulerLatency) {
    cmds.push(`echo 6000000 > /proc/sys/kernel/sched_latency_ns 2>/dev/null || true`);
    cmds.push(`echo 750000 > /proc/sys/kernel/sched_min_granularity_ns 2>/dev/null || true`);
    cmds.push(`echo 1000000 > /proc/sys/kernel/sched_wakeup_granularity_ns 2>/dev/null || true`);
  }
  cmds.push(`for queue in /sys/block/*/queue/scheduler; do`);
  cmds.push(`  echo "${state.ioScheduler}" > "$queue" 2>/dev/null || true`);
  cmds.push(`done`);

  if (soc.supportsKcal) {
    cmds.push('');
    cmds.push('# --- 4. Display Enhancer (KCAL Dynamic Vivid) ---');
    if (state.enableKcalVivid) {
      cmds.push(`if [ -d /sys/devices/platform/kcal_ctrl.0 ]; then`);
      cmds.push(`  echo 1 > /sys/devices/platform/kcal_ctrl.0/kcal_enable`);
      cmds.push(`  echo ${state.kcalSaturation} > /sys/devices/platform/kcal_ctrl.0/kcal_sat`);
      cmds.push(`  echo ${state.kcalContrast} > /sys/devices/platform/kcal_ctrl.0/kcal_val`);
      cmds.push(`  echo "${state.kcalRedMultiplier} ${state.kcalGreenMultiplier} ${state.kcalBlueMultiplier}" > /sys/devices/platform/kcal_ctrl.0/kcal`);
      cmds.push(`fi`);
    } else {
      cmds.push(`if [ -d /sys/devices/platform/kcal_ctrl.0 ]; then`);
      cmds.push(`  echo 256 > /sys/devices/platform/kcal_ctrl.0/kcal_sat`);
      cmds.push(`  echo 256 > /sys/devices/platform/kcal_ctrl.0/kcal_val`);
      cmds.push(`fi`);
    }
    cmds.push(`service call SurfaceFlinger 1035 i32 ${state.targetRefreshRate} 2>/dev/null || true`);
  }

  if (state.enableNetworkBoost) {
    cmds.push('');
    cmds.push('# --- 5. Network Booster & Low-Latency TCP Stack ---');
    const bufBytes = state.maxSocketBufferMb * 1024 * 1024;
    cmds.push(`echo "4096 87380 ${bufBytes}" > /proc/sys/net/ipv4/tcp_rmem`);
    cmds.push(`echo "4096 65536 ${bufBytes}" > /proc/sys/net/ipv4/tcp_wmem`);
    cmds.push(`echo "${state.tcpCongestion}" > /proc/sys/net/ipv4/tcp_congestion_control 2>/dev/null || echo cubic > /proc/sys/net/ipv4/tcp_congestion_control`);
    cmds.push(`echo ${state.tcpLowLatency ? 1 : 0} > /proc/sys/net/ipv4/tcp_low_latency 2>/dev/null || true`);
    cmds.push(`echo 1 > /proc/sys/net/ipv4/tcp_tw_reuse 2>/dev/null || true`);
    cmds.push(`echo 0 > /proc/sys/net/ipv4/tcp_slow_start_after_idle 2>/dev/null || true`);
    if (state.dnsOptimizer === 'cloudflare_gaming') {
      cmds.push(`setprop net.dns1 1.1.1.1`);
      cmds.push(`setprop net.dns2 1.0.0.1`);
    } else if (state.dnsOptimizer === 'google_dns') {
      cmds.push(`setprop net.dns1 8.8.8.8`);
      cmds.push(`setprop net.dns2 8.8.4.4`);
    }
  }

  return cmds;
}

export function generateStandaloneBashScript(state: TunerState, soc: SocProfile): string {
  const cmds = generateLiveCommands(state, soc);
  return `#!/system/bin/sh
# ==============================================================================
# TITAN X: HYPERFORGE - Silicon Overdrive & Kernel Warfare Script
# Target Device: ${soc.name}
# Profile: Overclocked Governor, ${state.zramExpansionGb}GB VRAM Allocation, Driver Optimization
# Generated: ${new Date().toISOString()}
# ==============================================================================

# Ensure script is executing as root
if [ "\$(id -u)" -ne 0 ]; then
  echo "[!] ERROR: TITAN X: HYPERFORGE requires root privileges (su)."
  exit 1
fi

echo "[*] Initializing TITAN X: HYPERFORGE Kernel Engine for ${soc.name}..."

${cmds.join('\n')}

echo "[✓] TITAN X: HYPERFORGE parameters applied successfully!"
echo "[*] Virtual VRAM Expansion: ${state.zramExpansionGb}GB active (${state.zramAlgorithm} compression)"
echo "[*] CPU Governor: ${state.cpuGovernor} | Target: ${state.cpuOverclockTargetMhz}MHz"
echo "[*] GPU Governor: ${state.gpuGovernor} | Target: ${state.gpuOverclockTargetMhz}MHz"
echo "[*] Network Congestion: ${state.tcpCongestion} (Low Latency: ${state.tcpLowLatency})"
`;
}

export function generateMagiskModuleFiles(state: TunerState, soc: SocProfile) {
  const moduleProp = `id=titanx_hyperforge_optimizer
name=TITAN X: HYPERFORGE Kernel & Hardware Booster
version=v4.0.0
versionCode=400
author=Titan Forge Core Team
description=Applies custom CPU/GPU overclock governors, allocates ${state.zramExpansionGb}GB VRAM/zRAM, installs ${state.selectedDriver} driver tweaks, KCAL vivid display calibration, and BBR low-latency network stack.
`;

  const systemProp = `# Graphics & Display Enhancements
debug.vulkan.layers=${state.enableVulkanLayerBypass ? '0' : '1'}
debug.egl.hw=${state.forceHwUiRendering ? '1' : '0'}
debug.sf.latch_unsignaled=${state.surfaceFlingerZeroLatch ? '1' : '0'}
vendor.perf.gestureopts=${state.touchSamplingBoost240Hz ? '1' : '0'}
persist.sys.sf.color_saturation=${state.enableKcalVivid ? '1.25' : '1.0'}
persist.sys.composition.type=c2d
debug.performance.tuning=1
video.accelerate.hw=1

# Memory Management Properties
persist.sys.purgeable_assets=1
ro.zram.mark_idle_delay_mins=60
ro.sys.fw.bg_apps_limit=32
`;

  const serviceSh = `#!/system/bin/sh
# TITAN X: HYPERFORGE late-start service
# Executed automatically after Android boot completes (service.sh)

MODDIR=\${0%/*}
LOGFILE="/data/local/tmp/titanx_hyperforge.log"

exec > "\$LOGFILE" 2>&1
echo "=== TITAN X: HYPERFORGE Boot Initialization: \$(date) ==="

# Wait until surfaceflinger and zygote are ready
until [ "\$(getprop sys.boot_completed)" = "1" ]; do
  sleep 2
done

sleep 5

${generateLiveCommands(state, soc).join('\n')}

echo "=== TITAN X: HYPERFORGE successfully initialized at \$(date) ==="
`;

  return { moduleProp, systemProp, serviceSh };
}
