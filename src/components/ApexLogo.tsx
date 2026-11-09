import React from 'react';

interface ApexLogoProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

export const ApexLogo: React.FC<ApexLogoProps> = ({
  className = 'h-7 w-7',
  size = 28,
  animate = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animate ? 'animate-pulse' : ''} shrink-0`}
    >
      <defs>
        {/* Neon Emerald Gradient */}
        <linearGradient id="apexEmerald" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Cyan Core Gradient */}
        <linearGradient id="apexCyan" x1="16" y1="20" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Glow Filter */}
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Hexagonal Outer Shield / Silicon Die */}
      <polygon
        points="32,4 56,18 56,46 32,60 8,46 8,18"
        stroke="url(#apexEmerald)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="rgba(6, 15, 25, 0.7)"
        filter="url(#neonGlow)"
      />

      {/* Internal Circuit Traces */}
      <path
        d="M32 10 L32 20 M14 22 L22 26 M50 22 L42 26 M14 42 L22 38 M50 42 L42 38"
        stroke="#10b981"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Stylized Apex Overclock Lightning Chevrons */}
      <path
        d="M32 16 L44 32 L34 32 L38 48 L22 30 L31 30 Z"
        fill="url(#apexEmerald)"
        stroke="#6ee7b7"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Central Core Micro-Dot */}
      <circle cx="32" cy="31" r="2" fill="#e0f2fe" filter="url(#neonGlow)" />
    </svg>
  );
};
