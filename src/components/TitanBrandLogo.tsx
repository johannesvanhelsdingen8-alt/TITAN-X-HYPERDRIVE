import React from 'react';

interface TitanBrandLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const TitanBrandLogo: React.FC<TitanBrandLogoProps> = ({
  className = '',
  size = 36,
  showText = false,
}) => {
  return (
    <div className={`flex items-center gap-3 shrink-0 ${className}`}>
      <div
        className="relative rounded-xl overflow-hidden shadow-[0_0_20px_rgba(20,184,166,0.4)] border border-teal-500/60 bg-black flex items-center justify-center shrink-0 group transition-transform"
        style={{ width: size, height: size }}
      >
        <img
          src="/src/assets/images/titan_turquoise_crest_1794259286228.jpg"
          alt="TITAN X: HYPERFORGE Logo"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-teal-400/15 to-transparent pointer-events-none" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-base font-black tracking-tight text-white">TITAN X</span>
            <span className="text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-400/50 shadow-[0_0_10px_rgba(20,184,166,0.3)] tracking-wider">
              HYPERFORGE
            </span>
          </div>
          <span className="text-[11px] text-teal-400/90 font-mono leading-none mt-1">
            Kernel Exploit &amp; Hardware Warfare Engine
          </span>
        </div>
      )}
    </div>
  );
};
