"use client";

import React, { useState, useEffect, use, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
  ChevronRight,
  Loader2,
  FastForward,
  Info
} from "lucide-react";
import { ReconstructionProject } from "@/lib/types";
import { getProjectById, saveProject } from "@/lib/projectStore";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * 8 Defined Pipeline Stages for TerraRecon Prototype Reconstruction.
 * Each stage features deterministic duration and user-friendly descriptions.
 * Strict Rule: No fake accuracy percentages, frame counts, or synthetic statistics.
 */
interface PipelineStageDef {
  num: string;
  name: string;
  description: string;
  durationMs: number;
}

const STAGES: PipelineStageDef[] = [
  {
    num: "01",
    name: "VIDEO INGESTION",
    description: "Preparing the uploaded drone footage.",
    durationMs: 2200,
  },
  {
    num: "02",
    name: "FRAME EXTRACTION",
    description: "Extracting useful frames.",
    durationMs: 2400,
  },
  {
    num: "03",
    name: "FEATURE DETECTION",
    description: "Detecting visual landmarks and keypoints across frames.",
    durationMs: 2200,
  },
  {
    num: "04",
    name: "FEATURE MATCHING",
    description: "Finding visual features between frames.",
    durationMs: 2400,
  },
  {
    num: "05",
    name: "CAMERA POSE ESTIMATION",
    description: "Estimating camera movement.",
    durationMs: 2200,
  },
  {
    num: "06",
    name: "POINT CLOUD GENERATION",
    description: "Building 3D structure.",
    durationMs: 2500,
  },
  {
    num: "07",
    name: "MESH GENERATION",
    description: "Generating terrain geometry.",
    durationMs: 2500,
  },
  {
    num: "08",
    name: "3D TERRAIN READY",
    description: "Reconstruction complete. Preparing 3D viewer.",
    durationMs: 1400,
  },
];

// Precompute cumulative timing for deterministic stage resolution
const CUMULATIVE_TIMES = STAGES.reduce<number[]>((acc, stage, idx) => {
  const prev = idx === 0 ? 0 : acc[idx - 1];
  acc.push(prev + stage.durationMs);
  return acc;
}, []);

const TOTAL_PIPELINE_DURATION_MS = CUMULATIVE_TIMES[CUMULATIVE_TIMES.length - 1];

