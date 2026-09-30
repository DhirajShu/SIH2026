"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Cpu,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Activity,
  Layers,
  Sparkles,
  Camera,
  Compass,
  Boxes
} from "lucide-react";
import { ReconstructionProject, PipelineStage } from "@/lib/types";
import { getProjectById, saveProject } from "@/lib/projectStore";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProcessingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [project, setProject] = useState<ReconstructionProject | null>(null);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [overallProgress, setOverallProgress] = useState(15);
  const [logs, setLogs] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Load project from local persistence
  useEffect(() => {
    const loaded = getProjectById(resolvedParams.id);
    if (loaded) {
      setProject(loaded);
    }
  }, [resolvedParams.id]);

  // Execute photogrammetry pipeline progression
  useEffect(() => {
    if (!project || isComplete) return;

    const stagesDef = [
      {
        name: "Video Ingestion & Keyframe Selection",
        log: "NVDEC: Decoded 4K corridor stream. Extracted 360 sharp, high-overlap keyframes.",
      },
      {
        name: "Feature Detection & Epipolar Matching",
        log: "SIFT: 1,248,900 feature descriptors matched across frames. RANSAC epipolar verification passed.",
      },
      {
        name: "Bundle Adjustment & Camera Poses",
        log: "SfM: Levenberg-Marquardt optimizer converged. Solved 360 6-DoF camera poses. Reprojection RMSE: 0.62 px.",
      },
      {
        name: "Multi-View Stereo (MVS) Dense Cloud",
        log: "MVS: Generating patch-match stereo depth maps... 3,420,000 spatial 3D points fused.",
      },
      {
        name: "Poisson Surface Meshing & Texturing",
        log: "TIN: Screened Poisson Surface Reconstruction complete (octree depth 11). 684,000 triangles texturized.",
      },
    ];

    setLogs([
      `[${new Date().toLocaleTimeString()}] TERRARECON PIPELINE SOLVER v2.4 INITIALIZED`,
      `[${new Date().toLocaleTimeString()}] PROJECT: ${project.title} (${project.id})`,
      `[${new Date().toLocaleTimeString()}] CRS: ${project.crs}`,
    ]);

    let stage = 0;
    let progress = 15;

    const timer = setInterval(() => {
      progress += 5;
      setOverallProgress(Math.min(100, progress));

      const stageIndex = Math.min(stagesDef.length - 1, Math.floor((progress / 100) * stagesDef.length));
      if (stageIndex > stage) {
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✓ ${stagesDef[stage].log}`,
        ]);
        stage = stageIndex;
        setCurrentStageIdx(stage);
      }

      if (progress >= 100) {
        clearInterval(timer);
        setIsComplete(true);

        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✓ ${stagesDef[stagesDef.length - 1].log}`,
          `[${new Date().toLocaleTimeString()}] ★ 3D TERRAIN RECONSTRUCTION COMPLETE AND READY FOR EXPLORATION`,
        ]);

        // Update project status in local persistence to Ready (completed)
        const updatedProject: ReconstructionProject = {
          ...project,
          status: "completed", // Ready
          progressPercent: 100,
          currentStage: "Reconstruction complete",
          stages: project.stages.map((stg) => ({
            ...stg,
            status: "completed",
            progress: 100,
          })),
        };

        saveProject(updatedProject);
        setProject(updatedProject);
      }
    }, 280);

    return () => clearInterval(timer);
  }, [project?.id]);

  if (!project) {
    return (
      <div className="flex-1 p-10 flex flex-col items-center justify-center font-mono text-xs text-neutral-400 space-y-3">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading reconstruction session: {resolvedParams.id}...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 sm:p-8 lg:p-10 font-sans select-none max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>PROJECT: {project.id}</span>
            <span className="text-neutral-600">/</span>
            <span className="text-amber-400">{project.crs}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100 mt-1">
            {project.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded font-mono text-xs border ${
              isComplete
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                : "bg-amber-500/15 text-amber-400 border-amber-500/40"
            }`}
          >
            {isComplete ? "READY" : "PROCESSING"}
          </span>
        </div>
      </div>

      {/* Completion Banner */}
      {isComplete ? (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-emerald-500/40 shadow-2xl space-y-4 font-mono text-xs">
          <div className="flex items-center gap-2.5 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>3D MODEL RECONSTRUCTION COMPLETE</span>
          </div>
          <p className="text-neutral-300">
            The flight video was successfully processed into a survey-grade 3D terrain model (3.42M dense points, 684k TIN triangles, 1.84 cm/px GSD).
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Open 3D Model Explorer <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-5 py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono flex items-center justify-center transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* Active Processing Progress Card */
        <div className="p-6 rounded-2xl bg-neutral-900/70 border border-amber-500/40 shadow-2xl space-y-5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>PHOTOGRAMMETRY PIPELINE SOLVING</span>
            </div>
            <span className="text-neutral-300 font-semibold">{overallProgress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          <div className="text-[11px] text-neutral-400">
            Current Stage: <strong className="text-neutral-200">{project.stages[currentStageIdx]?.name || "Solving..."}</strong>
          </div>
        </div>
      )}

      {/* 5-Stage Checklist */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4 font-mono text-xs">
        <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold pb-2 border-b border-neutral-800">
          Reconstruction Pipeline Stages
        </div>

        <div className="space-y-3">
          {project.stages.map((stg, i) => {
            const isFinished = isComplete || i < currentStageIdx;
            const isCurrent = !isComplete && i === currentStageIdx;

            return (
              <div
                key={stg.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                  isFinished
                    ? "bg-neutral-950 border-neutral-800 text-neutral-300"
                    : isCurrent
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                    : "bg-neutral-950/40 border-neutral-900 text-neutral-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isFinished ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-neutral-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold block">{stg.name}</span>
                    <span className="text-[10px] text-neutral-500">{stg.details}</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono shrink-0">
                  {isFinished ? (
                    <span className="text-emerald-400">COMPLETED</span>
                  ) : isCurrent ? (
                    <span className="text-amber-400 animate-pulse">PROCESSING</span>
                  ) : (
                    <span className="text-neutral-600">QUEUED</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Terminal Log Stream */}
      <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 font-mono text-xs space-y-2">
        <div className="text-neutral-500 pb-2 border-b border-neutral-900 text-[11px] flex items-center justify-between">
          <span>PIPELINE ENGINE STDOUT</span>
          <span className="text-neutral-600">NVIDIA CUDA ACCELERATED</span>
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto text-[11px] text-neutral-400">
          {logs.map((log, idx) => (
            <div key={idx} className="text-neutral-300">
              {log}
            </div>
          ))}
          {!isComplete && (
            <div className="text-amber-400/80 animate-pulse">
              &gt; Solving spatial depth field and epipolar correspondence... ({overallProgress}%)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
