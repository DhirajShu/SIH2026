import React from "react";
import { LandingScrollStory } from "@/components/landing/LandingScrollStory";

export const metadata = {
  title: "TerraRecon | Single-Pass Drone Video to 3D Terrain Reconstruction",
  description:
    "Turn one drone video into an interactive 3D reconstruction. Built for rapid topographic mapping, geotechnical surveys, and disaster assessment.",
};

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-[#060709] text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <LandingScrollStory />
    </div>
  );
}