export default function ProcessingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [project, setProject] = useState<ReconstructionProject | null>(null);
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [stageProgress, setStageProgress] = useState<number>(0);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  const hasRedirectedRef = useRef(false);

  // 1. Load project from local persistence
  useEffect(() => {
    const loaded = getProjectById(resolvedParams.id);
    if (loaded) {
      setProject(loaded);
      // If project was already completed prior to this visit, immediately mark completed
      if (loaded.status === "completed") {
        setIsComplete(true);
        setCurrentStageIdx(7);
        setOverallProgress(100);
      }
    }
  }, [resolvedParams.id]);

  // 2. Deterministic Pipeline Progression with Page Refresh Persistence
  useEffect(() => {
    if (!project) return;
    if (isComplete) return;

    const storageKey = `terra_pipeline_start_${resolvedParams.id}`;
    let startTime: number;

    const storedStart = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
    if (storedStart) {
      startTime = parseInt(storedStart, 10);
      if (isNaN(startTime)) {
        startTime = Date.now();
        localStorage.setItem(storageKey, startTime.toString());
      }
    } else {
      startTime = Date.now();
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, startTime.toString());
      }
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed >= TOTAL_PIPELINE_DURATION_MS) {
        // Complete the pipeline
        clearInterval(interval);
        setCurrentStageIdx(7);
        setStageProgress(100);
        setOverallProgress(100);
        setIsComplete(true);

        // Persist project status as "completed" (Ready) in project store
        const updatedProject: ReconstructionProject = {
          ...project,
          status: "completed",
          progressPercent: 100,
          currentStage: "3D TERRAIN READY",
        };
        saveProject(updatedProject);
        setProject(updatedProject);

        // Begin auto-redirect countdown
        setRedirectCountdown(2);
      } else {
        // Determine active stage deterministically from elapsed time
        let stageIdx = 0;
        for (let i = 0; i < CUMULATIVE_TIMES.length; i++) {
          if (elapsed < CUMULATIVE_TIMES[i]) {
            stageIdx = i;
            break;
          }
        }

        const stageStart = stageIdx === 0 ? 0 : CUMULATIVE_TIMES[stageIdx - 1];
        const stageDuration = STAGES[stageIdx].durationMs;
        const stageElapsed = elapsed - stageStart;
        const stagePercent = Math.min(100, Math.max(0, Math.floor((stageElapsed / stageDuration) * 100)));
        const overallPercent = Math.min(99, Math.max(1, Math.floor((elapsed / TOTAL_PIPELINE_DURATION_MS) * 100)));

        setCurrentStageIdx(stageIdx);
        setStageProgress(stagePercent);
        setOverallProgress(overallPercent);

        // Keep project currentStage updated in store
        if (project.currentStage !== STAGES[stageIdx].name) {
          const synced: ReconstructionProject = {
            ...project,
            currentStage: STAGES[stageIdx].name,
            progressPercent: overallPercent,
          };
          saveProject(synced);
        }
      }
    }, 80);

    return () => clearInterval(interval);
  }, [project?.id, isComplete, resolvedParams.id]);

  // 3. Handle Auto-Redirect when Complete
  useEffect(() => {
    if (redirectCountdown === null) return;

    if (redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (redirectCountdown === 0 && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push(`/dashboard/projects/${resolvedParams.id}`);
    }
  }, [redirectCountdown, resolvedParams.id, router]);

  // Fast forward helper for evaluators
  const handleFastForward = () => {
    if (!project) return;
    setIsComplete(true);
    setCurrentStageIdx(7);
    setOverallProgress(100);
    setStageProgress(100);

    const updated: ReconstructionProject = {
      ...project,
      status: "completed",
      progressPercent: 100,
      currentStage: "3D TERRAIN READY",
    };
    saveProject(updated);
    setProject(updated);
    router.push(`/dashboard/projects/${resolvedParams.id}`);
  };

  const activeStage = STAGES[currentStageIdx] || STAGES[0];

  if (!project) {
    return (
      <div className="flex-1 p-10 flex flex-col items-center justify-center font-mono text-xs text-neutral-400 space-y-3">
        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
        <span>Loading reconstruction workspace: {resolvedParams.id}...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 sm:p-8 lg:p-10 font-sans select-none max-w-4xl mx-auto space-y-8">
      {/* Top Prototype Reconstruction Disclaimer Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs font-mono">
        <div className="flex items-center gap-2 text-neutral-300">
          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold tracking-wider">
            PROTOTYPE RECONSTRUCTION
          </span>
          <span className="text-neutral-400 text-[11px] hidden md:inline">
            Deterministic reconstruction workflow demonstration
          </span>
        </div>

        <button
          onClick={handleFastForward}
          className="text-[11px] text-neutral-400 hover:text-amber-400 flex items-center gap-1 transition-colors self-end sm:self-auto cursor-pointer"
          title="Skip animation directly to the completed 3D Model Viewer"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Skip to 3D Viewer</span>
        </button>
      </div>

      {/* Project Header */}
      <div className="pb-6 border-b border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>PROJECT: {project.id}</span>
            <span className="text-neutral-600">/</span>
            <span className="text-neutral-300 truncate max-w-xs">{project.title}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100 mt-1">
            Reconstruction Pipeline
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded font-mono text-xs border flex items-center gap-1.5 ${
              isComplete
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                : "bg-amber-500/15 text-amber-400 border-amber-500/40"
            }`}
          >
            {isComplete ? (
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
        </div>
      </div>

      {/* Active Stage & Progress Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800/80">
          <div>
            <div className="text-[11px] font-mono text-amber-500 font-semibold tracking-wider">
              CURRENT STAGE {activeStage.num} OF 08
            </div>
            <div className="text-xl sm:text-2xl font-bold text-neutral-100 mt-0.5 tracking-tight">
              {activeStage.name}
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-[11px] text-neutral-500 uppercase tracking-wider">Overall Progress</div>
            <div className="text-2xl font-bold text-amber-400">{overallProgress}%</div>
          </div>
        </div>

        {/* Current Stage Description */}
        <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-sm text-neutral-200 font-sans flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-neutral-100 text-xs font-mono uppercase tracking-wide mb-0.5">
              Stage Activity
            </span>
            <p className="text-neutral-300 text-sm leading-relaxed">
              {activeStage.description}
            </p>
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>Reconstruction Progress</span>
            <span className="text-neutral-200">{overallProgress}%</span>
          </div>
          <div className="w-full bg-neutral-950 h-3 rounded-full overflow-hidden border border-neutral-800">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                isComplete ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Completion Action Banner */}
        {isComplete && (
          <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>3D TERRAIN MODEL READY</span>
            </div>
            <p className="text-neutral-300 text-xs leading-relaxed font-sans">
              All 8 stages of the reconstruction workflow are complete. Your 3D terrain model has been saved and is ready for exploration.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <span>Open 3D Model Explorer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {redirectCountdown !== null && redirectCountdown > 0 && (
                <span className="text-neutral-400 text-[11px]">
                  Redirecting automatically in {redirectCountdown}s...
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 8-Stage Workflow Timeline */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4 font-mono text-xs">
        <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold pb-2 border-b border-neutral-800 flex items-center justify-between">
          <span>PIPELINE RECONSTRUCTION SEQUENCE</span>
          <span className="text-[11px] text-neutral-500 font-normal">8 STAGES</span>
        </div>

        <div className="space-y-2.5">
          {STAGES.map((stg, i) => {
            const isFinished = isComplete || i < currentStageIdx;
            const isCurrent = !isComplete && i === currentStageIdx;

            return (
              <div
                key={stg.num}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                  isFinished
                    ? "bg-neutral-950/80 border-neutral-800 text-neutral-200"
                    : isCurrent
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-md shadow-amber-500/5"
                    : "bg-neutral-950/30 border-neutral-900/80 text-neutral-500"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      isFinished
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : isCurrent
                        ? "bg-amber-500 text-neutral-950 font-bold"
                        : "bg-neutral-900 text-neutral-600 border border-neutral-800"
                    }`}
                  >
                    {isFinished ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      stg.num
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold text-xs tracking-wide flex items-center gap-2">
                      <span className={isCurrent ? "text-amber-300 font-bold" : isFinished ? "text-neutral-100" : "text-neutral-500"}>
                        {stg.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-sans mt-0.5 truncate">
                      {stg.description}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono shrink-0 pl-3">
                  {isFinished ? (
                    <span className="text-emerald-400 font-medium">COMPLETED</span>
                  ) : isCurrent ? (
                    <span className="text-amber-400 font-semibold animate-pulse flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin inline" />
                      IN PROGRESS
                    </span>
                  ) : (
                    <span className="text-neutral-600">QUEUED</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 flex items-center justify-between text-xs font-mono text-neutral-500">
        <Link
          href="/dashboard"
          className="hover:text-neutral-300 transition-colors flex items-center gap-1"
        >
          ← Return to Dashboard
        </Link>
        <span>TerraRecon Single-Pass System</span>
      </div>
    </div>
  );
}
