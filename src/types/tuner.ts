export type CpuGovernor = 'performance' | 'schedutil' | 'powersave' | 'conservative' | 'ondemand';

export type GpuGovernor = 'performance' | 'msm-adreno-tz' | 'simple_ondemand' | 'userspace';

export type ZramAlgorithm = 'lz4' | 'zstd' | 'lzo-rle';

export type GraphicsDriver = 'turnip_v24' | 'adreno_v757' | 'adreno_v615' | 'mali_vulkan';

export type TcpCongestion = 'bbr' | 'cubic' | 'westwood' | 'bbr2';

export interface SocProfile {
  id: string;
  name: string;
  vendor: 'Qualcomm' | 'MediaTek' | 'Google' | 'Samsung' | 'UniSoC' | 'Generic';
  cpuArchitecture: string;
  gpuModel: string;
  defaultCpuClock: number; // in MHz (e.g. 3300)
  maxOverclockCpu: number; // in MHz (e.g. 3520)
  defaultGpuClock: number; // in MHz (e.g. 770)
  maxOverclockGpu: number; // in MHz (e.g. 903)
  physicalRamGb: number;
  supportsKcal: boolean;
  defaultDriver: GraphicsDriver;
  thermalZonePath: string;
}

import { DeviceBrand, OemHardwareDirectives } from './device';

export interface TunerState {
  selectedSocId: string;
  selectedDeviceId?: string;
  oemBrand?: DeviceBrand;
  oemDirectives?: OemHardwareDirectives;
  deviceModel: string;
  rootMode: 'magisk' | 'kernelsu' | 'apatch' | 'unrooted_demo';
  
  // Overclocking & Governors
  cpuGovernor: CpuGovernor;
  gpuGovernor: GpuGovernor;
  cpuOverclockTargetMhz: number;
  gpuOverclockTargetMhz: number;
  bypassGpuThrottling: boolean;
  thermalSafetyCutoff: boolean;
  maxAllowedTempCelsius: number;

  // RAM & VRAM Expansion
  zramExpansionGb: number; // 2 to 8
  zramAlgorithm: ZramAlgorithm;
  swappiness: number; // 0 - 100
  dropCachesAggressive: boolean;

  // Graphics & OS Drivers
  selectedDriver: GraphicsDriver;
  enableVulkanLayerBypass: boolean;
  forceHwUiRendering: boolean;
  surfaceFlingerZeroLatch: boolean;
  touchSamplingBoost240Hz: boolean;
  tuneSchedulerLatency: boolean;
  ioScheduler: 'noop' | 'kyber' | 'mq-deadline' | 'none';

  // Display Enhancer
  enableKcalVivid: boolean;
  kcalSaturation: number; // 256 default, up to 320
  kcalContrast: number; // 256 default, up to 300
  kcalRedMultiplier: number;
  kcalGreenMultiplier: number;
  kcalBlueMultiplier: number;
  targetRefreshRate: 60 | 90 | 120 | 144;

  // Network Booster
  enableNetworkBoost: boolean;
  tcpCongestion: TcpCongestion;
  tcpLowLatency: boolean;
  dnsOptimizer: 'cloudflare_gaming' | 'google_dns' | 'quad9' | 'stock';
  maxSocketBufferMb: number; // e.g. 64
}

export interface LiveHardwareTelemetry {
  socTemp: number; // in Celsius
  batteryTemp: number;
  batteryLevelPct: number;
  batteryCycleCount: number;
  batteryHealthStatus: 'Good' | 'Fair' | 'Overheat' | 'Degraded';
  batteryVoltageMv: number;
  batteryChargeCurrentMa: number;
  batteryDesignCapacityMah: number;
  batteryCurrentCapacityMah: number;
  cpuUsagePct: number;
  currentCpuMhz: number;
  currentGpuMhz: number;
  gpuUsagePct: number;
  activeGovernor: string;
  usedPhysicalRamMb: number;
  totalPhysicalRamMb: number;
  usedZramMb: number;
  totalZramMb: number;
  isThrottled: boolean;
  frameRateSimulationFps: number;
}
