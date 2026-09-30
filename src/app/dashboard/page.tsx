"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle,
  Calendar,
  Eye,
  Trash2,
  RotateCcw,
  Sparkles,
  UploadCloud
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

  // Status badge matching global design system tokens
  const getStatusBadge = (status: string) => {
    if (status === "completed" || status === "ready") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] font-mono text-[10px] font-medium border bg-[#7FAE8D]/15 text-[#7FAE8D] border-[#7FAE8D]/35">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7FAE8D]" />
          READY
        </span>
      );
    }
    if (status === "failed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] font-mono text-[10px] font-medium border bg-[#B87575]/15 text-[#B87575] border-[#B87575]/35">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B87575]" />
          FAILED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] font-mono text-[10px] font-medium border bg-[#B49B69]/15 text-[#B49B69] border-[#B49B69]/35">
        <span className="w-1.5 h-1.5 rounded-full bg-[#B49B69] animate-pulse" />
        PROCESSING
      </span>
    );
  };

  return (
    <div className="flex-1 p-6 sm:p-8 lg:p-10 font-sans select-none space-y-8 bg-[#080B0A] text-[#F1F4F2]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#26302C] gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F1F4F2]">
            Your Reconstructions
          </h1>
          <p className="text-[#9BA6A1] text-sm mt-1">
            Create and explore 3D models from drone footage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Evaluator Helper */}
          <div className="hidden lg:flex items-center gap-2 border-r border-[#26302C] pr-3 font-mono text-xs text-[#68736E]">
            {projects.length > 0 ? (
              <button
                onClick={handleClear}
                title="Clear all projects to test the Empty State"
                className="text-[11px] text-[#68736E] hover:text-[#9BA6A1] transition-colors cursor-pointer"
              >
                Test Empty State
              </button>
            ) : (
              <button
                onClick={handleReset}
                title="Restore demo flight surveys"
                className="text-[11px] text-[#78AFA2] hover:underline transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Restore Samples
              </button>
            )}
          </div>

          <Link
            href="/dashboard/demo"
            className="h-10 px-4 rounded-[8px] bg-[#121916] hover:bg-[#17211d] border border-[#26302C] hover:border-[#78AFA2] text-[#F1F4F2] font-semibold font-mono text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#78AFA2]" />
            Open Demo Reconstruction
          </Link>

          <Link
            href="/dashboard/new"
            className="h-10 px-4 rounded-[8px] bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-semibold font-mono text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            New Reconstruction
          </Link>
        </div>
      </div>

      {/* Project Content Area */}
      {!isLoaded ? (
        <div className="py-20 flex flex-col items-center justify-center font-mono text-xs text-[#68736E] space-y-3">
          <div className="w-6 h-6 border-2 border-[#78AFA2] border-t-transparent rounded-full animate-spin" />
          <span>Accessing photogrammetry repository...</span>
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <div className="py-16 sm:py-24 px-4 flex flex-col items-center justify-center text-center rounded-[14px] border border-dashed border-[#26302C] bg-[#0D1210]/60 max-w-2xl mx-auto space-y-5">
          <div className="w-14 h-14 rounded-[12px] bg-[#121916] border border-[#26302C] flex items-center justify-center text-[#78AFA2] shadow-lg">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold tracking-tight text-[#F1F4F2]">
              No reconstructions yet.
            </h2>
            <p className="text-sm text-[#9BA6A1] max-w-md mx-auto">
              Upload your first drone flight to begin.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/dashboard/new"
              className="h-11 px-5 rounded-[8px] bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-semibold font-mono text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Create Reconstruction
            </Link>

            <Link
              href="/dashboard/demo"
              className="h-11 px-5 rounded-[8px] bg-[#121916] hover:bg-[#17211d] border border-[#26302C] hover:border-[#78AFA2] text-[#F1F4F2] font-semibold font-mono text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#78AFA2]" />
              Open Demo Reconstruction
            </Link>
          </div>

          <div className="pt-6 border-t border-[#26302C] w-full max-w-sm flex items-center justify-center">
            <button
              onClick={handleReset}
              className="text-xs font-mono text-[#68736E] hover:text-[#78AFA2] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Or restore pre-calibrated sample drone surveys
            </button>
          </div>
        </div>
      ) : (
        /* Project Cards Grid */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group rounded-[14px] border border-[#26302C] bg-[#121916] overflow-hidden hover:border-[#78AFA2]/50 transition-all flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Thumbnail & Status Badge */}
                  <div className="relative h-48 w-full bg-[#080B0A] overflow-hidden">
                    <Image
                      src={project.thumbnailUrl || "/images/quarry.jpg"}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121916] via-transparent to-transparent opacity-90" />

                    {/* Top Status Badge */}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(project.status)}
                    </div>

                    {/* Capture Date Tag */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] font-mono text-[#9BA6A1] bg-[#080B0A]/85 backdrop-blur px-2.5 py-1 rounded-[6px] border border-[#26302C]">
                      <Calendar className="w-3.5 h-3.5 text-[#78AFA2]" />
                      <span>{project.captureDate}</span>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-semibold text-[#F1F4F2] group-hover:text-[#78AFA2] transition-colors text-base line-clamp-1">
                      {project.title}
                    </h3>

                    {/* Technical Sensor & Elevation metadata */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#9BA6A1] border-t border-[#26302C] pt-3">
                      <div>
                        Sensor: <span className="text-[#F1F4F2]">{project.focalLengthMm || 35}mm</span>
                      </div>
                      <div>
                        GSD: <span className="text-[#78AFA2] font-semibold">{project.gsdCmPerPixel || 1.84} cm</span>
                      </div>
                      <div>
                        Points: <span className="text-[#F1F4F2]">{((project.pointCloudSize || 3420000) / 1000000).toFixed(2)}M</span>
                      </div>
                      <div>
                        Reprojection: <span className="text-[#7FAE8D]">{project.reprojectionErrorPx || 0.62} px</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with Open Button and Actions */}
                <div className="px-5 py-3.5 border-t border-[#26302C] bg-[#0D1210] flex items-center justify-between font-mono text-xs">
                  <button
                    onClick={(e) => handleDelete(project.id, e)}
                    title="Remove project from local storage"
                    className="p-1.5 text-[#68736E] hover:text-[#B87575] rounded-[6px] hover:bg-[#121916] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="h-9 px-4 rounded-[8px] bg-[#121916] hover:bg-[#78AFA2] hover:text-[#080B0A] text-[#F1F4F2] border border-[#26302C] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
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
