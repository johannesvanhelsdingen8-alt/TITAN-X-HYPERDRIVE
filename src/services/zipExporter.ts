import JSZip from 'jszip';
import { TunerState, SocProfile } from '../types/tuner';
import { generateMagiskModuleFiles, generateStandaloneBashScript } from './scriptGenerator';

export async function exportMagiskModuleZip(state: TunerState, soc: SocProfile): Promise<Blob> {
  const zip = new JSZip();
  const { moduleProp, systemProp, serviceSh } = generateMagiskModuleFiles(state, soc);
  const standaloneScript = generateStandaloneBashScript(state, soc);

  zip.file('module.prop', moduleProp);
  zip.file('system.prop', systemProp);
  zip.file('service.sh', serviceSh);
  zip.file('apex_tuner.sh', standaloneScript);

  // Standard Magisk update-binary stub
  const updateBinary = `#!/sbin/sh
##########################################################################################
# Magisk Module Installer Script
##########################################################################################
OUTFD=$2
ZIPFILE=$3

ui_print() {
  echo -e "ui_print $1\nui_print" >> /proc/self/fd/$OUTFD
}

ui_print "****************************************"
ui_print "*   TITAN X: HYPERFORGE KERNEL ENGINE  *"
ui_print "*    8GB VRAM / OVERDRIVE WARFARE      *"
ui_print "****************************************"
ui_print "- Installing module to Magisk..."

# Magisk automatically extracts files into $MODPATH
exit 0
`;

  const metaInf = zip.folder('META-INF');
  if (metaInf) {
    const com = metaInf.folder('com');
    if (com) {
      const google = com.folder('google');
      if (google) {
        const android = google.folder('android');
        if (android) {
          android.file('update-binary', updateBinary);
          android.file('updater-script', '#MAGISK\n');
        }
      }
    }
  }

  const readme = `# TITAN X: HYPERFORGE Magisk & KernelSU Module
Device: ${soc.name}
RAM Expansion: ${state.zramExpansionGb}GB Virtual VRAM
Governor: ${state.cpuGovernor} / ${state.gpuGovernor}
Driver: ${state.selectedDriver}
TCP Congestion: ${state.tcpCongestion}

### Installation Instructions:
1. Open Magisk Manager, KernelSU, or APatch.
2. Go to the "Modules" tab.
3. Tap "Install from storage" and select this ZIP.
4. Reboot your phone.
5. All overclocking governors, 8GB VRAM allocation, and network stack optimizations will start automatically at boot!

### Manual Execution (Termux / ADB):
You can also run the standalone script directly:
\`\`\`bash
su -c sh /data/adb/modules/apex_tuner_optimizer/apex_tuner.sh
\`\`\`
`;
  zip.file('README.md', readme);

  return await zip.generateAsync({ type: 'blob' });
}

