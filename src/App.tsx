import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SOC_PROFILES } from './data/socProfiles';
import { TunerState, LiveHardwareTelemetry, SocProfile } from './types/tuner';
import { Header } from './components/Header';
import { TelemetryBar } from './components/TelemetryBar';
import { DeviceSelector } from './components/DeviceSelector';
import { DashboardOverview } from './components/DashboardOverview';
import { OverclockPanel } from './components/OverclockPanel';
import { VramRamPanel } from './components/VramRamPanel';
import { GraphicsDriversPanel } from './components/GraphicsDriversPanel';
import { DisplayEnhancerPanel } from './components/DisplayEnhancerPanel';
import { NetworkBoosterPanel } from './components/NetworkBoosterPanel';
import { BenchmarkModal } from './components/BenchmarkModal';
import { ExportModal } from './components/ExportModal';
import { LiveTerminalDrawer } from './components/LiveTerminalDrawer';
import { StartupAnimation } from './components/StartupAnimation';
import { CopywritingServicesPanel } from './components/CopywritingServicesPanel';
import { GameOptimizerHub } from './components/GameOptimizerHub';
import { TitanVoicePanel } from './components/TitanVoicePanel';
import { CloudSqlProfilesManager } from './components/CloudSqlProfilesManager';
import { titanAudio } from './services/titanAudio';
import { CheckCircle2, Terminal, ShieldCheck, Database, Mic, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('games');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isStartingUp, setIsStartingUp] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Active SoC
  const [selectedSocId, setSelectedSocId] = useState<string>('snapdragon_8_gen_3');
  const currentSoc: SocProfile =
    SOC_PROFILES.find((s) => s.id === selectedSocId) || SOC_PROFILES[0];

  // Tuner State
  const [tunerState, setTunerState] = useState<TunerState>({
    selectedSocId: 'snapdragon_8_gen_3',
    deviceModel: 'Snapdragon 8 Gen 3 Flagship',
    rootMode: 'magisk',

    // Overclocking
    cpuGovernor: 'performance',
    gpuGovernor: 'performance',
    cpuOverclockTargetMhz: currentSoc.maxOverclockCpu,
    gpuOverclockTargetMhz: currentSoc.maxOverclockGpu,
    bypassGpuThrottling: true,
    thermalSafetyCutoff: true,
    maxAllowedTempCelsius: 75,

    // 8GB VRAM / RAM Expansion
    zramExpansionGb: 8,
    zramAlgorithm: 'lz4',
    swappiness: 100,
    dropCachesAggressive: false,

    // Graphics Drivers & OS
    selectedDriver: currentSoc.defaultDriver,
    enableVulkanLayerBypass: true,
    forceHwUiRendering: true,
    surfaceFlingerZeroLatch: true,
    touchSamplingBoost240Hz: true,
    tuneSchedulerLatency: true,
    ioScheduler: 'none',

    // Display Enhancer
    enableKcalVivid: true,
    kcalSaturation: 290,
    kcalContrast: 270,
    kcalRedMultiplier: 256,
    kcalGreenMultiplier: 254,
    kcalBlueMultiplier: 262,
    targetRefreshRate: 144,

    // Network Booster
    enableNetworkBoost: true,
    tcpCongestion: 'bbr',
    tcpLowLatency: true,
    dnsOptimizer: 'cloudflare_gaming',
    maxSocketBufferMb: 64,
  });

  // Handle SoC selection update
  const handleSelectSoc = (socId: string) => {
    setSelectedSocId(socId);
    const newSoc = SOC_PROFILES.find((s) => s.id === socId) || SOC_PROFILES[0];
    setTunerState((prev) => ({
      ...prev,
      selectedSocId: socId,
      selectedDriver: newSoc.defaultDriver,
      cpuOverclockTargetMhz: newSoc.maxOverclockCpu,
      gpuOverclockTargetMhz: newSoc.maxOverclockGpu,
    }));
    showToast(`Loaded hardware profile: ${newSoc.name}`);
  };

  const handleUpdateState = (partial: Partial<TunerState>) => {
    setTunerState((prev) => ({ ...prev, ...partial }));
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  const handleApplyProfile = (profile: 'gaming' | 'balanced' | 'powersave') => {
    if (profile === 'gaming') {
      setTunerState((prev) => ({
        ...prev,
        cpuGovernor: 'performance',
        gpuGovernor: 'performance',
        cpuOverclockTargetMhz: currentSoc.maxOverclockCpu,
        gpuOverclockTargetMhz: currentSoc.maxOverclockGpu,
        bypassGpuThrottling: true,
        zramExpansionGb: 8,
        swappiness: 100,
        selectedDriver: 'turnip_v24',
        enableVulkanLayerBypass: true,
        surfaceFlingerZeroLatch: true,
        enableKcalVivid: true,
        kcalSaturation: 295,
        targetRefreshRate: 144,
        enableNetworkBoost: true,
        tcpCongestion: 'bbr',
        tcpLowLatency: true,
      }));
      showToast('Gaming Ultra Profile Applied: Peak Clocks & 8GB VRAM Active');
    } else if (profile === 'balanced') {
      setTunerState((prev) => ({
        ...prev,
        cpuGovernor: 'schedutil',
        gpuGovernor: 'simple_ondemand',
        cpuOverclockTargetMhz: currentSoc.defaultCpuClock,
        gpuOverclockTargetMhz: currentSoc.defaultGpuClock,
        bypassGpuThrottling: false,
        zramExpansionGb: 4,
        swappiness: 60,
        enableKcalVivid: false,
        targetRefreshRate: 120,
        enableNetworkBoost: true,
        tcpCongestion: 'cubic',
      }));
      showToast('Balanced Daily Profile Applied');
    } else {
      setTunerState((prev) => ({
        ...prev,
        cpuGovernor: 'powersave',
        gpuGovernor: 'simple_ondemand',
        cpuOverclockTargetMhz: currentSoc.defaultCpuClock - 300,
        gpuOverclockTargetMhz: currentSoc.defaultGpuClock - 150,
        bypassGpuThrottling: false,
        zramExpansionGb: 2,
        swappiness: 30,
        enableKcalVivid: false,
        targetRefreshRate: 60,
        enableNetworkBoost: false,
        tcpCongestion: 'cubic',
      }));
      showToast('Battery Saver Profile Applied: Lowest Frequencies & 60Hz');
    }
  };

  const handleFlushCaches = () => {
    showToast('Linux drop_caches triggered: Inactive pagecache & dentries cleared');
  };

  // Hardware Telemetry Simulation
  const [telemetry, setTelemetry] = useState<LiveHardwareTelemetry>({
    socTemp: 41.5,
    batteryTemp: 34.2,
    batteryLevelPct: 84,
    batteryCycleCount: 218,
    batteryHealthStatus: 'Good',
    batteryVoltageMv: 4192,
    batteryChargeCurrentMa: -420,
    batteryDesignCapacityMah: 5000,
    batteryCurrentCapacityMah: 4720,
    cpuUsagePct: 24,
    currentCpuMhz: currentSoc.maxOverclockCpu,
    currentGpuMhz: currentSoc.maxOverclockGpu,
    gpuUsagePct: 18,
    activeGovernor: tunerState.cpuGovernor,
    usedPhysicalRamMb: Math.round(currentSoc.physicalRamGb * 1024 * 0.58),
    totalPhysicalRamMb: currentSoc.physicalRamGb * 1024,
    usedZramMb: 3480,
    totalZramMb: tunerState.zramExpansionGb * 1024,
    isThrottled: false,
    frameRateSimulationFps: 120,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const isPerf = tunerState.cpuGovernor === 'performance';
        const baseTargetCpu = isPerf ? tunerState.cpuOverclockTargetMhz : currentSoc.defaultCpuClock * 0.7;
        const baseTargetGpu = tunerState.gpuGovernor === 'performance' ? tunerState.gpuOverclockTargetMhz : currentSoc.defaultGpuClock * 0.5;

        // Fluctuations
        const cpuJitter = Math.round((Math.random() - 0.5) * 80);
        const gpuJitter = Math.round((Math.random() - 0.5) * 40);
        const cpuMhz = Math.max(800, Math.min(currentSoc.maxOverclockCpu, baseTargetCpu + cpuJitter));
        const gpuMhz = Math.max(300, Math.min(currentSoc.maxOverclockGpu, baseTargetGpu + gpuJitter));

        const tempBaseline = isPerf ? 48 : 39;
        const tempNoise = (Math.random() - 0.5) * 1.5;
        const socTemp = Math.round((tempBaseline + tempNoise) * 10) / 10;
        const isThrottled = tunerState.thermalSafetyCutoff && socTemp >= tunerState.maxAllowedTempCelsius;

        const fpsTarget = isPerf ? tunerState.targetRefreshRate : Math.min(60, tunerState.targetRefreshRate);
        const fpsNoise = Math.round(Math.random() * 3 - 1);

        return {
          ...prev,
          currentCpuMhz: isThrottled ? Math.round(cpuMhz * 0.7) : cpuMhz,
          currentGpuMhz: isThrottled ? Math.round(gpuMhz * 0.7) : gpuMhz,
          socTemp,
          batteryTemp: Math.round((32 + (socTemp - 38) * 0.3) * 10) / 10,
          batteryLevelPct: 84,
          batteryCycleCount: 218,
          batteryHealthStatus: 'Good',
          batteryVoltageMv: 4180 + Math.round((Math.random() - 0.5) * 15),
          batteryChargeCurrentMa: isPerf ? -760 + Math.round((Math.random() - 0.5) * 60) : -390 + Math.round((Math.random() - 0.5) * 30),
          batteryDesignCapacityMah: 5000,
          batteryCurrentCapacityMah: 4720,
          cpuUsagePct: isPerf ? Math.round(35 + Math.random() * 25) : Math.round(15 + Math.random() * 15),
          gpuUsagePct: isPerf ? Math.round(40 + Math.random() * 30) : Math.round(10 + Math.random() * 15),
          totalZramMb: tunerState.zramExpansionGb * 1024,
          usedZramMb: Math.round(tunerState.zramExpansionGb * 1024 * (tunerState.swappiness / 100) * 0.45),
          isThrottled,
          frameRateSimulationFps: Math.max(30, Math.min(tunerState.targetRefreshRate, fpsTarget + fpsNoise)),
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [tunerState, currentSoc]);

  // Workstation Keyboard Navigation [Q] / [E] or Arrow Keys
  useEffect(() => {
    const tabOrder = ['games', 'titan_voice', 'cloud_sql', 'dashboard', 'overclock', 'vram', 'drivers', 'display', 'network', 'benchmark', 'copywriting'];
    const handleNavKeys = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      const currentIndex = tabOrder.indexOf(activeTab);
      if ((e.key === 'q' || e.key === 'Q' || e.key === '[') && currentIndex > 0) {
        titanAudio.playFocus();
        setActiveTab(tabOrder[currentIndex - 1]);
      } else if ((e.key === 'e' || e.key === 'E' || e.key === ']') && currentIndex < tabOrder.length - 1) {
        titanAudio.playFocus();
        setActiveTab(tabOrder[currentIndex + 1]);
      }
    };

    window.addEventListener('keydown', handleNavKeys);
    return () => window.removeEventListener('keydown', handleNavKeys);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans pb-24 relative titan-cyber-bg selection:bg-teal-500/20 selection:text-teal-300">
      {/* Hyperforce Electric Turquoise & Hunter Green Ambient Glows */}
      <div className="fixed top-0 left-1/3 w-[650px] h-[320px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-emerald-950/25 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-1/4 w-96 h-96 bg-teal-900/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Fullscreen Cyberpunk Startup & Boot Diagnostics Sequence */}
      <AnimatePresence>
        {isStartingUp && (
          <StartupAnimation
            onComplete={() => setIsStartingUp(false)}
            targetDeviceName={currentSoc.name}
          />
        )}
      </AnimatePresence>

      {/* Strict 3-Zone Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        onReplayStartup={() => setIsStartingUp(true)}
      />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Hardware Telemetry Bar (Shown on Games & Dashboard tabs) */}
        {(activeTab === 'games' || activeTab === 'dashboard') && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TelemetryBar telemetry={telemetry} soc={currentSoc} />
          </motion.div>
        )}

        {/* Device & Root Selector Strip (Shown on Hardware tuning tabs) */}
        {(activeTab === 'games' || activeTab === 'dashboard' || activeTab === 'overclock' || activeTab === 'vram' || activeTab === 'drivers' || activeTab === 'display') && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <DeviceSelector
              socProfiles={SOC_PROFILES}
              currentSoc={currentSoc}
              state={tunerState}
              onSelectSoc={handleSelectSoc}
              onUpdateState={handleUpdateState}
              onApplyProfile={handleApplyProfile}
            />
          </motion.div>
        )}

        {/* Animated Tab View Router with AnimatePresence */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'games' && (
                <GameOptimizerHub
                  state={tunerState}
                  soc={currentSoc}
                  telemetry={telemetry}
                  onUpdateState={handleUpdateState}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'titan_voice' && (
                <TitanVoicePanel
                  soc={currentSoc}
                  state={tunerState}
                  onApplyProfileChanges={handleUpdateState}
                />
              )}

              {activeTab === 'cloud_sql' && (
                <CloudSqlProfilesManager
                  currentSoc={currentSoc}
                  currentState={tunerState}
                  onLoadProfile={(loadedPartial, loadedSocId) => {
                    handleSelectSoc(loadedSocId);
                    handleUpdateState(loadedPartial);
                    showToast('Loaded profile from Cloud SQL PostgreSQL!');
                  }}
                />
              )}

              {activeTab === 'dashboard' && (
                <DashboardOverview
                  state={tunerState}
                  soc={currentSoc}
                  telemetry={telemetry}
                  onUpdateState={handleUpdateState}
                  onNavigateTab={setActiveTab}
                  onOpenExport={() => setIsExportOpen(true)}
                />
              )}

              {activeTab === 'overclock' && (
                <OverclockPanel
                  state={tunerState}
                  soc={currentSoc}
                  onUpdateState={handleUpdateState}
                />
              )}

              {activeTab === 'vram' && (
                <VramRamPanel
                  state={tunerState}
                  soc={currentSoc}
                  onUpdateState={handleUpdateState}
                  onFlushCaches={handleFlushCaches}
                />
              )}

              {activeTab === 'drivers' && (
                <GraphicsDriversPanel
                  state={tunerState}
                  soc={currentSoc}
                  onUpdateState={handleUpdateState}
                />
              )}

              {activeTab === 'display' && (
                <DisplayEnhancerPanel
                  state={tunerState}
                  soc={currentSoc}
                  onUpdateState={handleUpdateState}
                />
              )}

              {activeTab === 'network' && (
                <NetworkBoosterPanel
                  state={tunerState}
                  onUpdateState={handleUpdateState}
                />
              )}

              {activeTab === 'benchmark' && (
                <BenchmarkModal
                  state={tunerState}
                  soc={currentSoc}
                />
              )}

              {activeTab === 'copywriting' && (
                <CopywritingServicesPanel
                  state={tunerState}
                  soc={currentSoc}
                  onOpenExport={() => setIsExportOpen(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Live Terminal Stream Bottom Drawer */}
      <LiveTerminalDrawer state={tunerState} soc={currentSoc} />

      {/* Export Magisk Module & Scripts Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        state={tunerState}
        soc={currentSoc}
      />

      {/* Feedback Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-slate-900/95 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-emerald-300 shadow-xl shadow-emerald-950/40 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* TITAN X: HYPERFORGE Tactical Hardware Status Bar */}
      <footer className="fixed bottom-0 inset-x-0 z-30 border-t border-teal-950/80 bg-black/95 backdrop-blur-2xl px-4 py-2.5 select-none shadow-[0_-10px_35px_rgba(0,0,0,0.9)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs font-mono text-slate-400">
          {/* Left: Quick Tactical Shortcuts */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-1.5">
              <span className="titan-key-chip">Q</span>
              <span className="titan-key-chip">E</span>
              <span className="text-slate-300 font-semibold hidden sm:inline">Tab Switch</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="titan-key-chip titan-key-chip-active">SYSFS</span>
              <span className="text-teal-300">Root Kernel Linked</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="titan-key-chip">zRAM</span>
              <span className="text-slate-300">8GB VRAM Block</span>
            </div>
          </div>

          {/* Right: Cloud SQL & Hardware Status */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
              <Database className="h-3.5 w-3.5 text-teal-400" />
              <span className="text-slate-300">Cloud SQL (europe-west1)</span>
            </div>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.9)]" />
              <span className="text-teal-300 font-bold uppercase tracking-wider text-[11px]">
                TITAN X // HYPERFORGE ACTIVE
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
