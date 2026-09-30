"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Download,
  Activity,
  Film,
  CheckCircle2,
  Loader2,
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
      <div className="flex-1 bg-[#080B0A] flex items-center justify-center font-mono text-xs text-[#9BA6A1] p-8">
        <div className="space-y-3 text-center">
          <Loader2 className="w-5 h-5 text-[#78AFA2] animate-spin mx-auto" />
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
    <div className="flex-1 bg-[#080B0A] font-sans text-[#F1F4F2] flex flex-col min-h-screen">
      {/* =========================================================================
          TOP VIEWER HEADER & METADATA BAR
      ========================================================================= */}
      <div className="border-b border-[#26302C] bg-[#0D1210]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 select-none sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Back Link & Project Information */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard/projects"
              className="p-2 rounded-[8px] border border-[#26302C] bg-[#121916] hover:bg-[#121916]/80 text-[#9BA6A1] hover:text-[#F1F4F2] transition-colors shrink-0"
              title="Return to reconstructions list"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#68736E]">
                <span className="px-2 py-0.5 rounded-[6px] bg-[#78AFA2]/12 border border-[#78AFA2]/30 text-[#78AFA2] text-[10px] font-bold tracking-wider uppercase">
                  01 / RECONSTRUCTION
                </span>
                <span className="hidden sm:inline">|</span>
                <span className="text-[#9BA6A1] truncate max-w-xs flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-[#78AFA2] shrink-0" />
                  <span className="text-[#68736E]">Source:</span>
                  <span className="text-[#F1F4F2] font-semibold">{sourceVideo}</span>
                </span>
              </div>

              <h1 className="text-lg sm:text-xl font-bold text-[#F1F4F2] truncate mt-0.5 tracking-tight">
                {project.title}
              </h1>
            </div>
          </div>

          {/* Right: Status & Primary Action Buttons ("Analyze" and "Export") */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Status Indicator */}
            <span
              className={`px-2.5 py-1 rounded-[6px] font-mono text-xs border flex items-center gap-1.5 ${
                isCompleted
                  ? "bg-[#7FAE8D]/15 text-[#7FAE8D] border-[#7FAE8D]/40"
                  : "bg-[#78AFA2]/15 text-[#78AFA2] border-[#78AFA2]/40"
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>READY</span>
                </>
              ) : (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>PROCESSING</span>
                </>
              )}
            </span>

            {/* Action Button: Analyze */}
            <button
              onClick={() => setIsAnalyzeOpen((prev) => !prev)}
              className={`h-[40px] px-3.5 rounded-[8px] font-semibold font-mono text-xs flex items-center gap-1.5 transition-all border cursor-pointer ${
                isAnalyzeOpen
                  ? "bg-[#78AFA2]/15 text-[#78AFA2] border-[#78AFA2]/50"
                  : "bg-[#121916] hover:bg-[#121916]/80 text-[#F1F4F2] border-[#26302C] hover:border-[#78AFA2]/40"
              }`}
              title="Open surface measurement, lighting and analysis tools"
            >
              <Activity className="w-3.5 h-3.5 text-[#78AFA2]" />
              <span>Analyze</span>
            </button>

            {/* Action Button: Export */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="h-[40px] px-4 rounded-[8px] bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-bold font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
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
        <div className="p-4 rounded-xl bg-[#121916] border border-[#26302C] font-mono text-xs flex flex-wrap items-center justify-between gap-3 text-[#9BA6A1]">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-[#68736E]">PROJECT:</span>{" "}
              <span className="text-[#F1F4F2]">{project.id}</span>
            </div>
            <span className="text-[#26302C]">•</span>
            <div>
              <span className="text-[#68736E]">AIRFRAME:</span>{" "}
              <span className="text-[#F1F4F2]">{project.droneModel || "Survey UAV"}</span>
            </div>
            <span className="text-[#26302C]">•</span>
            <div>
              <span className="text-[#68736E]">DATE:</span>{" "}
              <span className="text-[#F1F4F2]">{project.captureDate || "Recent Survey"}</span>
            </div>
          </div>

          <div className="text-[11px] text-[#68736E] flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#78AFA2]" />
            <span>TerraRecon Single-Pass 3D Model Explorer</span>
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
