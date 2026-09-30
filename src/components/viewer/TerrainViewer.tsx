"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
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
  Ruler,
  AlertTriangle,
  X,
  Layers,
  Loader2,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { ReconstructionProject, ViewerDisplayMode } from "@/lib/types";
import { Terrain3D, ModelGeometryStats } from "./Terrain3D";
import { NorthumberlandiaModel } from "./NorthumberlandiaModel";

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
  useRealGlb?: boolean;
  onGeometryCalculated?: (stats: ModelGeometryStats) => void;
  controlsRefExternal?: React.MutableRefObject<any>;
}

export function TerrainViewer({
  project,
  isAnalyzeOpen = false,
  selectedKeyframeIndex = 0,
  onKeyframeChange,
  onToggleAnalyze,
  onOpenExportModal,
  useRealGlb = true,
  onGeometryCalculated: onGeometryCalculatedProp,
  controlsRefExternal,
}: TerrainViewerProps) {
  // Display Mode: Terrain (textured), Point Cloud (pointcloud), Wireframe (wireframe)
  const [mode, setMode] = useState<ViewerDisplayMode>("textured");
  const [sunAngle, setSunAngle] = useState(55);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Model loading and error states
  const isDemo = project.id === "demo-reconstruction-sih2026" || project.id.includes("northumberlandia");
  const isRealModel = useRealGlb && (isDemo || project.id.includes("real"));
  const [loadingStatus, setLoadingStatus] = useState<"loading" | "ready" | "error">(isRealModel ? "loading" : "ready");
  const [loadError, setLoadError] = useState<string | null>(null);

  // Model-space measurement tool state
  const [measuring, setMeasuring] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState<THREE.Vector3[]>([]);

  // Actual geometry information calculated directly from Three.js BufferGeometry
  const [geometryStats, setGeometryStats] = useState<ModelGeometryStats | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const localControlsRef = useRef<any>(null);
  const controlsRef = controlsRefExternal || localControlsRef;

  // Handle geometry calculation callback
  const handleGeometryCalculated = useCallback((stats: ModelGeometryStats) => {
    setGeometryStats(stats);
    if (onGeometryCalculatedProp) {
      onGeometryCalculatedProp(stats);
    }
  }, [onGeometryCalculatedProp]);

  // Reset Camera action (Orbit, Zoom, Pan reset)
  const handleResetCamera = () => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    if (isRealModel) {
      controls.object.position.set(0, 55, 75);
      controls.target.set(0, 0, 0);
    } else {
      controls.object.position.set(70, 60, 80);
      controls.target.set(0, 10, 0);
    }
    controls.update();
  };

  // Preset View: Top / Nadir
  const handleSetTopView = () => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    controls.object.position.set(0, 105, 0.1);
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
      className={`relative w-full h-[460px] sm:h-[640px] lg:h-[760px] bg-[#080B0A] border border-[#26302C] rounded-xl overflow-hidden select-none flex flex-col font-sans shadow-2xl transition-all ${
        isFullscreen ? "!h-screen !w-screen !rounded-none fixed inset-0 z-50" : ""
      }`}
    >
      {/* =========================================================================
          1. LOADING STATE OVERLAY
      ========================================================================= */}
      {loadingStatus === "loading" && (
        <div className="absolute inset-0 z-30 bg-[#080B0A]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-3 font-mono select-none animate-in fade-in">
          <div className="w-10 h-10 rounded-full border-2 border-[#78AFA2] border-t-transparent animate-spin" />
          <div className="text-[#F1F4F2] font-bold text-sm tracking-wider uppercase">
            LOADING RECONSTRUCTION
          </div>
          <p className="text-[11px] text-[#68736E] max-w-sm text-center">
            Streaming and parsing 3D photogrammetric terrain geometry...
          </p>
        </div>
      )}

      {/* =========================================================================
          2. ERROR STATE OVERLAY
      ========================================================================= */}
      {loadingStatus === "error" && (
        <div className="absolute inset-0 z-30 bg-[#080B0A] flex flex-col items-center justify-center p-6 space-y-4 font-mono select-none text-center animate-in fade-in">
          <div className="w-12 h-12 rounded-xl bg-[#121916] border border-[#26302C] flex items-center justify-center text-[#B87575]">
            <AlertTriangle className="w-6 h-6 text-[#B49B69]" />
          </div>
          <div className="space-y-1">
            <div className="text-[#F1F4F2] font-bold text-base tracking-wider uppercase">
              RECONSTRUCTION UNAVAILABLE
            </div>
            <p className="text-xs text-[#9BA6A1] max-w-md">
              Unable to load the demo terrain model asset. {loadError || "Check network connection or asset path."}
            </p>
          </div>
          <button
            onClick={() => {
              setLoadingStatus("loading");
              setLoadError(null);
            }}
            className="h-[40px] px-5 rounded-[8px] bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          3. CONTROL DOCK (FLOATING OVER 3D VIEWPORT)
      ========================================================================= */}
      <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 right-2.5 sm:right-auto z-20 flex flex-wrap items-center gap-1.5 sm:gap-2 max-w-full">
        {/* Core Mode Switcher: Terrain, Point Cloud, Wireframe */}
        <div className="flex items-center bg-[#0D1210]/95 backdrop-blur-md border border-[#26302C] rounded-[8px] p-0.5 sm:p-1 shadow-lg">
          <button
            onClick={() => setMode("textured")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-[6px] text-[11px] sm:text-xs font-mono font-medium flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              mode === "textured"
                ? "bg-[#78AFA2] text-[#080B0A] font-bold shadow-sm"
                : "text-[#9BA6A1] hover:text-[#F1F4F2] hover:bg-[#121916]"
            }`}
            title="Render textured photogrammetric 3D terrain mesh"
          >
            <Mountain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Terrain</span>
            <span className="sm:hidden">Mesh</span>
          </button>

          <button
            onClick={() => setMode("pointcloud")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-[6px] text-[11px] sm:text-xs font-mono font-medium flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              mode === "pointcloud"
                ? "bg-[#78AFA2] text-[#080B0A] font-bold shadow-sm"
                : "text-[#9BA6A1] hover:text-[#F1F4F2] hover:bg-[#121916]"
            }`}
            title="Render genuine 3D spatial points derived from GLB geometry"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Point Cloud</span>
            <span className="sm:hidden">Points</span>
          </button>

          <button
            onClick={() => setMode("wireframe")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-[6px] text-[11px] sm:text-xs font-mono font-medium flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              mode === "wireframe"
                ? "bg-[#78AFA2] text-[#080B0A] font-bold shadow-sm"
                : "text-[#9BA6A1] hover:text-[#F1F4F2] hover:bg-[#121916]"
            }`}
            title="Render geometric triangulated wireframe mesh"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wireframe</span>
            <span className="sm:hidden">Wire</span>
          </button>
        </div>

        {/* Camera Reset & Views */}
        <div className="flex items-center bg-[#0D1210]/95 backdrop-blur-md border border-[#26302C] rounded-[8px] p-0.5 sm:p-1 shadow-lg">
          <button
            onClick={handleResetCamera}
            className="px-2 sm:px-2.5 py-1.5 text-[#9BA6A1] hover:text-[#F1F4F2] hover:bg-[#121916] rounded-[6px] text-[11px] sm:text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset Camera (Orbit, Zoom, and Pan to default angle)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handleSetTopView}
            className="px-2 sm:px-2.5 py-1.5 text-[#9BA6A1] hover:text-[#F1F4F2] hover:bg-[#121916] rounded-[6px] text-[11px] sm:text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
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
          className={`px-2.5 sm:px-3 py-1.5 rounded-[8px] border text-[11px] sm:text-xs font-mono flex items-center gap-1.5 shadow-lg transition-all cursor-pointer ${
            measuring
              ? "bg-[#78AFA2]/20 border-[#78AFA2]/50 text-[#78AFA2] font-semibold"
              : "bg-[#0D1210]/95 border-[#26302C] text-[#9BA6A1] hover:text-[#F1F4F2] hover:bg-[#121916]"
          }`}
          title="Toggle Model-Space Measurement Tool"
        >
          <Ruler className="w-3.5 h-3.5 text-[#78AFA2]" />
          <span>{measuring ? "Measuring" : "Measure"}</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 sm:p-2 bg-[#0D1210]/95 backdrop-blur-md border border-[#26302C] rounded-[8px] text-[#9BA6A1] hover:text-[#F1F4F2] hover:bg-[#121916] transition-colors shadow-lg cursor-pointer"
          title="Toggle Fullscreen 3D Viewport"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation & Controls Helper */}
      <div className="absolute top-4 right-4 z-20 hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-[8px] bg-[#0D1210]/90 backdrop-blur-md border border-[#26302C] text-[11px] font-mono text-[#9BA6A1] shadow-lg pointer-events-none">
        <span>Orbit: <strong className="text-[#F1F4F2]">Left Drag</strong></span>
        <span className="text-[#26302C]">•</span>
        <span>Pan: <strong className="text-[#F1F4F2]">Right Drag</strong></span>
        <span className="text-[#26302C]">•</span>
        <span>Zoom: <strong className="text-[#F1F4F2]">Scroll</strong></span>
      </div>

      {/* =========================================================================
          4. 3D WEBGL VIEWPORT (THREE.JS / REACT THREE FIBER)
      ========================================================================= */}
      <div
        className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        <Canvas
          camera={{ position: isRealModel ? [0, 55, 75] : [70, 60, 80], fov: 44 }}
          shadows
          gl={{ antialias: true, alpha: false }}
          className="w-full h-full bg-[#080B0A]"
        >
          <color attach="background" args={["#080B0A"]} />
          <fog attach="fog" args={["#080B0A", 90, 260]} />

          {isRealModel ? (
            <React.Suspense fallback={null}>
              <NorthumberlandiaModel
                mode={mode}
                onGeometryCalculated={handleGeometryCalculated}
                onModelLoaded={() => setLoadingStatus("ready")}
                measuring={measuring}
                onPointClicked={handlePointClicked}
                measurementPoints={measurementPoints}
                sunAngle={sunAngle}
                autoCenterCamera={true}
              />
            </React.Suspense>
          ) : (
            <Terrain3D
              mode={mode}
              projectType={project.id.includes("alpine") ? "alpine" : "quarry"}
              showFlightPath={false}
              telemetry={project.telemetry}
              measuring={measuring}
              onPointClicked={handlePointClicked}
              measurementPoints={measurementPoints}
              sunAngle={sunAngle}
              onGeometryCalculated={handleGeometryCalculated}
            />
          )}

          <OrbitControls
            ref={controlsRef}
            enableRotate={true}
            enableZoom={true}
            enablePan={true}
            maxDistance={260}
            minDistance={8}
            maxPolarAngle={Math.PI / 2 - 0.04}
            touches={{
              ONE: THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN,
            }}
          />
        </Canvas>

        {/* Prototype Reconstruction Disclaimer Floating Badge (Hidden when measuring on mobile) */}
        {!measuring && (
          <div className="absolute bottom-3 left-3 z-20 pointer-events-none max-w-[260px] sm:max-w-sm">
            <div className="p-2 sm:p-3 rounded-xl bg-[#0D1210]/95 backdrop-blur-md border border-[#26302C] text-xs font-mono space-y-0.5 sm:space-y-1 shadow-lg">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-1.5 py-0.5 rounded-[4px] bg-[#78AFA2]/12 border border-[#78AFA2]/30 text-[#78AFA2] text-[9px] sm:text-[10px] font-bold tracking-wider uppercase">
                  DEMO RECONSTRUCTION
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#68736E] uppercase hidden sm:inline">3D VIEWER</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#9BA6A1] font-sans leading-snug sm:leading-relaxed">
                {isRealModel
                  ? "Northumberlandia Land Sculpture 3D model."
                  : "Procedural terrain demonstrating interactive 3D model exploration."}
              </p>
            </div>
          </div>
        )}

        {/* On-screen Model-Space Measurement Indicator Card */}
        {measuring && (
          <div className="absolute bottom-3 inset-x-3 sm:inset-x-auto sm:right-4 z-20 p-3 sm:p-4 rounded-xl bg-[#0D1210]/95 backdrop-blur-md border border-[#78AFA2]/40 text-xs font-mono shadow-xl max-w-full sm:max-w-xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between font-semibold text-[#78AFA2] pb-1.5 border-b border-[#26302C]">
              <span className="flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-[#78AFA2]" /> Model-space measurement
              </span>
              <button
                onClick={() => {
                  setMeasuring(false);
                  setMeasurementPoints([]);
                }}
                className="text-[11px] text-[#9BA6A1] hover:text-[#F1F4F2] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-1 text-[11px] font-sans text-[#9BA6A1]">
              {measurementPoints.length === 0 && (
                <p className="text-[#68736E]">Click first point on the 3D model to begin.</p>
              )}
              {measurementPoints.length === 1 && (
                <p className="text-[#78AFA2]">Point 1 selected. Click second point to measure distance.</p>
              )}
              {measurementCalculation && (
                <div className="space-y-1 font-mono pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#9BA6A1]">Model Distance:</span>
                    <span className="text-[#78AFA2] font-bold">{measurementCalculation.euclideanDistance} units</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#68736E]">
                    <span>Horizontal Delta (ΔXZ):</span>
                    <span>{measurementCalculation.horizontalDistance} units</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#68736E]">
                    <span>Relief Difference (ΔY):</span>
                    <span>{measurementCalculation.deltaHeight} units</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#68736E]">
                    <span>Surface Slope:</span>
                    <span>{measurementCalculation.slopeDeg}°</span>
                  </div>

                  <div className="pt-2 border-t border-[#26302C] flex items-center justify-between">
                    <span className="text-[10px] text-[#68736E] font-medium">
                      Scale not calibrated
                    </span>
                    <button
                      onClick={() => setMeasurementPoints([])}
                      className="text-[10px] text-[#9BA6A1] hover:text-[#78AFA2] underline cursor-pointer"
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
          5. ANALYSIS PANEL (SLIDE-OVER SUITE)
          Clean technical metrics without fake accuracy:
          - Model dimensions
          - Vertices
          - Triangles
          - Bounding box
      ========================================================================= */}
      {isAnalyzeOpen && (
        <div className="absolute top-0 right-0 bottom-0 w-full sm:w-88 max-w-full z-30 bg-[#0D1210]/98 backdrop-blur-xl border-l border-[#26302C] p-4 sm:p-6 font-mono text-xs shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#26302C]">
              <div className="flex items-center gap-2 text-[#F1F4F2] font-semibold text-sm">
                <Activity className="w-4 h-4 text-[#78AFA2]" />
                <span>3D Model Analysis</span>
              </div>
              <button
                onClick={onToggleAnalyze}
                className="p-1 text-[#9BA6A1] hover:text-[#F1F4F2] rounded-[6px] hover:bg-[#121916] transition-colors cursor-pointer"
                title="Close Analysis Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Geometry stats computed directly from active BufferGeometry */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[#9BA6A1] text-[11px] font-semibold tracking-wider uppercase">
                <span>Calculated Geometry</span>
                <span className="text-[#78AFA2] lowercase font-normal">{mode}</span>
              </div>

              <div className="p-4 rounded-xl bg-[#121916] border border-[#26302C] space-y-3">
                {/* Vertex Count */}
                <div className="flex items-center justify-between">
                  <span className="text-[#9BA6A1] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#78AFA2]" /> VERTICES:
                  </span>
                  <span className="text-[#F1F4F2] font-bold">
                    {geometryStats ? geometryStats.vertexCount.toLocaleString() : "Calculating..."}
                  </span>
                </div>

                {/* Triangle Count */}
                <div className="flex items-center justify-between">
                  <span className="text-[#9BA6A1] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#78AFA2]" /> TRIANGLES:
                  </span>
                  <span className="text-[#F1F4F2] font-bold">
                    {geometryStats
                      ? geometryStats.triangleCount !== null
                        ? geometryStats.triangleCount.toLocaleString()
                        : "N/A (Point Cloud)"
                      : "Calculating..."}
                  </span>
                </div>

                {/* Model Dimensions */}
                <div className="pt-2 border-t border-[#26302C] space-y-1.5">
                  <span className="text-[#9BA6A1] text-[11px] block font-medium uppercase tracking-wider">
                    BOUNDING BOX DIMENSIONS:
                  </span>
                  {geometryStats ? (
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="p-2 rounded-[6px] bg-[#080B0A] border border-[#26302C]">
                        <div className="text-[10px] text-[#68736E]">WIDTH (X)</div>
                        <div className="text-[#F1F4F2] font-semibold">{geometryStats.dimensions.x}</div>
                      </div>
                      <div className="p-2 rounded-[6px] bg-[#080B0A] border border-[#26302C]">
                        <div className="text-[10px] text-[#68736E]">RELIEF (Y)</div>
                        <div className="text-[#78AFA2] font-semibold">{geometryStats.dimensions.y}</div>
                      </div>
                      <div className="p-2 rounded-[6px] bg-[#080B0A] border border-[#26302C]">
                        <div className="text-[10px] text-[#68736E]">DEPTH (Z)</div>
                        <div className="text-[#F1F4F2] font-semibold">{geometryStats.dimensions.z}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[#68736E] text-[11px]">Computing geometry bounds...</div>
                  )}
                  <div className="text-[10px] text-[#68736E] pt-1">
                    Units: Arbitrary 3D coordinate space.
                  </div>
                </div>
              </div>
            </div>

            {/* Model-Space Measurement Tool */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[#9BA6A1] text-[11px] font-semibold tracking-wider uppercase">
                <span>Model-Space Measurement</span>
                <span
                  className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-mono ${
                    measuring ? "bg-[#78AFA2]/20 text-[#78AFA2]" : "bg-[#121916] text-[#68736E]"
                  }`}
                >
                  {measuring ? "ACTIVE" : "STANDBY"}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#121916] border border-[#26302C] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#F1F4F2] font-medium">Pick 2 Points</span>
                  <button
                    onClick={() => {
                      setMeasuring(!measuring);
                      if (!measuring) setMeasurementPoints([]);
                    }}
                    className={`px-3 py-1 rounded-[6px] text-xs font-mono transition-all cursor-pointer ${
                      measuring
                        ? "bg-[#78AFA2] text-[#080B0A] font-bold"
                        : "bg-[#080B0A] hover:bg-[#121916] text-[#F1F4F2] border border-[#26302C]"
                    }`}
                  >
                    {measuring ? "Deactivate" : "Activate Tool"}
                  </button>
                </div>

                <p className="text-[11px] text-[#9BA6A1] font-sans leading-relaxed">
                  Select two surface points on the 3D model to calculate spatial distance in model coordinates.
                </p>

                {measurementCalculation ? (
                  <div className="p-3 rounded-[6px] bg-[#080B0A] border border-[#26302C] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#9BA6A1] font-medium">Model-space measurement:</span>
                      <span className="text-[#78AFA2] font-bold text-sm">
                        {measurementCalculation.euclideanDistance} units
                      </span>
                    </div>

                    <div className="text-[10px] text-[#68736E] space-y-1 pt-1 border-t border-[#26302C]">
                      <div className="flex justify-between">
                        <span>Point A:</span>
                        <span className="text-[#9BA6A1] font-mono">
                          [{measurementCalculation.p1.x}, {measurementCalculation.p1.y}, {measurementCalculation.p1.z}]
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Point B:</span>
                        <span className="text-[#9BA6A1] font-mono">
                          [{measurementCalculation.p2.x}, {measurementCalculation.p2.y}, {measurementCalculation.p2.z}]
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Horizontal Distance:</span>
                        <span className="text-[#9BA6A1]">{measurementCalculation.horizontalDistance} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Relief Gradient (ΔY):</span>
                        <span className="text-[#78AFA2]">{measurementCalculation.deltaHeight} units</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setMeasurementPoints([])}
                      className="w-full mt-2 py-1 text-center text-[10px] text-[#9BA6A1] hover:text-[#F1F4F2] bg-[#121916] rounded-[4px] border border-[#26302C] transition-colors cursor-pointer"
                    >
                      Clear & Pick New Points
                    </button>
                  </div>
                ) : measuring ? (
                  <div className="p-3 rounded-[6px] bg-[#080B0A] border border-[#78AFA2]/30 text-[11px] text-[#78AFA2] font-sans">
                    {measurementPoints.length === 0
                      ? "• Click first target point on the terrain surface."
                      : "• Point 1 pinned. Click second target point to complete measurement."}
                  </div>
                ) : null}

                {/* Scale Calibration Status */}
                <div className="pt-2 border-t border-[#26302C] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#68736E] font-semibold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#B49B69]" />
                    <span>Scale not calibrated</span>
                  </div>
                  <p className="text-[11px] text-[#68736E] font-sans leading-relaxed">
                    Real-world geographic calibration requires georeferencing GCPs or RTK telemetry.
                  </p>
                </div>
              </div>
            </div>

            {/* Solar Relief Shading */}
            <div className="p-4 rounded-xl bg-[#121916] border border-[#26302C] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[#F1F4F2] font-medium flex items-center gap-1.5 text-xs">
                  <Sun className="w-3.5 h-3.5 text-[#78AFA2]" /> Solar Relief Shading
                </span>
                <span className="text-[#78AFA2] font-bold">{sunAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={sunAngle}
                onChange={(e) => setSunAngle(Number(e.target.value))}
                className="w-full h-1 bg-[#080B0A] rounded-[4px] appearance-none cursor-pointer accent-[#78AFA2]"
              />
              <p className="text-[10px] text-[#68736E] font-sans">
                Adjust light azimuth to inspect surface slope and topography.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[#26302C]">
            <button
              onClick={onToggleAnalyze}
              className="w-full py-2.5 rounded-[8px] bg-[#121916] hover:bg-[#121916]/80 text-[#9BA6A1] hover:text-[#F1F4F2] text-xs font-mono text-center transition-colors cursor-pointer border border-[#26302C]"
            >
              Close Analysis Suite
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
