"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UploadCloud,
  FileVideo,
  X,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  HardDrive,
  Film,
  Camera,
  Layers
} from "lucide-react";
import { ReconstructionProject, PipelineStage } from "@/lib/types";
import { saveProject } from "@/lib/projectStore";
import { videoStorage } from "@/lib/videoStorage";

const ACCEPTED_EXTENSIONS = [".mp4", ".mov", ".webm"];
const ACCEPTED_MIME_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_FILE_SIZE_MB = 1024; // 1GB

export default function NewReconstructionPage() {
  const router = useRouter();

  // Upload & File state
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Project form fields (shown after video selection)
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const validateFile = (selectedFile: File): string | null => {
    const ext = "." + selectedFile.name.split(".").pop()?.toLowerCase();
    const isExtValid = ACCEPTED_EXTENSIONS.includes(ext);
    const isMimeValid = ACCEPTED_MIME_TYPES.includes(selectedFile.type);

    if (!isExtValid && !isMimeValid) {
      return `Unsupported file format. Please upload an MP4, MOV, or WebM drone video. (Selected: ${selectedFile.name})`;
    }

    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File exceeds the maximum limit of ${MAX_FILE_SIZE_MB}MB. Please compress or select a smaller corridor pass.`;
    }

    return null;
  };

  const handleFileSelect = (selectedFile: File) => {
    setUploadError(null);
    setFormError(null);

    const error = validateFile(selectedFile);
    if (error) {
      setUploadError(error);
      return;
    }

    setFile(selectedFile);
    setUploadProgress(100);

    // Auto-derive project name if empty
    const cleanBaseName = selectedFile.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    if (!projectName) {
      setProjectName(cleanBaseName || "Drone Corridor Flight Survey");
    }
    if (!description) {
      setDescription(`Single-pass photogrammetric terrain reconstruction from aerial video footage (${selectedFile.name}).`);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleRemoveFile = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadError(null);
    setFormError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRetry = () => {
    handleRemoveFile();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Start reconstruction action
  const handleStartReconstruction = async () => {
    if (!file) {
      setFormError("Please select or drop a valid video file.");
      return;
    }

    if (!projectName.trim()) {
      setFormError("Please provide a name for this reconstruction project.");
      return;
    }

    setIsUploading(true);
    setFormError(null);

    const projectId = `proj-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    try {
      // 1. Save uploaded video into modular storage (IndexedDB) with progress
      await videoStorage.saveVideo(projectId, file, (progress) => {
        setUploadProgress(progress);
      });

      // 2. Build initial pipeline stages
      const initialStages: PipelineStage[] = [
        {
          id: "stg-1",
          name: "Video Ingestion & Keyframe Selection",
          category: "ingest",
          status: "processing",
          progress: 15,
          durationSec: 0,
          logMessage: "Decompressing video stream and evaluating motion blur...",
          details: "NVDEC hardware decode with adaptive optical flow spacing.",
        },
        {
          id: "stg-2",
          name: "Feature Detection & Epipolar Matching",
          category: "sfm",
          status: "pending",
          progress: 0,
          durationSec: 0,
          logMessage: "Queued",
          details: "Scale-Invariant Feature Transform with epipolar constraints.",
        },
        {
          id: "stg-3",
          name: "Bundle Adjustment & Camera Poses",
          category: "sfm",
          status: "pending",
          progress: 0,
          durationSec: 0,
          logMessage: "Queued",
          details: "Non-linear least squares optimization of 6-DoF trajectory.",
        },
        {
          id: "stg-4",
          name: "Multi-View Stereo (MVS) Dense Cloud",
          category: "mvs",
          status: "pending",
          progress: 0,
          durationSec: 0,
          logMessage: "Queued",
          details: "Sub-pixel disparity mapping and spatial depth fusion.",
        },
        {
          id: "stg-5",
          name: "Poisson Surface Meshing & Texturing",
          category: "mesh",
          status: "pending",
          progress: 0,
          durationSec: 0,
          logMessage: "Queued",
          details: "Screened Poisson watertight mesh with 8K UV atlas texture.",
        },
      ];

      // 3. Create project object with Status: Processing
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const newProject: ReconstructionProject = {
        id: projectId,
        title: projectName.trim(),
        clientRef: `UAV-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        description: description.trim() || `Single-pass drone photogrammetry reconstruction (${file.name}).`,
        locationName: "Aerial Survey Sector",
        country: "India",
        coordinates: {
          lat: 18.7324,
          lng: 73.8567,
        },
        crs: "EPSG:32643 (WGS 84 / UTM Zone 43N)",
        areaHectares: 12.4,
        gsdCmPerPixel: 1.84,
        reprojectionErrorPx: 0.62,
        pointCloudSize: 3420000,
        triangleCount: 684000,
        status: "processing", // Requirement: Set status to Processing
        progressPercent: 12,
        currentStage: "Video Ingestion & Keyframe Selection",
        droneModel: "DJI Matrice 350 RTK",
        cameraSensor: "Zenmuse P1 (45MP Full-Frame 35mm)",
        focalLengthMm: 35.0,
        flightAltitudeM: 65.0,
        avgFlightSpeedMs: 5.2,
        captureDate: formattedDate,
        videoDurationSec: 180,
        fps: 60,
        totalVideoFrames: 5400,
        extractedKeyframes: 360,
        thumbnailUrl: "/images/quarry.jpg",
        elevation: {
          minM: 540.0,
          maxM: 625.0,
          avgM: 582.0,
        },
        stages: initialStages,
        telemetry: [
          { timeSec: 0, lat: 18.7321, lng: 73.8561, altitudeM: 65.0, speedMs: 5.1, pitchDeg: -35.0, rollDeg: 0.8, yawDeg: 42.0, frameIndex: 1, iso: 100, shutter: "1/1000s" },
          { timeSec: 45, lat: 18.7324, lng: 73.8565, altitudeM: 65.5, speedMs: 5.2, pitchDeg: -35.5, rollDeg: 0.5, yawDeg: 43.5, frameIndex: 1350, iso: 100, shutter: "1/1000s" },
          { timeSec: 90, lat: 18.7328, lng: 73.8570, altitudeM: 65.8, speedMs: 5.0, pitchDeg: -36.2, rollDeg: -0.4, yawDeg: 46.0, frameIndex: 2700, iso: 100, shutter: "1/1250s" },
          { timeSec: 135, lat: 18.7332, lng: 73.8575, altitudeM: 65.2, speedMs: 5.3, pitchDeg: -35.8, rollDeg: 0.9, yawDeg: 51.0, frameIndex: 4050, iso: 100, shutter: "1/1250s" },
          { timeSec: 180, lat: 18.7337, lng: 73.8582, altitudeM: 64.8, speedMs: 4.9, pitchDeg: -34.8, rollDeg: 0.2, yawDeg: 55.0, frameIndex: 5400, iso: 100, shutter: "1/1000s" },
        ],
        gcps: [
          { id: "gcp-1", name: "GCP-101 (Bench)", lat: 18.7322, lng: 73.8562, elevationM: 545.2, residualErrorM: 0.014 },
          { id: "gcp-2", name: "GCP-102 (Crusher Edge)", lat: 18.7328, lng: 73.8571, elevationM: 588.6, residualErrorM: 0.018 },
        ],
        artifacts: {
          objMeshSizeMb: 86.4,
          plyCloudSizeMb: 142.1,
          lasCloudSizeMb: 118.6,
          geotiffDemMb: 34.2,
          orthomosaicMb: 168.0,
        },
      };

      // 4. Save project in local persistence
      saveProject(newProject);

      // 5. Navigate to: /dashboard/projects/[id]/processing
      router.push(`/dashboard/projects/${projectId}/processing`);
    } catch (err: any) {
      console.error("Reconstruction initialization failed:", err);
      setFormError("Could not initiate reconstruction pipeline. Please try again.");
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 p-6 sm:p-8 lg:p-10 font-sans select-none max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-neutral-800/80 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100">
          New Reconstruction
        </h1>
        <p className="text-neutral-400 text-sm">
          Upload a drone flight video to begin.
        </p>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Upload Validation Error:</span>
            <span>{uploadError}</span>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form Error Banner */}
      {formError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{formError}</span>
          </div>
          <button
            onClick={() => setFormError(null)}
            className="text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          LARGE DRAG-AND-DROP UPLOAD AREA
          Supports MP4, MOV, WebM with Drag & Drop, File Picker,
          File Name, File Size, Upload Progress, Remove, and Retry
      ========================================================================= */}
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-10 sm:p-14 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-amber-500 bg-amber-500/5 scale-[1.01]"
              : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/60"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-500 shadow-xl mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-neutral-100">
            Drag and drop your drone video here
          </h3>

          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-md">
            Supports <strong className="text-neutral-200">MP4</strong>, <strong className="text-neutral-200">MOV</strong>, or <strong className="text-neutral-200">WebM</strong> flight recordings up to {MAX_FILE_SIZE_MB}MB.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono text-xs transition-colors border border-neutral-700">
            <Film className="w-3.5 h-3.5 text-amber-400" />
            Browse Files
          </div>
        </div>
      ) : (
        /* Selected File Card with details, progress bar, remove and retry */
        <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <FileVideo className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-neutral-100 truncate">
                  {file.name}
                </div>
                <div className="text-xs font-mono text-neutral-400 flex items-center gap-2 mt-0.5">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span className="uppercase text-amber-400">
                    {file.name.split(".").pop()}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready for Ingestion
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRetry}
                title="Change or retry file"
                className="p-2 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1 text-xs font-mono"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Change</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveFile}
                title="Remove video file"
                className="p-2 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Upload Progress Bar */}
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>{isUploading ? "Uploading flight video to local engine..." : "Video verified"}</span>
              <span className="text-amber-400">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          AFTER SELECTING A VIDEO:
          Show:
          - Project Name
          - Description
          Then:
          - "Start Reconstruction"
      ========================================================================= */}
      {file && (
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 pb-3 border-b border-neutral-800">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>PROJECT METADATA CONFIGURATION</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Project Name Field */}
            <div>
              <label className="block text-neutral-300 mb-1.5 font-medium">
                PROJECT NAME *
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  if (formError) setFormError(null);
                }}
                disabled={isUploading}
                placeholder="e.g. Western Ghats Micro-Catchment Survey"
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs font-mono"
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-neutral-300 mb-1.5 font-medium">
                DESCRIPTION
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
                placeholder="Brief summary of the drone pass, terrain characteristics, and mapping objectives..."
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 transition-colors text-xs font-mono resize-none"
              />
            </div>
          </div>

          {/* Action Button: Start Reconstruction */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-800/80">
            <div className="text-[11px] font-mono text-neutral-500">
              Pipeline: <span className="text-neutral-300">Optical Flow $\to$ SIFT $\to$ Bundle Adjustment $\to$ Poisson TIN</span>
            </div>

            <button
              onClick={handleStartReconstruction}
              disabled={isUploading || !file}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 cursor-pointer hover:scale-[1.02]"
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Initiating Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-neutral-950" />
                  Start Reconstruction
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Pre-calibrated Demo Flights Helper (Quick fallback if user has no video file) */}
      {!file && (
        <div className="p-5 rounded-xl bg-neutral-900/30 border border-neutral-800 font-mono text-xs space-y-3">
          <div className="text-neutral-400 flex items-center justify-between">
            <span className="font-medium text-neutral-300">
              Don&apos;t have drone footage ready?
            </span>
            <span className="text-[10px] text-neutral-500">SIH 2026 PRESETS</span>
          </div>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            You can also test the system with pre-calibrated quarry and alpine ridge drone video passes:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                const sampleFile = new File(["demo-drone-footage-content"], "khadki_basalt_quarry_pass_4k.mp4", {
                  type: "video/mp4",
                });
                handleFileSelect(sampleFile);
                setProjectName("Khadki Basalt Quarry - Section 4");
                setDescription("High-resolution single-pass drone photogrammetry capturing terraced basalt quarry faces and haul ramps.");
              }}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Film className="w-3 h-3 text-amber-400" />
              Use Khadki Quarry Flight (MP4)
            </button>
            <button
              type="button"
              onClick={() => {
                const sampleFile = new File(["demo-drone-footage-content"], "zanskar_canyon_ridge_pass.mov", {
                  type: "video/quicktime",
                });
                handleFileSelect(sampleFile);
                setProjectName("Zanskar Canyon Alpine Ridge Survey");
                setDescription("High-relief single-pass corridor pass across 420m alpine canyon gradient.");
              }}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Film className="w-3 h-3 text-sky-400" />
              Use Zanskar Canyon Flight (MOV)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
