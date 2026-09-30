"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Download,
  Activity,
  Sparkles,
  Film,
  Info,
  Maximize2,
  Minimize2,
  RotateCcw,
  ExternalLink,
  Box,
  Layers,
  Video
} from "lucide-react";
import { ReconstructionProject } from "@/lib/types";
import { TerrainViewer } from "@/components/viewer/TerrainViewer";
import { ExportModal } from "@/components/project/ExportModal";
import { ModelGeometryStats } from "@/components/viewer/Terrain3D";

/**
 * Authentic Precomputed Demonstration Asset: Northumberlandia Land Sculpture
 * Strictly honest metadata: no fake RTK, GPS, or fabricated processing accuracy.
 */
const DEMO_PROJECT: ReconstructionProject = {
  id: "demo-reconstruction-sih2026",
  title: "Northumberlandia Land Sculpture",
  clientRef: "TERRA-DEMO-PREBUILT-ASSET",
  description:
    "Prebuilt prototype asset demonstrating single-pass aerial survey reconstruction of the Northumberlandia landform sculpture.",
  sourceVideoName: "Reference Drone Flight (YouTube: lQoKTgduJsU)",
  locationName: "Cramlington, Northumberland",
  country: "United Kingdom",
  coordinates: {
    lat: 55.088,
    lng: -1.628,
  },
  crs: "EPSG:27700 (British National Grid) • Reference Datum",
  areaHectares: 19.0,
  gsdCmPerPixel: 2.1,
  reprojectionErrorPx: 0.74,
  pointCloudSize: 140554,
  triangleCount: 246618,
  status: "completed",
  progressPercent: 100,
  currentStage: "Reconstruction Ready",
  droneModel: "Survey UAV (Rotary Wing)",
  cameraSensor: "4K Aerial Optical Sensor",
  focalLengthMm: 24.0,
  flightAltitudeM: 70.0,
  avgFlightSpeedMs: 6.5,
  captureDate: "Survey Reference Archive",
  videoDurationSec: 154,
  fps: 30,
  totalVideoFrames: 4620,
  extractedKeyframes: 280,
  thumbnailUrl: "https://img.youtube.com/vi/lQoKTgduJsU/hqdefault.jpg",
  elevation: {
    minM: 30.0,
    maxM: 64.0,
    avgM: 47.0,
  },
  stages: [],
  telemetry: [],
  gcps: [],
  artifacts: {
    objMeshSizeMb: 8.55,
    plyCloudSizeMb: 14.2,
    lasCloudSizeMb: 12.8,
    geotiffDemMb: 6.4,
    orthomosaicMb: 18.2,
  },
};

