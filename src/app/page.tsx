"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  Play,
  Layers,
  Sparkles,
  Cpu,
  Activity,
  Box,
  ChevronDown,
  Video,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Camera
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Hero3DCanvas } from "@/components/landing/Hero3DCanvas";
import {
  Section01Flight,
  Section02Frames,
  Section03Movement,
  Section04Mesh,
  Section05Interactive,
} from "@/components/landing/LandingStoryComponents";

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const trigger = ScrollTrigger.create({
      trigger: heroRef.current,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const scrollToStory = () => {
    storyRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full flex flex-col font-sans bg-neutral-950 text-neutral-100 overflow-x-hidden select-none">
      {/* =========================================================================
          HERO: Full-screen cinematic scene
          Show a realistic 3D drone flying above a realistic landscape.
          The drone does NOT break apart!
      ========================================================================= */}
      <section
        ref={heroRef}
        className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 border-b border-neutral-800/80 overflow-hidden"
      >
        {/* Cinematic 3D Scene in Background */}
        <Hero3DCanvas scrollProgress={scrollProgress} />

        {/* Foreground Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 pt-12 sm:pt-0">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/90 backdrop-blur border border-neutral-800 text-[11px] font-mono text-neutral-300 shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>TERRARECON PHOTOGRAMMETRY</span>
            <span className="text-neutral-600">|</span>
            <span className="text-amber-400">SINGLE-PASS CORRIDOR RECONSTRUCTION</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-semibold tracking-tight text-neutral-100 leading-[1.1]">
            TURN DRONE VIDEO INTO A{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">
              3D WORLD
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-neutral-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Transform a single drone flight into an explorable 3D reconstruction.
          </p>

          {/* Buttons: Get Started & Explore the Process */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold font-mono text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all hover:scale-105"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={scrollToStory}
              className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 backdrop-blur text-neutral-200 border border-neutral-800 font-mono text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ChevronDown className="w-4 h-4 text-amber-400 animate-bounce" />
              Explore the Process
            </button>
          </div>

          {/* Telemetry Footer Pill */}
          <div className="pt-6 flex items-center justify-center gap-4 text-[11px] font-mono text-neutral-400">
            <span>UAV: <strong className="text-neutral-300">MATRICE 350 RTK</strong></span>
            <span>•</span>
            <span>SOLVER: <strong className="text-neutral-300">SINGLE PASS SfM</strong></span>
            <span>•</span>
            <span>ACCURACY: <strong className="text-emerald-400">1.84 cm GSD</strong></span>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-neutral-400 text-[10px] font-mono pointer-events-none">
          <span>SCROLL TO INSPECT WORKFLOW</span>
          <ChevronDown className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
        </div>
      </section>

      {/* =========================================================================
          STORY FLOW CONTAINER
          DRONE -> CAPTURE -> VIDEO -> FRAMES -> ANALYSIS -> 3D RECONSTRUCTION -> 3D TERRAIN -> APPLICATION
      ========================================================================= */}
      <div ref={storyRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-32">
        {/* SECTION 01: START WITH A SINGLE DRONE FLIGHT */}
        <section id="section-01" className="scroll-mt-20">
          <Section01Flight />
        </section>

        {/* SECTION 02: WE TURN VIDEO INTO VISUAL DATA */}
        <section id="section-02" className="scroll-mt-20">
          <Section02Frames />
        </section>

        {/* SECTION 03: UNDERSTAND HOW THE CAMERA MOVED */}
        <section id="section-03" className="scroll-mt-20">
          <Section03Movement />
        </section>

        {/* SECTION 04: FROM POINTS TO A 3D WORLD */}
        <section id="section-04" className="scroll-mt-20">
          <Section04Mesh />
        </section>

        {/* SECTION 05: EXPLORE THE RECONSTRUCTION */}
        <section id="section-05" className="scroll-mt-20">
          <Section05Interactive />
        </section>
      </div>

      {/* =========================================================================
          FINAL SECTION
          "ONE FLIGHT. ONE VIDEO. ONE 3D WORLD."
      ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-900/60 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-amber-400">
            <Compass className="w-3.5 h-3.5" />
            TERRARECON SYSTEM READY
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-100 leading-tight">
            ONE FLIGHT.<br />
            ONE VIDEO.<br />
            ONE 3D WORLD.
          </h2>

          <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Upload your footage and explore the reconstructed environment.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/25 hover:scale-105"
            >
              GET STARTED
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard/new"
              className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 font-mono text-xs flex items-center justify-center transition-colors"
            >
              Try Preloaded Flight Dataset
            </Link>
          </div>

          <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left font-mono text-xs text-neutral-400 border-t border-neutral-800/80 max-w-2xl mx-auto">
            <div>
              <span className="text-neutral-200 font-semibold block">No Multi-Pass Sidelap</span>
              Single corridor flight pass saves 75% battery and flight time.
            </div>
            <div>
              <span className="text-neutral-200 font-semibold block">Centimeter Precision</span>
              GSD down to 1.8 cm/px with RTK GPS direct georeferencing.
            </div>
            <div>
              <span className="text-neutral-200 font-semibold block">Standard Formats</span>
              Exports OBJ meshes, LAS/LAZ point clouds, and GeoTIFF DEMs.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
