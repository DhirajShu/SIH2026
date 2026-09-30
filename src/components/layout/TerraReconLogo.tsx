import React from "react";

interface TerraReconLogoProps {
  className?: string;
  size?: number | "sm" | "md" | "lg";
  showWordmark?: boolean;
  showSubtext?: boolean;
  subtext?: string;
}

/**
 * TerraRecon Official Logo
 * Minimal geometric mark combining a drone corridor flight path vector with a terraced terrain contour line.
 */
export function TerraReconLogo({
  className = "",
  size = 28,
  showWordmark = true,
  showSubtext = true,
  subtext,
}: TerraReconLogoProps) {
  const pixelSize =
    typeof size === "number"
      ? size
      : size === "sm"
      ? 20
      : size === "lg"
      ? 36
      : 28;

  return (
    <div className={`flex items-center gap-2.5 ${className} select-none`}>
      {/* Geometric Flight Path & Contour Mark */}
      <div
        className="flex items-center justify-center rounded-[8px] bg-[#0D1210] border border-[#26302C] shrink-0"
        style={{ width: pixelSize + 8, height: pixelSize + 8 }}
      >
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#78AFA2]"
        >
          {/* Subtle terrain contour bench */}
          <path
            d="M3 20L9 16L15 18L21 13L25 15"
            stroke="#4F7F74"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Main corridor flight path vector */}
          <path
            d="M4 9L11 8L17 11L24 7"
            stroke="#78AFA2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Leading drone optical coordinate waypoint */}
          <circle cx="24" cy="7" r="2.25" fill="#78AFA2" />
          <circle cx="11" cy="8" r="1.5" fill="#8CC2B4" />
          <circle cx="17" cy="11" r="1.5" fill="#8CC2B4" />
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col text-left leading-none">
          <span className="font-mono text-sm tracking-widest font-semibold text-[#F1F4F2]">
            TERRARECON
          </span>
          {showSubtext && (
            <span className="text-[9px] font-mono tracking-wider text-[#68736E] mt-1">
              {subtext || "SINGLE-PASS RECONSTRUCTION"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
