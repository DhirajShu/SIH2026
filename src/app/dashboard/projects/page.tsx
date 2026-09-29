"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FolderGit2,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Download,
  RotateCcw,
  SlidersHorizontal,
  Grid,
  List,
  ArrowUpDown,
  MapPin,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { ReconstructionProject } from "@/lib/types";
import { getProjects, resetDemoProjects } from "@/lib/projectStore";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ReconstructionProject[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "points" | "area" | "gsd">("date");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleReset = () => {
    resetDemoProjects();
    setProjects(getProjects());
  };

  const filtered = projects
    .filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.locationName.toLowerCase().includes(search.toLowerCase()) ||
        (p.clientRef && p.clientRef.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "points") return b.pointCloudSize - a.pointCloudSize;
      if (sortBy === "area") return b.areaHectares - a.areaHectares;
      if (sortBy === "gsd") return a.gsdCmPerPixel - b.gsdCmPerPixel;
      return new Date(b.captureDate).getTime() - new Date(a.captureDate).getTime();
    });

  return (
    <div className="flex-1 bg-neutral-950 font-sans text-neutral-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span>PROJECT REGISTRY</span>
              <span className="text-neutral-600">/</span>
              <span>{projects.length} FLIGHT SURVEYS</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-100 mt-1">
              Photogrammetry Projects
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              title="Reset to default SIH demo datasets"
              className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Data
            </button>
            <Link
              href="/dashboard/new"
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold font-mono text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              New Flight Pass
            </Link>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, location, client ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500 text-[11px]">STATUS:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-300 py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-amber-500"
              >
                <option value="all">All States</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="queued">Queued</option>
              </select>
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500 text-[11px]">SORT:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-300 py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-amber-500"
              >
                <option value="date">Date Captured</option>
                <option value="points">Point Count</option>
                <option value="area">Survey Area</option>
                <option value="gsd">Best GSD (cm/px)</option>
              </select>
            </div>

            {/* Grid / Table Toggle */}
            <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${viewMode === "grid" ? "bg-neutral-800 text-neutral-100" : "text-neutral-500"}`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded ${viewMode === "table" ? "bg-neutral-800 text-neutral-100" : "text-neutral-500"}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-xs font-mono text-neutral-500">
          Showing {filtered.length} of {projects.length} project models
        </div>

        {/* View Mode: Grid */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="group rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-neutral-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-neutral-800 overflow-hidden">
                    <Image
                      src={project.thumbnailUrl}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-70" />
                    <div className="absolute top-3 left-3 bg-neutral-950/90 backdrop-blur px-2.5 py-1 rounded border border-neutral-800 font-mono text-[10px] text-neutral-300">
                      {project.captureDate}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
                          project.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : project.status === "processing"
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse"
                            : "bg-neutral-800 text-neutral-400 border-neutral-700"
                        }`}
                      >
                        {project.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-3 right-3 text-xs font-mono text-neutral-300 truncate">
                      {project.locationName}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-neutral-500">{project.clientRef || "REF: UNASSIGNED"}</span>
                      <span className="text-[10px] font-mono text-amber-400 font-semibold">{project.gsdCmPerPixel} cm/px GSD</span>
                    </div>
                    <h3 className="font-semibold text-neutral-100 group-hover:text-amber-400 transition-colors text-sm line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-neutral-400 border-t border-neutral-800/80">
                      <div>
                        Sensor: <span className="text-neutral-200">{project.cameraSensor.split(" ")[0]}</span>
                      </div>
                      <div>
                        Area: <span className="text-neutral-200">{project.areaHectares} ha</span>
                      </div>
                      <div>
                        Dense Cloud: <span className="text-neutral-200">{(project.pointCloudSize / 1000000).toFixed(2)}M pts</span>
                      </div>
                      <div>
                        Reprojection: <span className="text-emerald-400">{project.reprojectionErrorPx} px</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-neutral-800/80 bg-neutral-950 flex items-center justify-between font-mono text-xs">
                  <span className="text-neutral-500 text-[10px]">CRS: {project.crs.split(" ")[0]}</span>
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect 3D Model
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* View Mode: Technical Table */
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden font-mono text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-neutral-950/80 text-neutral-400 uppercase text-[10px] border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Project / Ref</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">GSD (cm)</th>
                    <th className="py-3 px-4">Points</th>
                    <th className="py-3 px-4">RMSE</th>
                    <th className="py-3 px-4">Sensor</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {filtered.map((proj) => (
                    <tr key={proj.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-200">{proj.title}</div>
                        <div className="text-[10px] text-neutral-500">{proj.clientRef || proj.id}</div>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-300">{proj.locationName}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] border ${
                            proj.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                              : proj.status === "processing"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                              : "bg-neutral-800 text-neutral-400 border-neutral-700"
                          }`}
                        >
                          {proj.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-amber-400 font-semibold">{proj.gsdCmPerPixel}</td>
                      <td className="py-3.5 px-4 text-neutral-300">{(proj.pointCloudSize / 1000000).toFixed(2)}M</td>
                      <td className="py-3.5 px-4 text-emerald-400">{proj.reprojectionErrorPx} px</td>
                      <td className="py-3.5 px-4 text-neutral-400">{proj.cameraSensor.split(" ")[0]}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/dashboard/projects/${proj.id}`}
                          className="px-2.5 py-1 bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 rounded text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
