import React, { useState } from 'react';
import { TunerState, SocProfile } from '../types/tuner';
import {
  generateStandaloneBashScript,
  generateMagiskModuleFiles,
} from '../services/scriptGenerator';
import {
  exportMagiskModuleZip,
  exportAndroidStudioZip,
  exportCapacitorProjectZip,
  downloadBlob,
} from '../services/zipExporter';
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
  Terminal,
  Package,
  Smartphone,
  Layers,
  Wrench,
  ShieldAlert,
  QrCode,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Flame,
  ArrowRight,
  Share2,
  CheckCircle2,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: TunerState;
  soc: SocProfile;
}

const SHARED_PHONE_URL = 'https://ais-pre-zfeqwlazl2iqy3vvuegw5b-612592286701.europe-west3.run.app';

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, state, soc }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'phone_direct' | 'capacitor_apk' | 'apk_project' | 'magisk_zip' | 'shell_script' | 'system_prop'>('phone_direct');
  const [capacitorSubTab, setCapacitorSubTab] = useState<'cli_guide' | 'gradle' | 'manifest' | 'plugin' | 'config'>('cli_guide');
  const [copied, setCopied] = useState<boolean>(false);
  const [urlCopied, setUrlCopied] = useState<boolean>(false);
  const [workflowCopied, setWorkflowCopied] = useState<boolean>(false);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [isExportingApkZip, setIsExportingApkZip] = useState<boolean>(false);
  const [isExportingCapacitorZip, setIsExportingCapacitorZip] = useState<boolean>(false);

  const standaloneScript = generateStandaloneBashScript(state, soc);
  const { moduleProp, systemProp, serviceSh } = generateMagiskModuleFiles(state, soc);

  const capacitorConfigJson = `{
  "appId": "com.titanx.hyperforge",
  "appName": "Titan X: Hyperforge",
  "webDir": "dist",
  "server": {
    "androidScheme": "https",
    "cleartext": false
  },
  "android": {
    "allowMixedContent": true,
    "captureInput": true,
    "webContentsDebuggingEnabled": false,
    "backgroundColor": "#020617"
  }
}`;

  const capacitorAppGradle = `apply plugin: 'com.android.application'

android {
    namespace "com.titanx.hyperforge"
    compileSdk 35

    defaultConfig {
        applicationId "com.titanx.hyperforge"
        minSdk 26
        targetSdk 35
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        release {
            storeFile file("release-key.keystore")
            storePassword System.getenv("KEYSTORE_PASSWORD") ?: "titanx123"
            keyAlias System.getenv("KEY_ALIAS") ?: "titanx"
            keyPassword System.getenv("KEY_PASSWORD") ?: "titanx123"
            v1SigningEnabled true
            v2SigningEnabled true
        }
    }

    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

repositories {
    google()
    mavenCentral()
    maven { url 'https://jitpack.io' }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation 'androidx.appcompat:appcompat:1.7.0'
    implementation 'androidx.coordinatorlayout:coordinatorlayout:1.2.0'
    implementation 'androidx.core:core-splashscreen:1.0.1'
    implementation project(':capacitor-android')
    
    // LibSU: Direct Linux superuser root execution for sysfs & kernel tuning
    implementation 'com.github.topjohnwu.libsu:core:5.2.2'
}

apply from: 'capacitor.build.gradle'
`;

  const capacitorManifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Superuser Root Access for sysfs & procfs kernel node manipulation -->
    <uses-permission android:name="android.permission.ACCESS_SUPERUSER" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.BATTERY_STATS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Titan X: Hyperforge"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:hardwareAccelerated="true"
        android:theme="@style/AppTheme.NoActionBar">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="Titan X: Hyperforge"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

    </application>

</manifest>
`;

  const rootBridgePluginCode = `package com.apextuner.app;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;
import com.topjohnwu.superuser.Shell;

/**
 * Native Capacitor bridge enabling React frontend to execute root shell commands
 * directly against /sys and /proc kernel interfaces.
 */
