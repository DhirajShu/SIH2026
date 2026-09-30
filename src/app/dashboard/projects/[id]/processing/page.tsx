"use client";

import React, { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  Loader2,
  FastForward,
  Info
} from "lucide-react";
import { ReconstructionProject } from "@/lib/types";
import { getProjectById, saveProject } from "@/lib/projectStore";

interface PageProps {
  params: Promise<{ id: string }>;
}

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
    description: "Validating single-pass aerial footage and parsing video stream metadata.",
    durationMs: 2200,
  },
  {
    num: "02",
    name: "FRAME EXTRACTION",
    description: "Extracting optimal overlap keyframes and discarding motion-blurred frames.",
    durationMs: 2400,
  },
  {
    num: "03",
    name: "FEATURE DETECTION",
    description: "Detecting visual landmarks and invariant keypoint descriptors across frames.",
    durationMs: 2200,
  },
  {
    num: "04",
    name: "FEATURE MATCHING",
    description: "Establishing tie points and matching keypoint correspondences between adjacent perspectives.",
    durationMs: 2400,
  },
  {
    num: "05",
    name: "CAMERA POSE ESTIMATION",
    description: "Solving Structure-from-Motion (SfM) bundle adjustment to recover trajectory poses.",
    durationMs: 2200,
  },
  {
    num: "06",
    name: "POINT CLOUD GENERATION",
    description: "Computing dense stereo multi-view disparity to build 3D spatial point cloud.",
    durationMs: 2500,
  },
  {
    num: "07",
    name: "MESH GENERATION",
    description: "Executing surface reconstruction to synthesize continuous 3D TIN terrain mesh.",
    durationMs: 2500,
  },
  {
    num: "08",
    name: "3D TERRAIN READY",
    description: "Reconstruction complete. Packaging high-fidelity 3D model for interactive inspection.",
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
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  const hasRedirectedRef = useRef(false);

  // 1. Load project from local persistence
  useEffect(() => {
    const loaded = getProjectById(resolvedParams.id);
    if (loaded) {
      setProject(loaded);
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
        clearInterval(interval);
        setCurrentStageIdx(7);
        setOverallProgress(100);
        setIsComplete(true);

        const updatedProject: ReconstructionProject = {
          ...project,
          status: "completed",
          progressPercent: 100,
          currentStage: "3D TERRAIN READY",
        };
        saveProject(updatedProject);
        setProject(updatedProject);

        setRedirectCountdown(2);
      } else {
        let stageIdx = 0;
        for (let i = 0; i < CUMULATIVE_TIMES.length; i++) {
          if (elapsed < CUMULATIVE_TIMES[i]) {
            stageIdx = i;
            break;
          }
        }

        const overallPercent = Math.min(99, Math.max(1, Math.floor((elapsed / TOTAL_PIPELINE_DURATION_MS) * 100)));

        setCurrentStageIdx(stageIdx);
        setOverallProgress(overallPercent);

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

  // Fast forward helper for evaluation
  const handleFastForward = () => {
    if (!project) return;
    setIsComplete(true);
    setCurrentStageIdx(7);
    setOverallProgress(100);

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
      <div className="flex-1 bg-[#080B0A] p-10 flex flex-col items-center justify-center font-mono text-xs text-[#9BA6A1] space-y-3">
        <Loader2 className="w-5 h-5 text-[#78AFA2] animate-spin" />
        <span>Loading reconstruction workspace: {resolvedParams.id}...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#080B0A] text-[#F1F4F2] p-6 sm:p-8 lg:p-10 font-sans select-none max-w-4xl mx-auto space-y-8">
      {/* Top Prototype Reconstruction Disclaimer Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#0D1210] border border-[#26302C] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-[6px] bg-[#78AFA2]/12 border border-[#78AFA2]/30 text-[#78AFA2] text-[10px] font-bold tracking-wider uppercase">
            01 / PIPELINE
          </span>
          <span className="text-[#9BA6A1] text-[11px] hidden md:inline">
            Deterministic Single-Pass Aerial Reconstruction
          </span>
        </div>

        <button
          onClick={handleFastForward}
          className="text-[11px] text-[#9BA6A1] hover:text-[#78AFA2] flex items-center gap-1.5 transition-colors self-end sm:self-auto cursor-pointer"
          title="Skip pipeline animation directly to the completed 3D Model Viewer"
        >
          <FastForward className="w-3.5 h-3.5 text-[#78AFA2]" />
          <span>Skip to 3D Viewer</span>
        </button>
      </div>

      {/* Project Header */}
      <div className="pb-6 border-b border-[#26302C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#68736E]">
            <span>PROJECT: {project.id}</span>
            <span>/</span>
            <span className="text-[#9BA6A1] truncate max-w-xs">{project.title}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F1F4F2] mt-1">
            Reconstruction Pipeline
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-[6px] font-mono text-xs border flex items-center gap-1.5 ${
              isComplete
                ? "bg-[#7FAE8D]/15 text-[#7FAE8D] border-[#7FAE8D]/40"
                : "bg-[#78AFA2]/15 text-[#78AFA2] border-[#78AFA2]/40"
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
      <div className="p-6 sm:p-7 rounded-xl bg-[#121916] border border-[#26302C] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#26302C]">
          <div>
            <div className="text-[11px] font-mono text-[#78AFA2] font-semibold tracking-wider uppercase">
              STAGE {activeStage.num} OF 08
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#F1F4F2] mt-0.5 tracking-tight">
              {activeStage.name}
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-[11px] text-[#68736E] uppercase tracking-wider">Progress</div>
            <div className="text-2xl font-bold text-[#78AFA2]">{overallProgress}%</div>
          </div>
        </div>

        {/* Current Stage Description */}
        <div className="p-4 rounded-[8px] bg-[#0D1210] border border-[#26302C] text-sm text-[#9BA6A1] font-sans flex items-start gap-3">
          <Info className="w-4 h-4 text-[#78AFA2] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-[#F1F4F2] text-xs font-mono uppercase tracking-wider mb-0.5">
              Operation Status
            </span>
            <p className="text-[#9BA6A1] text-sm leading-relaxed">
              {activeStage.description}
            </p>
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-[#9BA6A1]">
            <span>Reconstruction Progress</span>
            <span className="text-[#F1F4F2]">{overallProgress}%</span>
          </div>
          <div className="w-full bg-[#080B0A] h-2.5 rounded-[8px] overflow-hidden border border-[#26302C]">
            <div
              className={`h-full rounded-[8px] transition-all duration-200 ${
                isComplete ? "bg-[#7FAE8D]" : "bg-[#78AFA2]"
              }`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Completion Action Banner */}
        {isComplete && (
          <div className="p-5 rounded-[8px] bg-[#78AFA2]/10 border border-[#78AFA2]/30 text-[#F1F4F2] font-mono text-xs space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 font-semibold text-sm text-[#78AFA2]">
              <CheckCircle2 className="w-5 h-5 text-[#78AFA2]" />
              <span>3D TERRAIN MODEL READY</span>
            </div>
            <p className="text-[#9BA6A1] text-xs leading-relaxed font-sans">
              All 8 stages of the single-pass reconstruction workflow are complete. Your 3D terrain model has been saved and is ready for exploration.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                className="w-full sm:w-auto h-[44px] px-6 rounded-[8px] bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <span>OPEN 3D MODEL EXPLORER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {redirectCountdown !== null && redirectCountdown > 0 && (
                <span className="text-[#68736E] text-[11px]">
                  Redirecting automatically in {redirectCountdown}s...
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 8-Stage Workflow Timeline */}
      <div className="p-6 rounded-xl bg-[#121916] border border-[#26302C] space-y-4 font-mono text-xs">
        <div className="text-xs uppercase tracking-wider text-[#9BA6A1] font-semibold pb-2 border-b border-[#26302C] flex items-center justify-between">
          <span>PIPELINE RECONSTRUCTION SEQUENCE</span>
          <span className="text-[11px] text-[#68736E] font-normal">8 STAGES</span>
        </div>

        <div className="space-y-2">
          {STAGES.map((stg, i) => {
            const isFinished = isComplete || i < currentStageIdx;
            const isCurrent = !isComplete && i === currentStageIdx;

            return (
              <div
                key={stg.num}
                className={`p-3.5 rounded-[8px] border flex items-center justify-between transition-all duration-200 ${
                  isFinished
                    ? "bg-[#0D1210] border-[#26302C] text-[#F1F4F2]"
                    : isCurrent
                    ? "bg-[#78AFA2]/12 border-[#78AFA2] text-[#F1F4F2] shadow-sm"
                    : "bg-[#0D1210]/40 border-[#26302C]/50 text-[#68736E]"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-[6px] flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      isFinished
                        ? "bg-[#78AFA2]/15 text-[#78AFA2] border border-[#78AFA2]/30"
                        : isCurrent
                        ? "bg-[#78AFA2] text-[#080B0A] font-bold"
                        : "bg-[#080B0A] text-[#68736E] border border-[#26302C]"
                    }`}
                  >
                    {isFinished ? (
                      <CheckCircle2 className="w-4 h-4 text-[#78AFA2]" />
                    ) : (
                      stg.num
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold text-xs tracking-wide flex items-center gap-2">
                      <span className={isCurrent ? "text-[#8CC2B4] font-bold" : isFinished ? "text-[#F1F4F2]" : "text-[#68736E]"}>
                        {stg.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#9BA6A1] font-sans mt-0.5 truncate">
                      {stg.description}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono shrink-0 pl-3">
                  {isFinished ? (
                    <span className="text-[#78AFA2] font-medium">COMPLETED</span>
                  ) : isCurrent ? (
                    <span className="text-[#8CC2B4] font-semibold flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin inline text-[#78AFA2]" />
                      IN PROGRESS
                    </span>
                  ) : (
                    <span className="text-[#68736E]">PENDING</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#68736E]">
        <Link
          href="/dashboard"
          className="hover:text-[#F1F4F2] transition-colors flex items-center gap-1"
        >
          ← Return to Dashboard
        </Link>
        <span>TerraRecon Single-Pass System</span>
      </div>
    </div>
  );
}