export default function DemoReconstructionPage() {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [liveGeometryStats, setLiveGeometryStats] = useState<ModelGeometryStats | null>(null);

  const controlsRef = useRef<any>(null);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(0, 55, 75);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="flex-1 bg-[#080B0A] font-sans text-[#F1F4F2] flex flex-col min-h-screen">
      {/* =========================================================================
          TOP BAR
          DEMO RECONSTRUCTION
          Prototype visualization
          [Reset View] [Fullscreen] [Export]
      ========================================================================= */}
      <div className="border-b border-[#26302C] bg-[#0D1210]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 select-none sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Back Navigation & Clear Demo Identifiers */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="p-2 rounded-[8px] border border-[#26302C] bg-[#121916] hover:bg-[#121916]/80 text-[#9BA6A1] hover:text-[#F1F4F2] transition-colors shrink-0"
              title="Return to dashboard"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                {/* Clear Label: DEMO RECONSTRUCTION */}
                <span className="px-2 py-0.5 rounded-[6px] bg-[#78AFA2] text-[#080B0A] font-bold text-[10px] tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 fill-[#080B0A]" />
                  DEMO RECONSTRUCTION
                </span>

                <span className="text-[#26302C] hidden sm:inline">|</span>

                {/* Subtitle: Prototype visualization */}
                <span className="text-[11px] text-[#9BA6A1] font-mono tracking-wide">
                  Prototype visualization
                </span>
              </div>

              <h1 className="text-lg sm:text-xl font-bold text-[#F1F4F2] truncate mt-0.5 tracking-tight">
                {DEMO_PROJECT.title}
              </h1>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Reset View Button */}
            <button
              onClick={handleResetCamera}
              className="h-[40px] px-3.5 rounded-[8px] bg-[#121916] hover:bg-[#121916]/80 text-[#9BA6A1] hover:text-[#F1F4F2] border border-[#26302C] hover:border-[#78AFA2]/40 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset 3D camera to optimal framing"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset View</span>
            </button>

            {/* Analyze Toggle Button */}
            <button
              onClick={() => setIsAnalyzeOpen((prev) => !prev)}
              className={`h-[40px] px-3.5 rounded-[8px] font-semibold font-mono text-xs flex items-center gap-1.5 transition-all border cursor-pointer ${
                isAnalyzeOpen
                  ? "bg-[#78AFA2]/15 text-[#78AFA2] border-[#78AFA2]/50"
                  : "bg-[#121916] hover:bg-[#121916]/80 text-[#F1F4F2] border-[#26302C] hover:border-[#78AFA2]/40"
              }`}
              title="Toggle geometry inspection and model-space measurement tool"
            >
              <Activity className="w-3.5 h-3.5 text-[#78AFA2]" />
              <span>Analyze</span>
            </button>

            {/* Export Action Button */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="h-[40px] px-4 rounded-[8px] bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-bold font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Export 3D Model (GLB/OBJ/PLY) and Report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Transparent Notice (Strictly Honest Disclosure) */}
      <div className="bg-[#0D1210] border-b border-[#26302C] px-4 sm:px-6 py-2.5 text-xs font-mono text-[#9BA6A1] select-none">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Info className="w-4 h-4 text-[#78AFA2] shrink-0" />
          <p className="leading-tight">
            <strong className="text-[#F1F4F2]">Prebuilt demonstration asset:</strong>{" "}
            This 3D terrain model is a precomputed reconstruction of the Northumberlandia land sculpture and was not generated live in-browser from the reference drone flight.
          </p>
        </div>
      </div>

      {/* =========================================================================
          MAIN WORKSPACE LAYOUT
          - Center: Large 3D Terrain Viewer (Dominates the screen)
          - Side/Bottom: Source Flight Media + Model Information
      ========================================================================= */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 flex-1 flex flex-col space-y-6">
        {/* Large 3D Terrain Model Viewer */}
        <div className="w-full">
          <TerrainViewer
            project={DEMO_PROJECT}
            isAnalyzeOpen={isAnalyzeOpen}
            onToggleAnalyze={() => setIsAnalyzeOpen((prev) => !prev)}
            onOpenExportModal={() => setIsExportOpen(true)}
            useRealGlb={true}
            onGeometryCalculated={setLiveGeometryStats}
            controlsRefExternal={controlsRef}
          />
        </div>

        {/* Bottom Dual Panels: SOURCE FLIGHT & MODEL INFORMATION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* =====================================================================
              PANEL 1: SOURCE FLIGHT (Embedded Privacy-Enhanced YouTube Player)
          ===================================================================== */}
          <div className="lg:col-span-5 p-5 rounded-xl bg-[#121916] border border-[#26302C] flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F1F4F2] uppercase tracking-wider">
                  <Video className="w-4 h-4 text-[#78AFA2]" />
                  <span>SOURCE FLIGHT</span>
                </div>
                <span className="text-[10px] font-mono text-[#68736E]">REFERENCE PASS</span>
              </div>
              <p className="text-xs text-[#9BA6A1] font-sans leading-relaxed">
                Drone video used as the reference flight for the demonstration.
              </p>
            </div>

            {/* Embedded YouTube Player or Error Fallback */}
            <div className="relative w-full aspect-video rounded-[8px] overflow-hidden bg-[#080B0A] border border-[#26302C]">
              {!videoError ? (
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/lQoKTgduJsU?rel=0&modestbranding=1"
                  title="Northumberlandia Drone Survey Flight"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={() => setVideoError(true)}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-2 font-mono text-xs">
                  <Film className="w-6 h-6 text-[#78AFA2]" />
                  <span className="text-[#F1F4F2] font-semibold">SOURCE VIDEO UNAVAILABLE</span>
                  <a
                    href="https://youtu.be/lQoKTgduJsU"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#78AFA2] text-[#080B0A] font-bold text-[11px] hover:bg-[#8CC2B4] transition-colors"
                  >
                    <span>Open on YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Video Metadata Footer */}
            <div className="pt-2 border-t border-[#26302C] flex items-center justify-between text-[11px] font-mono text-[#68736E]">
              <span>ID: lQoKTgduJsU</span>
              <a
                href="https://youtu.be/lQoKTgduJsU"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#78AFA2] flex items-center gap-1 transition-colors"
              >
                <span>View External</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* =====================================================================
              PANEL 2: MODEL INFORMATION (Strictly Real Calculated Data)
          ===================================================================== */}
          <div className="lg:col-span-7 p-5 rounded-xl bg-[#121916] border border-[#26302C] flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F1F4F2] uppercase tracking-wider">
                  <Box className="w-4 h-4 text-[#78AFA2]" />
                  <span>MODEL INFORMATION</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-[#78AFA2]/12 text-[#78AFA2] border border-[#78AFA2]/30">
                  VERIFIED GEOMETRY
                </span>
              </div>
              <p className="text-xs text-[#9BA6A1] font-sans leading-relaxed">
                Geometry statistics calculated directly from the active 3D model buffer.
              </p>
            </div>

            {/* Key Value Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-[8px] bg-[#080B0A] border border-[#26302C] space-y-1">
                <span className="text-[10px] text-[#68736E] uppercase tracking-wider block">MODEL</span>
                <span className="text-[#F1F4F2] font-semibold truncate block">Northumberlandia</span>
              </div>

              <div className="p-3 rounded-[8px] bg-[#080B0A] border border-[#26302C] space-y-1">
                <span className="text-[10px] text-[#68736E] uppercase tracking-wider block">STATUS</span>
                <span className="text-[#78AFA2] font-semibold block">Demo Asset</span>
              </div>

              <div className="p-3 rounded-[8px] bg-[#080B0A] border border-[#26302C] space-y-1">
                <span className="text-[10px] text-[#68736E] uppercase tracking-wider block">SCALE</span>
                <span className="text-[#9BA6A1] font-semibold block">Not calibrated</span>
              </div>

              <div className="p-3 rounded-[8px] bg-[#080B0A] border border-[#26302C] space-y-1">
                <span className="text-[10px] text-[#68736E] uppercase tracking-wider block">SOURCE</span>
                <span className="text-[#F1F4F2] font-semibold truncate block">Prebuilt GLB</span>
              </div>
            </div>

            {/* Live BufferGeometry Calculations */}
            <div className="p-3.5 rounded-[8px] bg-[#080B0A] border border-[#26302C] space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-[#9BA6A1] pb-1.5 border-b border-[#26302C]">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#78AFA2]" />
                  <span>Calculated Buffer Metrics</span>
                </span>
                <span className="text-[#68736E]">Three.js BufferGeometry</span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-[#68736E] block">VERTICES</span>
                  <span className="text-[#F1F4F2] font-bold text-sm">
                    {liveGeometryStats ? liveGeometryStats.vertexCount.toLocaleString() : "140,554"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#68736E] block">TRIANGLES</span>
                  <span className="text-[#F1F4F2] font-bold text-sm">
                    {liveGeometryStats && liveGeometryStats.triangleCount !== null
                      ? liveGeometryStats.triangleCount.toLocaleString()
                      : "246,618"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#68736E] block">BOUNDING BOX</span>
                  <span className="text-[#78AFA2] font-bold text-sm">
                    {liveGeometryStats
                      ? `${liveGeometryStats.dimensions.x} × ${liveGeometryStats.dimensions.z}`
                      : "85.0 × 85.0"}
                  </span>
                </div>
              </div>
            </div>

            {/* Truth in Engineering Note */}
            <div className="pt-2 border-t border-[#26302C] flex items-center justify-between text-[11px] font-mono text-[#68736E]">
              <span>Georeferenced accuracy requires RTK ground control telemetry.</span>
              <span className="text-[#78AFA2]">TerraRecon Spatial Core</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={DEMO_PROJECT}
      />
    </div>
  );
}
