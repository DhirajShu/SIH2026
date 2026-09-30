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
  Layers,
  Sparkles,
  RotateCcw,
  Loader2,
  Box,
  FolderOpen
} from "lucide-react";
import { ReconstructionProject } from "@/lib/types";
import {
  getProjects,
  saveProject,
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

  // Success / Error notification states
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Rename modal state
  const [renameTarget, setRenameTarget] = useState<ReconstructionProject | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<ReconstructionProject | null>(null);

  // Export modal state
  const [exportTarget, setExportTarget] = useState<ReconstructionProject | null>(null);

  // Load actual user projects
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

  // 1. Rename Action
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

  // 2. Delete Action with Confirmation
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const name = deleteTarget.title;
    deleteProject(deleteTarget.id);
    setDeleteTarget(null);
    showSuccess(`Deleted project "${name}".`);
    refreshProjects();
  };

  // 3. Open Action
  const handleOpenProject = (p: ReconstructionProject) => {
    if (p.status === "processing") {
      router.push(`/dashboard/projects/${p.id}/processing`);
    } else {
      router.push(`/dashboard/projects/${p.id}`);
    }
  };

  // Optional demo loader if user wants sample flights
  const handleLoadSampleData = () => {
    loadSampleProjects();
    refreshProjects();
    showSuccess("Loaded pre-calibrated sample drone surveys.");
  };

  // Filtering
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
    <div className="flex-1 bg-neutral-950 font-sans text-neutral-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span>PROJECT REGISTRY</span>
              <span className="text-neutral-600">/</span>
              <span>{projects.length} ACTUAL RECONSTRUCTIONS</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-100 mt-1">
              Your Reconstructions
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/new"
              className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold font-mono text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              + New Reconstruction
            </Link>
          </div>
        </div>

        {/* Global Notifications */}
        {successBanner && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="flex-1">{successBanner}</span>
          </div>
        )}

        {errorBanner && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-mono text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="flex-1">{errorBanner}</span>
          </div>
        )}

        {/* Search & Filter Bar (Only if projects exist) */}
        {projects.length > 0 && (
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by project name or video file..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <span className="text-neutral-500 text-[11px]">FILTER:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-300 py-1.5 px-3 rounded-lg focus:outline-none focus:border-amber-500 text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Ready (Completed)</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          </div>
        )}

        {/* =========================================================================
            1. LOADING STATE
        ========================================================================= */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-neutral-400">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            <span>Loading your project registry...</span>
          </div>
        ) : projects.length === 0 ? (
          /* =========================================================================
              2. EMPTY STATE (When no user projects exist)
          ========================================================================= */
          <div className="p-12 sm:p-16 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-500 shadow-xl">
              <FolderOpen className="w-7 h-7" />
            </div>

            <div className="space-y-1 max-w-md">
              <h3 className="text-base sm:text-lg font-semibold text-neutral-100">
                No reconstructions yet
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans">
                Upload your first drone flight video to begin generating an explorable 3D terrain model.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/dashboard/new"
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold font-mono text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Create Reconstruction
              </Link>

              <button
                onClick={handleLoadSampleData}
                className="px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Load Sample Flights
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          /* Search Empty State */
          <div className="p-10 rounded-xl bg-neutral-900/30 border border-neutral-800 text-center space-y-2 font-mono text-xs text-neutral-400">
            <p>No reconstructions matched &quot;{search}&quot;</p>
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* =========================================================================
              3. PROJECT LIST WITH ACTIONS (OPEN, RENAME, EXPORT, DELETE)
          ========================================================================= */
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
                  className="rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 transition-all p-5 flex flex-col justify-between space-y-4 shadow-xl group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Status badge & Actions dropdown */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold border flex items-center gap-1 ${
                          isReady
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30"
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
                        {/* Quick Rename Button */}
                        <button
                          onClick={() => handleOpenRename(p)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                          title="Rename reconstruction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Export Button */}
                        <button
                          onClick={() => setExportTarget(p)}
                          className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                          title="Export 3D model formats"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Delete Button */}
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
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
                        className="font-semibold text-base text-neutral-100 hover:text-amber-400 transition-colors cursor-pointer line-clamp-1"
                        title={p.title}
                      >
                        {p.title}
                      </h3>
                      <p className="text-xs text-neutral-400 font-sans line-clamp-2 mt-1 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    {/* Source Video Tag */}
                    <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 font-mono text-[11px] text-neutral-400 flex items-center gap-2 truncate">
                      <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-neutral-500">Source:</span>
                      <span className="text-neutral-300 font-semibold truncate">{videoName}</span>
                    </div>

                    {/* Date & Drone Details */}
                    <div className="text-[11px] font-mono text-neutral-500 flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {p.captureDate ? p.captureDate.split(" ")[0] : "Recent"}
                      </span>
                      <span>{p.droneModel || "UAV Flight"}</span>
                    </div>
                  </div>

                  {/* Open Primary Action */}
                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-neutral-500">
                      ID: {p.id.substring(0, 16)}...
                    </span>

                    <button
                      onClick={() => handleOpenProject(p)}
                      className={`px-4 py-2 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isReady
                          ? "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/10"
                          : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
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

      {/* =========================================================================
          RENAME CONFIRMATION MODAL
      ========================================================================= */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="font-semibold text-neutral-100 text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-500" /> Rename Reconstruction
              </span>
              <button
                onClick={() => setRenameTarget(null)}
                className="text-neutral-500 hover:text-neutral-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-neutral-400 text-[11px] block">NEW PROJECT TITLE</label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 focus:outline-none focus:border-amber-500 text-xs font-mono"
                placeholder="Enter project name..."
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRenameTarget(null)}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRename}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
      ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
          <div className="w-full max-w-md bg-neutral-900 border border-red-500/40 rounded-2xl shadow-2xl p-6 font-mono text-xs space-y-4">
            <div className="flex items-center gap-2.5 text-red-400 font-bold text-sm pb-2 border-b border-neutral-800">
              <AlertTriangle className="w-4 h-4" />
              <span>Delete Reconstruction?</span>
            </div>

            <p className="text-neutral-300 font-sans text-xs leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-neutral-100">&quot;{deleteTarget.title}&quot;</strong>?
              This will remove the project metadata, video linkage, and 3D reconstruction session from your browser.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
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
