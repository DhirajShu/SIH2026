"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Compass,
  PlusCircle,
  FolderGit2,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Radio,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  HardDrive,
  Download,
  Eye,
  Sliders,
  Play
} from "lucide-react";
import { ReconstructionProject } from "@/lib/types";
import { getProjects } from "@/lib/projectStore";
import { getStoredUser, UserSession } from "@/lib/auth";

export default function DashboardPage() {
  const [projects, setProjects] = useState<ReconstructionProject[]>([]);
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    setProjects(getProjects());
    setUser(getStoredUser());
  }, []);

  const totalPoints = projects.reduce((acc, p) => acc + (p.pointCloudSize || 0), 0);
  const totalHectares = projects.reduce((acc, p) => acc + (p.areaHectares || 0), 0);
  const avgGsd = (
    projects.reduce((acc, p) => acc + (p.gsdCmPerPixel || 0), 0) / (projects.length || 1)
  ).toFixed(2);

  const completedCount = projects.filter((p) => p.status === "completed").length;
  const processingCount = projects.filter((p) => p.status === "processing").length;
  const queuedCount = projects.filter((p) => p.status === "queued").length;

  return (
    <div className="flex-1 bg-neutral-950 font-sans text-neutral-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Mission Telemetry Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-800 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>STATION CONSOLE</span>
              <span className="text-neutral-600">/</span>
              <span>{user?.organization || "National Geospatial Laboratory"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100 mt-1">
              Photogrammetry Operations
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5 font-mono">
              Lead Officer: <span className="text-neutral-200">{user?.name}</span> ({user?.role})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/new"
              className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold font-mono text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              New Single-Pass Flight
            </Link>
          </div>
        </div>

        {/* Real Geospatial KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 font-mono space-y-1">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>MAPPED EXTENT</span>
              <Layers className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-neutral-100">
              {totalHectares.toFixed(1)} <span className="text-sm font-normal text-neutral-400">ha</span>
            </div>
            <div className="text-[10px] text-neutral-400">
              {(totalHectares * 0.01).toFixed(2)} km² total terrain envelope
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 font-mono space-y-1">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>DENSE POINT RECOVERY</span>
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-neutral-100">
              {(totalPoints / 1000000).toFixed(2)} <span className="text-sm font-normal text-neutral-400">Million</span>
            </div>
            <div className="text-[10px] text-neutral-400">
              Poisson mesh vertices georeferenced
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 font-mono space-y-1">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>AVG RESOLUTION (GSD)</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-neutral-100">
              {avgGsd} <span className="text-sm font-normal text-neutral-400">cm/px</span>
            </div>
            <div className="text-[10px] text-neutral-400">
              Ground Sample Distance accuracy
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 font-mono space-y-1">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>GPU PIPELINE QUEUE</span>
              <Cpu className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-neutral-100 flex items-center gap-2">
              <span>{projects.length}</span>
              <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                {completedCount} READY
              </span>
            </div>
            <div className="text-[10px] text-neutral-400">
              {processingCount} processing • {queuedCount} queued
            </div>
          </div>
        </div>

        {/* Live Active Job Progress Banner (If any project is processing) */}
        {projects.find((p) => p.status === "processing") && (
          <div className="p-4 rounded-xl bg-neutral-900/90 border border-amber-500/40 font-mono">
            {(() => {
              const activeJob = projects.find((p) => p.status === "processing")!;
              return (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                      <span className="font-semibold text-neutral-200">
                        ACTIVE SOLVE IN PROGRESS: {activeJob.title}
                      </span>
                    </div>
                    <span className="text-amber-400 font-semibold">
                      {activeJob.progressPercent}% Complete
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${activeJob.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Current Stage: <strong className="text-neutral-200">{activeJob.currentStage}</strong></span>
                    <Link
                      href={`/dashboard/projects/${activeJob.id}`}
                      className="text-amber-400 hover:underline flex items-center gap-1"
                    >
                      Watch Live GPU Stream <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Recent Flight Missions / 3D Reconstruction Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-amber-500" />
              Reconstructed Flight Projects
            </h2>
            <Link
              href="/dashboard/projects"
              className="text-xs font-mono text-neutral-400 hover:text-amber-400 flex items-center gap-1"
            >
              View Full Archive ({projects.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-neutral-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail Banner */}
                  <div className="relative h-44 w-full bg-neutral-800 overflow-hidden">
                    <Image
                      src={project.thumbnailUrl}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />
                    <div className="absolute top-3 left-3 bg-neutral-950/90 backdrop-blur px-2 py-0.5 rounded border border-neutral-800 font-mono text-[10px] text-neutral-300">
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

                  {/* Body */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-neutral-100 group-hover:text-amber-400 transition-colors text-sm line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Metadata tags */}
                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-neutral-400 border-t border-neutral-800/80">
                      <div>
                        Sensor: <span className="text-neutral-200">{project.focalLengthMm}mm</span>
                      </div>
                      <div>
                        GSD: <span className="text-amber-400 font-semibold">{project.gsdCmPerPixel} cm</span>
                      </div>
                      <div>
                        Points: <span className="text-neutral-200">{(project.pointCloudSize / 1000000).toFixed(2)}M</span>
                      </div>
                      <div>
                        RMSE: <span className="text-emerald-400">{project.reprojectionErrorPx} px</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="p-3 border-t border-neutral-800/80 bg-neutral-950 flex items-center justify-between font-mono text-xs">
                  <span className="text-neutral-500 text-[10px]">{project.crs.split(" ")[0]}</span>
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Open 3D Model
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Help & Pipeline Standards Section */}
        <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="space-y-1.5">
            <div className="text-neutral-200 font-semibold flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-amber-500" /> Single-Pass Ingestion
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Unlike classical photogrammetry requiring 80% sidelap crosshatch flights, TerraRecon uses high-frequency motion vectors to extract sufficient baseline parallax from one pass.
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="text-neutral-200 font-semibold flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-sky-400" /> RTK GPS Direct Georeferencing
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Flight telemetry timestamps automatically align with camera frame exposures to constrain the bundle adjustment without requiring terrestrial survey targets.
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="text-neutral-200 font-semibold flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-emerald-400" /> Standard Deliverables
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Export standard LAS point clouds, watertight textured OBJ meshes, GeoTIFF DEMs, and automated photogrammetric quality audit reports for GIS pipelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
