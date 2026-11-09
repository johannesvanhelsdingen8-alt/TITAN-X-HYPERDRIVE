import React, { useState } from 'react';
import { TunerState, SocProfile } from '../types/tuner';
import { Eye, Sliders, Sparkles, RefreshCw, Layers } from 'lucide-react';

interface DisplayEnhancerPanelProps {
  state: TunerState;
  soc: SocProfile;
  onUpdateState: (partial: Partial<TunerState>) => void;
}

export const DisplayEnhancerPanel: React.FC<DisplayEnhancerPanelProps> = ({
  state,
  soc,
  onUpdateState,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage for split screen

  // Compute CSS filter string based on KCAL values for live canvas preview
  const saturationFactor = (state.kcalSaturation / 256).toFixed(2);
  const contrastFactor = (state.kcalContrast / 256).toFixed(2);
  const redRatio = (state.kcalRedMultiplier / 256).toFixed(2);
  const blueRatio = (state.kcalBlueMultiplier / 256).toFixed(2);

  const applyPreset = (preset: 'vivid' | 'oled_hyper' | 'cinematic' | 'stock') => {
    switch (preset) {
      case 'vivid':
        onUpdateState({
          enableKcalVivid: true,
          kcalSaturation: 290,
          kcalContrast: 270,
          kcalRedMultiplier: 256,
          kcalGreenMultiplier: 254,
          kcalBlueMultiplier: 262,
        });
        break;
      case 'oled_hyper':
        onUpdateState({
          enableKcalVivid: true,
          kcalSaturation: 320,
          kcalContrast: 285,
          kcalRedMultiplier: 256,
          kcalGreenMultiplier: 250,
          kcalBlueMultiplier: 265,
        });
        break;
      case 'cinematic':
        onUpdateState({
          enableKcalVivid: true,
          kcalSaturation: 268,
          kcalContrast: 260,
          kcalRedMultiplier: 260,
          kcalGreenMultiplier: 256,
          kcalBlueMultiplier: 250,
        });
        break;
      case 'stock':
        onUpdateState({
          enableKcalVivid: false,
          kcalSaturation: 256,
          kcalContrast: 256,
          kcalRedMultiplier: 256,
          kcalGreenMultiplier: 256,
          kcalBlueMultiplier: 256,
        });
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Live Split-Screen Visualizer */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Eye className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Live Hardware KCAL Display Calibration</h3>
              <p className="text-xs text-slate-400">Interactive split-screen comparison: Stock sRGB vs KCAL Dynamic Vivid</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400">Presets:</span>
            <button
              onClick={() => applyPreset('vivid')}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer"
            >
              Dynamic Vivid
            </button>
            <button
              onClick={() => applyPreset('oled_hyper')}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 cursor-pointer"
            >
              OLED Hyper
            </button>
            <button
              onClick={() => applyPreset('cinematic')}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 cursor-pointer"
            >
              D65 Cinematic
            </button>
            <button
              onClick={() => applyPreset('stock')}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              Reset Stock
            </button>
          </div>
        </div>

        {/* Visual Split-Screen Comparison Canvas */}
        <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-slate-700 select-none bg-slate-950">
          {/* Base Layer: Stock sRGB */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)`,
              }}
            >
              {/* Graphic Scene Content */}
              <div className="w-full h-full flex flex-col justify-between p-6">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="bg-slate-900/80 px-2 py-1 rounded border border-slate-800">STOCK sRGB (Default 100%)</span>
                </div>
                <div className="grid grid-cols-3 gap-4 max-w-md">
                  <div className="h-20 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 p-3 flex flex-col justify-end text-white font-bold text-xs shadow-md">
                    Crimson Peak
                  </div>
                  <div className="h-20 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 p-3 flex flex-col justify-end text-white font-bold text-xs shadow-md">
                    Emerald Deep
                  </div>
                  <div className="h-20 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-500 p-3 flex flex-col justify-end text-white font-bold text-xs shadow-md">
                    Cyber Neon
                  </div>
                </div>
                <div className="text-[11px] font-mono text-slate-400">Standard Calibration: Saturation 256 / Contrast 256</div>
              </div>
            </div>
          </div>

          {/* Top Layer: Vivid KCAL calibrated (Clipped to slider width) */}
          <div
            className="absolute inset-y-0 right-0 overflow-hidden"
            style={{ width: `${100 - sliderPos}%` }}
          >
            <div
              className="absolute right-0 top-0 bottom-0 h-full overflow-hidden"
              style={{
                width: '100%',
                minWidth: '600px',
                filter: state.enableKcalVivid
                  ? `saturate(${saturationFactor}) contrast(${contrastFactor}) brightness(1.05)`
                  : 'none',
              }}
            >
              <div
                className="w-full h-full bg-cover bg-center flex flex-col justify-between p-6"
                style={{
                  backgroundImage: `linear-gradient(135deg, #090e1a 0%, #030712 50%, #110e38 100%)`,
                }}
              >
                <div className="flex items-center justify-end text-xs font-mono text-emerald-400">
                  <span className="bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/40 font-bold">
                    KCAL VIVID DYNAMIC ({Math.round((state.kcalSaturation / 256) * 100)}%)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 max-w-md ml-auto">
                  <div className="h-20 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-400 p-3 flex flex-col justify-end text-white font-bold text-xs shadow-lg">
                    Crimson Peak
                  </div>
                  <div className="h-20 rounded-lg bg-gradient-to-tr from-cyan-400 to-emerald-400 p-3 flex flex-col justify-end text-slate-950 font-bold text-xs shadow-lg">
                    Emerald Deep
                  </div>
                  <div className="h-20 rounded-lg bg-gradient-to-tr from-violet-500 to-fuchsia-400 p-3 flex flex-col justify-end text-white font-bold text-xs shadow-lg">
                    Cyber Neon
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono text-emerald-400">
                  KCAL Sat: {state.kcalSaturation} · Val: {state.kcalContrast} · Dynamic Refresh {state.targetRefreshRate}Hz
                </div>
              </div>
            </div>
          </div>

          {/* Draggable Divider Bar */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.7)]"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="h-8 w-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold shadow-lg">
              ↔
            </div>
          </div>

          {/* Slider input handle overlay */}
          <input
            type="range"
            min={5}
            max={95}
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-ew-resize z-20 w-full h-full"
          />
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saturation & Contrast Hardware Registers */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-slate-100">KCAL Saturation & Dynamic Contrast</h4>
            </div>
            <span className="text-[11px] font-mono text-slate-400">/sys/devices/platform/kcal_ctrl.0</span>
          </div>

          {/* Enable KCAL Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/40">
            <div>
              <div className="text-xs font-semibold text-slate-200">Enable Hardware KCAL Driver</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Writes to <code className="text-slate-300 font-mono text-[10px]">kcal_enable=1</code> to unlock GPU display engine tone mapping.
              </div>
            </div>
            <button
              onClick={() => onUpdateState({ enableKcalVivid: !state.enableKcalVivid })}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                state.enableKcalVivid ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                  state.enableKcalVivid ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Saturation Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Color Saturation (kcal_sat)</span>
              <span className="font-mono text-sm font-bold tabular-nums text-emerald-400">
                {state.kcalSaturation} / 320
              </span>
            </div>
            <input
              type="range"
              min={220}
              max={320}
              step={2}
              value={state.kcalSaturation}
              onChange={(e) => onUpdateState({ kcalSaturation: Number(e.target.value), enableKcalVivid: true })}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Muted (220)</span>
              <span>Stock sRGB (256)</span>
              <span className="text-emerald-400 font-semibold">Hyper Vivid (320)</span>
            </div>
          </div>

          {/* Contrast Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Display Value & Contrast (kcal_val)</span>
              <span className="font-mono text-sm font-bold tabular-nums text-amber-400">
                {state.kcalContrast} / 300
              </span>
            </div>
            <input
              type="range"
              min={240}
              max={300}
              step={2}
              value={state.kcalContrast}
              onChange={(e) => onUpdateState({ kcalContrast: Number(e.target.value), enableKcalVivid: true })}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Flat (240)</span>
              <span>Standard (256)</span>
              <span className="text-amber-400 font-semibold">High Dynamic (300)</span>
            </div>
          </div>
        </div>

        {/* RGB Multipliers & Refresh Rate Override */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-slate-100">RGB Channels & Refresh Rate Lock</h4>
            </div>
            <span className="text-[11px] font-mono text-slate-400">SurfaceFlinger 1035</span>
          </div>

          {/* Refresh Rate Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">SurfaceFlinger Display Refresh Rate</label>
            <div className="grid grid-cols-4 gap-2">
              {([60, 90, 120, 144] as const).map((hz) => (
                <button
                  key={hz}
                  onClick={() => onUpdateState({ targetRefreshRate: hz })}
                  className={`py-2 px-3 rounded-lg text-xs font-bold font-mono border text-center transition-all cursor-pointer ${
                    state.targetRefreshRate === hz
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {hz} Hz
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Locks Android SurfaceFlinger to prevent adaptive refresh rate stutter when panning.
            </p>
          </div>

          {/* RGB Sliders */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-medium text-slate-300">White Point & Color Multipliers</div>

            {/* Red */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-rose-400">Red Channel</span>
                <span className="text-slate-300">{state.kcalRedMultiplier}</span>
              </div>
              <input
                type="range"
                min={200}
                max={256}
                value={state.kcalRedMultiplier}
                onChange={(e) => onUpdateState({ kcalRedMultiplier: Number(e.target.value) })}
                className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Green */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-emerald-400">Green Channel</span>
                <span className="text-slate-300">{state.kcalGreenMultiplier}</span>
              </div>
              <input
                type="range"
                min={200}
                max={256}
                value={state.kcalGreenMultiplier}
                onChange={(e) => onUpdateState({ kcalGreenMultiplier: Number(e.target.value) })}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Blue */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-cyan-400">Blue Channel</span>
                <span className="text-slate-300">{state.kcalBlueMultiplier}</span>
              </div>
              <input
                type="range"
                min={200}
                max={256}
                value={state.kcalBlueMultiplier}
                onChange={(e) => onUpdateState({ kcalBlueMultiplier: Number(e.target.value) })}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