export async function exportAndroidStudioZip(state: TunerState, soc: SocProfile): Promise<Blob> {
  const zip = new JSZip();
  const { serviceSh } = generateMagiskModuleFiles(state, soc);

  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Titan X: Hyperforge"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const buildGradleKts = `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.titanx.hyperforge"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.titanx.hyperforge"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation("com.github.topjohnwu.libsu:core:5.2.2")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}`;

  const tweakEngineKt = `package com.titanx.hyperforge

import com.topjohnwu.superuser.Shell
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object SystemTweakEngine {
    init {
        Shell.enableVerboseLogging = false
        Shell.setDefaultBuilder(
            Shell.Builder.create()
                .setFlags(Shell.FLAG_REDIRECT_STDERR)
                .setTimeout(10)
        )
    }

    suspend fun checkRoot(): Boolean = withContext(Dispatchers.IO) {
        Shell.getShell().isRoot
    }

    suspend fun applyApexTuning(): Boolean = withContext(Dispatchers.IO) {
        val script = """
            ${serviceSh.split('\n').slice(14).join('\n            ')}
        """.trimIndent()
        Shell.cmd(script).exec().isSuccess
    }

    suspend fun getSoCTemperature(): String = withContext(Dispatchers.IO) {
        val out = Shell.cmd("cat ${soc.thermalZonePath} 2>/dev/null").exec().out
        if (out.isNotEmpty()) {
            val raw = out[0].toLongOrNull() ?: 0L
            val celsius = if (raw > 1000) raw / 1000 else raw
            "\$celsius°C"
        } else {
            "N/A"
        }
    }

    suspend fun getBatteryCycleCount(): String = withContext(Dispatchers.IO) {
        val out = Shell.cmd("cat /sys/class/power_supply/battery/cycle_count 2>/dev/null").exec().out
        if (out.isNotEmpty()) out[0].trim() else "N/A"
    }
}`;

  const mainActivityKt = `package com.titanx.hyperforge

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                Surface(modifier = Modifier.fillMaxSize(), color = Color(0xFF060911)) {
                    TitanXHyperforgeScreen()
                }
            }
        }
    }
}

@Composable
fun TitanXHyperforgeScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var isTuningActive by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxSize().padding(24.dp)) {
        Text("TITAN X: HYPERFORGE", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Text("Silicon Overdrive & 8GB VRAM Warfare Engine", fontSize = 14.sp, color = Color(0xFF10B981))
        Spacer(modifier = Modifier.height(24.dp))
        Button(
            onClick = {
                scope.launch {
                    val ok = SystemTweakEngine.applyApexTuning()
                    isTuningActive = ok
                    Toast.makeText(context, if (ok) "Profile Applied!" else "Root Required", Toast.LENGTH_SHORT).show()
                }
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(if (isTuningActive) "Hyperforge Active (Overdrive + 8GB VRAM)" else "Engage Titan X Hyperforge Boost")
        }
    }
}`;

  const instructionsMd = `# How to Compile APK in Android Studio

1. Extract this ZIP file.
2. Open **Android Studio** and select **Open existing project**, then choose this folder.
3. Wait for Gradle sync to complete.
4. To build the APK:
   - Click **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - Or open terminal in this directory and run:
     \`\`\`bash
     ./gradlew assembleDebug
     \`\`\`
5. The generated APK will be at:
   \`app/build/outputs/apk/debug/app-debug.apk\`
6. Transfer \`app-debug.apk\` to your Android phone and install!
`;

  zip.file('app/build.gradle.kts', buildGradleKts);
  zip.file('app/src/main/AndroidManifest.xml', manifestXml);
  zip.file('app/src/main/java/com/titanx/hyperforge/MainActivity.kt', mainActivityKt);
  zip.file('app/src/main/java/com/titanx/hyperforge/SystemTweakEngine.kt', tweakEngineKt);
  zip.file('BUILD_APK_INSTRUCTIONS.md', instructionsMd);

  return await zip.generateAsync({ type: 'blob' });
}

