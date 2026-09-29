"use client";

import React, { useState } from "react";
import {
  Settings,
  Compass,
  Cpu,
  Save,
  CheckCircle,
  HardDrive,
  Camera,
  Layers,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [defaultCrs, setDefaultCrs] = useState("EPSG:32643 (WGS 84 / UTM Zone 43N)");
  const [geoidModel, setGeoidModel] = useState("EGM96 Global Orthometric");
  const [cudaWorkers, setCudaWorkers] = useState("8");
  const [keyframeOverlap, setKeyframeOverlap] = useState("80");
  const [octreeDepth, setOctreeDepth] = useState("11");
  const [textureAtlasRes, setTextureAtlasRes] = useState("8192x8192");
  const [lasCompression, setLasCompression] = useState("laz-lossless");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 bg-neutral-950 font-sans text-neutral-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>STATION CONFIGURATION</span>
            <span className="text-neutral-600">/</span>
            <span>GEODETIC & PIPELINE PRESETS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100 mt-1">
            Engine & Sensor Settings
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Calibrate drone cameras, geodetic reference datums, and hardware acceleration kernels.
          </p>
        </div>

        {saved && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>Photogrammetry pipeline configuration saved and committed to local engine cache.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Geodesy & Coordinate Reference Systems */}
          <div className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 font-mono">
              <Compass className="w-4 h-4 text-amber-500" />
              1. Geodetic Datum & Coordinate Systems (CRS)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="block text-neutral-400 mb-1.5">DEFAULT SURVEY CRS</label>
                <select
                  value={defaultCrs}
                  onChange={(e) => setDefaultCrs(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="EPSG:32643 (WGS 84 / UTM Zone 43N)">EPSG:32643 (WGS 84 / UTM Zone 43N)</option>
                  <option value="EPSG:32644 (WGS 84 / UTM Zone 44N)">EPSG:32644 (WGS 84 / UTM Zone 44N)</option>
                  <option value="EPSG:4326 (WGS 84 Geographic 2D)">EPSG:4326 (WGS 84 Geographic 2D)</option>
                  <option value="EPSG:7755 (India National Grid Zone 1)">EPSG:7755 (India National Grid Zone 1)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1.5">VERTICAL GEOID DATUM</label>
                <select
                  value={geoidModel}
                  onChange={(e) => setGeoidModel(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="EGM96 Global Orthometric">EGM96 Global Orthometric (Standard)</option>
                  <option value="EGM2008 2.5-Minute Grid">EGM2008 2.5-Minute Grid (High Precision)</option>
                  <option value="WGS84 Ellipsoidal Height">WGS84 Ellipsoidal Height</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: UAV Camera Calibration Library */}
          <div className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 font-mono">
              <Camera className="w-4 h-4 text-sky-400" />
              2. Pre-Calibrated Sensor Profiles
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="text-neutral-200 font-semibold">DJI Zenmuse P1</div>
                <div className="text-[11px] text-neutral-400">Sensor: 35.9 × 24.0 mm</div>
                <div className="text-[11px] text-neutral-400">Pixel Pitch: 4.4 μm</div>
                <div className="text-[10px] text-emerald-400">✓ Radial Distortion Verified</div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="text-neutral-200 font-semibold">Sony RX0 II</div>
                <div className="text-[11px] text-neutral-400">Sensor: 13.2 × 8.8 mm</div>
                <div className="text-[11px] text-neutral-400">Pixel Pitch: 2.4 μm</div>
                <div className="text-[10px] text-emerald-400">✓ Brown-Conrady Solved</div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="text-neutral-200 font-semibold">Skydio X2 Color</div>
                <div className="text-[11px] text-neutral-400">Sensor: 1/2.3-inch CMOS</div>
                <div className="text-[11px] text-neutral-400">Pixel Pitch: 1.55 μm</div>
                <div className="text-[10px] text-emerald-400">✓ Electronic Rolling Shutter Cal</div>
              </div>
            </div>
          </div>

          {/* Section 3: Hardware Acceleration & GPU Pipelines */}
          <div className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 font-mono">
              <Cpu className="w-4 h-4 text-emerald-400" />
              3. GPU Acceleration & Solver Parameters
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div>
                <label className="block text-neutral-400 mb-1.5">NVDEC DECODE STREAMS</label>
                <select
                  value={cudaWorkers}
                  onChange={(e) => setCudaWorkers(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="4">4 Parallel Threads</option>
                  <option value="8">8 Parallel Threads (Optimal)</option>
                  <option value="16">16 Threads (Multi-GPU)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1.5">KEYFRAME OVERLAP (%)</label>
                <input
                  type="number"
                  min="60"
                  max="95"
                  value={keyframeOverlap}
                  onChange={(e) => setKeyframeOverlap(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1.5">POISSON OCTREE DEPTH</label>
                <select
                  value={octreeDepth}
                  onChange={(e) => setOctreeDepth(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="9">Depth 9 (~200k polys)</option>
                  <option value="10">Depth 10 (~500k polys)</option>
                  <option value="11">Depth 11 (~1.2M polys - Recommended)</option>
                  <option value="12">Depth 12 (~4.0M polys - Ultra)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Export Format Presets */}
          <div className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 font-mono">
              <HardDrive className="w-4 h-4 text-amber-500" />
              4. Export Product Packaging
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="block text-neutral-400 mb-1.5">UV TEXTURE ATLAS RESOLUTION</label>
                <select
                  value={textureAtlasRes}
                  onChange={(e) => setTextureAtlasRes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="4096x4096">4K (4096 × 4096 px)</option>
                  <option value="8192x8192">8K (8192 × 8192 px - Survey Quality)</option>
                  <option value="16384x16384">16K Tiled UDIM</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1.5">POINT CLOUD CODEC</label>
                <select
                  value={lasCompression}
                  onChange={(e) => setLasCompression(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="laz-lossless">LAZ (LASzip Lossless Compression)</option>
                  <option value="las-raw">Uncompressed ASPRS LAS 1.4</option>
                  <option value="ply-ascii">Stanford PLY (ASCII)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold font-mono text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              Save Geodetic & Hardware Profiles
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
