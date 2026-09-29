import React from "react";
import Link from "next/link";
import { Compass, Terminal, Shield, Cpu, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 font-sans text-xs text-neutral-400 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-neutral-100 font-mono font-semibold tracking-wider">
              <Compass className="w-4 h-4 text-amber-500" />
              TERRARECON
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Single-Pass Drone Video to Accurate 3D Model Generation System. Built for rapid topographic mapping, geotechnical surveys, and disaster assessment.
            </p>
            <div className="text-[11px] font-mono text-neutral-400 pt-1">
              SIH 2026 Innovation Prototype
            </div>
          </div>

          {/* Engine Specs */}
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-wider text-neutral-300 font-medium flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-500" />
              Pipeline Engine
            </div>
            <ul className="space-y-1.5 text-neutral-400 text-xs font-mono">
              <li>Optical Flow Keyframing</li>
              <li>Epipolar Geometry SfM</li>
              <li>Multi-View Stereo (MVS)</li>
              <li>Poisson Surface Meshing</li>
              <li>Ortho-rectified Texturing</li>
            </ul>
          </div>

          {/* Geodesy & Standards */}
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-wider text-neutral-300 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              Geodesy & Standards
            </div>
            <ul className="space-y-1.5 text-neutral-400 text-xs font-mono">
              <li>WGS 84 / UTM Zone 43N & 44N</li>
              <li>ASPRS LAS / LAZ 1.4 Format</li>
              <li>GeoTIFF DEM (32-bit Float)</li>
              <li>RTK / PPK GPS Synchronization</li>
              <li>GSD Down to 1.2 cm/pixel</li>
            </ul>
          </div>

          {/* System Telemetry */}
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-wider text-neutral-300 font-medium flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-500" />
              Runtime Telemetry
            </div>
            <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono space-y-1 text-neutral-400">
              <div className="flex justify-between">
                <span>Kernel:</span>
                <span className="text-neutral-200">NVDEC-SfM-v2.4</span>
              </div>
              <div className="flex justify-between">
                <span>Reprojection:</span>
                <span className="text-emerald-400">&lt; 0.8 px RMSE</span>
              </div>
              <div className="flex justify-between">
                <span>Pass Type:</span>
                <span className="text-amber-400">Single Video Corridor</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 gap-2 font-mono">
          <div>
            © 2026 TerraRecon Geospatial Systems. Smart India Hackathon Prototype.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-neutral-300 transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/projects" className="hover:text-neutral-300 transition-colors">
              Projects
            </Link>
            <Link href="/dashboard/settings" className="hover:text-neutral-300 transition-colors">
              CRS Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