export async function exportCapacitorProjectZip(state: TunerState, soc: SocProfile): Promise<Blob> {
  const zip = new JSZip();
  const { serviceSh } = generateMagiskModuleFiles(state, soc);

  const capacitorConfig = `{
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

  const topLevelBuildGradle = `// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.7.2'
        classpath 'com.google.gms:google-services:4.4.2'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://jitpack.io' }
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
`;

  const appBuildGradle = `apply plugin: 'com.android.application'

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
        aaptOptions {
             // Files and dirs to omit from the packaged assets
             ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
        }
    }

    signingConfigs {
        release {
            storeFile file("release-key.keystore")
            storePassword System.getenv("KEYSTORE_PASSWORD") ?: "apextuner123"
            keyAlias System.getenv("KEY_ALIAS") ?: "apextuner"
            keyPassword System.getenv("KEY_PASSWORD") ?: "apextuner123"
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
    
    // LibSU: Direct Linux superuser shell execution for sysfs and kernel overclocking
    implementation 'com.github.topjohnwu.libsu:core:5.2.2'
    
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.2.1'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.6.1'
}

apply from: 'capacitor.build.gradle'
`;

  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Superuser Root Access for sysfs / procfs kernel tuning -->
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

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths"></meta-data>
        </provider>
    </application>

</manifest>
`;

  const mainActivityJava = `package com.titanx.hyperforge;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(RootBridgePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
`;

  const rootBridgePluginJava = `package com.titanx.hyperforge;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;
import com.topjohnwu.superuser.Shell;
import java.util.List;

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

    @PluginMethod
    public void applyPresetScript(PluginCall call) {
        String script = """
            ${serviceSh.split('\n').slice(14).join('\n            ')}
        """;
        Shell.Result result = Shell.cmd(script).exec();
        JSObject ret = new JSObject();
        ret.put("success", result.isSuccess());
        call.resolve(ret);
    }
}
`;

  const proguardRules = `# Capacitor ProGuard / R8 Optimization Rules
-keepattributes *Annotation*
-keepclassmembers class * {
    @org.webkit.JavascriptInterface <methods>;
}
-keep class com.getcapacitor.** { *; }
-keep class com.titanx.hyperforge.** { *; }

# TopJohnWu LibSU
-keep class com.topjohnwu.superuser.** { *; }
-keepclassmembers class com.topjohnwu.superuser.** { *; }
`;

  const instructionsMd = `# Packaging TITAN X: HYPERFORGE React Web App into Android APK with Capacitor

This guide takes your compiled React + Vite + Tailwind CSS bundle and packages it into a native, installable Android APK with Root (\`su\`) bridge support.

---

### Prerequisites
1. **Node.js** (v18+ or v20+)
2. **Android Studio** (Koala / Ladybug or newer) with Android SDK 35 installed
3. **Java JDK 17 or 21**

---

### Step 1: Install Capacitor in this React Project
In your terminal, run:
\`\`\`bash
npm install @capacitor/core @capacitor/cli @capacitor/android
\`\`\`

---

### Step 2: Initialize & Build the Web App
Build the Vite production bundle:
\`\`\`bash
npm run build
\`\`\`

Initialize Capacitor (using the provided \`capacitor.config.json\`):
\`\`\`bash
npx cap add android
\`\`\`

---

### Step 3: Copy Native Bridge & Gradle Files
Replace the generated files in the \`android/\` folder with the pre-configured files from this ZIP:
- Copy \`android/app/build.gradle\` -> \`android/app/build.gradle\`
- Copy \`android/app/src/main/AndroidManifest.xml\` -> \`android/app/src/main/AndroidManifest.xml\`
- Copy \`android/app/src/main/java/com/apextuner/app/MainActivity.java\` -> \`android/app/src/main/java/com/apextuner/app/MainActivity.java\`
- Copy \`android/app/src/main/java/com/apextuner/app/RootBridgePlugin.java\` -> \`android/app/src/main/java/com/apextuner/app/RootBridgePlugin.java\`
- Copy \`android/app/proguard-rules.pro\` -> \`android/app/proguard-rules.pro\`

Sync assets:
\`\`\`bash
npx cap sync android
\`\`\`

---

### Step 4: Build the Debug APK (Quick Test)
Run Gradle directly in the \`android\` directory:
\`\`\`bash
cd android
./gradlew assembleDebug
\`\`\`

Your APK is compiled at:
\`android/app/build/outputs/apk/debug/app-debug.apk\`

Install directly to your connected device:
\`\`\`bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
\`\`\`

---

### Step 5: Build Production Signed Release APK
1. Generate your release keystore:
\`\`\`bash
keytool -genkey -v -keystore release-key.keystore -alias apextuner -keyalg RSA -keysize 2048 -validity 10000
\`\`\`
Place \`release-key.keystore\` inside the \`android/app/\` folder.

2. Compile optimized release APK:
\`\`\`bash
./gradlew assembleRelease
\`\`\`

Production APK output:
\`android/app/build/outputs/apk/release/app-release.apk\`
`;

  zip.file('capacitor.config.json', capacitorConfig);
  zip.file('android/build.gradle', topLevelBuildGradle);
  zip.file('android/app/build.gradle', appBuildGradle);
  zip.file('android/app/src/main/AndroidManifest.xml', manifestXml);
  zip.file('android/app/src/main/java/com/titanx/hyperforge/MainActivity.java', mainActivityJava);
  zip.file('android/app/src/main/java/com/titanx/hyperforge/RootBridgePlugin.java', rootBridgePluginJava);
  zip.file('android/app/proguard-rules.pro', proguardRules);
  zip.file('CAPACITOR_APK_BUILD_GUIDE.md', instructionsMd);

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


