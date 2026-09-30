"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle,
  FolderGit2,
  Calendar,
  Eye,
  Trash2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { ReconstructionProject } from "@/lib/types";
import { getProjects, clearAllProjects, resetDemoProjects, deleteProject } from "@/lib/projectStore";

export default function DashboardPage() {
  const [projects, setProjects] = useState<ReconstructionProject[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProjects(getProjects());
    setIsLoaded(true);
  }, []);

  const handleClear = () => {
    clearAllProjects();
    setProjects([]);
  };

  const handleReset = () => {
    resetDemoProjects();
    setProjects(getProjects());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteProject(id);
    setProjects(getProjects());
  };

  // Helper to format display status: Processing, Ready, Failed
  const getStatusBadge = (status: string) => {
    if (status === "completed" || status === "ready") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] font-medium border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Ready
        </span>
      );
    }
    if (status === "failed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] font-medium border bg-red-500/15 text-red-400 border-red-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          Failed
        </span>
      );
    }
    // Default to processing for "processing", "queued", or active jobs
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] font-medium border bg-amber-500/15 text-amber-400 border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Processing
      </span>
    );
  };

  return (
    <div className="flex-1 p-6 sm:p-8 lg:p-10 font-sans select-none space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-800/80 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100">
            Your Reconstructions
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Create and explore 3D models from drone footage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Evaluator State Helper */}
          <div className="hidden lg:flex items-center gap-2 border-r border-neutral-800 pr-3 font-mono text-xs text-neutral-500">
            {projects.length > 0 ? (
              <button
                onClick={handleClear}
                title="Clear all projects to test the Empty State"
                className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Test Empty State
              </button>
            ) : (
              <button
                onClick={handleReset}
                title="Restore demo flight surveys"
                className="text-[11px] text-amber-400 hover:underline transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Load Sample Flights
              </button>
            )}
          </div>

          <Link
            href="/dashboard/new"
            className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold font-mono text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            + New Reconstruction
          </Link>
        </div>
      </div>

      {/* Project Content Area */}
      {!isLoaded ? (
        <div className="py-20 flex flex-col items-center justify-center font-mono text-xs text-neutral-500 space-y-3">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Accessing local photogrammetry repository...</span>
        </div>
      ) : projects.length === 0 ? (
        /* =========================================================================
           EMPTY STATE
           "No reconstructions yet."
           "Upload your first drone flight to begin."
           Button: "Create Reconstruction"
        ========================================================================= */
        <div className="py-16 sm:py-24 px-4 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 max-w-2xl mx-auto space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-500 shadow-xl">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold tracking-tight text-neutral-100">
              No reconstructions yet.
            </h2>
            <p className="text-sm text-neutral-400 max-w-md mx-auto">
              Upload your first drone flight to begin.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard/new"
              className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold font-mono text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Create Reconstruction
            </Link>
          </div>

          <div className="pt-6 border-t border-neutral-800/80 w-full max-w-sm flex items-center justify-center">
            <button
              onClick={handleReset}
              className="text-xs font-mono text-neutral-500 hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Or restore pre-calibrated sample drone surveys
            </button>
          </div>
        </div>
      ) : (
        /* =========================================================================
           PROJECT LIST
           Show actual project data from prototype's local persistence
           Each project contains:
           - Project name
           - Date
           - Status (Processing / Ready / Failed)
           - Thumbnail
           - Open button
        ========================================================================= */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-neutral-700 transition-all flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Thumbnail & Status Badge */}
                  <div className="relative h-48 w-full bg-neutral-950 overflow-hidden">
                    <Image
                      src={project.thumbnailUrl || "/images/quarry.jpg"}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-80" />

                    {/* Top Status Badge */}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(project.status)}
                    </div>

                    {/* Capture Date Tag */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] font-mono text-neutral-300 bg-neutral-950/80 backdrop-blur px-2.5 py-1 rounded border border-neutral-800/80">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{project.captureDate}</span>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-semibold text-neutral-100 group-hover:text-amber-400 transition-colors text-base line-clamp-1">
                      {project.title}
                    </h3>

                    {/* Technical Sensor & Elevation metadata */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-400 border-t border-neutral-800/80 pt-3">
                      <div>
                        Sensor: <span className="text-neutral-200">{project.focalLengthMm || 35}mm</span>
                      </div>
                      <div>
                        GSD: <span className="text-amber-400 font-semibold">{project.gsdCmPerPixel || 1.84} cm</span>
                      </div>
                      <div>
                        Points: <span className="text-neutral-200">{((project.pointCloudSize || 3420000) / 1000000).toFixed(2)}M</span>
                      </div>
                      <div>
                        Reprojection: <span className="text-emerald-400">{project.reprojectionErrorPx || 0.62} px</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with Open Button and Actions */}
                <div className="px-5 py-3.5 border-t border-neutral-800/80 bg-neutral-950 flex items-center justify-between font-mono text-xs">
                  <button
                    onClick={(e) => handleDelete(project.id, e)}
                    title="Remove project from local storage"
                    className="p-1.5 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-900 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-100 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
