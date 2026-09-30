"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Download,
  Activity,
  Sparkles,
  CheckCircle2,
  Film,
  Camera,
  Layers,
  Info,
  RotateCcw
} from "lucide-react";
import { ReconstructionProject } from "@/lib/types";
import { TerrainViewer } from "@/components/viewer/TerrainViewer";
import { ExportModal } from "@/components/project/ExportModal";

/**
 * Precomputed high-quality 3D terrain demonstration asset for SIH 2026.
 * Guaranteed 100% reliable fallback that requires zero pipeline waiting.
 */
const DEMO_PROJECT: ReconstructionProject = {
  id: "demo-reconstruction-sih2026",
  title: "Khadki Basalt Highwall & Quarry Bench",
  clientRef: "SIH-2026-PRECOMPUTED-ASSET",
  description:
    "Precomputed high-density photogrammetric 3D terrain model demonstrating single-pass aerial survey reconstruction.",
  sourceVideoName: "precomputed_drone_pass_4k.mp4 (Demonstration Asset)",
  locationName: "Khadki Basalt Basin",
  country: "India",
  coordinates: {
    lat: 18.7324,
    lng: 73.8567,
  },
  crs: "EPSG:32643 (WGS 84 / UTM Zone 43N)",
  areaHectares: 14.8,
  gsdCmPerPixel: 1.84,
  reprojectionErrorPx: 0.62,
  pointCloudSize: 3420000,
  triangleCount: 684000,
  status: "completed", // Ready
  progressPercent: 100,
  currentStage: "Reconstruction Ready",
  droneModel: "DJI Matrice 350 RTK",
  cameraSensor: "Zenmuse P1 (45MP Full-Frame 35mm)",
  focalLengthMm: 35.0,
  flightAltitudeM: 65.0,
  avgFlightSpeedMs: 5.2,
  captureDate: "2026-08-14 09:24 IST",
  videoDurationSec: 180,
  fps: 60,
  totalVideoFrames: 5400,
  extractedKeyframes: 360,
  thumbnailUrl: "/images/quarry.jpg",
  elevation: {
    minM: 540.0,
    maxM: 628.0,
    avgM: 584.0,
  },
  stages: [],
  telemetry: [],
  gcps: [],
  artifacts: {
    objMeshSizeMb: 86.4,
    plyCloudSizeMb: 142.1,
    lasCloudSizeMb: 118.6,
    geotiffDemMb: 34.2,
    orthomosaicMb: 168.0,
  },
};

export default function DemoReconstructionPage() {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState(false);

  return (
    <div className="flex-1 bg-neutral-950 font-sans text-neutral-100 flex flex-col min-h-screen">
      {/* Top Header & Context Bar */}
      <div className="border-b border-neutral-800/80 bg-neutral-950/95 backdrop-blur-md px-4 sm:px-6 py-3.5 select-none sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Back Link & Demonstration Identifiers */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors shrink-0"
              title="Return to dashboard"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                {/* Unmistakable DEMO RECONSTRUCTION Label */}
                <span className="px-2 py-0.5 rounded bg-amber-500 text-neutral-950 font-bold text-[11px] tracking-wider flex items-center gap-1 shadow-md shadow-amber-500/20">
                  <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
                  DEMO RECONSTRUCTION
                </span>

                <span className="text-neutral-600 hidden sm:inline">|</span>

                <span className="text-neutral-400 truncate max-w-xs flex items-center gap-1">
                  <Film className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="text-neutral-500">Asset:</span>
                  <span className="text-neutral-300 font-semibold">{DEMO_PROJECT.sourceVideoName}</span>
                </span>
              </div>

              <h1 className="text-lg sm:text-xl font-bold text-neutral-100 truncate mt-0.5">
                {DEMO_PROJECT.title}
              </h1>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="px-2.5 py-1 rounded font-mono text-xs border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>READY (DEMO)</span>
            </span>

            {/* Analyze Action Button */}
            <button
              onClick={() => setIsAnalyzeOpen((prev) => !prev)}
              className={`px-3.5 py-2 rounded-lg font-semibold font-mono text-xs flex items-center gap-1.5 transition-all border cursor-pointer ${
                isAnalyzeOpen
                  ? "bg-neutral-800 text-amber-400 border-amber-500/50"
                  : "bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-700 hover:border-neutral-600"
              }`}
              title="Toggle geometry inspection and model-space measurement tool"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Analyze</span>
            </button>

            {/* Export Action Button */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold font-mono text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] cursor-pointer"
              title="Export genuine GLB, OBJ, PLY, and Technical Report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Transparent Notice */}
      <div className="bg-neutral-900/80 border-b border-neutral-800/80 px-4 sm:px-6 py-2.5 text-xs font-mono text-neutral-400 select-none">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="leading-tight">
            <strong className="text-neutral-200">Precomputed demonstration asset:</strong>{" "}
            This high-quality 3D terrain model is precomputed for presentation purposes and is not generated from an uploaded video.
          </p>
        </div>
      </div>

      {/* Main 3D Viewport Area */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 flex-1 flex flex-col space-y-4">
        {/* Large 3D Viewport with Orbit, Zoom, Pan, Reset, Terrain, Point Cloud, Wireframe, Measurement & Analysis */}
        <TerrainViewer
          project={DEMO_PROJECT}
          isAnalyzeOpen={isAnalyzeOpen}
          onToggleAnalyze={() => setIsAnalyzeOpen((prev) => !prev)}
          onOpenExportModal={() => setIsExportOpen(true)}
        />

        {/* Demo Quick Summary Footer */}
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 font-mono text-xs flex flex-wrap items-center justify-between gap-3 text-neutral-400">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-neutral-500">MODE:</span>{" "}
              <span className="text-amber-400 font-semibold">SIH 2026 Presentation Fallback</span>
            </div>
            <span>•</span>
            <div>
              <span className="text-neutral-500">AIRFRAME:</span>{" "}
              <span className="text-neutral-200">{DEMO_PROJECT.droneModel}</span>
            </div>
            <span>•</span>
            <div>
              <span className="text-neutral-500">DELIVERY:</span>{" "}
              <span className="text-emerald-400">Instant (No Processing Delay)</span>
            </div>
          </div>

          <div className="text-[11px] text-neutral-500 flex items-center gap-1">
            <span>Guaranteed working 3D result for live evaluation</span>
          </div>
        </div>
      </div>

      {/* Genuine Working 3D Export Modal (GLB, OBJ, PLY, and Report) */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={DEMO_PROJECT}
      />
    </div>
  );
}
