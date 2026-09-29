"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Layers,
  Sparkles,
  Compass,
  ArrowRight,
  Eye,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Activity,
  Maximize2,
  Box,
  Share2
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SAMPLE_PROJECTS } from "@/lib/mockData";
import { TerrainViewer } from "@/components/viewer/TerrainViewer";

/* =========================================================================
   SECTION 01 — CAPTURE
   "START WITH A SINGLE DRONE FLIGHT"
   - Keep drone intact
   - Continue flight through environment
   - Move camera toward drone's camera
   - Transition into the footage captured by the drone
========================================================================= */
export function SectionCapture() {
  const [zoomLevel, setZoomLevel] = useState(0); // 0 (drone view) to 1 (camera view)
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 75%",
        end: "bottom 30%",
        scrub: 0.5,
        onUpdate: (self) => {
          setZoomLevel(self.progress);
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full space-y-8">
      {/* Header */}
      <div className="max-w-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-amber-400">
          <span>01 / CAPTURE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-100 leading-tight">
          START WITH A SINGLE DRONE FLIGHT
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          Upload a drone video and turn the captured environment into a 3D reconstruction.
        </p>
      </div>

      {/* Visual Transition: Drone flight transitioning into the optical footage */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl aspect-[16/10] sm:aspect-[21/9] select-none">
        {/* Background 1: Drone in flight corridor */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: 1 - zoomLevel * 0.85 }}
        >
          <Image
            src="/images/quarry.jpg"
            alt="Drone flight over terrain"
            fill
            className="object-cover scale-105 filter brightness-90"
            priority
          />
          {/* Complete 3D drone silhouette / graphical representation flying in corridor */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300"
            style={{
              transform: `translate(-50%, -50%) scale(${1 + zoomLevel * 2.2})`,
            }}
          >
            {/* Visual Drone Body Indicator */}
            <div className="w-32 h-16 sm:w-48 sm:h-24 border border-amber-400/60 rounded-xl bg-neutral-950/70 backdrop-blur-sm p-3 flex flex-col justify-between shadow-2xl">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-300">
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  UAV IN FLIGHT
                </span>
                <span>ALT 65m</span>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-amber-400 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                </div>
              </div>
              <div className="text-[9px] font-mono text-neutral-400 text-center truncate">
                35mm GIMBAL STABILIZED
              </div>
            </div>
          </div>
        </div>

        {/* Background 2: Lens Optical Footage with HUD Overlays */}
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: zoomLevel }}
        >
          <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between font-mono text-xs">
            {/* Camera Frame Corners */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-400" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-400" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-400" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-400" />

            {/* Top Telemetry */}
            <div className="flex items-center justify-between bg-neutral-950/80 backdrop-blur px-3 py-1.5 rounded border border-neutral-800 text-[11px] text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-semibold text-neutral-100">CAPTURING CONTINUOUS CORRIDOR</span>
              </div>
              <span className="text-amber-400">4K 60FPS • SINGLE PASS</span>
              <span>18.7324° N, 73.8567° E</span>
            </div>

            {/* Center Aim Crosshair */}
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-amber-400/50 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
            </div>

            {/* Bottom Status */}
            <div className="flex items-center justify-between bg-neutral-950/80 backdrop-blur px-3 py-1.5 rounded border border-neutral-800 text-[10px] text-neutral-400">
              <span>OPTICAL FLOW INGESTION ACTIVE</span>
              <span className="text-emerald-400">NO CROSSHATCH GRIDS NEEDED</span>
              <span>SHUTTER: 1/1000s</span>
            </div>
          </div>
        </div>

        {/* Interactive Slider scrub indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-neutral-950/90 border border-neutral-800 rounded-full px-3 py-1 flex items-center gap-2 font-mono text-[10px] text-neutral-400">
          <span>DRONE VIEW</span>
          <div className="w-16 h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${zoomLevel * 100}%` }}
            />
          </div>
          <span className="text-amber-400">CAMERA FOOTAGE</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   SECTION 02 — ANALYZE
   "WE TURN VIDEO INTO VISUAL DATA"
   - Show the drone footage
   - Slow the footage down
   - Visually separate it into individual frames
   - Show subtle feature points on frames
   - Connect matching features between frames
========================================================================= */
export function SectionAnalyze() {
  const [spread, setSpread] = useState(false);
  const [showMatches, setShowMatches] = useState(true);

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-amber-400">
            <span>02 / ANALYZE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-100 leading-tight">
            WE TURN VIDEO INTO VISUAL DATA
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            The system extracts useful frames and identifies visual features across the flight.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setSpread(!spread)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              spread
                ? "bg-amber-500 text-neutral-950 border-amber-500 font-semibold"
                : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
            }`}
          >
            {spread ? "Stack Video Stream" : "Separate Into Frames"}
          </button>
          <button
            onClick={() => setShowMatches(!showMatches)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              showMatches
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-semibold"
                : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {showMatches ? "Features: Visible" : "Features: Hidden"}
          </button>
        </div>
      </div>

      {/* Frame Separation & Visual Feature Points Canvas */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-2xl relative select-none">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pb-4 mb-4 border-b border-neutral-800">
          <span>HIGH-OVERLAP KEYFRAME DECOMPOSITION</span>
          <span className="text-amber-400 font-semibold">OVERLAP: ~82%</span>
        </div>

        {/* Separated Frames Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative min-h-[300px]">
          {[
            { id: 1, tag: "FRAME #084", time: "00:02.8", altitude: "65.4m" },
            { id: 2, tag: "FRAME #085", time: "00:03.1", altitude: "65.6m" },
            { id: 3, tag: "FRAME #086", time: "00:03.4", altitude: "65.8m" },
          ].map((f, i) => (
            <div
              key={f.id}
              className={`relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-xl transition-all duration-500 ${
                spread ? "translate-y-0 opacity-100" : i > 0 ? "md:-ml-16 md:opacity-85" : ""
              }`}
            >
              {/* Frame Image */}
              <div className="relative h-56 w-full">
                <Image
                  src="/images/quarry.jpg"
                  alt={`Frame ${f.tag}`}
                  fill
                  className="object-cover"
                />

                {/* Feature Crosshair Points */}
                {showMatches && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {[
                      { x: "28%", y: "42%" },
                      { x: "48%", y: "36%" },
                      { x: "64%", y: "52%" },
                      { x: "36%", y: "68%" },
                      { x: "72%", y: "65%" },
                    ].map((pt, pIdx) => (
                      <g key={pIdx}>
                        <circle cx={pt.x} cy={pt.y} r="3" fill="#10b981" />
                        <circle cx={pt.x} cy={pt.y} r="7" stroke="#10b981" strokeWidth="1" fill="none" opacity="0.6" />
                      </g>
                    ))}
                  </svg>
                )}

                {/* Badge */}
                <div className="absolute top-2 left-2 bg-neutral-950/85 px-2 py-0.5 rounded font-mono text-[10px] text-neutral-300">
                  {f.tag} ({f.time})
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3 bg-neutral-950 flex items-center justify-between font-mono text-[11px] text-neutral-400 border-t border-neutral-800">
                <span>ALT: {f.altitude}</span>
                <span className="text-emerald-400">3,420 features</span>
              </div>
            </div>
          ))}

          {/* Feature connection tie-lines between frames */}
          {showMatches && (
            <svg className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-20">
              <line x1="28%" y1="42%" x2="52%" y2="40%" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="62%" y1="40%" x2="84%" y2="38%" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="30%" y1="62%" x2="56%" y2="60%" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="64%" y1="60%" x2="88%" y2="58%" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>Identical visual features are matched across frames to establish spatial parallax.</span>
          <span className="text-neutral-500">SIFT Geometric Verification</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   SECTION 03 — RECONSTRUCT
   "UNDERSTAND HOW THE CAMERA MOVED"
   - Arrange frames in 3D space
   - Show camera positions
   - Show subtle camera paths
   - Gradually form a sparse point cloud
========================================================================= */
export function SectionReconstruct() {
  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="max-w-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-amber-400">
          <span>03 / RECONSTRUCT</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-100 leading-tight">
          UNDERSTAND HOW THE CAMERA MOVED
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          Visual features across frames help estimate camera positions and reconstruct the scene in three dimensions.
        </p>
      </div>

      {/* 3D Perspective Diagram: Camera Frustums & Trajectory Spline */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-2xl relative select-none font-mono">
        <div className="flex items-center justify-between text-xs text-neutral-400 pb-4 mb-4 border-b border-neutral-800">
          <span className="flex items-center gap-2 text-neutral-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            6-DoF CAMERA POSE ESTIMATION & FLIGHT TRAJECTORY
          </span>
          <span className="text-emerald-400">BUNDLE ADJUSTMENT: SOLVED</span>
        </div>

        {/* 3D Camera Frustums Array & Formed Point Cloud */}
        <div className="relative h-72 rounded-xl bg-neutral-950 border border-neutral-800/80 overflow-hidden flex flex-col justify-between p-6">
          {/* Subtle Grid Ground Plane */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />

          {/* Top Flight Path Spline & Camera Positions */}
          <div className="relative z-10">
            {/* Continuous Flight Path Arc */}
            <svg className="w-full h-20 overflow-visible">
              <path
                d="M 40 40 Q 250 15 500 35 T 900 30"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
            </svg>

            {/* Camera Poses along flight path */}
            <div className="flex items-center justify-between -mt-16 px-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-3.5 h-3.5 rounded bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                  {/* Camera Frustum Pyramid (pointing down toward ground) */}
                  <div className="w-8 h-8 border-b-2 border-l border-r border-sky-400/50 transform rotate-180 -mt-1" />
                  <span className="text-[9px] text-neutral-400 mt-1">Pose #{idx}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sparse 3D Point Cloud Forming Below */}
          <div className="relative z-10 pt-8">
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">
              Triangulated 3D Tie Points (Ground Target Elevation)
            </div>
            <div className="h-20 w-full relative">
              {Array.from({ length: 65 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]"
                  style={{
                    left: `${(i * 14.5) % 94}%`,
                    top: `${20 + ((i * 23) % 65)}%`,
                    opacity: 0.65 + ((i % 5) * 0.08),
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-400">
          <div>
            Camera Path: <strong className="text-neutral-200">Single Linear Arc</strong>
          </div>
          <div>
            Intrinsic Calibration: <strong className="text-neutral-200">Self-Solved</strong>
          </div>
          <div>
            Reprojection Error: <strong className="text-emerald-400">0.62 px RMSE</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   SECTION 04 — GENERATE
   "FROM POINTS TO A 3D WORLD"
   - Sparse point cloud becomes denser
   - Point cloud becomes a surface
   - Surface becomes a mesh
   - Mesh becomes a recognizable terrain
   - Main visual payoff!
========================================================================= */
export function SectionGenerate() {
  const [sliderStep, setSliderStep] = useState(3); // 0: Sparse, 1: Dense, 2: Mesh, 3: Terrain

  const stepLabels = [
    { id: 0, label: "1. Sparse Cloud", desc: "Triangulated tie points", count: "12,000 pts" },
    { id: 1, label: "2. Dense Cloud", desc: "Multi-View Stereo depth", count: "3.4M pts" },
    { id: 2, label: "3. Triangular Mesh", desc: "Screened Poisson TIN", count: "684k polys" },
    { id: 3, label: "4. 3D Terrain", desc: "Fully texturized model", count: "1.84 cm GSD" },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="max-w-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-amber-400">
          <span>04 / GENERATE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-100 leading-tight">
          FROM POINTS TO A 3D WORLD
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          Dense reconstruction transforms the captured scene into an explorable 3D surface.
        </p>
      </div>

      {/* Main Transformation Payoff Container */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-2xl space-y-6 select-none font-mono">
        {/* Step Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stepLabels.map((s) => (
            <button
              key={s.id}
              onClick={() => setSliderStep(s.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                sliderStep === s.id
                  ? "bg-amber-500/15 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10"
                  : "bg-neutral-950/80 border-neutral-800 text-neutral-400 hover:border-neutral-700"
              }`}
            >
              <div className="font-semibold text-xs">{s.label}</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">{s.desc}</div>
              <div className="text-[10px] text-emerald-400 mt-1">{s.count}</div>
            </button>
          ))}
        </div>

        {/* Dynamic Display Area */}
        <div className="relative h-[380px] sm:h-[480px] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
          {/* Step 0: Sparse Cloud */}
          {sliderStep === 0 && (
            <div className="relative w-full h-full bg-[#0a0b0e] flex items-center justify-center">
              <div className="absolute inset-0 opacity-40">
                {Array.from({ length: 90 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-amber-400"
                    style={{
                      left: `${(i * 17) % 92}%`,
                      top: `${15 + ((i * 19) % 70)}%`,
                    }}
                  />
                ))}
              </div>
              <div className="absolute bottom-4 left-4 bg-neutral-950/90 backdrop-blur border border-neutral-800 p-3 rounded text-xs space-y-1">
                <div className="text-amber-400 font-semibold">STAGE 1: SPARSE GEOMETRIC TIE POINTS</div>
                <div className="text-neutral-400">12,400 initial 3D positions calculated from camera parallax</div>
              </div>
            </div>
          )}

          {/* Step 1: Dense Cloud */}
          {sliderStep === 1 && (
            <div className="relative w-full h-full bg-[#0a0b0e]">
              <Image
                src="/images/quarry.jpg"
                alt="Dense Point Cloud"
                fill
                className="object-cover mix-blend-luminosity filter blur-[1px] opacity-40"
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px)`,
                  backgroundSize: "6px 6px",
                  opacity: 0.6,
                }}
              />
              <div className="absolute bottom-4 left-4 bg-neutral-950/90 backdrop-blur border border-neutral-800 p-3 rounded text-xs space-y-1">
                <div className="text-amber-400 font-semibold">STAGE 2: DENSE MULTI-VIEW STEREO (MVS)</div>
                <div className="text-neutral-400">3,420,000 dense elevation points computed via sub-pixel disparity</div>
              </div>
            </div>
          )}

          {/* Step 2: Mesh */}
          {sliderStep === 2 && (
            <div className="relative w-full h-full bg-[#0a0b0e]">
              <Image
                src="/images/quarry.jpg"
                alt="TIN Surface Mesh"
                fill
                className="object-cover filter contrast-150 brightness-40 opacity-30"
              />
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage: `linear-gradient(rgba(245, 158, 11, 0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.45) 1px, transparent 1px)`,
                  backgroundSize: "16px 16px",
                }}
              />
              <div className="absolute bottom-4 left-4 bg-neutral-950/90 backdrop-blur border border-neutral-800 p-3 rounded text-xs space-y-1">
                <div className="text-amber-400 font-semibold">STAGE 3: SCREENED POISSON TIN SURFACE</div>
                <div className="text-neutral-400">684,000 interconnected triangular facets creating a watertight continuous surface</div>
              </div>
            </div>
          )}

          {/* Step 3: 3D Terrain (Photogrammetric Textured Model) */}
          {sliderStep === 3 && (
            <div className="relative w-full h-full bg-[#0a0b0e]">
              <Image
                src="/images/quarry.jpg"
                alt="3D Reconstructed Terrain"
                fill
                className="object-cover"
                priority
              />
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 60%, rgba(245,158,11,0.6) 0%, transparent 60%)`,
                }}
              />
              <div className="absolute top-4 right-4 bg-neutral-950/90 backdrop-blur border border-neutral-800 p-3 rounded text-xs space-y-1">
                <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 3D TERRAIN READY
                </div>
                <div className="text-neutral-300">1.84 cm/pixel GSD • 14.8 Hectares</div>
              </div>
              <div className="absolute bottom-4 left-4 bg-neutral-950/90 backdrop-blur border border-neutral-800 p-3 rounded text-xs space-y-1">
                <div className="text-neutral-100 font-semibold">STAGE 4: FULLY TEXTURIZED PHOTOGRAMMETRIC TERRAIN</div>
                <div className="text-neutral-400">Watertight 3D environment ready for inspection and export</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   SECTION 05 — EXPLORE
   "EXPLORE THE RECONSTRUCTION"
   - Interactive Three.js / React Three Fiber terrain
   - Controls: Orbit, Zoom, Pan, Reset
   - Controls: Terrain, Point Cloud, Wireframe
   - Only working controls shown!
========================================================================= */
export function SectionExplore() {
  const featured = SAMPLE_PROJECTS[0];

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-amber-400">
            <span>05 / EXPLORE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-100 leading-tight">
            EXPLORE THE RECONSTRUCTION
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Inspect the generated 3D environment from every angle.
          </p>
        </div>

        <Link
          href={`/dashboard/projects/${featured.id}`}
          className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-xs font-mono flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0"
        >
          Open In Full Studio <ArrowRight className="w-4 h-4 text-amber-400" />
        </Link>
      </div>

      {/* Interactive 3D Terrain Viewer with Orbit, Zoom, Pan, Reset, Terrain, Point Cloud, Wireframe */}
      <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl">
        <TerrainViewer
          project={featured}
          selectedKeyframeIndex={2}
        />
      </div>
    </div>
  );
}
