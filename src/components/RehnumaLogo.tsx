import React from "react";

interface RehnumaLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textColor?: string;
}

export const RehnumaLogo: React.FC<RehnumaLogoProps> = ({
  size = 44,
  className = "",
  showText = false,
  textColor = "#1E4D3E",
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`} aria-label="Rehnuma Logo">
      {/* 8-point Geometric Rosette from Rehnuma Brand Identity */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:rotate-45 duration-500"
      >
        <defs>
          <linearGradient id="rosetteGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E3B367" />
            <stop offset="100%" stopColor="#C89745" />
          </linearGradient>
          <linearGradient id="rosetteTerracotta" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E07A48" />
            <stop offset="100%" stopColor="#D96B27" />
          </linearGradient>
        </defs>

        {/* Central Core Circle */}
        <circle cx="50" cy="50" r="7.5" fill="url(#rosetteTerracotta)" />

        {/* 8 Symmetrical Diamond Petals (Radius ~26px out, angle increments 45 deg) */}
        {/* North */}
        <path d="M50 16 L56 26 L50 36 L44 26 Z" fill="url(#rosetteGold)" />
        {/* South */}
        <path d="M50 64 L56 74 L50 84 L44 74 Z" fill="url(#rosetteGold)" />
        {/* East */}
        <path d="M64 50 L74 44 L84 50 L74 56 Z" fill="url(#rosetteGold)" />
        {/* West */}
        <path d="M16 50 L26 44 L36 50 L26 56 Z" fill="url(#rosetteGold)" />

        {/* North-East (45 deg) */}
        <path d="M62 28 L72 30 L72 40 L62 38 Z" fill="url(#rosetteGold)" opacity="0.95" />
        {/* North-West (315 deg) */}
        <path d="M38 28 L28 30 L28 40 L38 38 Z" fill="url(#rosetteGold)" opacity="0.95" />
        {/* South-East (135 deg) */}
        <path d="M62 72 L72 70 L72 60 L62 62 Z" fill="url(#rosetteGold)" opacity="0.95" />
        {/* South-West (225 deg) */}
        <path d="M38 72 L28 70 L28 60 L38 62 Z" fill="url(#rosetteGold)" opacity="0.95" />
      </svg>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="font-serif text-2xl font-bold tracking-tight" style={{ color: textColor }}>
            Rehnuma
          </span>
          <span className="text-xs font-semibold text-[#D96B27] tracking-wider uppercase">
            A Friendly Digital Guide
          </span>
        </div>
      )}
    </div>
  );
};
