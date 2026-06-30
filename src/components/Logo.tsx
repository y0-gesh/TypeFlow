import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size }: LogoProps) {
  const style = size ? { width: size, height: size } : undefined;
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={`select-none ${className}`}
      style={style}
      fill="none"
    >
      <defs>
        {/* Gray Key Gradients */}
        <linearGradient id="logo-gray-skirt" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="logo-gray-top" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        
        {/* Cyan Accent Key Gradients */}
        <linearGradient id="logo-cyan-skirt" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id="logo-cyan-top" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        
        {/* Drop Shadows */}
        <filter id="logo-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.4" floodColor="#020617" />
        </filter>
      </defs>

      {/* Key 1: 'T' (Gray/Dark Keycap, Top-Left) */}
      <g filter="url(#logo-shadow)">
        <rect x="4" y="6" width="26" height="26" rx="6" fill="url(#logo-gray-skirt)" />
        <rect x="6" y="8" width="22" height="20" rx="4" fill="url(#logo-gray-top)" />
        <rect x="7" y="10" width="20" height="16" rx="3" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3" />
        <text
          x="17"
          y="18"
          fontFamily="var(--font-mono), monospace"
          fontWeight="900"
          fontSize="14"
          fill="#f1f5f9"
          textAnchor="middle"
          dominantBaseline="central"
        >
          T
        </text>
      </g>

      {/* Key 2: 'F' (Cyan Keycap, Bottom-Right) */}
      <g filter="url(#logo-shadow)">
        <rect x="32" y="30" width="26" height="26" rx="6" fill="url(#logo-cyan-skirt)" />
        <rect x="34" y="32" width="22" height="20" rx="4" fill="url(#logo-cyan-top)" />
        <rect x="35" y="34" width="20" height="16" rx="3" fill="none" stroke="#0891b2" strokeWidth="0.5" opacity="0.3" />
        <text
          x="45"
          y="42"
          fontFamily="var(--font-mono), monospace"
          fontWeight="900"
          fontSize="14"
          fill="#ffffff"
          textAnchor="middle"
          dominantBaseline="central"
        >
          F
        </text>
      </g>
    </svg>
  );
}
