"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import {
  Layers,
  Activity,
  Maximize2,
  Minimize2,
  Ruler,
  Compass,
  Sun,
  Eye,
  Camera,
  RotateCcw,
  Sparkles,
  Download,
  Info,
  Sliders,
  ChevronDown
} from "lucide-react";
import { ReconstructionProject, ViewerDisplayMode } from "@/lib/types";

// Dynamic import of Canvas with ssr disabled to prevent Next.js hydration issues
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
);

const OrbitControls = dynamic(
  () => import("@react-three/drei").then((mod) => mod.OrbitControls),
  { ssr: false }
);

// Import Terrain3D
import { Terrain3D } from "./Terrain3D";

interface TerrainViewerProps {
  project: ReconstructionProject;
  selectedKeyframeIndex?: number;
  onKeyframeChange?: (index: number) => void;
  onOpenExportModal?: () => void;
}

export function TerrainViewer({
  project,
  selectedKeyframeIndex = 0,
  onKeyframeChange,
  onOpenExportModal,
}: TerrainViewerProps) {
  const [mode, setMode] = useState<ViewerDisplayMode>("textured");
  const [showFlightPath, setShowFlightPath] = useState(true);
  const [measuring, setMeasuring] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState<THREE.Vector3[]>([]);
  const [sunAngle, setSunAngle] = useState(45);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraView, setCameraView] = useState<"perspective" | "nadir" | "side">("perspective");
  const [showStats, setShowStats] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);

  // Determine project terrain profile
  const terrainType = project.id.includes("alpine")
    ? "alpine"
    : project.id.includes("viaduct")
    ? "viaduct"
    : "quarry";

  // Handle measurement click
  const handlePointClicked = (point: THREE.Vector3) => {
    if (!measuring) return;
    if (measurementPoints.length >= 2) {
      setMeasurementPoints([point]);
    } else {
      setMeasurementPoints((prev) => [...prev, point]);
    }
  };

  // Calculate measurement stats
  const measurementData = React.useMemo(() => {
    if (measurementPoints.length !== 2) return null;
    const p1 = measurementPoints[0];
    const p2 = measurementPoints[1];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;

    // Real scale conversion factor based on project area
    const scaleFactor = 1.4; // 1 unit in 3D = 1.4 meters in real world
    const groundDistanceM = Math.sqrt(dx * dx + dz * dz) * scaleFactor;
    const euclideanDistanceM = Math.sqrt(dx * dx + dy * dy + dz * dz) * scaleFactor;
    const deltaHeightM = dy * scaleFactor;
    const slopeDeg = Math.atan2(Math.abs(dy), Math.sqrt(dx * dx + dz * dz)) * (180 / Math.PI);

    return {
      groundDistanceM: groundDistanceM.toFixed(2),
      euclideanDistanceM: euclideanDistanceM.toFixed(2),
      deltaHeightM: deltaHeightM.toFixed(2),
      slopeDeg: slopeDeg.toFixed(1),
    };
  }, [measurementPoints]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleResetCamera = (view: "perspective" | "nadir" | "side") => {
    setCameraView(view);
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    if (view === "nadir") {
      controls.object.position.set(0, 110, 0.1);
      controls.target.set(0, 0, 0);
    } else if (view === "side") {
      controls.object.position.set(110, 20, 0);
      controls.target.set(0, 10, 0);
    } else {
      controls.object.position.set(70, 60, 80);
      controls.target.set(0, 10, 0);
    }
    controls.update();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[620px] bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden select-none flex flex-col font-sans ${
        isFullscreen ? "h-screen w-screen rounded-none fixed inset-0 z-50" : ""
      }`}
    >
      {/* Top HUD Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: View Mode Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-lg pointer-events-auto shadow-xl">
          <button
            onClick={() => setMode("textured")}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider uppercase rounded transition-all flex items-center gap-1.5 ${
              mode === "textured"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Textured
          </button>
          <button
            onClick={() => setMode("wireframe")}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider uppercase rounded transition-all flex items-center gap-1.5 ${
              mode === "wireframe"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            TIN Mesh
          </button>
          <button
            onClick={() => setMode("pointcloud")}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider uppercase rounded transition-all flex items-center gap-1.5 ${
              mode === "pointcloud"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Point Cloud
          </button>
          <button
            onClick={() => setMode("elevation")}
            className={`px-3 py-1.5 text-xs font-mono tracking-wider uppercase rounded transition-all flex items-center gap-1.5 ${
              mode === "elevation"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            DEM Heatmap
          </button>
        </div>

        {/* Right: Camera Tools & Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Flight Path Toggle */}
          <button
            onClick={() => setShowFlightPath(!showFlightPath)}
            title="Toggle Drone Flight Trajectory"
            className={`p-2 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
              showFlightPath
                ? "bg-sky-500/20 border-sky-500/40 text-sky-300"
                : "bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Trajectory</span>
          </button>

          {/* GIS Measure Tool */}
          <button
            onClick={() => {
              setMeasuring(!measuring);
              setMeasurementPoints([]);
            }}
            title="Interactive GIS Measure (Distance & Slope)"
            className={`p-2 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
              measuring
                ? "bg-red-500/20 border-red-500/50 text-red-400"
                : "bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Ruler className="w-4 h-4" />
            <span className="hidden sm:inline">Measure</span>
          </button>

          {/* Camera View presets */}
          <div className="flex items-center bg-neutral-900/90 border border-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => handleResetCamera("perspective")}
              className={`px-2 py-1.5 text-xs font-mono rounded ${
                cameraView === "perspective" ? "bg-neutral-800 text-neutral-100" : "text-neutral-400"
              }`}
              title="Isometric 3D Perspective"
            >
              3D
            </button>
            <button
              onClick={() => handleResetCamera("nadir")}
              className={`px-2 py-1.5 text-xs font-mono rounded ${
                cameraView === "nadir" ? "bg-neutral-800 text-neutral-100" : "text-neutral-400"
              }`}
              title="Nadir 90° Top-Down View"
            >
              Nadir
            </button>
            <button
              onClick={() => handleResetCamera("side")}
              className={`px-2 py-1.5 text-xs font-mono rounded ${
                cameraView === "side" ? "bg-neutral-800 text-neutral-100" : "text-neutral-400"
              }`}
              title="Side Cross Elevation"
            >
              Elev
            </button>
          </div>

          {/* Sun / Shadow Slider */}
          <div className="hidden md:flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 rounded-lg px-2.5 py-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <input
              type="range"
              min="0"
              max="360"
              value={sunAngle}
              onChange={(e) => setSunAngle(Number(e.target.value))}
              className="w-16 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              title="Solar Azimuth Angle"
            />
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-neutral-900/90 border border-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-200 transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ position: [70, 60, 80], fov: 45 }}
          shadows
          gl={{ antialias: true, alpha: false }}
          className="w-full h-full bg-neutral-950"
        >
          <color attach="background" args={["#0a0b0e"]} />
          <fog attach="fog" args={["#0a0b0e", 100, 240]} />
          <Terrain3D
            mode={mode}
            projectType={terrainType}
            showFlightPath={showFlightPath}
            telemetry={project.telemetry}
            measuring={measuring}
            onPointClicked={handlePointClicked}
            measurementPoints={measurementPoints}
            sunAngle={sunAngle}
            selectedKeyframeIndex={selectedKeyframeIndex}
          />
          <OrbitControls
            ref={controlsRef}
            maxDistance={220}
            minDistance={10}
            maxPolarAngle={Math.PI / 2 - 0.04}
          />
        </Canvas>

        {/* Reticle / HUD Watermark */}
        <div className="absolute bottom-4 left-4 pointer-events-none font-mono text-[11px] text-neutral-400 bg-neutral-950/80 backdrop-blur-sm border border-neutral-800/80 rounded-md p-2.5 space-y-1">
          <div className="flex items-center gap-2 text-neutral-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            TERRARECON ENGINE v2.4 (SINGLE-PASS)
          </div>
          <div>CRS: <span className="text-neutral-300">{project.crs}</span></div>
          <div>GSD: <span className="text-amber-400 font-semibold">{project.gsdCmPerPixel} cm/px</span> | RMSE: <span className="text-emerald-400">{project.reprojectionErrorPx} px</span></div>
          <div>EST. POINTS: <span className="text-neutral-300">{(project.pointCloudSize / 1000000).toFixed(2)}M</span> | TRIANGLES: <span className="text-neutral-300">{(project.triangleCount / 1000).toFixed(0)}k</span></div>
        </div>

        {/* DEM Elevation Scale Legend (Shown in elevation mode) */}
        {mode === "elevation" && (
          <div className="absolute right-4 top-20 bg-neutral-950/90 backdrop-blur border border-neutral-800 rounded-lg p-3 font-mono text-xs w-36 shadow-2xl">
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-2 font-semibold">
              Elevation (DEM)
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3.5 h-36 rounded border border-neutral-700"
                style={{
                  background: "linear-gradient(to top, #3b82f6, #06b6d4, #10b981, #eab308, #ef4444, #ffffff)",
                }}
              />
              <div className="flex flex-col justify-between h-36 text-[10px] text-neutral-300">
                <span className="text-red-400 font-semibold">{project.elevation.maxM} m</span>
                <span>{((project.elevation.maxM + project.elevation.avgM) / 2).toFixed(0)} m</span>
                <span className="text-emerald-400">{project.elevation.avgM} m</span>
                <span>{((project.elevation.avgM + project.elevation.minM) / 2).toFixed(0)} m</span>
                <span className="text-blue-400 font-semibold">{project.elevation.minM} m</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-neutral-800 text-[9px] text-neutral-400">
              Delta: {(project.elevation.maxM - project.elevation.minM).toFixed(1)}m
            </div>
          </div>
        )}

        {/* GIS Measurement Floating Card */}
        {measuring && (
          <div className="absolute top-16 left-4 bg-neutral-950/95 backdrop-blur-md border border-red-500/40 rounded-lg p-3 font-mono text-xs shadow-2xl max-w-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
              <span className="text-red-400 font-semibold flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" /> GIS Measurement Tool
              </span>
              <button
                onClick={() => setMeasurementPoints([])}
                className="text-[10px] text-neutral-400 hover:text-neutral-200 underline"
              >
                Clear
              </button>
            </div>
            {measurementPoints.length === 0 && (
              <p className="text-neutral-400 text-[11px]">Click 1st point on terrain surface...</p>
            )}
            {measurementPoints.length === 1 && (
              <p className="text-amber-400 text-[11px] animate-pulse">Point 1 selected. Click 2nd target point...</p>
            )}
            {measurementData && (
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Ground Dist:</span>
                  <span className="text-neutral-100 font-semibold">{measurementData.groundDistanceM} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Euclidean Dist:</span>
                  <span className="text-neutral-100 font-semibold">{measurementData.euclideanDistanceM} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Elevation Δh:</span>
                  <span className="text-amber-400 font-semibold">{measurementData.deltaHeightM} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Slope Gradient:</span>
                  <span className="text-emerald-400 font-semibold">{measurementData.slopeDeg}°</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Synchronized Drone Keyframe & Video Scrub Bar */}
      {project.telemetry && project.telemetry.length > 0 && onKeyframeChange && (
        <div className="bg-neutral-900 border-t border-neutral-800 px-4 py-2.5 flex items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-neutral-300 shrink-0">
            <Camera className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-neutral-200">Flight Synchronizer</span>
            <span className="text-neutral-400 text-[11px]">
              Frame #{project.telemetry[selectedKeyframeIndex]?.frameIndex || 1} ({selectedKeyframeIndex + 1}/{project.telemetry.length})
            </span>
          </div>

          <div className="flex-1 max-w-xl flex items-center gap-3">
            <span className="text-[10px] text-neutral-400">0s</span>
            <input
              type="range"
              min="0"
              max={Math.max(0, project.telemetry.length - 1)}
              value={selectedKeyframeIndex}
              onChange={(e) => onKeyframeChange(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-[10px] text-neutral-400">{project.videoDurationSec}s</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] text-neutral-400 shrink-0">
            <span>Alt: <strong className="text-neutral-200 font-mono">{project.telemetry[selectedKeyframeIndex]?.altitudeM.toFixed(1)}m</strong></span>
            <span>Speed: <strong className="text-neutral-200 font-mono">{project.telemetry[selectedKeyframeIndex]?.speedMs.toFixed(1)}m/s</strong></span>
            <span>Pitch: <strong className="text-neutral-200 font-mono">{project.telemetry[selectedKeyframeIndex]?.pitchDeg.toFixed(1)}°</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
