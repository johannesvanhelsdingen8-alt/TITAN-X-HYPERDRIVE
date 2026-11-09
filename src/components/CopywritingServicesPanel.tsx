import React, { useState } from 'react';
import { TunerState, SocProfile } from '../types/tuner';
import {
  FileText,
  Copy,
  Check,
  Download,
  Sparkles,
  Send,
  Star,
  CheckCircle2,
  Share2,
  PenTool,
  Store,
  Terminal,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Flame,
  BadgeAlert,
} from 'lucide-react';

interface CopywritingServicesPanelProps {
  state: TunerState;
  soc: SocProfile;
  onOpenExport?: () => void;
}

type CopyFormat = 'play_store' | 'xda_thread' | 'github_release' | 'community_pitch' | 'onboarding';
type CopyTone = 'hardcore' | 'professional' | 'gaming';

interface ServicePackage {
  id: string;
  name: string;
  tagline: string;
  price: string;
  turnaround: string;
  features: string[];
  popular?: boolean;
}

export const CopywritingServicesPanel: React.FC<CopywritingServicesPanelProps> = ({
  state,
  soc,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<CopyFormat>('play_store');
  const [tone, setTone] = useState<CopyTone>('hardcore');
  const [copied, setCopied] = useState<boolean>(false);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('aso_kit');

  // Service Order Form State
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [appName, setAppName] = useState<string>('TITAN X: Hyperforge');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [orderSubmitted, setOrderSubmitted] = useState<boolean>(false);

  // Packages list
  const packages: ServicePackage[] = [
    {
      id: 'aso_kit',
      name: 'Google Play & ASO Kit',
      tagline: 'Rank higher and convert APK visitors into loyal daily users.',
      price: '$49',
      turnaround: '24-48 Hours',
      features: [
        'SEO-optimized 30-char App Title & 80-char Short Hook',
        'Keyword-dense 4,000-char Long Description',
        '7 Bulletproof Feature Highlights with technical specs',
        '5 Screenshot Caption Headlines & Micro-copy',
        'Google Play Store Policy & Safety Compliance Check',
      ],
      popular: true,
    },
    {
      id: 'xda_suite',
      name: 'XDA & Modder Launch Suite',
      tagline: 'Technical thread copy that earns respect on XDA, Reddit & GitHub.',
      price: '$79',
      turnaround: '48 Hours',
      features: [
        'BBCode/Markdown formatted XDA Developers Thread template',
        'Kernel governor & sysfs architecture breakdown',
        'Step-by-step Magisk / KernelSU flashing instructions',
        'Hardware disclaimer & battery safety guarantee copy',
        'Benchmark comparative data tables (FPS & Frame times)',
      ],
    },
    {
      id: 'full_campaign',
      name: 'Full App Launch Campaign',
      tagline: 'End-to-end promotional copywriting across all Android modding channels.',
      price: '$129',
      turnaround: '72 Hours',
      features: [
        'Everything in Play Store Kit + XDA Suite',
        'Reddit r/Android & r/AndroidRoot high-engagement pitch',
        'Telegram & Discord channel announcement copy',
        'GitHub README.md + Version Release Notes (v1.0.0)',
        'In-app onboarding dialogs & toast micro-copy',
        '2 rounds of editorial revisions with senior tech copywriter',
      ],
    },
  ];

  // Dynamic Copy Generators based on Active SoC & Tuner State
  const getPlayStoreCopy = () => {
    if (tone === 'hardcore') {
      return `【 APP TITLE 】
TITAN X: HYPERFORGE - ${soc.name} Kernel & 8GB VRAM Studio

【 SHORT DESCRIPTION (80 chars max) 】
Overclock ${soc.name}, allocate 8GB Virtual VRAM, and flash custom GPU drivers.

【 FULL DESCRIPTION 】
Take full command of your mobile silicon. TITAN X: HYPERFORGE gives power users, benchmark enthusiasts, and gamers direct kernel-level tuning controls for ${soc.name}.

🚀 KEY PERFORMANCE CAPABILITIES:
• 8GB VIRTUAL VRAM / ZRAM EXPANSION:
Eliminate background task termination and stutter. Leverage high-speed ${state.zramAlgorithm.toUpperCase()} compressed memory allocation up to ${state.zramExpansionGb}GB with intelligent page caching.

• KERNEL OVERCLOCKING & GOVERNORS:
Lock your CPU frequencies to maximum clock target (${soc.maxOverclockCpu} MHz) and GPU to ${soc.maxOverclockGpu} MHz using the raw Linux '${state.cpuGovernor}' governor.

• GRAPHICS PIPELINE & VULKAN DRIVERS:
Switch seamlessly between ${state.selectedDriver} and custom Mesa Turnip Vulkan layers. Enjoy zero-latch frame dispatching and 240Hz touch sampling rate boosts.

• KCAL DYNAMIC VIVID DISPLAY:
Re-calibrate your AMOLED/OLED panel with precision hardware RGB matrix adjustments for deeper contrast, vibrant gamut, and true cinema-grade saturation.

• GOOGLE BBR LOW-LATENCY NETWORKING:
Engage kernel-level BBR TCP congestion control algorithms to slash ping jitter and packet loss during competitive mobile gaming.

⚠️ SYSTEM REQUIREMENTS:
• Root access via Magisk, KernelSU, or APatch (or unlocked bootloader for custom kernel scripts).
• ARM64 device running Android 9.0 to Android 15.

DISCLAIMER: TITAN X: HYPERFORGE interacts directly with sysfs/procfs kernel nodes. Built-in thermal safeguards are included to protect device hardware longevity.`;
    }

    if (tone === 'gaming') {
      return `【 APP TITLE 】
TITAN X: HYPERFORGE Game Warfare - 8GB VRAM & Ultra FPS Optimizer

【 SHORT DESCRIPTION 】
Unlock 120FPS gaming, 8GB RAM expansion, and lowest ping on ${soc.name}!

【 FULL DESCRIPTION 】
Tired of frame drops, thermal throttling, and lag during ranked matches? TITAN X: HYPERFORGE unleashes the hidden gaming potential inside your ${soc.name}!

🎮 ULTIMATE GAMING FEATURES:
🔥 8GB VIRTUAL VRAM EXPANSION:
Allocate up to 8GB of ultra-compressed virtual video memory to keep high-end game textures loaded in real-time. No more stutter or out-of-memory crashes!

⚡ 120FPS / 144Hz DISPLAY SMOOTHNESS:
Force ultra-high refresh rates, eliminate UI input lag with 240Hz touch sampling boost, and enjoy instant trigger response in FPS games.

🎮 CUSTOM VULKAN GRAPHICS DRIVERS:
Bypass OEM driver bottlenecks using modern Vulkan 1.3 shaders. Experience up to 25% faster frame rendering in heavy 3D open-world titles.

🌐 ZERO-LAG GOOGLE BBR NETWORK ENGINE:
Slash gaming ping by up to 35% with Google's low-latency TCP congestion engine. Enjoy rock-solid multiplayer stability.

🔋 SMART THERMAL MONITORING:
Real-time SoC and battery health analytics keep your device running cool and safe during marathon gaming sessions.

Download TITAN X: HYPERFORGE and dominate the leaderboard!`;
    }

    // Professional / Clean Tone
    return `【 APP TITLE 】
TITAN X: HYPERFORGE - Silicon Overdrive & Kernel Warfare Engine

【 SHORT DESCRIPTION 】
Advanced system kernel tuning, zRAM memory management, and hardware calibration.

【 FULL DESCRIPTION 】
TITAN X: HYPERFORGE is a professional-grade system management utility designed for Android devices powered by ${soc.name}.

Designed for advanced users, hardware engineers, and developers, this suite provides direct transparent control over kernel parameters, memory paging architectures, and display calibration matrices.

CORE MODULES:
1. Memory Virtualization Subsystem:
Configure kernel zRAM blocks up to ${state.zramExpansionGb}GB with LZ4 compression, dynamic swappiness weighting (${state.swappiness}%), and automated cache drops.

2. Governor & Clock Frequency Management:
Deploy verified Linux kernel scaling governors ('${state.cpuGovernor}') with configurable thermal limits to balance operational efficiency and compute throughput.

3. Graphics & Display Engine:
Utilize Vulkan 1.3 hardware rendering pipelines, SurfaceFlinger optimizations, and KCAL hardware color matrices for accurate display fidelity.

4. Network Stack Optimization:
Implement Google BBR TCP algorithms to improve socket buffer utilization and throughput consistency.

TECHNICAL NOTES:
Root privileges (Magisk / KernelSU) required for low-level sysfs writes. Non-root users can export flashable recovery modules and deployment shell scripts.`;
  };

  const getXdaThreadCopy = () => {
    return `[CENTER][B][SIZE=6][COLOR="#10B981"]★ TITAN X: HYPERFORGE ★[/COLOR][/SIZE]
[SIZE=4]Kernel Overdrive • 8GB Virtual VRAM • Turnip Vulkan • Titan X Hardware Warfare Engine[/SIZE]
[SIZE=2]Optimized for: [B]${soc.name}[/B] | Architecture: ARM64-v8a[/SIZE][/CENTER]

[HR][/HR]
[SIZE=4][B][COLOR="#38BDF8"]1. INTRODUCTION & PHILOSOPHY[/COLOR][/B][/SIZE]
TITAN X: HYPERFORGE is a clean, no-bloat kernel and hardware tuning utility built specifically for rooted Android power users. Instead of placebo RAM cleaners, TITAN X interacts directly with [B]/sys/devices/system/cpu[/B], [B]/sys/class/kgsl[/B], [B]/dev/block/zram0[/B], and Qualcomm/MediaTek hardware nodes.

[SIZE=4][B][COLOR="#38BDF8"]2. HIGHLIGHTED CAPABILITIES[/COLOR][/B][/SIZE]
[LIST]
[*] [B]8GB Virtual VRAM (zRAM):[/B] Configurable up to 8GB with LZ4/zstd compression and customizable swappiness.
[*] [B]CPU/GPU Overclock Governors:[/B] Force Performance governor, override thermal throttling safety caps, and set target frequencies.
[*] [B]Graphics Driver Pipelines:[/B] Toggle Turnip Vulkan layers, SurfaceFlinger zero-latch, and 240Hz touch sampling rate.
[*] [B]KCAL Vivid OLED Calibration:[/B] Real-time RGB hardware matrix control for true dynamic contrast and deep color saturation.
[*] [B]Google BBR TCP Congestion Control:[/B] Slash ping jitter in online games.
[*] [B]Export Options:[/B] Generate ready-to-flash Magisk / KernelSU ZIP modules, standalone shell scripts, or native APK project source.
[/LIST]

[SIZE=4][B][COLOR="#38BDF8"]3. BENCHMARK VERIFICATION[/COLOR][/B][/SIZE]
[CODE]
Target SoC:        ${soc.name}
CPU Baseline:      ${soc.defaultCpuClock} MHz  ==>  Target: ${state.cpuOverclockTargetMhz} MHz
GPU Baseline:      ${soc.defaultGpuClock} MHz  ==>  Target: ${state.gpuOverclockTargetMhz} MHz
zRAM Allocation:   ${state.zramExpansionGb}GB (${state.zramAlgorithm.toUpperCase()} compression)
Frame Rate Target: ${state.targetRefreshRate} FPS (SurfaceFlinger Zero-Latch)
[/CODE]

[SIZE=4][B][COLOR="#38BDF8"]4. INSTALLATION INSTRUCTIONS[/COLOR][/B][/SIZE]
[B]Method A (Direct APK):[/B]
1. Download and install [B]TitanX-Hyperforge.apk[/B].
2. Open app and grant Superuser (su) root permission.
3. Tap "Apply Profile" to commit sysfs tweaks.

[B]Method B (Magisk / KernelSU Module):[/B]
1. Export the Magisk ZIP from the app.
2. In Magisk Manager, go to Modules -> Install from storage.
3. Flash and reboot. All governors and 8GB VRAM will mount at boot!

[SIZE=4][B][COLOR="#EF4444"]5. DISCLAIMER & WARRANTY[/COLOR][/B][/SIZE]
[QUOTE]Your warranty is now void. I am not responsible for bricked devices, dead SD cards, or thermal shutdowns. Please ensure your device has adequate cooling when testing high overclock frequencies.[/QUOTE]

[B]Credits:[/B] TopJohnWu (libsu), Mesa Turnip Team, Google (BBR), Linux Kernel community.`;
  };

  const getGithubReleaseCopy = () => {
    return `# TITAN X: HYPERFORGE v4.0 - Silicon Overdrive & Kernel Warfare Engine

## 🚀 Release Highlights
- **Active SoC Support:** Added customized profiles for **${soc.name}** and modern ARM64 silicon.
- **8GB Virtual VRAM Allocation:** Fast compressed zRAM initialization block via \`/dev/block/zram0\` with dynamic swappiness controls.
- **Mesa Turnip Vulkan Integration:** GPU driver bypass pipeline for Adreno & Immortalis GPUs.
- **KCAL Vivid OLED Display Matrix:** Native RGB matrix saturation tuning for AMOLED panels.
- **Google BBR TCP Congestion:** Slash network packet jitter and latency.
- **Capacitor & Magisk Export Engine:** Package this React app into a production Android APK with root bridge or export flashable Magisk modules.

---

## 📦 Downloads & Artifacts
| File | Description | Target |
| :--- | :--- | :--- |
| \`TitanX-Hyperforge-release.apk\` | Signed Production APK | Android 9.0 - 15 (ARM64) |
| \`TitanX-Hyperforge-MagiskModule-${soc.id}.zip\` | Auto-boot Flashable Magisk Module | Magisk / KernelSU / APatch |
| \`titanx_hyperforge_${soc.id}.sh\` | Standalone Root Shell Script | ADB / Termux Shell |

---

## 🛠️ CLI Quick Execution (Termux / ADB)
\`\`\`bash
# Run standalone script with root
su -c sh /sdcard/Download/apex_tuner_${soc.id}.sh
\`\`\`

## 🛡️ License & Safety
Distributed under the Apache 2.0 License. Thermal cutoffs are enabled by default at ${state.maxAllowedTempCelsius}°C.`;
  };

  const getCommunityPitchCopy = () => {
    return `⚡ **[RELEASE] TITAN X: HYPERFORGE - Unlock 8GB VRAM & Overclock ${soc.name}!** ⚡

Hey everyone! 👋 If you've been looking for a clean, modern kernel tuner that doesn't use gimmicky RAM cleaners or battery placebo apps, check out **TITAN X: HYPERFORGE**.

🔥 **What it actually does:**
✅ Allocates **${state.zramExpansionGb}GB of Virtual VRAM** in high-speed compressed memory (LZ4).
✅ Forces Linux **${state.cpuGovernor}** CPU & GPU governors up to **${state.cpuOverclockTargetMhz}MHz**.
✅ Injects **Turnip Vulkan 1.3** graphics layers & zero-latch frame dispatching.
✅ Calibrates display colors with **KCAL Vivid OLED saturation**.
✅ Activates **Google BBR TCP** congestion algorithms for ultra-low ping.

📱 Works on **rooted phones (Magisk / KernelSU / APatch)** and can also be exported as a flashable ZIP or standalone APK!

👇 Grab the APK or Magisk ZIP now:
https://github.com/apextuner/apex-tuner/releases/tag/v2.5.0`;
  };

  const getOnboardingCopy = () => {
    return `// Screen 1: Welcome & Root Detection
Title: "Welcome to TITAN X: HYPERFORGE"
Subtitle: "Hardware Kernel & 8GB VRAM Studio for ${soc.name}"
Body: "TITAN X provides direct low-level kernel governor control, high-speed zRAM expansion, and graphics driver optimization. Grant Superuser root privileges to enable real-time sysfs tweaking."
Action: "Grant Root & Initialize"

// Screen 2: 8GB VRAM Memory Virtualization
Title: "Allocate 8GB Virtual VRAM"
Subtitle: "Zero Task Drops • Silky Multitasking"
Body: "Convert compressed memory into high-speed paging cache with LZ4 algorithm. Prevents heavy 3D games from crashing or reloading."
Action: "Configure Memory Buffer"

// Screen 3: Thermal Safeguards
Title: "Hardware Protection Guarantee"
Subtitle: "Automatic Thermal Throttling"
Body: "Safety cutoff is armed at ${state.maxAllowedTempCelsius}°C. Governors will safely downclock if excessive heat is detected."
Action: "Launch Tuner Dashboard"`;
  };

  const getCurrentCopy = () => {
    switch (selectedFormat) {
      case 'play_store':
        return getPlayStoreCopy();
      case 'xda_thread':
        return getXdaThreadCopy();
      case 'github_release':
        return getGithubReleaseCopy();
      case 'community_pitch':
        return getCommunityPitchCopy();
      case 'onboarding':
        return getOnboardingCopy();
      default:
        return getPlayStoreCopy();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCopy = () => {
    const ext = selectedFormat === 'xda_thread' || selectedFormat === 'github_release' ? 'md' : 'txt';
    const blob = new Blob([getCurrentCopy()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TitanX_Hyperforge_${selectedFormat}_${tone}_copy.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSubmitted(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Service Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Professional Tech Copywriting Services</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              High-Converting Copy for Your Android Apps & Modding Releases
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Publishing an Android APK, Magisk module, or custom ROM? Get battle-tested App Store Optimization (ASO), technical XDA threads, GitHub release notes, and community pitch copy written by senior mobile tech copywriters.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setSelectedPackage('aso_kit');
                setOrderModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <PenTool className="h-4 w-4" />
              <span>Book Copywriting Service</span>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('instant-generator');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer whitespace-nowrap"
            >
              <FileText className="h-4 w-4 text-emerald-400" />
              <span>Use Instant Generator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Service Packages Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Star className="h-4 w-4 text-emerald-400 fill-emerald-400" />
              <span>Professional Copywriting Packages</span>
            </h3>
            <p className="text-xs text-slate-400">Written and vetted by experienced Android developers & technical copywriters</p>
          </div>
          <span className="text-xs font-mono text-emerald-400">Guaranteed 24-72h Turnaround</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                pkg.popular
                  ? 'border-emerald-500/50 bg-slate-900/90 shadow-[0_0_25px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 right-4 rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950 shadow-md">
                  Most Popular
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <h4 className="text-base font-bold text-white">{pkg.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{pkg.tagline}</p>
                </div>

                <div className="flex items-baseline gap-2 pt-2 border-t border-slate-800/80">
                  <span className="text-2xl font-black text-emerald-400 font-mono">{pkg.price}</span>
                  <span className="text-xs text-slate-400">/ project</span>
                  <span className="ml-auto text-[11px] font-mono text-slate-400">{pkg.turnaround}</span>
                </div>

                <ul className="space-y-2 pt-2 text-xs text-slate-300">
                  {pkg.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  setSelectedPackage(pkg.id);
                  setOrderModalOpen(true);
                }}
                className={`mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  pkg.popular
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                <span>Request {pkg.name}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Instant Live Copywriting Generator */}
      <div id="instant-generator" className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <PenTool className="h-4 w-4 text-emerald-400" />
              <span>Instant Self-Service Copywriting Generator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live copy tailored to active specs: <span className="text-emerald-400 font-semibold">{soc.name}</span>, <span className="text-cyan-400 font-semibold">{state.zramExpansionGb}GB VRAM</span>, and <span className="text-indigo-400 font-semibold">{state.selectedDriver}</span>
            </p>
          </div>

          {/* Tone Selector */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
            <span className="text-[11px] font-mono text-slate-500 px-2">TONE:</span>
            <button
              onClick={() => setTone('hardcore')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                tone === 'hardcore'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pro Modder
            </button>
            <button
              onClick={() => setTone('gaming')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                tone === 'gaming'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ultra Gaming
            </button>
            <button
              onClick={() => setTone('professional')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                tone === 'professional'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Enterprise Clean
            </button>
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex border-b border-slate-800 gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedFormat('play_store')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              selectedFormat === 'play_store'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store className="h-4 w-4" />
            <span>Google Play Store Listing</span>
          </button>

          <button
            onClick={() => setSelectedFormat('xda_thread')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              selectedFormat === 'xda_thread'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>XDA Developers Thread</span>
          </button>

          <button
            onClick={() => setSelectedFormat('github_release')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              selectedFormat === 'github_release'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>GitHub Release & Changelog</span>
          </button>

          <button
            onClick={() => setSelectedFormat('community_pitch')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              selectedFormat === 'community_pitch'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="h-4 w-4" />
            <span>Reddit / Telegram Launch</span>
          </button>

          <button
            onClick={() => setSelectedFormat('onboarding')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              selectedFormat === 'onboarding'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>In-App Onboarding Copy</span>
          </button>
        </div>

        {/* Live Copy Viewer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400">
              Word Count: <span className="text-emerald-400 font-bold tabular-nums">{getCurrentCopy().split(/\s+/).length}</span> words | Characters: <span className="text-cyan-400 font-bold tabular-nums">{getCurrentCopy().length}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(getCurrentCopy())}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>

              <button
                onClick={handleDownloadCopy}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={getCurrentCopy()}
            rows={14}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500 select-all"
          />
        </div>
      </div>

      {/* Booking / Service Request Modal */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <PenTool className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Order Copywriting Service</h3>
              </div>
              <button
                onClick={() => {
                  setOrderModalOpen(false);
                  setOrderSubmitted(false);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {!orderSubmitted ? (
              <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Selected Package</label>
                  <select
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 font-medium"
                  >
                    <option value="aso_kit">Google Play & ASO Kit ($49 - 24-48h)</option>
                    <option value="xda_suite">XDA & Modder Launch Suite ($79 - 48h)</option>
                    <option value="full_campaign">Full App Launch Campaign ($129 - 72h)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Carter"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Contact Email</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@developer.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">App / Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TITAN X: Hyperforge"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Special Features & Target Keywords</label>
                  <textarea
                    rows={3}
                    placeholder={`e.g. Needs focus on ${soc.name}, 8GB VRAM expansion, Turnip Vulkan gaming performance, and battery safety...`}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                  />
                </div>

                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-[11px] text-emerald-300 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Our editorial team will confirm the creative brief and deliver ready-to-publish copy with full editorial rights directly to your email within the guaranteed window.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOrderModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Copywriting Brief</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Copywriting Brief Received!</h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                    Thank you, <strong className="text-white">{clientName || 'Developer'}</strong>. Our senior technical copywriters have received your brief for <strong className="text-emerald-400">{appName}</strong>. We will review the specs for {soc.name} and reach out to <strong className="text-slate-100">{clientEmail}</strong> shortly.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setOrderModalOpen(false);
                    setOrderSubmitted(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                >
                  Return to Tuner
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
