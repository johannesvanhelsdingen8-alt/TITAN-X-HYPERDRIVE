export type DeviceBrand =
  | 'all'
  | 'samsung'
  | 'honor'
  | 'sony'
  | 'hisense'
  | 'xiaomi'
  | 'google'
  | 'oneplus'
  | 'asus'
  | 'motorola'
  | 'generic';

export interface PhoneModel {
  id: string;
  brand: DeviceBrand;
  brandName: string;
  modelName: string;
  socId: string;
  osSkin: string; // e.g. "One UI 6.1.1 (Android 14/15)"
  androidVersion: string; // e.g. "Android 14 / 15"
  screenSpecs: string; // e.g. "6.8\" Dynamic AMOLED 2X 120Hz LTPO (3120x1440)"
  coolingSystem: string; // e.g. "1.9x Vapor Chamber Titanium Frame"
  oemFeatures: string[]; // e.g. ["GOS Bypass", "Xclipse RDNA3 RT", "Game Booster"]
  defaultZramGb: number;
  recommendedDriver: 'turnip_v24' | 'adreno_v757' | 'adreno_v615' | 'mali_vulkan';
}

export interface DetectedDeviceResult {
  brand: DeviceBrand;
  brandName: string;
  modelName: string;
  matchedDeviceId: string;
  socId: string;
  gpuRenderer: string;
  gpuVendor: string;
  cpuCores: number;
  ramGb: number;
  osVersion: string;
  screenResolution: string;
  screenRefreshRateHz: number;
  isMobileDevice: boolean;
  confidence: 'exact' | 'hardware_match' | 'heuristic' | 'desktop_preview';
  detectedOemSkin: string;
  optimizationSummary: string;
}

export interface OemHardwareDirectives {
  // Samsung
  bypassSamsungGos: boolean;
  xclipseRaytracingBoost: boolean;
  samsungGameBooster120Hz: boolean;

  // Honor
  honorGpuTurboX: boolean;
  magicOsThermalOverride: boolean;

  // Sony
  sonyHsPowerControl: boolean;
  sonyCreatorModeBravia: boolean;
  sonyTouchPolling240Hz: boolean;

  // Hisense
  hisenseEinkWaveformA2: boolean;
  hisenseHiFiDacDirect: boolean;

  // Xiaomi
  xiaomiJoyoseBypass: boolean;
  xiaomiWildboost: boolean;

  // Google Pixel
  pixelTensorNpuBoost: boolean;
  pixelScheduleAffinity: boolean;
}
