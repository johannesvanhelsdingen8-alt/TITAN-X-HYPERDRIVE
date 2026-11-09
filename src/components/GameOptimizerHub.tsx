import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MobileGame, INITIAL_GAMES } from '../data/gamesData';
import { TunerState, SocProfile, LiveHardwareTelemetry } from '../types/tuner';
import { titanAudio } from '../services/titanAudio';
import {
  Gamepad2,
  Zap,
  Cpu,
  Gauge,
  Flame,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  Wifi,
  Layers,
  Touchpad,
  Activity,
  X,
  ChevronRight,
  Maximize2,
  Pin,
  Clock,
} from 'lucide-react';

interface GameOptimizerHubProps {
  state: TunerState;
  soc: SocProfile;
  telemetry: LiveHardwareTelemetry;
  onUpdateState: (patch: Partial<TunerState>) => void;
  onNavigateTab: (tab: string) => void;
}

export const GameOptimizerHub: React.FC<GameOptimizerHubProps> = ({
  state,
  soc,
  telemetry,
  onUpdateState,
  onNavigateTab,
}) => {
  const [games, setGames] = useState<MobileGame[]>(INITIAL_GAMES);
  const [selectedGameId, setSelectedGameId] = useState<string>('warzone_mobile');
  const [activeGameOverlay, setActiveGameOverlay] = useState<MobileGame | null>(null);
  const [isBoosting, setIsBoosting] = useState<boolean>(false);
  const [boostLogs, setBoostLogs] = useState<string[]>([]);
  const [showAddGameModal, setShowAddGameModal] = useState<boolean>(false);
  const [autoTuningNotice, setAutoTuningNotice] = useState<string | null>(null);

  // New Custom Game Form State
  const [newGameTitle, setNewGameTitle] = useState<string>('');
  const [newGamePackage, setNewGamePackage] = useState<string>('');
  const [newGameGenre, setNewGameGenre] = useState<MobileGame['genre']>('Action RPG');
  const [newGameFps, setNewGameFps] = useState<number>(90);

  const selectedGame = games.find((g) => g.id === selectedGameId) || games[0];

  // Keyboard navigation for authentic console feel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAddGameModal || activeGameOverlay) return;

      const currentIndex = games.findIndex((g) => g.id === selectedGameId);
      if (e.key === 'ArrowRight' && currentIndex < games.length - 1) {
        titanAudio.playFocus();
        setSelectedGameId(games[currentIndex + 1].id);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        titanAudio.playFocus();
        setSelectedGameId(games[currentIndex - 1].id);
      } else if (e.key === 'Enter') {
        handleBoostAndLaunch(selectedGame);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGameId, games, showAddGameModal, activeGameOverlay]);

  // Handle 1-Click Game Hardware Boost
  const handleBoostAndLaunch = (game: MobileGame) => {
    titanAudio.playBoostLaunch();
    setIsBoosting(true);
    setBoostLogs([]);

    const steps = [
      `1/5 Flushed OS file caches (echo 3 > /proc/sys/vm/drop_caches)`,
      `2/5 Locked CPU clusters to 'Performance' governor @ ${soc.maxOverclockCpu} MHz`,
      `3/5 Allocated ${game.recommendedVramGb}GB dedicated zRAM memory block for ${game.title}`,
      `4/5 Injected ${game.recommendedDriver === 'turnip_v24' ? 'Mesa Turnip Vulkan 1.3' : 'Adreno OEM'} driver layer`,
      `5/5 Forced ${game.recommendedRefreshRate}Hz SurfaceFlinger display sync & 360Hz touch sampling`,
      `[SUCCESS] Hardware profile locked for ${soc.name}. Launching ${game.title}...`,
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setBoostLogs((prev) => [...prev, step]);
        if (idx === steps.length - 1) {
          // Apply tuner state changes for this game
          onUpdateState({
            cpuGovernor: 'performance',
            gpuGovernor: 'performance',
            cpuOverclockTargetMhz: soc.maxOverclockCpu,
            gpuOverclockTargetMhz: soc.maxOverclockGpu,
            zramExpansionGb: Math.max(state.zramExpansionGb, game.recommendedVramGb),
            selectedDriver: game.recommendedDriver,
            targetRefreshRate: game.recommendedRefreshRate,
            touchSamplingBoost240Hz: true,
            surfaceFlingerZeroLatch: true,
            enableVulkanLayerBypass: true,
            enableNetworkBoost: game.bbrQosPriority,
          });

          // Mark game as active/boosted
          setGames((prev) =>
            prev.map((g) => (g.id === game.id ? { ...g, status: 'Boosted & Active' } : g))
          );

          setTimeout(() => {
            setIsBoosting(false);
            setActiveGameOverlay(game);
          }, 800);
        }
      }, (idx + 1) * 350);
    });
  };

  // Hardware-Aware Auto-Tuner tailored to phone SoC
  const handleAutoTuneForPhone = () => {
    titanAudio.playSelect();
    setAutoTuningNotice(`Analyzing ${soc.name} hardware architecture...`);

    setTimeout(() => {
      // Dynamic logic according to phone silicon
      let optimalDriver = selectedGame.recommendedDriver;
      let optimalVram = selectedGame.recommendedVramGb;
      let optimalFps = selectedGame.recommendedRefreshRate;

      if (soc.vendor === 'Qualcomm') {
        optimalDriver = 'turnip_v24';
        optimalVram = Math.min(8, selectedGame.recommendedVramGb + 2);
      } else if (soc.vendor === 'MediaTek') {
        optimalDriver = 'mali_vulkan';
        optimalVram = 8;
      }

      setGames((prev) =>
        prev.map((g) =>
          g.id === selectedGame.id
            ? {
                ...g,
                recommendedDriver: optimalDriver,
                recommendedVramGb: optimalVram,
                recommendedRefreshRate: optimalFps,
                boostedAverageFps: Math.min(optimalFps, Math.round(g.stockAverageFps * 1.55)),
                status: 'Optimized',
                customNotes: `Auto-tuned specifically for ${soc.name} (${soc.cpuArchitecture}). Optimal driver: ${optimalDriver}, VRAM: ${optimalVram}GB.`,
              }
            : g
        )
      );

      setAutoTuningNotice(
        `✓ Hardware Match Complete: Applied optimal settings for ${soc.name} (GPU: ${soc.gpuModel}).`
      );

      setTimeout(() => setAutoTuningNotice(null), 4000);
    }, 700);
  };

  // Quick Resume Pin Toggle
  const toggleQuickResumePin = (gameId: string) => {
    titanAudio.playSelect();
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, isQuickResumePinned: !g.isQuickResumePinned } : g))
    );
  };

  // Handle Add Game
  const handleAddCustomGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameTitle.trim()) return;

    const newGame: MobileGame = {
      id: `custom_${Date.now()}`,
      title: newGameTitle,
      developer: 'Installed Application',
      packageName: newGamePackage || `com.game.${newGameTitle.toLowerCase().replace(/\s+/g, '')}`,
      genre: newGameGenre,
      coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&q=80',
      graphicsBackend: 'Vulkan 1.3',
      stockAverageFps: 60,
      boostedAverageFps: newGameFps,
      nativeResolution: 'Native 1080p (Hardware Boosted)',
      recommendedVramGb: 6,
      recommendedDriver: soc.vendor === 'Qualcomm' ? 'turnip_v24' : 'mali_vulkan',
      recommendedRefreshRate: newGameFps as 60 | 90 | 120 | 144,
      cpuAffinityMode: 'performance_prime',
      touchPollingRateHz: 240,
      bbrQosPriority: true,
      thermalSafetyLimit: 78,
      isQuickResumePinned: true,
      status: 'Ready to Boost',
      customNotes: `Custom game profile configured for ${soc.name}.`,
    };

    setGames([newGame, ...games]);
    setSelectedGameId(newGame.id);
    setShowAddGameModal(false);
    setNewGameTitle('');
    setNewGamePackage('');
    titanAudio.playSelect();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* TITAN X: HYPERFORGE Hero Showcase Tile */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-slate-800 bg-slate-900 shadow-2xl transition-all duration-300 group">
        {/* Cinematic Backdrop Banner Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={selectedGame.bannerImage}
            alt={selectedGame.title}
            className="h-full w-full object-cover object-center opacity-30 filter brightness-75 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-between min-h-[380px]">
          {/* Top Bar on Hero: Hardware Compatibility Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              <span className="text-emerald-400 font-extrabold uppercase tracking-wider">
                TITAN X // HYPERFORGE OPTIMIZER
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300 font-semibold">{soc.name}</span>
            </div>

            <div className="flex items-center gap-2">
              {selectedGame.isQuickResumePinned && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-950/70 border border-emerald-500/50 text-[11px] font-mono font-bold text-emerald-300">
                  <Pin className="h-3 w-3 fill-emerald-400" />
                  <span>QUICK RESUME PINNED (8GB VRAM)</span>
                </div>
              )}
              <div className="px-3 py-1 rounded-md bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-slate-300">
                {selectedGame.graphicsBackend}
              </div>
            </div>
          </div>

          {/* Center: Title & Specs Grid */}
          <div className="my-auto space-y-4 max-w-3xl">
            <div className="space-y-1">
              <span className="text-xs font-mono text-emerald-400 tracking-wider uppercase">
                {selectedGame.developer} · {selectedGame.genre}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase drop-shadow-md">
                {selectedGame.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-2xl leading-relaxed">
                {selectedGame.customNotes}
              </p>
            </div>

            {/* Hardware Metrics Comparison Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 backdrop-blur-md">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Target Frame Rate</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-emerald-400 font-mono tabular-nums">
                    {selectedGame.boostedAverageFps}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">FPS</span>
                  <span className="text-[10px] text-slate-500 font-mono ml-auto">
                    (stock {selectedGame.stockAverageFps})
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 backdrop-blur-md">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">VRAM Buffer Allocation</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-cyan-400 font-mono tabular-nums">
                    {selectedGame.recommendedVramGb}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">GB</span>
                  <span className="text-[10px] text-slate-500 font-mono ml-auto">zRAM LZ4</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 backdrop-blur-md">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Graphics Pipeline</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-sm font-bold text-indigo-300 font-mono truncate">
                    {selectedGame.recommendedDriver === 'turnip_v24' ? 'Turnip v24.2' : 'Adreno OEM'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono block">Zero-Latch Dispatch</span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 backdrop-blur-md">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Touch Polling Rate</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-amber-400 font-mono tabular-nums">
                    {selectedGame.touchPollingRateHz}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Hz</span>
                  <span className="text-[10px] text-slate-500 font-mono ml-auto">Hyper-Response</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
            {/* Primary Electric Turquoise Hyperforge Boost Button */}
            <button
              onClick={() => handleBoostAndLaunch(selectedGame)}
              className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 px-6 py-3.5 text-xs sm:text-sm font-black text-slate-950 shadow-[0_0_25px_rgba(20,184,166,0.55)] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              <span>ENGAGE HYPERFORGE BOOST</span>
            </button>

            {/* Auto-Tune For Phone Button */}
            <button
              onClick={handleAutoTuneForPhone}
              className="flex items-center gap-2 rounded-xl border border-teal-500/50 bg-teal-950/40 hover:bg-teal-900/60 px-4 py-3.5 text-xs font-bold text-teal-300 transition-all cursor-pointer whitespace-nowrap"
              title="Calculates optimal clocks and VRAM allocation for your phone's SoC"
            >
              <Sparkles className="h-4 w-4 text-teal-400" />
              <span>Auto-Tune for {soc.name.split(' ')[0]}</span>
            </button>

            {/* Quick Resume Toggle */}
            <button
              onClick={() => toggleQuickResumePin(selectedGame.id)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-3.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedGame.isQuickResumePinned
                  ? 'border-teal-500/60 bg-teal-950/60 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.3)]'
                  : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-teal-500/40'
              }`}
            >
              <Pin className={`h-4 w-4 ${selectedGame.isQuickResumePinned ? 'fill-teal-400 text-teal-400' : ''}`} />
              <span>{selectedGame.isQuickResumePinned ? 'Pinned in VRAM' : 'Pin to Fast Resume'}</span>
            </button>

            {/* Hardware Profile Status in bottom right */}
            <div className="hidden lg:flex items-center gap-3 ml-auto text-xs font-mono">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-teal-950 text-slate-300">
                <span className="text-teal-400 font-bold">GPU:</span>
                <span className="text-slate-200">{soc.gpuModel}</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-teal-950 text-slate-300">
                <span className="text-teal-400 font-bold">VRAM:</span>
                <span className="text-teal-300">{selectedGame.recommendedVramGb}GB Block</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Tuning Feedback Notification */}
      {autoTuningNotice && (
        <div className="rounded-xl border border-teal-500/60 bg-teal-950/80 p-3.5 text-xs font-mono text-teal-300 flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <Sparkles className="h-4 w-4 text-teal-400 shrink-0" />
          <span>{autoTuningNotice}</span>
        </div>
      )}

      {/* TITAN X Hardware Acceleration Matrix Game Profiles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-teal-400" />
            <h3 className="text-base font-extrabold text-white tracking-wide uppercase">
              HARDWARE ACCELERATION MATRIX // PROFILES
            </h3>
            <span className="text-xs font-mono text-slate-500">({games.length} titles ready)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                titanAudio.playSelect();
                setShowAddGameModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white hover:border-emerald-500/50 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-400" />
              <span>Add Custom Game</span>
            </button>
          </div>
        </div>

        {/* Console Horizontal Cards Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {games.map((game) => {
            const isSelected = game.id === selectedGameId;
            return (
              <div
                key={game.id}
                onClick={() => {
                  titanAudio.playFocus();
                  setSelectedGameId(game.id);
                }}
                className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col ${
                  isSelected
                    ? 'ring-2 ring-emerald-400 scale-[1.03] shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                    : 'border border-slate-800/80 hover:border-slate-600 opacity-80 hover:opacity-100 hover:scale-[1.01]'
                }`}
              >
                {/* Poster Artwork Aspect */}
                <div className="relative aspect-[3/4] w-full bg-slate-950 overflow-hidden">
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />

                  {/* Badges on Tile */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-800 text-[9px] font-mono font-bold text-emerald-400">
                      {game.boostedAverageFps} FPS
                    </span>
                  </div>

                  {game.isQuickResumePinned && (
                    <div className="absolute top-2 right-2">
                      <Pin className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400 drop-shadow" />
                    </div>
                  )}

                  {/* Title overlay at bottom of poster */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <h4 className="text-xs font-bold text-white truncate leading-tight">{game.title}</h4>
                    <span className="text-[10px] font-mono text-slate-400 truncate block">
                      {game.recommendedVramGb}GB VRAM
                    </span>
                  </div>
                </div>

                {/* Status Bar */}
                <div
                  className={`px-2 py-1 text-[10px] font-mono text-center truncate ${
                    isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {isSelected ? 'SELECTED' : game.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Game Hardware Tuning Parameters Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Hardware Tuning Knobs for {selectedGame.title}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust how the Linux kernel, graphics driver, and zRAM memory allocate resources for this specific title.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBoostAndLaunch(selectedGame)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-slate-950" />
              <span>Apply & Launch</span>
            </button>
          </div>
        </div>

        {/* 6 Core Tuning Knobs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Knob 1: Target FPS Refresh Override */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-emerald-400" />
                Target Frame Rate
              </span>
              <span className="font-mono text-emerald-400 font-bold">{selectedGame.recommendedRefreshRate} FPS</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[60, 90, 120, 144].map((fps) => (
                <button
                  key={fps}
                  onClick={() => {
                    titanAudio.playSelect();
                    setGames((prev) =>
                      prev.map((g) =>
                        g.id === selectedGame.id
                          ? { ...g, recommendedRefreshRate: fps as 60 | 90 | 120 | 144, boostedAverageFps: fps }
                          : g
                      )
                    );
                  }}
                  className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    selectedGame.recommendedRefreshRate === fps
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {fps}Hz
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Forces SurfaceFlinger display panel synchronization to bypass OEM 60 FPS thermal limits.
            </p>
          </div>

          {/* Knob 2: Dedicated Virtual VRAM Slice */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                Dedicated VRAM Slice
              </span>
              <span className="font-mono text-cyan-400 font-bold">{selectedGame.recommendedVramGb} GB</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[2, 4, 6, 8].map((vram) => (
                <button
                  key={vram}
                  onClick={() => {
                    titanAudio.playSelect();
                    setGames((prev) =>
                      prev.map((g) =>
                        g.id === selectedGame.id ? { ...g, recommendedVramGb: vram } : g
                      )
                    );
                  }}
                  className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    selectedGame.recommendedVramGb === vram
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {vram}GB
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Reserves high-priority LZ4 compressed memory in /dev/block/zram0 so high-res textures don't reload.
            </p>
          </div>

          {/* Knob 3: Graphics Driver Pipeline */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                Vulkan Driver Pipeline
              </span>
              <span className="font-mono text-indigo-400 font-bold">
                {selectedGame.recommendedDriver === 'turnip_v24' ? 'Turnip Vulkan' : 'Adreno OEM'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  titanAudio.playSelect();
                  setGames((prev) =>
                    prev.map((g) => (g.id === selectedGame.id ? { ...g, recommendedDriver: 'turnip_v24' } : g))
                  );
                }}
                className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  selectedGame.recommendedDriver === 'turnip_v24'
                    ? 'bg-indigo-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Turnip Vulkan 1.3
              </button>
              <button
                onClick={() => {
                  titanAudio.playSelect();
                  setGames((prev) =>
                    prev.map((g) => (g.id === selectedGame.id ? { ...g, recommendedDriver: 'adreno_v757' } : g))
                  );
                }}
                className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  selectedGame.recommendedDriver === 'adreno_v757'
                    ? 'bg-indigo-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                Adreno v757 OEM
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Mesa Turnip offers up to 25% faster shader compilation and fixes graphical glitches on Qualcomm SoCs.
            </p>
          </div>

          {/* Knob 4: Touch Polling Rate Boost */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Touchpad className="h-3.5 w-3.5 text-amber-400" />
                Touch Polling Rate
              </span>
              <span className="font-mono text-amber-400 font-bold">{selectedGame.touchPollingRateHz} Hz</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[120, 240, 360].map((hz) => (
                <button
                  key={hz}
                  onClick={() => {
                    titanAudio.playSelect();
                    setGames((prev) =>
                      prev.map((g) =>
                        g.id === selectedGame.id ? { ...g, touchPollingRateHz: hz as 120 | 240 | 360 } : g
                      )
                    );
                  }}
                  className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    selectedGame.touchPollingRateHz === hz
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {hz}Hz
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Overrides touch driver event loop latency for immediate aim and button trigger response.
            </p>
          </div>

          {/* Knob 5: Google BBR Network QoS Priority */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                Google BBR Low-Ping QoS
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {selectedGame.bbrQosPriority ? 'ENABLED' : 'OFF'}
              </span>
            </div>
            <button
              onClick={() => {
                titanAudio.playSelect();
                setGames((prev) =>
                  prev.map((g) =>
                    g.id === selectedGame.id ? { ...g, bbrQosPriority: !g.bbrQosPriority } : g
                  )
                );
              }}
              className={`w-full py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                selectedGame.bbrQosPriority
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {selectedGame.bbrQosPriority ? '✓ BBR Socket Priority ON' : 'Standard TCP Reno'}
            </button>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Applies kernel TCP BBR algorithms to prevent queue bufferbloat and ping spikes in online matches.
            </p>
          </div>

          {/* Knob 6: Thermal Threshold & Safety Cutoff */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-red-400" />
                Thermal Safety Ceiling
              </span>
              <span className="font-mono text-red-400 font-bold">{selectedGame.thermalSafetyLimit}°C</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[72, 78, 85].map((temp) => (
                <button
                  key={temp}
                  onClick={() => {
                    titanAudio.playSelect();
                    setGames((prev) =>
                      prev.map((g) =>
                        g.id === selectedGame.id ? { ...g, thermalSafetyLimit: temp } : g
                      )
                    );
                  }}
                  className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    selectedGame.thermalSafetyLimit === temp
                      ? 'bg-red-500 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {temp}°C
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              If temperature exceeds this limit, governors safely downclock to prevent thermal damage.
            </p>
          </div>
        </div>
      </div>

      {/* Boosting Progress Modal / Animation */}
      {isBoosting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border-2 border-emerald-500/60 bg-slate-900 p-6 shadow-[0_0_50px_rgba(16,185,129,0.3)] space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Zap className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Applying Hardware Boost for {selectedGame.title}</span>
                </h3>
                <p className="text-xs font-mono text-emerald-400">Target SoC: {soc.name}</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs space-y-2 max-h-48 overflow-y-auto">
              {boostLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <span className="text-emerald-400 font-bold">›</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-mono">
              <span>Memory Paging & Governor Lock in progress...</span>
              <span className="text-emerald-400 font-bold animate-pulse">OPTIMIZING</span>
            </div>
          </div>
        </div>
      )}

      {/* Live In-Game Performance Tactical Overlay (Titan X HUD) */}
      {activeGameOverlay && (
        <div className="fixed bottom-6 right-6 z-50 w-96 rounded-2xl border-2 border-teal-500/70 bg-black/95 p-4 shadow-[0_0_35px_rgba(20,184,166,0.35)] backdrop-blur-2xl space-y-3 animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-teal-950 pb-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                TITAN X TACTICAL HUD // {activeGameOverlay.title}
              </span>
            </div>
            <button
              onClick={() => {
                titanAudio.playBack();
                setActiveGameOverlay(null);
              }}
              className="rounded p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Telemetry Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2">
              <span className="text-[10px] text-slate-400 uppercase">FPS Real-Time</span>
              <div className="text-xl font-black text-emerald-400 tabular-nums">
                {activeGameOverlay.boostedAverageFps}
              </div>
              <span className="text-[9px] text-slate-500">1% Low: {activeGameOverlay.boostedAverageFps - 3}</span>
            </div>

            <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2">
              <span className="text-[10px] text-slate-400 uppercase">CPU Clock</span>
              <div className="text-sm font-bold text-cyan-400 tabular-nums mt-1">
                {soc.maxOverclockCpu} MHz
              </div>
              <span className="text-[9px] text-emerald-400">Locked Perf</span>
            </div>

            <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2">
              <span className="text-[10px] text-slate-400 uppercase">SoC Temp</span>
              <div className="text-sm font-bold text-amber-400 tabular-nums mt-1">
                {telemetry.socTemp}°C
              </div>
              <span className="text-[9px] text-slate-500">Safe Ceiling</span>
            </div>
          </div>

          {/* Memory & VRAM Status */}
          <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-2.5 space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">8GB VRAM Allocation</span>
              <span className="text-emerald-400 font-bold tabular-nums">
                {activeGameOverlay.recommendedVramGb}.0 GB / 8.0 GB
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                style={{ width: `${(activeGameOverlay.recommendedVramGb / 8) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
            <span>SurfaceFlinger: 0-Latch Active</span>
            <button
              onClick={() => {
                titanAudio.playBack();
                setActiveGameOverlay(null);
              }}
              className="text-red-400 hover:text-red-300 font-semibold cursor-pointer"
            >
              Close HUD
            </button>
          </div>
        </div>
      )}

      {/* Add Custom Game Modal */}
      {showAddGameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Add Installed Mobile Game</h3>
              </div>
              <button
                onClick={() => setShowAddGameModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomGame} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Game Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diablo Immortal, Wild Rift, Roblox..."
                  value={newGameTitle}
                  onChange={(e) => setNewGameTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Android Package Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. com.blizzard.diablo.immortal"
                  value={newGamePackage}
                  onChange={(e) => setNewGamePackage(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Genre</label>
                  <select
                    value={newGameGenre}
                    onChange={(e) => setNewGameGenre(e.target.value as MobileGame['genre'])}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                  >
                    <option value="Action RPG">Action RPG</option>
                    <option value="Battle Royale">Battle Royale</option>
                    <option value="FPS / Shooter">FPS / Shooter</option>
                    <option value="Open World RPG">Open World RPG</option>
                    <option value="Racing / Sim">Racing / Sim</option>
                    <option value="Sandbox">Sandbox</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target FPS</label>
                  <select
                    value={newGameFps}
                    onChange={(e) => setNewGameFps(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 font-mono"
                  >
                    <option value={60}>60 FPS</option>
                    <option value={90}>90 FPS</option>
                    <option value={120}>120 FPS</option>
                    <option value={144}>144 FPS</option>
                  </select>
                </div>
              </div>

              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-[11px] text-emerald-300">
                TITAN X: HYPERFORGE will automatically generate dedicated 8GB VRAM swap blocks and governor rules for {newGameTitle || 'your game'}.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGameModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 cursor-pointer"
                >
                  Save & Optimize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