@CapacitorPlugin(name = "RootBridge")
public class RootBridgePlugin extends Plugin {

    @PluginMethod
    public void checkRoot(PluginCall call) {
        boolean isRoot = Shell.getShell().isRoot();
        JSObject ret = new JSObject();
        ret.put("isRoot", isRoot);
        call.resolve(ret);
    }

    @PluginMethod
    public void exec(PluginCall call) {
        String command = call.getString("command");
        if (command == null || command.isEmpty()) {
            call.reject("Command is required");
            return;
        }

        Shell.Result result = Shell.cmd(command).exec();
        JSObject ret = new JSObject();
        ret.put("success", result.isSuccess());
        ret.put("code", result.getCode());
        ret.put("output", String.join("\\n", result.getOut()));
        ret.put("error", String.join("\\n", result.getErr()));
        call.resolve(ret);
    }
}
`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsExportingZip(true);
    try {
      const zipBlob = await exportMagiskModuleZip(state, soc);
      const filename = `TitanX_Hyperforge_${soc.id}_${state.zramExpansionGb}GB_VRAM.zip`;
      downloadBlob(zipBlob, filename);
    } catch (e) {
      console.error('Failed to export ZIP', e);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleDownloadCapacitorZip = async () => {
    setIsExportingCapacitorZip(true);
    try {
      const zipBlob = await exportCapacitorProjectZip(state, soc);
      const filename = `TitanX_Hyperforge_Capacitor_Android_${soc.id}.zip`;
      downloadBlob(zipBlob, filename);
    } catch (e) {
      console.error('Failed to export Capacitor Project ZIP', e);
    } finally {
      setIsExportingCapacitorZip(false);
    }
  };

  const handleDownloadApkProjectZip = async () => {
    setIsExportingApkZip(true);
    try {
      const zipBlob = await exportAndroidStudioZip(state, soc);
      const filename = `TitanX_Hyperforge_Native_APK_${soc.id}.zip`;
      downloadBlob(zipBlob, filename);
    } catch (e) {
      console.error('Failed to export APK Project ZIP', e);
    } finally {
      setIsExportingApkZip(false);
    }
  };

  const handleDownloadScript = () => {
    const blob = new Blob([standaloneScript], { type: 'text/x-shellscript' });
    downloadBlob(blob, `titanx_hyperforge_${soc.id}.sh`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-800/90 bg-slate-900/95 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Export TITAN X: HYPERFORGE APK &amp; Magisk Modules</span>
              </h3>
              <p className="text-xs text-slate-400">Package this React application into an Android APK or flashable Magisk module for {soc.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Row */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/70 px-6 gap-2 pt-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('phone_direct')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'phone_direct'
                ? 'border-emerald-400 text-emerald-400 font-bold bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>📱 Get APK on My Phone</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">Direct</span>
          </button>

          <button
            onClick={() => setActiveTab('capacitor_apk')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'capacitor_apk'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Capacitor React APK</span>
          </button>

          <button
            onClick={() => setActiveTab('apk_project')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'apk_project'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Jetpack Compose APK</span>
          </button>

          <button
            onClick={() => setActiveTab('magisk_zip')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'magisk_zip'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Magisk Module ZIP</span>
          </button>

          <button
            onClick={() => setActiveTab('shell_script')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'shell_script'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>Root Shell Script (.sh)</span>
          </button>

          <button
            onClick={() => setActiveTab('system_prop')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'system_prop'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="h-4 w-4" />
            <span>system.prop Tweaks</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 0: GET DIRECTLY ON MY PHONE */}
          {activeTab === 'phone_direct' && (
            <div className="space-y-6">
              {/* Hero Status Banner */}
              <div className="rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-950 p-5 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase">
                      <Sparkles className="h-4 w-4" />
                      <span>Zero PC Required · Direct Mobile Phone Access</span>
                    </div>
                    <h4 className="text-lg font-black text-white tracking-tight">
                      Yes! You Can Get &amp; Install TITAN X Directly from Your Cellular Phone
                    </h4>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      Choose between installing the native <strong className="text-emerald-400 font-semibold">Android WebAPK</strong> (installs in 1-tap from Chrome into your App Drawer with full offline capability), downloading the <strong className="text-cyan-400 font-semibold">Magisk/KernelSU Module ZIP</strong> for root kernel tuning, or using our <strong className="text-indigo-400 font-semibold">Cloud APK Compiler</strong>.
                    </p>
                  </div>

                  <a
                    href={SHARED_PHONE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Open Phone Link</span>
                  </a>
                </div>
              </div>

              {/* QR Code & Direct Link Box */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                {/* QR Code Card */}
                <div className="md:col-span-5 rounded-xl border border-slate-800 bg-slate-950/80 p-5 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold">
                    <QrCode className="h-4 w-4" />
                    <span>Scan with Your Phone's Camera</span>
                  </div>

                  <div className="relative p-2 rounded-xl bg-slate-900 border-2 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&color=16-185-129&bgcolor=2-6-23&data=${encodeURIComponent(SHARED_PHONE_URL)}`}
                      alt="Scan to open on cellular phone"
                      className="w-48 h-48 rounded-lg object-contain"
                      loading="lazy"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug max-w-xs">
                    Point your camera or QR scanner at the code above to open TITAN X in your phone's browser (Google Chrome, Samsung Internet, Edge).
                  </p>
                </div>

                {/* Direct Link & Copy Tools */}
                <div className="md:col-span-7 rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h5 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-emerald-400" />
                      <span>Direct Cellular Phone Link</span>
                    </h5>
                    <p className="text-xs text-slate-400">
                      Send or paste this link to your phone via WhatsApp, Telegram, email, or browser:
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        readOnly
                        value={SHARED_PHONE_URL}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-emerald-300 selection:bg-emerald-500/30"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(SHARED_PHONE_URL);
                          setUrlCopied(true);
                          setTimeout(() => setUrlCopied(false), 2000);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer shrink-0"
                      >
                        {urlCopied ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/70 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-200">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>Pre-Configured For Your Phone</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                      Target Silicon: <strong className="text-emerald-400">{soc.name}</strong> · Profile: <strong className="text-indigo-300">{state.zramExpansionGb}GB Virtual VRAM</strong> · Driver: <strong className="text-cyan-300">{state.selectedDriver}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Mobile Installation Paths */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Path 1: Instant WebAPK Install */}
                <div className="rounded-xl border-2 border-emerald-500/40 bg-slate-900/80 p-5 space-y-3 relative group hover:border-emerald-500/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      FASTEST (NO PC)
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-white">
                    1. Native WebAPK Install
                  </h5>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Android Chrome &amp; Samsung Internet compile a real signed <strong className="text-emerald-400">.apk</strong> directly on your phone with an app drawer icon!
                  </p>

                  <div className="space-y-2 pt-1 font-mono text-[11px] text-slate-300 border-t border-slate-800">
                    <div className="flex items-start gap-2">
                      <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                      <span>Open link in Chrome on your phone</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                      <span>Tap <strong className="text-emerald-400">"Install App"</strong> or menu (⋮) → <strong className="text-emerald-400">"Add to Home screen"</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                      <span>Play Services installs the APK with full screen &amp; offline cache</span>
                    </div>
                  </div>
                </div>

                {/* Path 2: Flashable Magisk / KernelSU Root ZIP */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      <Package className="h-5 w-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      ROOT USERS
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-white">
                    2. Magisk / KernelSU ZIP
                  </h5>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Download the auto-booting flashable module directly to your phone storage to inject kernel governors and 8GB VRAM into <code className="text-cyan-400 font-mono">/system</code>.
                  </p>

                  <button
                    onClick={handleDownloadZip}
                    disabled={isExportingZip}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 transition-all cursor-pointer shadow-md"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{isExportingZip ? 'Packaging...' : 'Download ZIP to Phone'}</span>
                  </button>

                  <div className="space-y-1.5 pt-1 font-mono text-[11px] text-slate-400">
                    <div>1. Download saves to <code className="text-slate-300">/sdcard/Download</code></div>
                    <div>2. Open Magisk / KernelSU → Modules</div>
                    <div>3. Select ZIP &amp; reboot your phone</div>
                  </div>
                </div>

                {/* Path 3: Cloud Automated APK Builder */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      <Layers className="h-5 w-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      STANDALONE .APK
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-white">
                    3. Cloud APK Compiler
                  </h5>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Want a compiled raw <strong className="text-indigo-300">.apk</strong> binary without a PC? Push to GitHub; GitHub Actions compiles it in 2 min and delivers the direct APK download to your phone!
                  </p>

                  <button
                    onClick={() => {
                      const workflow = `name: Build TITAN X APK
on: [push, workflow_dispatch]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci && npm run build && npx cap sync android
      - run: cd android && chmod +x gradlew && ./gradlew assembleRelease
      - uses: actions/upload-artifact@v4
        with:
          name: TitanX-Release-APK
          path: android/app/build/outputs/apk/release/*.apk`;
                      navigator.clipboard.writeText(workflow);
                      setWorkflowCopied(true);
                      setTimeout(() => setWorkflowCopied(false), 2000);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    {workflowCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Workflow Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Cloud Builder (CI)</span>
                      </>
                    )}
                  </button>

                  <div className="space-y-1.5 pt-1 font-mono text-[11px] text-slate-400">
                    <div>• Zero local SDK setup needed</div>
                    <div>• Produces signed production APK</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: CAPACITOR REACT APK */}
          {activeTab === 'capacitor_apk' && (
            <div className="space-y-4">
              {/* Banner with 1-click Download */}
              <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 p-5 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-emerald-400" />
                      <span>Package This React App into Android APK with Capacitor</span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                      Packages the active Vite + React frontend into a native Android APK using Capacitor. Includes the pre-configured <code className="text-emerald-400 font-mono">RootBridge</code> plugin for root (<code className="text-emerald-400 font-mono">su</code>) kernel tuning and production Gradle files.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadCapacitorZip}
                    disabled={isExportingCapacitorZip}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    <Download className="h-4 w-4" />
                    <span>{isExportingCapacitorZip ? 'Generating Project...' : 'Download Capacitor APK Kit'}</span>
                  </button>
                </div>
              </div>

              {/* Step By Step Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Step 1: Install & Build</span>
                  <div className="text-xs font-bold text-slate-200">Compile React Frontend</div>
                  <p className="text-[11px] text-slate-400 font-mono">npm install && npm run build</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">Step 2: Add Capacitor</span>
                  <div className="text-xs font-bold text-slate-200">Initialize Android Target</div>
                  <p className="text-[11px] text-slate-400 font-mono">npx cap add android</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">Step 3: Sync Assets</span>
                  <div className="text-xs font-bold text-slate-200">Copy Web Bundle & Plugins</div>
                  <p className="text-[11px] text-slate-400 font-mono">npx cap sync</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">Step 4: Build APK</span>
                  <div className="text-xs font-bold text-slate-200">Compile Native APK</div>
                  <p className="text-[11px] text-slate-400 font-mono">./gradlew assembleRelease</p>
                </div>
              </div>

              {/* Sub-tabs to inspect code files */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 gap-2 pt-2 text-xs overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setCapacitorSubTab('cli_guide')}
                    className={`px-3 py-1.5 border-b-2 font-medium cursor-pointer ${
                      capacitorSubTab === 'cli_guide'
                        ? 'border-emerald-400 text-emerald-400 font-semibold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    CLI Build Commands
                  </button>

                  <button
                    onClick={() => setCapacitorSubTab('gradle')}
                    className={`px-3 py-1.5 border-b-2 font-medium cursor-pointer ${
                      capacitorSubTab === 'gradle'
                        ? 'border-emerald-400 text-emerald-400 font-semibold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    app/build.gradle
                  </button>

                  <button
                    onClick={() => setCapacitorSubTab('manifest')}
                    className={`px-3 py-1.5 border-b-2 font-medium cursor-pointer ${
                      capacitorSubTab === 'manifest'
                        ? 'border-emerald-400 text-emerald-400 font-semibold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    AndroidManifest.xml
                  </button>

                  <button
                    onClick={() => setCapacitorSubTab('plugin')}
                    className={`px-3 py-1.5 border-b-2 font-medium cursor-pointer ${
                      capacitorSubTab === 'plugin'
                        ? 'border-emerald-400 text-emerald-400 font-semibold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    RootBridgePlugin.java
                  </button>

                  <button
                    onClick={() => setCapacitorSubTab('config')}
                    className={`px-3 py-1.5 border-b-2 font-medium cursor-pointer ${
                      capacitorSubTab === 'config'
                        ? 'border-emerald-400 text-emerald-400 font-semibold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    capacitor.config.json
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-slate-300">
                      {capacitorSubTab === 'cli_guide' && 'Production APK Terminal Workflow:'}
                      {capacitorSubTab === 'gradle' && 'android/app/build.gradle (SDK 35, LibSU, ProGuard):'}
                      {capacitorSubTab === 'manifest' && 'android/app/src/main/AndroidManifest.xml (Superuser permissions):'}
                      {capacitorSubTab === 'plugin' && 'android/app/src/main/java/com/apextuner/app/RootBridgePlugin.java:'}
                      {capacitorSubTab === 'config' && 'capacitor.config.json (Web-to-Native routing):'}
                    </span>
                    <button
                      onClick={() => {
                        const content =
                          capacitorSubTab === 'cli_guide'
                            ? `npm install @capacitor/core @capacitor/cli @capacitor/android\nnpm run build\nnpx cap add android\nnpx cap sync\ncd android\n./gradlew assembleRelease`
                            : capacitorSubTab === 'gradle'
                            ? capacitorAppGradle
                            : capacitorSubTab === 'manifest'
                            ? capacitorManifestXml
                            : capacitorSubTab === 'plugin'
                            ? rootBridgePluginCode
                            : capacitorConfigJson;
                        copyToClipboard(content);
                      }}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>

                  {capacitorSubTab === 'cli_guide' && (
                    <pre className="font-mono text-xs text-emerald-400 bg-slate-900/90 p-4 rounded-lg overflow-x-auto leading-relaxed">
                      {`# 1. Install Capacitor CLI and Android runtime dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Build the production React web assets to dist/
npm run build

# 3. Initialize the native Android project scaffolding
npx cap add android

# 4. Sync web bundle, plugins, and icons to Android assets
npx cap sync android

# 5. Compile Debug or Release APK using Gradle
cd android
./gradlew assembleDebug    # Output: android/app/build/outputs/apk/debug/app-debug.apk
./gradlew assembleRelease  # Output: android/app/build/outputs/apk/release/app-release.apk

# 6. Install directly on connected Android device via ADB
adb install -r app/build/outputs/apk/debug/app-debug.apk`}
                    </pre>
                  )}

                  {capacitorSubTab === 'gradle' && (
                    <pre className="font-mono text-xs text-slate-300 bg-slate-900/90 p-4 rounded-lg overflow-x-auto max-h-72">
                      {capacitorAppGradle}
                    </pre>
                  )}

                  {capacitorSubTab === 'manifest' && (
                    <pre className="font-mono text-xs text-slate-300 bg-slate-900/90 p-4 rounded-lg overflow-x-auto max-h-72">
                      {capacitorManifestXml}
                    </pre>
                  )}

                  {capacitorSubTab === 'plugin' && (
                    <pre className="font-mono text-xs text-indigo-300 bg-slate-900/90 p-4 rounded-lg overflow-x-auto max-h-72">
                      {rootBridgePluginCode}
                    </pre>
                  )}

                  {capacitorSubTab === 'config' && (
                    <pre className="font-mono text-xs text-cyan-300 bg-slate-900/90 p-4 rounded-lg overflow-x-auto max-h-72">
                      {capacitorConfigJson}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apk_project' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 p-5 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-emerald-400" />
                      <span>Jetpack Compose Native Android Studio Kit</span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                      Download the complete Kotlin + Jetpack Compose Android Studio project with <code className="text-emerald-400 font-mono">libsu</code> root integration and hardware tweaker engine.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadApkProjectZip}
                    disabled={isExportingApkZip}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    <Download className="h-4 w-4" />
                    <span>{isExportingApkZip ? 'Packing APK Project...' : 'Download Compose Project ZIP'}</span>
                  </button>
                </div>
              </div>

              {/* Step by Step Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Step 1</span>
                  <div className="text-xs font-bold text-slate-200">Extract & Open Project</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Unzip the project file and open it in Android Studio. Wait for Gradle sync to pull dependencies.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">Step 2</span>
                  <div className="text-xs font-bold text-slate-200">Compile Debug or Release APK</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                    ./gradlew assembleDebug
                  </p>
                  <p className="text-[10px] text-slate-500">Or use Build &gt; Build APK(s) in top menu.</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">Step 3</span>
                  <div className="text-xs font-bold text-slate-200">Install APK on Phone</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Transfer <code className="text-slate-200 font-mono text-[10px]">app-debug.apk</code> to phone and install. Grant Superuser when prompted!
                  </p>
                </div>
              </div>

              {/* Terminal command snippet */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-slate-300">Terminal Command to Build APK:</span>
                  <button
                    onClick={() => copyToClipboard('./gradlew assembleDebug')}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="font-mono text-xs text-emerald-400 bg-slate-900/90 p-3 rounded-lg overflow-x-auto">
                  ./gradlew assembleDebug && ls -lh app/build/outputs/apk/debug/app-debug.apk
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'magisk_zip' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Ready to Flash in Magisk / KernelSU / APatch</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Packages <code className="text-emerald-400 font-mono">module.prop</code>, <code className="text-emerald-400 font-mono">service.sh</code>, and <code className="text-emerald-400 font-mono">system.prop</code> into a standard flashable ZIP that auto-starts on boot.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadZip}
                    disabled={isExportingZip}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-md shadow-emerald-500/20"
                  >
                    <Download className="h-4 w-4" />
                    <span>{isExportingZip ? 'Packing ZIP...' : 'Download Magisk ZIP'}</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-slate-300">service.sh Preview (Boot Service)</span>
                  <button
                    onClick={() => copyToClipboard(serviceSh)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="font-mono text-xs text-slate-300 bg-slate-900/90 p-3 rounded-lg overflow-x-auto max-h-56">
                  {serviceSh}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'shell_script' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">apex_tuner.sh (Termux / ADB Shell)</h4>
                  <p className="text-xs text-slate-400">Run with <code className="text-emerald-400 font-mono">su -c sh apex_tuner.sh</code></p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(standaloneScript)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Script'}</span>
                  </button>
                  <button
                    onClick={handleDownloadScript}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download .sh</span>
                  </button>
                </div>
              </div>

              <pre className="font-mono text-xs text-slate-300 bg-slate-950 border border-slate-800 p-4 rounded-xl overflow-x-auto max-h-80">
                {standaloneScript}
              </pre>
            </div>
          )}

          {activeTab === 'system_prop' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">system.prop (Build Properties)</h4>
                  <p className="text-xs text-slate-400">Android system properties injected into system runtime</p>
                </div>
                <button
                  onClick={() => copyToClipboard(systemProp)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="font-mono text-xs text-emerald-300 bg-slate-950 border border-slate-800 p-4 rounded-xl overflow-x-auto max-h-80">
                {systemProp}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 px-6 py-3.5 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Target Platform: Android 9.0 to Android 15 (ARM64)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
