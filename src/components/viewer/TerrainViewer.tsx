"use client";

import React, { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import {
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
  Ruler,
  AlertTriangle,
  X,
  Layers,
  Box,
  CheckCircle2
} from "lucide-react";
import { ReconstructionProject, ViewerDisplayMode } from "@/lib/types";
import { Terrain3D, ModelGeometryStats } from "./Terrain3D";

// Dynamic import of Canvas with ssr disabled to prevent Next.js hydration issues
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
);

const OrbitControls = dynamic(
  () => import("@react-three/drei").then((mod) => mod.OrbitControls),
  { ssr: false }
);

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
  // Display Mode: Terrain (textured), Point Cloud (pointcloud), Wireframe (wireframe)
  const [mode, setMode] = useState<ViewerDisplayMode>("textured");
  const [sunAngle, setSunAngle] = useState(55);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Model-space measurement tool state
  const [measuring, setMeasuring] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState<THREE.Vector3[]>([]);

  // Actual geometry information calculated directly from Three.js BufferGeometry
  const [geometryStats, setGeometryStats] = useState<ModelGeometryStats | null>(null);

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

  // Preset View: Top / Nadir
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
  const handlePointClicked = useCallback((point: THREE.Vector3) => {
    setMeasurementPoints((prev) => {
      if (prev.length >= 2) {
        return [point];
      }
      return [...prev, point];
    });
  }, []);

  // Compute Model-Space Measurement between 2 selected points
  const measurementCalculation = React.useMemo(() => {
    if (measurementPoints.length !== 2) return null;
    const p1 = measurementPoints[0];
    const p2 = measurementPoints[1];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;

    const euclideanDistance = p1.distanceTo(p2);
    const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
    const deltaHeight = Math.abs(dy);
    const slopeDeg = (Math.atan2(deltaHeight, horizontalDistance) * 180) / Math.PI;

    return {
      p1: { x: p1.x.toFixed(1), y: p1.y.toFixed(1), z: p1.z.toFixed(1) },
      p2: { x: p2.x.toFixed(1), y: p2.y.toFixed(1), z: p2.z.toFixed(1) },
      euclideanDistance: euclideanDistance.toFixed(2),
      horizontalDistance: horizontalDistance.toFixed(2),
      deltaHeight: deltaHeight.toFixed(2),
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
            title="Render 3D spatial point cloud"
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
            title="Reset Camera (Orbit, Zoom, and Pan to default angle)"
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

        {/* Measurement Quick Toggle */}
        <button
          onClick={() => {
            setMeasuring((prev) => !prev);
            if (!isAnalyzeOpen && onToggleAnalyze) {
              onToggleAnalyze();
            }
          }}
          className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 shadow-2xl transition-all cursor-pointer ${
            measuring
              ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
              : "bg-neutral-950/90 border-neutral-800 text-neutral-400 hover:text-neutral-200"
          }`}
          title="Toggle Model-Space Measurement Tool"
        >
          <Ruler className="w-3.5 h-3.5 text-amber-400" />
          <span>{measuring ? "Measuring Active" : "Measure"}</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-neutral-950/90 backdrop-blur-md border border-neutral-800 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors shadow-2xl cursor-pointer"
          title="Toggle Fullscreen 3D Viewport"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation & Controls Helper */}
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
            showFlightPath={false}
            telemetry={project.telemetry}
            measuring={measuring}
            onPointClicked={handlePointClicked}
            measurementPoints={measurementPoints}
            sunAngle={sunAngle}
            onGeometryCalculated={setGeometryStats}
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

        {/* Prototype Reconstruction Disclaimer Floating Badge */}
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
          </div>
        </div>

        {/* On-screen Model-Space Measurement Indicator Card */}
        {measuring && (
          <div className="absolute bottom-4 right-4 z-20 p-4 rounded-xl bg-neutral-950/95 backdrop-blur-md border border-amber-500/40 text-xs font-mono shadow-2xl max-w-xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between font-semibold text-amber-400 pb-1.5 border-b border-neutral-800">
              <span className="flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" /> Model-space measurement
              </span>
              <button
                onClick={() => {
                  setMeasuring(false);
                  setMeasurementPoints([]);
                }}
                className="text-[11px] text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-1 text-[11px] font-sans text-neutral-300">
              {measurementPoints.length === 0 && (
                <p className="text-neutral-400">Click first point on the 3D model to begin.</p>
              )}
              {measurementPoints.length === 1 && (
                <p className="text-amber-300">Point 1 selected. Click second point to measure distance.</p>
              )}
              {measurementCalculation && (
                <div className="space-y-1 font-mono pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Model Distance:</span>
                    <span className="text-amber-400 font-bold">{measurementCalculation.euclideanDistance} units</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>Horizontal Delta (ΔXZ):</span>
                    <span>{measurementCalculation.horizontalDistance} units</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>Relief Difference (ΔY):</span>
                    <span>{measurementCalculation.deltaHeight} units</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>Surface Slope:</span>
                    <span>{measurementCalculation.slopeDeg}°</span>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-amber-400/90 font-medium">
                      Scale not calibrated
                    </span>
                    <button
                      onClick={() => setMeasurementPoints([])}
                      className="text-[10px] text-neutral-400 hover:text-neutral-200 underline cursor-pointer"
                    >
                      Clear Points
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          ANALYSIS PANEL (SLIDE-OVER SUITE)
          Demonstrates genuine functionality without inventing scientific results:
          - Actual geometry information calculated directly from Three.js BufferGeometry:
            • Vertex count
            • Triangle count
            • Model dimensions (Bounding Box X, Y, Z)
          - Model-space measurement tool with uncalibrated scale notice
      ========================================================================= */}
      {isAnalyzeOpen && (
        <div className="absolute top-0 right-0 bottom-0 w-88 max-w-full z-30 bg-neutral-950/95 backdrop-blur-xl border-l border-neutral-800 p-6 font-mono text-xs shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-100 font-semibold text-sm">
                <Activity className="w-4 h-4 text-amber-500" />
                <span>3D Model Analysis</span>
              </div>
              <button
                onClick={onToggleAnalyze}
                className="p-1 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Close Analysis Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ===================================================================
                1. ACTUAL GEOMETRY INFORMATION (CALCULATED FROM ACTIVE BUFFER)
                Strict Rule: Vertex count, triangle count, and dimensions are
                computed directly from Three.js BufferGeometry attributes.
            =================================================================== */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-neutral-400 text-[11px] font-semibold tracking-wider uppercase">
                <span>Calculated Geometry</span>
                <span className="text-amber-500 lowercase font-normal">{mode}</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                {/* Vertex Count */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400/80" /> Vertex Count:
                  </span>
                  <span className="text-neutral-100 font-bold">
                    {geometryStats ? geometryStats.vertexCount.toLocaleString() : "Calculating..."}
                  </span>
                </div>

                {/* Triangle Count */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-400/80" /> Triangle Count:
                  </span>
                  <span className="text-neutral-100 font-bold">
                    {geometryStats
                      ? geometryStats.triangleCount !== null
                        ? geometryStats.triangleCount.toLocaleString()
                        : "N/A (Point Cloud)"
                      : "Calculating..."}
                  </span>
                </div>

                {/* Model Dimensions */}
                <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                  <span className="text-neutral-400 text-[11px] block font-medium">
                    Model Dimensions (Bounding Box):
                  </span>
                  {geometryStats ? (
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="p-2 rounded bg-neutral-950 border border-neutral-800/80">
                        <div className="text-[10px] text-neutral-500">WIDTH (X)</div>
                        <div className="text-neutral-200 font-semibold">{geometryStats.dimensions.x}</div>
                      </div>
                      <div className="p-2 rounded bg-neutral-950 border border-neutral-800/80">
                        <div className="text-[10px] text-neutral-500">RELIEF (Y)</div>
                        <div className="text-amber-400 font-semibold">{geometryStats.dimensions.y}</div>
                      </div>
                      <div className="p-2 rounded bg-neutral-950 border border-neutral-800/80">
                        <div className="text-[10px] text-neutral-500">DEPTH (Z)</div>
                        <div className="text-neutral-200 font-semibold">{geometryStats.dimensions.z}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-neutral-500 text-[11px]">Computing geometry bounds...</div>
                  )}
                  <div className="text-[10px] text-neutral-500 pt-1">
                    Units: Arbitrary 3D coordinate space.
                  </div>
                </div>
              </div>
            </div>

            {/* ===================================================================
                2. MODEL-SPACE MEASUREMENT TOOL
                Measures 3D euclidean distance in model-space without claiming
                geographic scale accuracy.
            =================================================================== */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-neutral-400 text-[11px] font-semibold tracking-wider uppercase">
                <span>Model-Space Measurement</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    measuring ? "bg-amber-500/20 text-amber-300" : "bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {measuring ? "ACTIVE" : "STANDBY"}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-200 font-medium">Pick 2 Points</span>
                  <button
                    onClick={() => {
                      setMeasuring(!measuring);
                      if (!measuring) setMeasurementPoints([]);
                    }}
                    className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                      measuring
                        ? "bg-amber-500 text-neutral-950 font-bold"
                        : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                    }`}
                  >
                    {measuring ? "Deactivate" : "Activate Tool"}
                  </button>
                </div>

                <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                  Select two surface points on the 3D model to calculate spatial distance in model coordinates.
                </p>

                {/* Points & Calculated Distance Display */}
                {measurementCalculation ? (
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400 font-medium">Model-space measurement:</span>
                      <span className="text-amber-400 font-bold text-sm">
                        {measurementCalculation.euclideanDistance} units
                      </span>
                    </div>

                    <div className="text-[10px] text-neutral-400 space-y-1 pt-1 border-t border-neutral-800">
                      <div className="flex justify-between">
                        <span>Point A:</span>
                        <span className="text-neutral-300 font-mono">
                          [{measurementCalculation.p1.x}, {measurementCalculation.p1.y}, {measurementCalculation.p1.z}]
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Point B:</span>
                        <span className="text-neutral-300 font-mono">
                          [{measurementCalculation.p2.x}, {measurementCalculation.p2.y}, {measurementCalculation.p2.z}]
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Horizontal Distance:</span>
                        <span className="text-neutral-300">{measurementCalculation.horizontalDistance} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Relief Gradient (ΔY):</span>
                        <span className="text-amber-400">{measurementCalculation.deltaHeight} units</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setMeasurementPoints([])}
                      className="w-full mt-2 py-1 text-center text-[10px] text-neutral-400 hover:text-neutral-200 bg-neutral-900 rounded transition-colors cursor-pointer"
                    >
                      Clear & Pick New Points
                    </button>
                  </div>
                ) : measuring ? (
                  <div className="p-3 rounded-lg bg-neutral-950/80 border border-amber-500/20 text-[11px] text-amber-300 font-sans">
                    {measurementPoints.length === 0
                      ? "• Click first target point on the terrain surface."
                      : "• Point 1 pinned. Click second target point to complete measurement."}
                  </div>
                ) : null}

                {/* Scale Calibration Status & Required Explanation */}
                <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Scale not calibrated</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                    Real-world geographic accuracy requires georeferencing information such as GPS, RTK or ground control points.
                  </p>
                </div>
              </div>
            </div>

            {/* ===================================================================
                3. SOLAR RELIEF SHADING INSPECTION
            =================================================================== */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-300 font-medium flex items-center gap-1.5 text-xs">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Solar Relief Shading
                </span>
                <span className="text-amber-400 font-bold">{sunAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={sunAngle}
                onChange={(e) => setSunAngle(Number(e.target.value))}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[10px] text-neutral-500 font-sans">
                Adjust light vector azimuth to inspect micro-topography and fractures.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-neutral-800">
            <button
              onClick={onToggleAnalyze}
              className="w-full py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono text-center transition-colors cursor-pointer"
            >
              Close Analysis Suite
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
