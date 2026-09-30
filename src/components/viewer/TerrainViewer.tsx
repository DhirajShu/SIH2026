"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import {
  Layers,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Mountain,
  Grid,
  Sun,
  Activity,
  Compass,
  Info,
  Sliders,
  Eye,
  CheckCircle2
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

import { Terrain3D } from "./Terrain3D";

interface TerrainViewerProps {
  project: ReconstructionProject;
  isAnalyzeOpen?: boolean;
  selectedKeyframeIndex?: number;
  onKeyframeChange?: (index: number) => void;
  onToggleAnalyze?: () => void;
  onOpenExportModal?: () => void;
}

export function TerrainViewer({
  project,
  isAnalyzeOpen = false,
  selectedKeyframeIndex = 0,
  onKeyframeChange,
  onToggleAnalyze,
  onOpenExportModal,
}: TerrainViewerProps) {
  // Viewer Display Mode: 'textured' (Terrain), 'pointcloud' (Point Cloud), 'wireframe' (Wireframe)
  const [mode, setMode] = useState<ViewerDisplayMode>("textured");
  const [sunAngle, setSunAngle] = useState(55);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [measuring, setMeasuring] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState<THREE.Vector3[]>([]);
  const [showFlightCorridor, setShowFlightCorridor] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);

  // Terrain profile determination
  const terrainType = project.id.includes("alpine")
    ? "alpine"
    : project.id.includes("viaduct")
    ? "viaduct"
    : "quarry";

  // Reset Camera action (Orbit, Zoom, Pan reset)
  const handleResetCamera = () => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    controls.object.position.set(70, 60, 80);
    controls.target.set(0, 10, 0);
    controls.update();
  };

  // Preset Views (Top / Nadir)
  const handleSetTopView = () => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    controls.object.position.set(0, 115, 0.1);
    controls.target.set(0, 0, 0);
    controls.update();
  };

  // Fullscreen Handler
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

  // Handle point selection on terrain
  const handlePointClicked = (point: THREE.Vector3) => {
    if (!measuring) return;
    if (measurementPoints.length >= 2) {
      setMeasurementPoints([point]);
    } else {
      setMeasurementPoints((prev) => [...prev, point]);
    }
  };

  // Compute distance between 2 measured points (relative scene units)
  const measurementInfo = React.useMemo(() => {
    if (measurementPoints.length !== 2) return null;
    const p1 = measurementPoints[0];
    const p2 = measurementPoints[1];
    const dist = p1.distanceTo(p2);
    const deltaY = Math.abs(p2.y - p1.y);
    const horizontalDist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2));
    const slopeDeg = (Math.atan2(deltaY, horizontalDist) * 180) / Math.PI;

    return {
      euclideanUnits: dist.toFixed(1),
      horizontalUnits: horizontalDist.toFixed(1),
      deltaHeightUnits: deltaY.toFixed(1),
      slopeDeg: slopeDeg.toFixed(1),
    };
  }, [measurementPoints]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[640px] sm:h-[720px] lg:h-[760px] bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden select-none flex flex-col font-sans shadow-2xl transition-all ${
        isFullscreen ? "!h-screen !w-screen !rounded-none fixed inset-0 z-50" : ""
      }`}
    >
      {/* =========================================================================
          SMALL CONTROL PANEL (FLOATING DOCK OVER 3D VIEWPORT)
          Features:
          - Terrain (Solid surface)
          - Point Cloud (Dense 3D points)
          - Wireframe (TIN topology)
          - Camera Reset (Orbit/Zoom/Pan Reset)
          - Top (Nadir) View
      ========================================================================= */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-2rem)]">
        {/* Core Mode Switcher: Terrain, Point Cloud, Wireframe */}
        <div className="flex items-center bg-neutral-950/90 backdrop-blur-md border border-neutral-800 rounded-xl p-1 shadow-2xl">
          <button
            onClick={() => setMode("textured")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === "textured"
                ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 font-bold"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
            }`}
            title="Render textured photogrammetric 3D terrain mesh"
          >
            <Mountain className="w-3.5 h-3.5" />
            <span>Terrain</span>
          </button>

          <button
            onClick={() => setMode("pointcloud")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === "pointcloud"
                ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 font-bold"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
            }`}
            title="Render 3D sparse and dense spatial point cloud"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Point Cloud</span>
          </button>

          <button
            onClick={() => setMode("wireframe")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === "wireframe"
                ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 font-bold"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
            }`}
            title="Render geometric triangulated wireframe mesh"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Wireframe</span>
          </button>
        </div>

        {/* Camera Reset & Views */}
        <div className="flex items-center bg-neutral-950/90 backdrop-blur-md border border-neutral-800 rounded-xl p-1 shadow-2xl">
          <button
            onClick={handleResetCamera}
            className="px-2.5 py-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset Camera (Orbit, Zoom, and Pan to default)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handleSetTopView}
            className="px-2.5 py-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
            title="Align camera to Top / Nadir orthographic view"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Top</span>
          </button>
        </div>

        {/* Solar Azimuth Sun Relief (Light angle) */}
        <div className="hidden lg:flex items-center gap-2 bg-neutral-950/90 backdrop-blur-md border border-neutral-800 rounded-xl px-3 py-1.5 shadow-2xl text-xs font-mono text-neutral-400">
          <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[10px] text-neutral-500">SUN</span>
          <input
            type="range"
            min="0"
            max="360"
            value={sunAngle}
            onChange={(e) => setSunAngle(Number(e.target.value))}
            className="w-16 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            title="Rotate terrain sun lighting azimuth"
          />
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-neutral-950/90 backdrop-blur-md border border-neutral-800 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors shadow-2xl cursor-pointer"
          title="Toggle Fullscreen 3D Viewport"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* =========================================================================
          INTERACTION CHEAT SHEET / NAVIGATION HINT
      ========================================================================= */}
      <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-neutral-800/80 text-[11px] font-mono text-neutral-400 shadow-xl pointer-events-none">
        <span>Orbit: <strong className="text-neutral-200">Left Drag</strong></span>
        <span className="text-neutral-700">•</span>
        <span>Pan: <strong className="text-neutral-200">Right Drag</strong></span>
        <span className="text-neutral-700">•</span>
        <span>Zoom: <strong className="text-neutral-200">Scroll</strong></span>
      </div>

      {/* =========================================================================
          LARGE 3D WEBGL VIEWPORT (THREE.JS / REACT THREE FIBER / DREI)
      ========================================================================= */}
      <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ position: [70, 60, 80], fov: 44 }}
          shadows
          gl={{ antialias: true, alpha: false }}
          className="w-full h-full bg-neutral-950"
        >
          <color attach="background" args={["#08090b"]} />
          <fog attach="fog" args={["#08090b", 90, 240]} />

          <Terrain3D
            mode={mode}
            projectType={terrainType}
            showFlightPath={showFlightCorridor}
            telemetry={project.telemetry}
            measuring={measuring}
            onPointClicked={handlePointClicked}
            measurementPoints={measurementPoints}
            sunAngle={sunAngle}
          />

          <OrbitControls
            ref={controlsRef}
            enableRotate={true}
            enableZoom={true}
            enablePan={true}
            maxDistance={240}
            minDistance={8}
            maxPolarAngle={Math.PI / 2 - 0.04}
          />
        </Canvas>

        {/* =====================================================================
            PROTOTYPE RECONSTRUCTION FLOATING DISCLAIMER BADGE
            Strictly honest disclaimer: does NOT claim fake real-world data
        ===================================================================== */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none max-w-sm">
          <div className="p-3 rounded-xl bg-neutral-950/90 backdrop-blur-md border border-neutral-800 text-xs font-mono space-y-1 shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                PROTOTYPE RECONSTRUCTION
              </span>
              <span className="text-[10px] text-neutral-500 uppercase">3D VIEWER</span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
              High-fidelity procedural terrain demonstrating interactive 3D model exploration.
            </p>
            <div className="text-[10px] text-neutral-500 pt-0.5 flex items-center gap-2">
              <span>Mode: <strong className="text-neutral-300 uppercase">{mode}</strong></span>
              <span>•</span>
              <span>Engine: <strong className="text-neutral-300">Three.js R3F</strong></span>
            </div>
          </div>
        </div>

        {/* Active Measurement Overlay Tool */}
        {measuring && (
          <div className="absolute top-16 left-4 z-20 p-4 rounded-xl bg-neutral-950/95 backdrop-blur-md border border-amber-500/40 text-xs font-mono shadow-2xl max-w-xs space-y-2">
            <div className="flex items-center justify-between font-semibold text-amber-400 pb-1.5 border-b border-neutral-800">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Surface Measurement
              </span>
              <button
                onClick={() => {
                  setMeasuring(false);
                  setMeasurementPoints([]);
                }}
                className="text-[10px] text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-[11px] text-neutral-400 font-sans">
              {measurementPoints.length === 0
                ? "Click on any point on the terrain surface to begin."
                : measurementPoints.length === 1
                ? "Click a second point on the terrain to calculate relative slope & distance."
                : "2-Point Surface Profile calculated:"}
            </p>

            {measurementInfo && (
              <div className="space-y-1 pt-1 border-t border-neutral-800 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Spatial Distance:</span>
                  <span className="text-neutral-200">{measurementInfo.euclideanUnits} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Horizontal Delta:</span>
                  <span className="text-neutral-200">{measurementInfo.horizontalUnits} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Relief Difference (Δy):</span>
                  <span className="text-amber-400">{measurementInfo.deltaHeightUnits} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Surface Slope:</span>
                  <span className="text-neutral-200">{measurementInfo.slopeDeg}°</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          ANALYZE SIDE DRAWER (When Analyze button is active)
      ========================================================================= */}
      {isAnalyzeOpen && (
        <div className="absolute top-0 right-0 bottom-0 w-80 max-w-full z-30 bg-neutral-950/95 backdrop-blur-xl border-l border-neutral-800 p-5 font-mono text-xs shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-200 font-semibold text-sm">
                <Activity className="w-4 h-4 text-amber-500" />
                <span>Terrain Analysis Tools</span>
              </div>
              <button
                onClick={onToggleAnalyze}
                className="text-neutral-500 hover:text-neutral-300 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Measurement Tool Toggle */}
            <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-200 font-medium">Surface Measurement</span>
                <button
                  onClick={() => setMeasuring(!measuring)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    measuring
                      ? "bg-amber-500 text-neutral-950 font-bold"
                      : "bg-neutral-800 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {measuring ? "Active" : "Enable"}
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                Click two points across the model to inspect spatial distance and gradient.
              </p>
            </div>

            {/* Flight Trajectory Corridor Toggle */}
            <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-200 font-medium">Flight Path Trajectory</span>
                <button
                  onClick={() => setShowFlightCorridor(!showFlightCorridor)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    showFlightCorridor
                      ? "bg-amber-500 text-neutral-950 font-bold"
                      : "bg-neutral-800 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {showFlightCorridor ? "Visible" : "Hidden"}
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                Visualizes the single-pass camera survey corridor above the terrain.
              </p>
            </div>

            {/* Shading Azimuth */}
            <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-200 font-medium">Solar Relief Angle</span>
                <span className="text-amber-400">{sunAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={sunAngle}
                onChange={(e) => setSunAngle(Number(e.target.value))}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[11px] text-neutral-500 font-sans">
                Rotate directional light to highlight geological fractures and slope contours.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800/80">
            <button
              onClick={onToggleAnalyze}
              className="w-full py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono text-center transition-colors cursor-pointer"
            >
              Close Analysis Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
