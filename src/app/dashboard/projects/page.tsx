"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  PlusCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
  Film,
  Calendar,
  RotateCcw,
  Loader2,
  FolderOpen
} from "lucide-react";
import { ReconstructionProject } from "@/lib/types";
import {
  getProjects,
  renameProject,
  deleteProject,
  loadSampleProjects
} from "@/lib/projectStore";
import { ExportModal } from "@/components/project/ExportModal";

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<ReconstructionProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Notifications
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Modals
  const [renameTarget, setRenameTarget] = useState<ReconstructionProject | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ReconstructionProject | null>(null);
  const [exportTarget, setExportTarget] = useState<ReconstructionProject | null>(null);

  const refreshProjects = () => {
    const list = getProjects();
    setProjects(list);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorBanner(msg);
    setTimeout(() => setErrorBanner(null), 4000);
  };

  const handleOpenRename = (p: ReconstructionProject) => {
    setRenameTarget(p);
    setRenameValue(p.title);
    setErrorBanner(null);
  };

  const handleConfirmRename = () => {
    if (!renameTarget) return;
    if (!renameValue.trim()) {
      setErrorBanner("Project title cannot be empty.");
      return;
    }

    const ok = renameProject(renameTarget.id, renameValue);
    if (ok) {
      showSuccess(`Renamed project to "${renameValue.trim()}".`);
      setRenameTarget(null);
      refreshProjects();
    } else {
      showError("Could not rename project.");
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const name = deleteTarget.title;
    deleteProject(deleteTarget.id);
    setDeleteTarget(null);
    showSuccess(`Deleted project "${name}".`);
    refreshProjects();
  };

  const handleOpenProject = (p: ReconstructionProject) => {
    if (p.status === "processing") {
      router.push(`/dashboard/projects/${p.id}/processing`);
    } else {
      router.push(`/dashboard/projects/${p.id}`);
    }
  };

  const handleLoadSampleData = () => {
    loadSampleProjects();
    refreshProjects();
    showSuccess("Loaded pre-calibrated sample drone surveys.");
  };

  const filtered = projects.filter((p) => {
    const query = search.toLowerCase();
    const matchSearch =
      p.title.toLowerCase().includes(query) ||
      (p.sourceVideoName && p.sourceVideoName.toLowerCase().includes(query)) ||
      p.id.toLowerCase().includes(query);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex-1 bg-[#080B0A] font-sans text-[#F1F4F2] py-8 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#26302C]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#9BA6A1]">
              <span>PROJECT REGISTRY</span>
              <span className="text-[#26302C]">/</span>
              <span>{projects.length} RECONSTRUCTIONS</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F1F4F2] mt-1">
              Your Reconstructions
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/new"
              className="h-10 px-4 rounded-[8px] bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-semibold font-mono text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              New Reconstruction
            </Link>
          </div>
        </div>

        {/* Global Notifications */}
        {successBanner && (
          <div className="p-3.5 rounded-[8px] bg-[#7FAE8D]/15 border border-[#7FAE8D]/35 text-[#7FAE8D] font-mono text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#7FAE8D] shrink-0" />
            <span className="flex-1">{successBanner}</span>
          </div>
        )}

        {errorBanner && (
          <div className="p-3.5 rounded-[8px] bg-[#B87575]/15 border border-[#B87575]/35 text-[#B87575] font-mono text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#B87575] shrink-0" />
            <span className="flex-1">{errorBanner}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        {projects.length > 0 && (
          <div className="p-4 rounded-[12px] bg-[#121916] border border-[#26302C] flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-[#68736E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by project name or video file..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0D1210] border border-[#26302C] rounded-[8px] text-[#F1F4F2] placeholder:text-[#68736E] focus:outline-none focus:border-[#78AFA2] text-xs"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <span className="text-[#68736E] text-[11px]">FILTER:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0D1210] border border-[#26302C] text-[#F1F4F2] py-1.5 px-3 rounded-[8px] focus:outline-none focus:border-[#78AFA2] text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Ready (Completed)</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          </div>
        )}

        {/* 1. Loading State */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-[#68736E]">
            <Loader2 className="w-6 h-6 text-[#78AFA2] animate-spin" />
            <span>Loading your project registry...</span>
          </div>
        ) : projects.length === 0 ? (
          /* 2. Empty State */
          <div className="p-12 sm:p-16 rounded-[14px] bg-[#0D1210]/60 border border-dashed border-[#26302C] text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-[12px] bg-[#121916] border border-[#26302C] flex items-center justify-center text-[#78AFA2] shadow-lg">
              <FolderOpen className="w-7 h-7" />
            </div>

            <div className="space-y-1 max-w-md">
              <h3 className="text-base sm:text-lg font-semibold text-[#F1F4F2]">
                No reconstructions yet
              </h3>
              <p className="text-xs sm:text-sm text-[#9BA6A1] leading-relaxed font-sans">
                Upload your first drone flight video to begin generating an explorable 3D terrain model.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/dashboard/new"
                className="h-10 px-5 rounded-[8px] bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-semibold font-mono text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Create Reconstruction
              </Link>

              <button
                onClick={handleLoadSampleData}
                className="h-10 px-4 rounded-[8px] bg-[#121916] hover:bg-[#17211d] text-[#F1F4F2] border border-[#26302C] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Load Sample Flights
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          /* Search Empty State */
          <div className="p-10 rounded-[12px] bg-[#121916] border border-[#26302C] text-center space-y-2 font-mono text-xs text-[#9BA6A1]">
            <p>No reconstructions matched &quot;{search}&quot;</p>
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="text-[#78AFA2] hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* 3. Project Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => {
              const isReady = p.status === "completed";
              const videoName =
                p.sourceVideoName ||
                (p.id.includes("quarry")
                  ? "khadki_basalt_quarry_pass_4k.mp4"
                  : p.id.includes("canyon")
                  ? "zanskar_canyon_ridge_pass.mov"
                  : "flight_recording.mp4");

              return (
                <div
                  key={p.id}
                  className="rounded-[14px] bg-[#121916] border border-[#26302C] hover:border-[#78AFA2]/50 transition-all p-5 flex flex-col justify-between space-y-4 shadow-xl group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Status badge & Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-[6px] font-mono text-[10px] font-semibold border flex items-center gap-1 ${
                          isReady
                            ? "bg-[#7FAE8D]/15 text-[#7FAE8D] border-[#7FAE8D]/35"
                            : "bg-[#B49B69]/15 text-[#B49B69] border-[#B49B69]/35"
                        }`}
                      >
                        {isReady ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> READY
                          </>
                        ) : (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" /> PROCESSING
                          </>
                        )}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenRename(p)}
                          className="p-1.5 text-[#9BA6A1] hover:text-[#F1F4F2] hover:bg-[#0D1210] rounded-[6px] transition-colors cursor-pointer"
                          title="Rename reconstruction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setExportTarget(p)}
                          className="p-1.5 text-[#9BA6A1] hover:text-[#78AFA2] hover:bg-[#0D1210] rounded-[6px] transition-colors cursor-pointer"
                          title="Export 3D model formats"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 text-[#68736E] hover:text-[#B87575] hover:bg-[#0D1210] rounded-[6px] transition-colors cursor-pointer"
                          title="Delete reconstruction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Project Title */}
                    <div>
                      <h3
                        onClick={() => handleOpenProject(p)}
                        className="font-semibold text-base text-[#F1F4F2] group-hover:text-[#78AFA2] transition-colors cursor-pointer line-clamp-1"
                        title={p.title}
                      >
                        {p.title}
                      </h3>
                      <p className="text-xs text-[#9BA6A1] font-sans line-clamp-2 mt-1 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    {/* Source Video Tag */}
                    <div className="p-2.5 rounded-[8px] bg-[#0D1210] border border-[#26302C] font-mono text-[11px] text-[#9BA6A1] flex items-center gap-2 truncate">
                      <Film className="w-3.5 h-3.5 text-[#78AFA2] shrink-0" />
                      <span className="text-[#68736E]">Source:</span>
                      <span className="text-[#F1F4F2] font-semibold truncate">{videoName}</span>
                    </div>

                    {/* Date & Drone Details */}
                    <div className="text-[11px] font-mono text-[#68736E] flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {p.captureDate ? p.captureDate.split(" ")[0] : "Recent"}
                      </span>
                      <span>{p.droneModel || "UAV Flight"}</span>
                    </div>
                  </div>

                  {/* Open Primary Action */}
                  <div className="pt-2 border-t border-[#26302C] flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-[#68736E]">
                      ID: {p.id.substring(0, 16)}...
                    </span>

                    <button
                      onClick={() => handleOpenProject(p)}
                      className={`h-9 px-4 rounded-[8px] font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isReady
                          ? "bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A]"
                          : "bg-[#0D1210] hover:bg-[#17211d] text-[#F1F4F2] border border-[#26302C]"
                      }`}
                    >
                      <span>{isReady ? "Open 3D Model" : "View Progress"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rename Confirmation Modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
          <div className="w-full max-w-md bg-[#121916] border border-[#26302C] rounded-[14px] shadow-2xl p-6 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#26302C]">
              <span className="font-semibold text-[#F1F4F2] text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#78AFA2]" /> Rename Reconstruction
              </span>
              <button
                onClick={() => setRenameTarget(null)}
                className="text-[#68736E] hover:text-[#F1F4F2] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[#9BA6A1] text-[11px] block">NEW PROJECT TITLE</label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full px-3 py-2 bg-[#0D1210] border border-[#26302C] rounded-[8px] text-[#F1F4F2] focus:outline-none focus:border-[#78AFA2] text-xs font-mono"
                placeholder="Enter project name..."
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRenameTarget(null)}
                className="h-9 px-3.5 rounded-[8px] bg-[#0D1210] hover:bg-[#17211d] border border-[#26302C] text-[#9BA6A1] hover:text-[#F1F4F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRename}
                className="h-9 px-4 rounded-[8px] bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-semibold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
          <div className="w-full max-w-md bg-[#121916] border border-[#B87575]/40 rounded-[14px] shadow-2xl p-6 font-mono text-xs space-y-4">
            <div className="flex items-center gap-2.5 text-[#B87575] font-bold text-sm pb-2 border-b border-[#26302C]">
              <AlertTriangle className="w-4 h-4" />
              <span>Delete Reconstruction?</span>
            </div>

            <p className="text-[#9BA6A1] font-sans text-xs leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-[#F1F4F2]">&quot;{deleteTarget.title}&quot;</strong>?
              This will remove the project metadata, video linkage, and 3D reconstruction session from your browser.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="h-9 px-3.5 rounded-[8px] bg-[#0D1210] hover:bg-[#17211d] border border-[#26302C] text-[#9BA6A1] hover:text-[#F1F4F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="h-9 px-4 rounded-[8px] bg-[#B87575] hover:bg-[#c98686] text-[#080B0A] font-bold cursor-pointer"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportTarget && (
        <ExportModal
          isOpen={true}
          onClose={() => setExportTarget(null)}
          project={exportTarget}
        />
      )}
    </div>
  );
}
