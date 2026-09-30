"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  RotateCcw,
  Move3d,
  MousePointerClick,
  ExternalLink,
  Film,
  Menu,
  X,
  Sparkles,
  Boxes
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DroneScene } from "./DroneScene";
import { TerraReconLogo } from "../layout/TerraReconLogo";

export function LandingScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [terrainMode, setTerrainMode] = useState<"textured" | "pointcloud" | "wireframe">("textured");
  const [isInteractive, setIsInteractive] = useState(false);
  const [resetCameraTrigger, setResetCameraTrigger] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
          // Auto-disable interactive orbit controls if scrolled away from explore section
          if (self.progress < 0.85 || self.progress > 0.96) {
            setIsInteractive(false);
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Programmatic scroll to section
  const scrollToStage = (progress: number) => {
    if (!containerRef.current) return;
    const totalHeight = containerRef.current.scrollHeight - window.innerHeight;
    const targetY = containerRef.current.offsetTop + totalHeight * progress;
    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  };

  // Section Opacity Calculations
  // Section 01 — THE DRONE (0.00 - 0.15)
  const opSec1 =
    scrollProgress < 0.12
      ? 1
      : Math.max(0, 1 - (scrollProgress - 0.12) / 0.03);

  // Section 02 — CAPTURE (0.15 - 0.30)
  const opSec2 =
    scrollProgress < 0.15 || scrollProgress > 0.30
      ? 0
      : scrollProgress < 0.18
      ? (scrollProgress - 0.15) / 0.03
      : scrollProgress > 0.27
      ? 1 - (scrollProgress - 0.27) / 0.03
      : 1;

  // Section 03 — VIDEO (0.30 - 0.45)
  const opSec3 =
    scrollProgress < 0.30 || scrollProgress > 0.45
      ? 0
      : scrollProgress < 0.33
      ? (scrollProgress - 0.30) / 0.03
      : scrollProgress > 0.42
      ? 1 - (scrollProgress - 0.42) / 0.03
      : 1;

  // Section 04 — ANALYSIS (0.45 - 0.60)
  const opSec4 =
    scrollProgress < 0.45 || scrollProgress > 0.60
      ? 0
      : scrollProgress < 0.48
      ? (scrollProgress - 0.45) / 0.03
      : scrollProgress > 0.57
      ? 1 - (scrollProgress - 0.57) / 0.03
      : 1;

  // Section 05 — CAMERA MOVEMENT (0.60 - 0.72)
  const opSec5 =
    scrollProgress < 0.60 || scrollProgress > 0.72
      ? 0
      : scrollProgress < 0.63
      ? (scrollProgress - 0.60) / 0.03
      : scrollProgress > 0.69
      ? 1 - (scrollProgress - 0.69) / 0.03
      : 1;

  // Section 06 — 3D RECONSTRUCTION (0.72 - 0.88)
  const opSec6 =
    scrollProgress < 0.72 || scrollProgress > 0.88
      ? 0
      : scrollProgress < 0.75
      ? (scrollProgress - 0.72) / 0.03
      : scrollProgress > 0.85
      ? 1 - (scrollProgress - 0.85) / 0.03
      : 1;

  // Section 07 — TERRAIN / EXPLORE (0.88 - 0.95)
  const opSec7 =
    scrollProgress < 0.88 || scrollProgress > 0.955
      ? 0
      : scrollProgress < 0.90
      ? (scrollProgress - 0.88) / 0.02
      : scrollProgress > 0.945
      ? 1 - (scrollProgress - 0.945) / 0.01
      : 1;

  // Section 08 — FINAL CTA (0.95 - 1.00)
  const opSec8 =
    scrollProgress < 0.95
      ? 0
      : Math.min(1, (scrollProgress - 0.95) / 0.03);

  // Active step index (1-6)
  const activeStep =
    scrollProgress < 0.15
      ? 0
      : scrollProgress < 0.30
      ? 1
      : scrollProgress < 0.45
      ? 2
      : scrollProgress < 0.60
      ? 3
      : scrollProgress < 0.72
      ? 4
      : scrollProgress < 0.88
      ? 5
      : scrollProgress < 0.95
      ? 6
      : 7;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#080B0A] text-[#F1F4F2] select-none"
      style={{ height: "760vh" }}
    >
      {/* =====================================================================
          PINNED FULL-VIEWPORT WRAPPER
      ===================================================================== */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Background 3D Drone & Story Scene */}
        <DroneScene
          scrollProgress={scrollProgress}
          terrainMode={terrainMode}
          isInteractive={isInteractive}
          resetCameraTrigger={resetCameraTrigger}
        />

        {/* Subtle Vignette & Depth Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(8,11,10,0.75)_92%)] z-10" />

        {/* Animated Drifting Background Orbs — teal palette ambient motion */}
        <div className="absolute inset-0 pointer-events-none z-[8] overflow-hidden">
          <div className="landing-orb landing-orb--1" />
          <div className="landing-orb landing-orb--2" />
          <div className="landing-orb landing-orb--3" />
          <div className="landing-orb landing-orb--4" />
          <div className="landing-orb landing-orb--5" />
        </div>

        {/* Subtle radial illumination behind the drone area (hero only) */}
        <div
          className="absolute inset-0 pointer-events-none z-[9] transition-opacity duration-500"
          style={{
            opacity: opSec1 * 0.45,
            background: "radial-gradient(ellipse 55% 60% at 58% 48%, rgba(120,175,162,0.06) 0%, transparent 70%)",
          }}
        />

        {/* ===================================================================
            TOP NAVIGATION: Minimal, dark/transparent, floating above 3D scene
            TerraRecon | Work • Technology • About | Get Started
        =================================================================== */}
        <header
          className="relative z-30 w-full px-4 sm:px-10 lg:px-14 py-4 sm:py-5 flex items-center justify-between font-sans"
          style={{
            background: "linear-gradient(180deg, rgba(8,11,10,0.65) 0%, transparent 100%)",
          }}
        >
          {/* Left: Brand */}
          <button
            onClick={() => scrollToStage(0)}
            className="flex items-center gap-2.5 sm:gap-3 text-[#F1F4F2] group transition-opacity hover:opacity-85 text-left cursor-pointer"
          >
            <TerraReconLogo size={22} subtext="CORRIDOR RECONSTRUCTION" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-sans text-[11px] tracking-[0.12em] uppercase text-[#9BA6A1]">
            <button
              onClick={() => scrollToStage(0.35)}
              className="hover:text-[#F1F4F2] transition-colors duration-200 cursor-pointer"
            >
              Work
            </button>
            <button
              onClick={() => scrollToStage(0.78)}
              className="hover:text-[#F1F4F2] transition-colors duration-200 cursor-pointer"
            >
              Technology
            </button>
            <button
              onClick={() => scrollToStage(0.91)}
              className="hover:text-[#F1F4F2] transition-colors duration-200 cursor-pointer"
            >
              3D Explore
            </button>
          </nav>

          {/* Right: Actions & Mobile Hamburger Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="h-8 sm:h-9 px-3.5 sm:px-5 rounded-[8px] bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-sans text-[11px] font-semibold tracking-[0.08em] flex items-center justify-center transition-all duration-200 active:scale-[0.97]"
            >
              Get Started
            </Link>

            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-1.5 rounded-[8px] border border-[#26302C] bg-[#0D1210]/80 text-[#9BA6A1] hover:text-[#F1F4F2] hover:bg-[#121916] transition-colors cursor-pointer"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileNavOpen && (
          <div className="md:hidden fixed inset-0 top-[56px] z-50 bg-[#080B0A]/95 backdrop-blur-xl border-t border-[#26302C] p-5 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200">
            <div className="space-y-4">
              <div className="font-mono text-[10px] tracking-wider uppercase text-[#68736E] pb-2 border-b border-[#26302C]">
                STORY PROGRESSION
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { step: "01", label: "Capture Pass", progress: 0.22 },
                  { step: "02", label: "Video Frames", progress: 0.38 },
                  { step: "03", label: "Keypoint Analyze", progress: 0.52 },
                  { step: "04", label: "Camera Path", progress: 0.66 },
                  { step: "05", label: "Point Cloud", progress: 0.80 },
                  { step: "06", label: "Interactive 3D", progress: 0.91 },
                ].map((item) => (
                  <button
                    key={item.step}
                    onClick={() => {
                      scrollToStage(item.progress);
                      setMobileNavOpen(false);
                    }}
                    className="p-2.5 rounded-[8px] bg-[#121916] border border-[#26302C] text-left hover:border-[#78AFA2]/50 transition-colors cursor-pointer"
                  >
                    <div className="font-mono text-[10px] text-[#78AFA2]">{item.step}</div>
                    <div className="text-xs text-[#F1F4F2] font-medium truncate">{item.label}</div>
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-[#26302C] space-y-2">
                <Link
                  href="/dashboard/demo"
                  onClick={() => setMobileNavOpen(false)}
                  className="w-full flex items-center justify-between p-3 rounded-[8px] bg-[#78AFA2]/12 border border-[#78AFA2]/30 text-[#78AFA2] text-xs font-mono font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Open 3D Demo Workspace
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/dashboard"
                  onClick={() => setMobileNavOpen(false)}
                  className="w-full flex items-center justify-between p-3 rounded-[8px] bg-[#121916] border border-[#26302C] text-[#F1F4F2] text-xs font-mono"
                >
                  <span className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-[#78AFA2]" />
                    Dashboard Overview
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#68736E]" />
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-[#26302C] flex items-center justify-between text-xs font-mono">
              <span className="text-[#68736E]">TerraRecon Engine</span>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="text-[#78AFA2] hover:underline"
              >
                Close Menu
              </button>
            </div>
          </div>
        )}

        {/* Mobile Story Stage Pill (Floating when scrolling) */}
        {scrollProgress > 0.14 && scrollProgress < 0.95 && (
          <div className="lg:hidden fixed top-[64px] right-4 z-30 flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0D1210]/90 backdrop-blur-md border border-[#26302C] font-mono text-[10px] text-[#9BA6A1] shadow-lg pointer-events-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#78AFA2] animate-pulse" />
            <span className="text-[#F1F4F2] font-semibold">STAGE 0{Math.min(6, Math.max(1, activeStep))}</span>
            <span className="text-[#68736E]">/ 06</span>
          </div>
        )}

        {/* ===================================================================
            SIDE PROGRESS INDICATOR (Minimal Technical Style)
        =================================================================== */}
        <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3 font-mono text-[10px] tracking-wider text-[#68736E] pointer-events-auto">
          {[
            { step: 1, label: "CAPTURE", progress: 0.22 },
            { step: 2, label: "VIDEO", progress: 0.38 },
            { step: 3, label: "ANALYZE", progress: 0.52 },
            { step: 4, label: "RECONSTRUCT", progress: 0.66 },
            { step: 5, label: "GENERATE", progress: 0.80 },
            { step: 6, label: "EXPLORE", progress: 0.91 },
          ].map((item) => {
            const isActive = activeStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => scrollToStage(item.progress)}
                className={`group flex items-center gap-2.5 transition-colors cursor-pointer ${
                  isActive ? "text-[#78AFA2] font-semibold" : "hover:text-[#9BA6A1]"
                }`}
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#9BA6A1]">
                  {item.label}
                </span>
                <span className="w-4 text-right">0{item.step}</span>
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-[#78AFA2] ring-4 ring-[#78AFA2]/20 scale-125"
                      : "bg-[#26302C] group-hover:bg-[#4F7F74]"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* ===================================================================
            STORY TEXT OVERLAYS (Synchronized with 3D Centerpiece)
        =================================================================== */}
        <div className="relative z-20 flex-1 flex items-center justify-center px-4 sm:px-12 lg:px-20 pointer-events-none">
          {/* SECTION 01 — THE DRONE (Hero) — Large editorial composition */}
          <div
            className="absolute inset-0 flex flex-col justify-between transition-opacity duration-300"
            style={{
              opacity: opSec1,
              pointerEvents: opSec1 > 0.5 ? "auto" : "none",
            }}
          >
            {/* Hero Typography — left/center aligned, overlapping with drone */}
            <div className="relative z-[15] flex flex-col justify-center flex-1 px-4 sm:px-12 lg:px-20 pt-0">
              <div className="max-w-[720px]">
                <h1
                  className="font-[var(--font-space-grotesk)] font-medium tracking-[-0.03em] leading-[0.94] text-[#F1F4F2] break-words hyphens-auto"
                  style={{
                    fontSize: "clamp(1.85rem, 6.8vw, 7.5rem)",
                  }}
                >
                  <span
                    className="block"
                    style={{ color: "rgba(241,244,242,0.58)" }}
                  >
                    SINGLE-PASS
                  </span>
                  <span
                    className="block font-semibold"
                    style={{ color: "rgba(241,244,242,0.72)" }}
                  >
                    DRONE
                  </span>
                  <span
                    className="block"
                    style={{ color: "rgba(241,244,242,0.62)" }}
                  >
                    RECONSTRUCTION
                  </span>
                </h1>
                <p
                  className="mt-4 sm:mt-6 font-sans text-xs sm:text-base max-w-md leading-relaxed"
                  style={{ color: "rgba(155,166,161,0.85)" }}
                >
                  Turn one drone video into an interactive 3D reconstruction.
                </p>
              </div>
            </div>

            {/* Bottom scroll hint */}
            <div className="relative z-[15] pb-5 sm:pb-6 px-4 sm:px-12 lg:px-20 flex flex-col items-start gap-1.5 sm:gap-2 text-[#68736E] font-mono text-[10px] tracking-widest uppercase">
              <span>SCROLL TO EXPLORE</span>
              <div className="w-[1px] h-5 sm:h-6 bg-gradient-to-b from-[#78AFA2] to-transparent animate-pulse" />
            </div>
          </div>

          {/* SECTION 02 — CAPTURE */}
          <div
            className="absolute left-4 right-4 sm:right-auto sm:left-12 lg:left-24 max-w-md space-y-3 sm:space-y-4 transition-opacity duration-300 text-left"
            style={{
              opacity: opSec2,
              pointerEvents: opSec2 > 0.5 ? "auto" : "none",
            }}
          >
            <div className="inline-flex items-center gap-2 font-mono text-xs text-[#78AFA2] tracking-wider">
              <span>01</span>
              <span>/</span>
              <span>CAPTURE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-sans font-light tracking-tight text-[#F1F4F2] leading-tight">
              START WITH A SINGLE <br />
              <strong className="font-semibold text-[#F1F4F2]">DRONE FLIGHT</strong>
            </h2>
            <p className="text-[#9BA6A1] font-sans text-xs sm:text-base leading-relaxed">
              TerraRecon begins with ordinary drone video. No specialized scanning rig is required for the prototype experience.
            </p>
            <div className="pt-1 sm:pt-2 flex items-center gap-2.5 font-mono text-[10px] sm:text-[11px] text-[#9BA6A1]">
              <span className="text-[#F1F4F2]">DRONE</span>
              <span className="text-[#78AFA2]">→</span>
              <span className="text-[#F1F4F2]">CAMERA</span>
              <span className="text-[#78AFA2]">→</span>
              <span className="text-[#F1F4F2]">VIDEO</span>
            </div>
          </div>

          {/* SECTION 03 — VIDEO */}
          <div
            className="absolute left-4 right-4 sm:left-auto sm:right-12 lg:right-24 max-w-md space-y-3 sm:space-y-4 transition-opacity duration-300 text-left sm:text-right"
            style={{
              opacity: opSec3,
              pointerEvents: opSec3 > 0.5 ? "auto" : "none",
            }}
          >
            <div className="inline-flex items-center gap-2 font-mono text-xs text-[#78AFA2] tracking-wider sm:justify-end">
              <span>02</span>
              <span>/</span>
              <span>VIDEO</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-sans font-light tracking-tight text-[#F1F4F2] leading-tight">
              ONE FLIGHT. <br />
              <strong className="font-semibold text-[#F1F4F2]">ONE VIDEO.</strong>
            </h2>
            <p className="text-[#9BA6A1] font-sans text-xs sm:text-base leading-relaxed">
              The flight video becomes the input for reconstruction. The frame sequence is extracted adaptively across the continuous trajectory.
            </p>
            <div className="pt-1 sm:pt-2 flex flex-col items-start sm:items-end gap-2">
              <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] text-[#9BA6A1]">
                <span className="text-[#F1F4F2]">DRONE</span>
                <span className="text-[#78AFA2]">↓</span>
                <span className="text-[#78AFA2] font-semibold">VIDEO FRAME</span>
              </div>
              <a
                href="https://youtu.be/lQoKTgduJsU"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#0D1210] hover:bg-[#121916] border border-[#26302C] text-[#78AFA2] hover:text-[#8CC2B4] font-mono text-[10px] sm:text-[11px] transition-colors"
                title="View reference drone survey pass"
              >
                <span>Reference Flight (YouTube)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* SECTION 04 — ANALYSIS */}
          <div
            className="absolute left-4 right-4 sm:right-auto sm:left-12 lg:left-24 max-w-md space-y-3 sm:space-y-4 transition-opacity duration-300 text-left"
            style={{
              opacity: opSec4,
              pointerEvents: opSec4 > 0.5 ? "auto" : "none",
            }}
          >
            <div className="inline-flex items-center gap-2 font-mono text-xs text-[#78AFA2] tracking-wider">
              <span>03</span>
              <span>/</span>
              <span>ANALYZE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-sans font-light tracking-tight text-[#F1F4F2] leading-tight">
              WE TURN VIDEO <br />
              <strong className="font-semibold text-[#F1F4F2]">INTO VISUAL DATA</strong>
            </h2>
            <p className="text-[#9BA6A1] font-sans text-xs sm:text-base leading-relaxed">
              Frames are analyzed for visual features that can be tracked across the flight. Salient keypoints and epipolar constraints build robust correspondences.
            </p>
            <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-1.5 sm:gap-2 font-mono text-[9px] sm:text-[10px]">
              <span className="px-2 py-0.5 sm:py-1 rounded-[6px] bg-[#0D1210] border border-[#26302C] text-[#78AFA2]">
                • Feature Points
              </span>
              <span className="px-2 py-0.5 sm:py-1 rounded-[6px] bg-[#0D1210] border border-[#26302C] text-[#8CC2B4]">
                • Matching Points
              </span>
              <span className="px-2 py-0.5 sm:py-1 rounded-[6px] bg-[#0D1210] border border-[#26302C] text-[#9BA6A1]">
                • Correspondences
              </span>
            </div>
          </div>

          {/* SECTION 05 — CAMERA MOVEMENT */}
          <div
            className="absolute left-4 right-4 sm:left-auto sm:right-12 lg:right-24 max-w-md space-y-3 sm:space-y-4 transition-opacity duration-300 text-left sm:text-right"
            style={{
              opacity: opSec5,
              pointerEvents: opSec5 > 0.5 ? "auto" : "none",
            }}
          >
            <div className="inline-flex items-center gap-2 font-mono text-xs text-[#78AFA2] tracking-wider sm:justify-end">
              <span>04</span>
              <span>/</span>
              <span>RECONSTRUCT</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-sans font-light tracking-tight text-[#F1F4F2] leading-tight">
              UNDERSTAND <br />
              <strong className="font-semibold text-[#F1F4F2]">HOW CAMERA MOVED</strong>
            </h2>
            <p className="text-[#9BA6A1] font-sans text-xs sm:text-base leading-relaxed">
              Feature relationships help estimate the camera&apos;s movement through the scene, resolving precise 3D camera poses without relying solely on satellite drift.
            </p>
            <div className="pt-1 sm:pt-2 flex items-center sm:justify-end gap-2 font-mono text-[10px] sm:text-[11px] text-[#9BA6A1]">
              <span className="text-[#F1F4F2]">FRAME</span>
              <span className="text-[#78AFA2]">↓</span>
              <span className="text-[#F1F4F2]">FEATURES</span>
              <span className="text-[#78AFA2]">↓</span>
              <span className="text-[#78AFA2] font-semibold">CAMERA PATH</span>
            </div>
          </div>

          {/* SECTION 06 — 3D RECONSTRUCTION */}
          <div
            className="absolute left-4 right-4 sm:right-auto sm:left-12 lg:left-24 max-w-md space-y-3 sm:space-y-4 transition-opacity duration-300 text-left"
            style={{
              opacity: opSec6,
              pointerEvents: opSec6 > 0.5 ? "auto" : "none",
            }}
          >
            <div className="inline-flex items-center gap-2 font-mono text-xs text-[#78AFA2] tracking-wider">
              <span>05</span>
              <span>/</span>
              <span>GENERATE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-sans font-light tracking-tight text-[#F1F4F2] leading-tight">
              FROM POINTS <br />
              <strong className="font-semibold text-[#F1F4F2]">TO A 3D WORLD</strong>
            </h2>
            <p className="text-[#9BA6A1] font-sans text-xs sm:text-base leading-relaxed">
              The reconstructed scene becomes an interactive 3D model. Sparse triangulations densify into survey-grade surface topography.
            </p>
            <div className="pt-1 sm:pt-2 flex items-center gap-2 font-mono text-[10px] sm:text-[11px] text-[#9BA6A1]">
              <span className="text-[#78AFA2]">Sparse</span>
              <span>→</span>
              <span className="text-[#9BA6A1]">Dense Cloud</span>
              <span>→</span>
              <span className="text-[#F1F4F2] font-semibold">Terrain Mesh</span>
            </div>
          </div>

          {/* SECTION 07 — TERRAIN / EXPLORE */}
          <div
            className="absolute inset-x-3 sm:inset-x-12 bottom-4 sm:bottom-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 transition-opacity duration-300"
            style={{
              opacity: opSec7,
              pointerEvents: opSec7 > 0.5 ? "auto" : "none",
            }}
          >
            <div className="space-y-1 sm:space-y-2 text-left">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] text-[#78AFA2] tracking-wider">
                <span>06</span>
                <span>/</span>
                <span>EXPLORE</span>
              </div>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-sans font-light tracking-tight text-[#F1F4F2]">
                NORTHUMBERLANDIA. <strong className="font-semibold">IN 3D.</strong>
              </h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-[11px] text-[#9BA6A1]">
                <span className="flex items-center gap-1.5 text-[#78AFA2]">
                  <Move3d className="w-3.5 h-3.5" />
                  TOUCH / DRAG TO ORBIT
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">PINCH TO ZOOM</span>
              </div>
            </div>

            {/* Interactive Terrain Controls Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0D1210]/95 backdrop-blur-md border border-[#26302C] p-1.5 sm:p-2 rounded-[12px] shadow-2xl overflow-x-auto max-w-full">
              <button
                onClick={() => setIsInteractive(!isInteractive)}
                className={`h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-[8px] font-mono text-[11px] sm:text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  isInteractive
                    ? "bg-[#78AFA2] text-[#080B0A] font-semibold"
                    : "bg-[#121916] hover:bg-[#17211d] text-[#F1F4F2] border border-[#26302C]"
                }`}
              >
                <MousePointerClick className="w-3.5 h-3.5" />
                <span>{isInteractive ? "Orbit Active" : "Interact"}</span>
              </button>

              <div className="h-4 w-[1px] bg-[#26302C] shrink-0" />

              <div className="flex items-center gap-0.5 sm:gap-1 bg-[#080B0A] p-0.5 rounded-[8px] border border-[#26302C] text-[10px] sm:text-[11px] font-mono shrink-0">
                <button
                  onClick={() => setTerrainMode("textured")}
                  className={`px-2 sm:px-2.5 py-1 rounded-[6px] transition-colors cursor-pointer ${
                    terrainMode === "textured"
                      ? "bg-[#121916] text-[#F1F4F2] border border-[#26302C] font-medium"
                      : "text-[#9BA6A1] hover:text-[#F1F4F2]"
                  }`}
                >
                  Surface
                </button>
                <button
                  onClick={() => setTerrainMode("pointcloud")}
                  className={`px-2 sm:px-2.5 py-1 rounded-[6px] transition-colors cursor-pointer ${
                    terrainMode === "pointcloud"
                      ? "bg-[#121916] text-[#F1F4F2] border border-[#26302C] font-medium"
                      : "text-[#9BA6A1] hover:text-[#F1F4F2]"
                  }`}
                >
                  Points
                </button>
                <button
                  onClick={() => setTerrainMode("wireframe")}
                  className={`px-2 sm:px-2.5 py-1 rounded-[6px] transition-colors cursor-pointer ${
                    terrainMode === "wireframe"
                      ? "bg-[#121916] text-[#F1F4F2] border border-[#26302C] font-medium"
                      : "text-[#9BA6A1] hover:text-[#F1F4F2]"
                  }`}
                >
                  Wire
                </button>
              </div>

              <button
                onClick={() => setResetCameraTrigger((c) => c + 1)}
                title="Reset Camera Position"
                className="h-8 sm:h-9 w-8 sm:w-9 flex items-center justify-center rounded-[8px] bg-[#121916] hover:bg-[#17211d] text-[#9BA6A1] hover:text-[#F1F4F2] border border-[#26302C] transition-colors shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-[1px] bg-[#26302C] shrink-0" />

              {/* Direct Link to Demo Workspace */}
              <Link
                href="/dashboard/demo"
                className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-[8px] bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-mono text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all shrink-0 shadow-sm"
              >
                <span>Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* SECTION 08 — FINAL CTA */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-12 transition-opacity duration-300"
            style={{
              opacity: opSec8,
              pointerEvents: opSec8 > 0.5 ? "auto" : "none",
            }}
          >
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-sans font-light tracking-tight text-[#F1F4F2] leading-tight">
                ONE FLIGHT. <br />
                ONE VIDEO. <br />
                <span className="font-semibold text-[#F1F4F2]">
                  ONE 3D WORLD.
                </span>
              </h2>

              <p className="text-[#9BA6A1] font-sans text-xs sm:text-base max-w-md mx-auto leading-relaxed">
                Transform drone footage into an explorable 3D reconstruction.
              </p>

              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <Link
                  href="/login"
                  className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 rounded-[8px] bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-sans text-xs font-semibold tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  START RECONSTRUCTION
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/dashboard/demo"
                  className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-7 rounded-[8px] bg-[#121916] hover:bg-[#17211d] border border-[#26302C] text-[#F1F4F2] font-sans text-xs font-medium tracking-wider flex items-center justify-center transition-colors"
                >
                  VIEW DEMO
                </Link>
              </div>

              <div className="pt-6 sm:pt-8 text-[10px] sm:text-[11px] font-mono text-[#68736E]">
                TERRARECON PHOTOGRAMMETRIC ENGINE • SIH 2026 PROTOTYPE
              </div>
            </div>
          </div>
        </div>

        {/* Bottom subtle progress line */}
        <div className="relative z-30 w-full h-[2px] bg-[#0D1210]">
          <div
            className="h-full bg-[#78AFA2] transition-all duration-100 ease-out"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
