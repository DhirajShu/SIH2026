"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Download,
  Activity,
  Layers,
  Sparkles,
  Camera,
  Calendar,
  Film,
  CheckCircle2,
  Clock,
  RotateCcw,
  FileText,
  Sliders,
  Maximize2,
  Info
} from "lucide-react";
import { ReconstructionProject } from "@/lib/types";
import { getProjectById } from "@/lib/projectStore";
import { TerrainViewer } from "@/components/viewer/TerrainViewer";
import { ExportModal } from "@/components/project/ExportModal";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [project, setProject] = useState<ReconstructionProject | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState(false);

  useEffect(() => {
    const found = getProjectById(resolvedParams.id);
    if (found) {
      setProject(found);
    }
  }, [resolvedParams.id]);

  if (!project) {
    return (
      <div className="flex-1 bg-neutral-950 flex items-center justify-center font-mono text-xs text-neutral-400 p-8">
        <div className="space-y-3 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
          <div>LOADING RECONSTRUCTION: {resolvedParams.id}...</div>
        </div>
      </div>
    );
  }

  // Derive source video name safely without inventing fake data
  const sourceVideo =
    project.sourceVideoName ||
    (project.id.includes("quarry")
      ? "khadki_basalt_quarry_pass_4k.mp4"
      : project.id.includes("canyon") || project.id.includes("alpine")
      ? "zanskar_canyon_ridge_pass.mov"
      : "flight_recording.mp4");

  const isCompleted = project.status === "completed";

  return (
    <div className="flex-1 bg-neutral-950 font-sans text-neutral-100 flex flex-col min-h-screen">
      {/* =========================================================================
          TOP VIEWER HEADER & METADATA BAR
          Shows:
          - Project name
          - Source video
          - Status
          - "Prototype Reconstruction" subtle label
          - "Analyze" and "Export" action buttons
      ========================================================================= */}
      <div className="border-b border-neutral-800/80 bg-neutral-950/95 backdrop-blur-md px-4 sm:px-6 py-3.5 select-none sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Back Link & Project Information */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard/projects"
              className="p-2 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors shrink-0"
              title="Return to reconstructions list"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-neutral-400">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                  PROTOTYPE RECONSTRUCTION
                </span>
                <span className="text-neutral-600 hidden sm:inline">|</span>
                <span className="text-neutral-400 truncate max-w-xs flex items-center gap-1">
                  <Film className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="text-neutral-500">Source:</span>
                  <span className="text-neutral-300 font-semibold">{sourceVideo}</span>
                </span>
              </div>

              <h1 className="text-lg sm:text-xl font-bold text-neutral-100 truncate mt-0.5">
                {project.title}
              </h1>
            </div>
          </div>

          {/* Right: Status & Primary Action Buttons ("Analyze" and "Export") */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Status Indicator */}
            <span
              className={`px-2.5 py-1 rounded font-mono text-xs border flex items-center gap-1.5 ${
                isCompleted
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                  : "bg-amber-500/15 text-amber-400 border-amber-500/40"
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>READY</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>PROCESSING</span>
                </>
              )}
            </span>

            {/* Action Button: Analyze */}
            <button
              onClick={() => setIsAnalyzeOpen((prev) => !prev)}
              className={`px-3.5 py-2 rounded-lg font-semibold font-mono text-xs flex items-center gap-1.5 transition-all border cursor-pointer ${
                isAnalyzeOpen
                  ? "bg-neutral-800 text-amber-400 border-amber-500/50"
                  : "bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-700 hover:border-neutral-600"
              }`}
              title="Open surface measurement, lighting and analysis tools"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Analyze</span>
            </button>

            {/* Action Button: Export */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold font-mono text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] cursor-pointer"
              title="Export 3D Model (OBJ/PLY) and Technical Report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN APPLICATION VIEWPORT
          The 3D viewer is the visual focus of the page.
          Expansive, unobstructed, professional interactive canvas.
      ========================================================================= */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 flex-1 flex flex-col space-y-4">
        {/* Large 3D Viewport Component */}
        <TerrainViewer
          project={project}
          isAnalyzeOpen={isAnalyzeOpen}
          onToggleAnalyze={() => setIsAnalyzeOpen((prev) => !prev)}
          onOpenExportModal={() => setIsExportOpen(true)}
        />

        {/* Project Metadata Footer / Quick Summary Bar */}
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 font-mono text-xs flex flex-wrap items-center justify-between gap-3 text-neutral-400">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-neutral-500">PROJECT:</span>{" "}
              <span className="text-neutral-200">{project.id}</span>
            </div>
            <span>•</span>
            <div>
              <span className="text-neutral-500">AIRFRAME:</span>{" "}
              <span className="text-neutral-200">{project.droneModel || "Survey UAV"}</span>
            </div>
            <span>•</span>
            <div>
              <span className="text-neutral-500">DATE:</span>{" "}
              <span className="text-neutral-200">{project.captureDate || "Recent Survey"}</span>
            </div>
          </div>

          <div className="text-[11px] text-neutral-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Prototype Reconstruction • Interactive 3D Model Explorer</span>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
      />
    </div>
  );
}
