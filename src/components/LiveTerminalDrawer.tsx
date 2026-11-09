import React, { useState } from 'react';
import { TunerState, SocProfile } from '../types/tuner';
import { generateLiveCommands } from '../services/scriptGenerator';
import { Terminal, ChevronUp, ChevronDown, Copy, Check } from 'lucide-react';
import { titanAudio } from '../services/titanAudio';

interface LiveTerminalDrawerProps {
  state: TunerState;
  soc: SocProfile;
}

export const LiveTerminalDrawer: React.FC<LiveTerminalDrawerProps> = ({ state, soc }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const commands = generateLiveCommands(state, soc);

  const copyCommands = () => {
    titanAudio.playSelect();
    navigator.clipboard.writeText(commands.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleExpand = () => {
    titanAudio.playFocus();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-[41px] left-0 right-0 z-20 border-t border-teal-950/80 bg-black/95 backdrop-blur-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.85)] transition-all duration-300">
      {/* Drawer Bar Header */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <div
          onClick={toggleExpand}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded bg-teal-950/60 text-teal-400 border border-teal-500/30 group-hover:border-teal-500/60 group-hover:shadow-[0_0_12px_rgba(20,184,166,0.35)] transition-all">
            <Terminal className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-200">Kernel Sysfs Directives</span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-slate-400 hidden sm:inline font-mono">
              {commands.filter((c) => c && !c.startsWith('#')).length} real-time hardware directives
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyCommands}
            className="flex items-center gap-1.5 rounded-md border border-teal-950 bg-slate-950 px-2.5 py-1 text-xs text-slate-300 hover:text-teal-300 hover:border-teal-500/40 cursor-pointer"
          >
            {copied ? <Check className="h-3 w-3 text-teal-400" /> : <Copy className="h-3 w-3" />}
            <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={toggleExpand}
            className="text-slate-400 hover:text-teal-300 p-1 cursor-pointer"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Terminal Panel */}
      {isExpanded && (
        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <div className="max-h-64 overflow-y-auto rounded-lg border border-teal-950/90 bg-black/90 p-4 font-mono text-xs text-teal-300/90 shadow-inner">
            <div className="mb-2 flex items-center justify-between border-b border-teal-950/80 pb-2 text-[11px] text-slate-500">
              <span>root@android:/sys/devices/system/cpu #</span>
              <span className="text-slate-600">LIVE SYSFS STREAM</span>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed select-text font-mono">
              {commands.join('\n')}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
