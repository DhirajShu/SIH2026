"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Cpu, MapPin } from "lucide-react";
import { TerraReconLogo } from "./TerraReconLogo";

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <footer className="border-t border-[#26302C] bg-[#080B0A] font-sans text-xs text-[#9BA6A1] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <TerraReconLogo size={24} subtext="SIH 2026 PROTOTYPE" />
            <p className="text-[#9BA6A1] text-xs leading-relaxed pt-1">
              Single-Pass Drone Video to Accurate 3D Model Generation System. Built for rapid topographic mapping, geotechnical surveys, and disaster assessment.
            </p>
          </div>

          {/* Engine Specs */}
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-wider text-[#F1F4F2] font-medium flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#78AFA2]" />
              Pipeline Engine
            </div>
            <ul className="space-y-1.5 text-[#9BA6A1] text-xs font-mono">
              <li>Optical Flow Keyframing</li>
              <li>Epipolar Geometry SfM</li>
              <li>Multi-View Stereo (MVS)</li>
              <li>Poisson Surface Meshing</li>
              <li>Ortho-rectified Texturing</li>
            </ul>
          </div>

          {/* Geodesy & Standards */}
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-wider text-[#F1F4F2] font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#78AFA2]" />
              Geodesy & Standards
            </div>
            <ul className="space-y-1.5 text-[#9BA6A1] text-xs font-mono">
              <li>WGS 84 / UTM Zone 43N & 44N</li>
              <li>ASPRS LAS / LAZ 1.4 Format</li>
              <li>GeoTIFF DEM (32-bit Float)</li>
              <li>RTK / PPK GPS Synchronization</li>
              <li>GSD Down to 1.8 cm/pixel</li>
            </ul>
          </div>

          {/* System Telemetry */}
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-wider text-[#F1F4F2] font-medium flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#78AFA2]" />
              Runtime Telemetry
            </div>
            <div className="p-2.5 rounded-[8px] bg-[#0D1210] border border-[#26302C] text-[11px] font-mono space-y-1 text-[#9BA6A1]">
              <div className="flex justify-between">
                <span>Kernel:</span>
                <span className="text-[#F1F4F2]">NVDEC-SfM-v2.4</span>
              </div>
              <div className="flex justify-between">
                <span>Reprojection:</span>
                <span className="text-[#7FAE8D]">&lt; 0.8 px RMSE</span>
              </div>
              <div className="flex justify-between">
                <span>Pass Type:</span>
                <span className="text-[#78AFA2]">Single Video Corridor</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#26302C] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#68736E] gap-2 font-mono">
          <div>
            © 2026 TerraRecon Geospatial Systems. Smart India Hackathon Prototype.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-[#F1F4F2] transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/projects" className="hover:text-[#F1F4F2] transition-colors">
              Projects
            </Link>
            <Link href="/dashboard/settings" className="hover:text-[#F1F4F2] transition-colors">
              CRS Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
