"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Play,
  Layers,
  Sparkles,
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
  Compass,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Video,
  Activity,
  Crosshair,
  TrendingUp,
  MapPin,
  ShieldCheck
} from "lucide-react";
import { SAMPLE_PROJECTS } from "@/lib/mockData";
import { TerrainViewer } from "@/components/viewer/TerrainViewer";

/* =========================================================================
   SECTION 01: START WITH A SINGLE DRONE FLIGHT
   Visualizing the continuous flight corridor & camera telemetry HUD
========================================================================= */
export function Section01Flight() {
  const [telemetryTime, setTelemetryTime] = useState(24.5);

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryTime((prev) => (prev > 180 ? 0 : Number((prev + 0.1).toFixed(1))));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      {/* Narrative Text */}
      <div className="lg:col-span-5 space-y-4">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-amber-400">
          <Camera className="w-3.5 h-3.5" />
          <span>PHASE 01 • CORRIDOR CAPTURE</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-100 leading-tight">
          Start With a Single Drone Flight
        </h2>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Upload a drone video and start the reconstruction workflow.
        </p>
        <p className="text-neutral-500 text-xs leading-relaxed">
          Traditional surveys require crosshatch multi-pass grid patterns with 80% sidelap. TerraRecon is engineered specifically for single-pass linear corridors—flying along roads, pipelines, ridges, or quarries in one continuous sweep.
        </p>

        {/* Live In-flight Telemetry Panel */}
        <div className="p-3.5 rounded-lg bg-neutral-900/80 border border-neutral-800 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-300 border-b border-neutral-800 pb-1.5">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              OPTICAL SHUTTER STREAM
            </span>
            <span className="text-neutral-400">{telemetryTime}s / 184s</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px] text-neutral-400">
            <div>
              ALT: <strong className="text-neutral-200">65.4m AGL</strong>
            </div>
            <div>
              SPD: <strong className="text-neutral-200">5.2 m/s</strong>
            </div>
            <div>
              GSD: <strong className="text-amber-400">1.84 cm/px</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Visual: Flight Corridor Camera View with HUD Overlay */}
      <div className="lg:col-span-7">
        <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl aspect-video select-none">
          <Image
            src="/images/quarry.jpg"
            alt="Drone Single-Pass Corridor Flight"
            fill
            className="object-cover"
            priority
          />

          {/* Camera Telemetry Reticle HUD */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between font-mono text-[11px]">
            {/* Top Bar */}
            <div className="flex items-center justify-between bg-neutral-950/70 backdrop-blur px-3 py-1.5 rounded border border-neutral-800/80 text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-neutral-100 font-semibold">REC 4K UHD</span>
                <span className="text-neutral-500">|</span>
                <span>60 FPS</span>
              </div>
              <div className="text-amber-400">ZENMUSE P1 • 35mm F/5.6</div>
              <div>RTK FIX: 18.7324° N, 73.8567° E</div>
            </div>

            {/* Center Crosshair & Pitch Ladder */}
            <div className="flex-1 flex items-center justify-center relative">
              <div className="w-16 h-16 border border-amber-400/40 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
              </div>
              <div className="absolute w-28 h-px bg-amber-400/40" />
              <div className="absolute h-28 w-px bg-amber-400/40" />
              {/* Pitch Angle Indicator */}
              <div className="absolute top-1/2 -translate-y-1/2 right-8 text-[10px] text-amber-300/80 bg-neutral-950/60 px-1.5 py-0.5 rounded">
                -35.0° NADIR
              </div>
            </div>

            {/* Bottom Stream Status */}
            <div className="flex items-center justify-between bg-neutral-950/70 backdrop-blur px-3 py-1.5 rounded border border-neutral-800/80 text-neutral-400">
              <span>SINGLE-PASS CONTINUOUS EXPOSURE</span>
              <span className="text-emerald-400">MOTION BLUR &lt; 0.2px</span>
              <span>BUFFER: 98.4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   SECTION 02: WE TURN VIDEO INTO VISUAL DATA
   Extracting individual frames with subtle SIFT feature points (corners)
========================================================================= */
export function Section02Frames() {
  const [selectedFrame, setSelectedFrame] = useState(1);

  const frames = [
    { id: 1, frameNo: "#042", time: "00:01.4", features: 3420, label: "Corridor Ingress" },
    { id: 2, frameNo: "#084", time: "00:02.8", features: 3680, label: "Bench Alpha Overlap" },
    { id: 3, frameNo: "#126", time: "00:04.2", features: 3910, label: "Excavation Pit Face" },
    { id: 4, frameNo: "#168", time: "00:05.6", features: 3550, label: "Haul Road Curvature" },
  ];

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      {/* Visual: Frame Extraction & SIFT Corner Features */}
      <div className="lg:col-span-7 order-2 lg:order-1">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-3">
          {/* Main Selected Keyframe with SIFT Feature Crosshairs */}
          <div className="relative rounded-lg overflow-hidden border border-neutral-800 aspect-video bg-neutral-950">
            <Image
              src="/images/quarry.jpg"
              alt="Keyframe Feature Extraction"
              fill
              className="object-cover"
            />

            {/* Subtle, Realistic Feature Points (SIFT keypoints, NOT magic dust) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Discrete corner detections across rock strata */}
              {[
                { x: "24%", y: "38%" },
                { x: "32%", y: "42%" },
                { x: "28%", y: "52%" },
                { x: "45%", y: "35%" },
                { x: "55%", y: "48%" },
                { x: "62%", y: "40%" },
                { x: "68%", y: "56%" },
                { x: "38%", y: "68%" },
                { x: "50%", y: "74%" },
                { x: "72%", y: "70%" },
                { x: "82%", y: "52%" },
                { x: "80%", y: "36%" },
                { x: "18%", y: "65%" },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="3" fill="#10b981" opacity="0.85" />
                  <circle cx={pt.x} cy={pt.y} r="7" stroke="#10b981" strokeWidth="1" fill="none" opacity="0.5" />
                </g>
              ))}
            </svg>

            {/* Frame metadata tag */}
            <div className="absolute top-3 left-3 bg-neutral-950/90 backdrop-blur px-2.5 py-1 rounded border border-neutral-800 font-mono text-[11px] text-neutral-300">
              FRAME {frames[selectedFrame].frameNo} • {frames[selectedFrame].features.toLocaleString()} SIFT TIE-POINTS DETECTED
            </div>
            <div className="absolute bottom-3 right-3 bg-neutral-950/90 backdrop-blur px-2.5 py-1 rounded border border-neutral-800 font-mono text-[10px] text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> LOWE RATIO: 0.74 (STABLE)
            </div>
          </div>

          {/* Extracted Frame Filmstrip */}
          <div className="grid grid-cols-4 gap-2 font-mono text-xs">
            {frames.map((f, idx) => (
              <button
                key={f.id}
                onClick={() => setSelectedFrame(idx)}
                className={`p-2 rounded-lg border text-left transition-all ${
                  selectedFrame === idx
                    ? "bg-amber-500/15 border-amber-500/60 text-amber-300"
                    : "bg-neutral-950/80 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                <div className="font-semibold">{f.frameNo}</div>
                <div className="text-[10px] text-neutral-500">{f.time}</div>
                <div className="text-[10px] text-emerald-400 mt-1">{f.features} pts</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Narrative Text */}
      <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-amber-400">
          <Layers className="w-3.5 h-3.5" />
          <span>PHASE 02 • OPTICAL SAMPLING</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-100 leading-tight">
          We Turn Video Into Visual Data
        </h2>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Transition drone footage into individual high-overlap frames.
        </p>
        <p className="text-neutral-500 text-xs leading-relaxed">
          The continuous 4K stream is dynamically sampled based on flight velocity and angular motion. Each keyframe undergoes Scale-Invariant Feature Transform (SIFT) detection to locate stable geometric corners and high-contrast geological textures.
        </p>

        <div className="p-3.5 rounded-lg bg-neutral-900/60 border border-neutral-800 font-mono text-xs space-y-1.5 text-neutral-400">
          <div className="text-neutral-200 font-semibold">Motion-Compensated Selection:</div>
          <div className="flex justify-between text-[11px]">
            <span>Blur Rejection Filter:</span>
            <span className="text-emerald-400">Laplacian Variance &gt; 120</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Longitudinal Overlap:</span>
            <span className="text-amber-400">82% Frame-to-Frame</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   SECTION 03: UNDERSTAND HOW THE CAMERA MOVED
   Frame-to-frame feature connections, camera poses, sparse point cloud
========================================================================= */
export function Section03Movement() {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      {/* Narrative Text */}
      <div className="lg:col-span-5 space-y-4">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-amber-400">
          <Activity className="w-3.5 h-3.5" />
          <span>PHASE 03 • POSE GRAPH ESTIMATION</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-100 leading-tight">
          Understand How the Camera Moved
        </h2>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Visual features across frames help reconstruct camera movement and scene structure.
        </p>
        <p className="text-neutral-500 text-xs leading-relaxed">
          By tracking the movement of identical visual landmarks across consecutive video frames (epipolar parallax), the solver computes both the 6-DoF position of the drone camera at every fraction of a second and the sparse 3D structure of the terrain below.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="text-[10px] text-neutral-500 uppercase">Camera Poses</div>
            <div className="text-lg font-bold text-neutral-100 mt-0.5">368 Solved</div>
            <div className="text-[10px] text-emerald-400">0.62 px RMSE</div>
          </div>
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="text-[10px] text-neutral-500 uppercase">Epipolar Matches</div>
            <div className="text-lg font-bold text-neutral-100 mt-0.5">1.24 Million</div>
            <div className="text-[10px] text-sky-400">RANSAC Filtered</div>
          </div>
        </div>
      </div>

      {/* Visual: Frame-to-Frame Epipolar Matching & Sparse 3D Poses */}
      <div className="lg:col-span-7">
        <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 p-6 shadow-2xl font-mono select-none">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-800 text-xs text-neutral-400">
            <span className="text-neutral-200 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              Epipolar Correspondence & Bundle Adjustment
            </span>
            <span className="text-[10px]">SOLVER: LEVENBERG-MARQUARDT</span>
          </div>

          {/* Visualizing 2 Overlapping Frames with Tie-Lines */}
          <div className="grid grid-cols-2 gap-4 relative">
            {/* Frame A */}
            <div className="space-y-1.5">
              <div className="relative h-40 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900">
                <Image src="/images/quarry.jpg" alt="Frame t" fill className="object-cover opacity-80" />
                <div className="absolute top-2 left-2 bg-neutral-950/80 px-2 py-0.5 rounded text-[10px] text-neutral-300">
                  Frame #084 (t = 2.8s)
                </div>
              </div>
              <div className="text-[10px] text-neutral-500">Camera Pose 84: [X: 18.2, Y: 65.4, Z: 12.1]</div>
            </div>

            {/* Frame B */}
            <div className="space-y-1.5">
              <div className="relative h-40 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900">
                <Image src="/images/quarry.jpg" alt="Frame t+1" fill className="object-cover opacity-80 scale-105" />
                <div className="absolute top-2 left-2 bg-neutral-950/80 px-2 py-0.5 rounded text-[10px] text-neutral-300">
                  Frame #085 (t = 2.9s)
                </div>
              </div>
              <div className="text-[10px] text-neutral-500">Camera Pose 85: [X: 18.8, Y: 65.5, Z: 12.3]</div>
            </div>

            {/* Simulated Geometric Tie-Lines across frames */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1="28%" y1="35%" x2="68%" y2="38%" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="38%" y1="52%" x2="78%" y2="55%" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="22%" y1="68%" x2="62%" y2="70%" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* Sparse 3D Point Cloud Representation Below */}
          <div className="mt-4 pt-4 border-t border-neutral-800/80">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2">
              <span>Triangulated Sparse 3D Coordinates:</span>
              <span className="text-amber-400">Bundle Reprojection Error: 0.62 px</span>
            </div>
            <div className="h-24 rounded-lg bg-neutral-900/60 border border-neutral-800/80 relative flex items-center justify-center overflow-hidden">
              {/* Flight Camera Frustums Array */}
              <div className="flex items-center gap-6 z-10">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-sky-400 rounded-sm" />
                    <div className="w-6 h-5 border-b border-l border-r border-sky-400/60 -mt-1 transform rotate-180" />
                    <span className="text-[8px] text-neutral-500 mt-1">C{i}</span>
                  </div>
                ))}
              </div>

              {/* Sparse 3D tie points */}
              <div className="absolute inset-0 opacity-40">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-amber-400"
                    style={{
                      left: `${(i * 19) % 95}%`,
                      top: `${50 + ((i * 17) % 40)}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   SECTION 04: FROM POINTS TO A 3D WORLD
   Multi-View Stereo (MVS) dense cloud into triangulated surface mesh & terrain
========================================================================= */
export function Section04Mesh() {
  const [stageMode, setStageMode] = useState<"points" | "mesh" | "terrain">("terrain");

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PHASE 04 • DENSE RECONSTRUCTION & MESING</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-100">
          From Points to a 3D World
        </h2>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Transform the point cloud into a surface/mesh, then reveal a recognizable 3D terrain. This is the core visual payoff of the TerraRecon pipeline.
        </p>
      </div>

      {/* Interactive Transformation Stage Box */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-2xl space-y-6">
        {/* Toggle between the 3 evolutionary stages */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-neutral-800">
          <div className="font-mono text-xs text-neutral-400">
            INSPECT GEOMETRIC TRANSFORMATION:
          </div>
          <div className="flex items-center gap-2 p-1 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-xs">
            <button
              onClick={() => setStageMode("points")}
              className={`px-3 py-1.5 rounded transition-all ${
                stageMode === "points"
                  ? "bg-amber-500 text-neutral-950 font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              1. Dense Cloud (3.4M Pts)
            </button>
            <button
              onClick={() => setStageMode("mesh")}
              className={`px-3 py-1.5 rounded transition-all ${
                stageMode === "mesh"
                  ? "bg-amber-500 text-neutral-950 font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              2. Poisson TIN Mesh (684k)
            </button>
            <button
              onClick={() => setStageMode("terrain")}
              className={`px-3 py-1.5 rounded transition-all ${
                stageMode === "terrain"
                  ? "bg-amber-500 text-neutral-950 font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              3. Texturized 3D Terrain
            </button>
          </div>
        </div>

        {/* Dynamic Visual Stage Presentation */}
        <div className="relative h-[380px] sm:h-[460px] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 select-none">
          {stageMode === "points" && (
            <div className="relative w-full h-full bg-[#0a0b0e] flex items-center justify-center">
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, rgba(245,158,11,0.6) 0%, rgba(56,189,248,0.3) 40%, transparent 80%)`,
                }}
              />
              <Image
                src="/images/quarry.jpg"
                alt="Dense Point Cloud"
                fill
                className="object-cover mix-blend-luminosity filter blur-[1px] opacity-40"
              />
              {/* Point cloud dot simulation */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px)`,
                  backgroundSize: "6px 6px",
                  opacity: 0.5,
                }}
              />
              <div className="absolute bottom-4 left-4 bg-neutral-950/90 backdrop-blur border border-neutral-800 p-3 rounded font-mono text-xs space-y-1">
                <div className="text-amber-400 font-semibold">STAGE 1: DENSE MVS POINT CLOUD</div>
                <div className="text-neutral-400">3,420,000 georeferenced spatial vertices</div>
                <div className="text-neutral-500">Sub-pixel disparity mapping computed via CUDA</div>
              </div>
            </div>
          )}

          {stageMode === "mesh" && (
            <div className="relative w-full h-full bg-[#0a0b0e] flex items-center justify-center">
              <Image
                src="/images/quarry.jpg"
                alt="TIN Surface Mesh"
                fill
                className="object-cover filter contrast-150 brightness-50 opacity-40"
              />
              {/* High-density Wireframe Grid Overlay */}
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage: `linear-gradient(rgba(245, 158, 11, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.5) 1px, transparent 1px)`,
                  backgroundSize: "18px 18px",
                }}
              />
              <div className="absolute bottom-4 left-4 bg-neutral-950/90 backdrop-blur border border-neutral-800 p-3 rounded font-mono text-xs space-y-1">
                <div className="text-amber-400 font-semibold">STAGE 2: SCREENED POISSON TIN SURFACE</div>
                <div className="text-neutral-400">684,000 continuous triangular polygons</div>
                <div className="text-neutral-500">Watertight manifold surface with slope normals</div>
              </div>
            </div>
          )}

          {stageMode === "terrain" && (
            <div className="relative w-full h-full bg-[#0a0b0e]">
              <Image
                src="/images/quarry.jpg"
                alt="Photogrammetric Reconstructed 3D Terrain"
                fill
                className="object-cover"
              />
              {/* Subtle elevation contour rings */}
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 60%, rgba(245,158,11,0.5) 0%, transparent 60%)`,
                }}
              />
              <div className="absolute top-4 right-4 bg-neutral-950/90 backdrop-blur border border-neutral-800 p-3 rounded font-mono text-xs space-y-1">
                <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 3D SURFACE MODEL READY
                </div>
                <div className="text-neutral-300">GSD: 1.84 cm/pixel • 14.8 Hectares</div>
                <div className="text-neutral-500">CRS: EPSG:32643 (UTM Zone 43N)</div>
              </div>
              <div className="absolute bottom-4 left-4 bg-neutral-950/90 backdrop-blur border border-neutral-800 p-3 rounded font-mono text-xs space-y-1">
                <div className="text-neutral-100 font-semibold">STAGE 3: 8K ORTHO-RECTIFIED TEXTURING</div>
                <div className="text-neutral-400">Fully explorable terrain mesh with geological strata fidelity</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   SECTION 05: EXPLORE THE RECONSTRUCTION
   Interactive terrain viewer with orbit, zoom, pan, reset, and working toggles
========================================================================= */
export function Section05Interactive() {
  const featured = SAMPLE_PROJECTS[0];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-amber-400">
            <Compass className="w-3.5 h-3.5" />
            <span>PHASE 05 • INTERACTIVE INSPECTION</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-100">
            Explore the Reconstruction
          </h2>
          <p className="text-neutral-400 text-sm max-w-2xl leading-relaxed">
            Interact with the georeferenced 3D model in real time. Use the controls to switch between Textured Mesh, TIN Wireframe, Dense Point Cloud, and DEM Heatmap.
          </p>
        </div>

        <Link
          href={`/dashboard/projects/${featured.id}`}
          className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-xs font-mono flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0"
        >
          Open In Full Studio <ArrowRight className="w-4 h-4 text-amber-400" />
        </Link>
      </div>

      {/* Interactive 3D Viewer Canvas */}
      <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl">
        <TerrainViewer
          project={featured}
          selectedKeyframeIndex={2}
        />
      </div>
    </div>
  );
}
