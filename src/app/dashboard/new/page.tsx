"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileVideo,
  X,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Play,
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

  // Project form fields
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
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleStartReconstruction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!file) {
      setFormError("Please upload a drone flight video before starting reconstruction.");
      return;
    }

    if (!projectName.trim()) {
      setFormError("Please enter a name for this reconstruction project.");
      return;
    }

    setIsUploading(true);

    try {
      const projectId = `proj-${Date.now()}`;
      await videoStorage.saveVideo(projectId, file);

      const initialStages: PipelineStage[] = [
        {
          id: "stg-1",
          name: "Video Ingestion & Hardware Decoding",
          category: "ingest",
          status: "processing",
          progress: 15,
          durationSec: 1,
          details: "Hardware NVDEC decoding initialized. Verifying metadata and frame rate.",
          logMessage: `Uploaded ${file.name} (${formatFileSize(file.size)}) registered for single-pass ingestion.`,
        },
        {
          id: "stg-2",
          name: "Optical Flow & Keyframe Extraction",
          category: "ingest",
          status: "pending",
          progress: 0,
          durationSec: 0,
          logMessage: "Pending keyframe extraction",
          details: "Dynamic motion blur rejection and 80% longitudinal overlap filtering.",
        },
        {
          id: "stg-3",
          name: "SIFT Feature Detection & Geometric Verification",
          category: "sfm",
          status: "pending",
          progress: 0,
          durationSec: 0,
          logMessage: "Pending feature detection",
          details: "Scale-Invariant Feature Transform with epipolar correspondence matching.",
        },
        {
          id: "stg-4",
          name: "Structure from Motion & Camera Pose Solver",
          category: "sfm",
          status: "pending",
          progress: 0,
          durationSec: 0,
          logMessage: "Pending camera pose solver",
          details: "Incremental bundle adjustment estimating 3D camera trajectory.",
        },
        {
          id: "stg-5",
          name: "Multi-View Stereo Dense Cloud Generation",
          category: "mvs",
          status: "pending",
          progress: 0,
          durationSec: 0,
          logMessage: "Pending point cloud generation",
          details: "PatchMatch dense stereo matching generating high-density elevation points.",
        },
        {
          id: "stg-6",
          name: "Poisson Surface Meshing & TIN Optimization",
          category: "mesh",
          status: "pending",
          progress: 0,
          durationSec: 0,
          logMessage: "Pending mesh generation",
          details: "Screened Poisson surface reconstruction with Delaunay triangulation.",
        },
        {
          id: "stg-7",
          name: "Texture Projection & Orthorectification",
          category: "ortho",
          status: "pending",
          progress: 0,
          durationSec: 0,
          logMessage: "Pending orthorectification",
          details: "Multi-band seamless texture blending and ortho-rectification projection.",
        },
      ];

      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const newProject: ReconstructionProject = {
        id: projectId,
        title: projectName.trim(),
        clientRef: `UAV-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        description: description.trim() || `Single-pass drone photogrammetry reconstruction (${file.name}).`,
        sourceVideoName: file.name,
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
        status: "processing",
        progressPercent: 12,
        currentStage: "Video Ingestion & Hardware Decoding",
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

      saveProject(newProject);
      router.push(`/dashboard/projects/${projectId}/processing`);
    } catch (err: any) {
      console.error("Reconstruction initialization failed:", err);
      setFormError("Could not initiate reconstruction pipeline. Please try again.");
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 p-6 sm:p-8 lg:p-10 font-sans select-none max-w-4xl mx-auto space-y-8 bg-[#080B0A] text-[#F1F4F2]">
      {/* Header */}
      <div className="pb-6 border-b border-[#26302C] space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F1F4F2]">
          New Reconstruction
        </h1>
        <p className="text-[#9BA6A1] text-sm">
          Upload a drone flight video to initiate single-pass 3D reconstruction.
        </p>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-4 rounded-[8px] bg-[#B87575]/15 border border-[#B87575]/35 text-[#B87575] font-mono text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Upload Validation Error:</span>
            <span>{uploadError}</span>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-[#B87575] hover:text-[#F1F4F2] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form Error Banner */}
      {formError && (
        <div className="p-4 rounded-[8px] bg-[#B87575]/15 border border-[#B87575]/35 text-[#B87575] font-mono text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{formError}</span>
          </div>
          <button
            onClick={() => setFormError(null)}
            className="text-[#B87575] hover:text-[#F1F4F2] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Large Technical Drag-and-Drop Area */}
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-[14px] border-2 border-dashed p-10 sm:p-14 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-[#78AFA2] bg-[#78AFA2]/5 scale-[1.01]"
              : "border-[#26302C] bg-[#121916] hover:border-[#78AFA2]/70 hover:bg-[#121916]/80"
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

          <div className="w-14 h-14 rounded-[12px] bg-[#0D1210] border border-[#26302C] flex items-center justify-center text-[#78AFA2] shadow-lg mb-4">
            <Camera className="w-7 h-7" />
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-[#F1F4F2]">
            Drag and drop your drone video here
          </h3>

          <p className="text-xs sm:text-sm text-[#9BA6A1] mt-1 max-w-md">
            Supports <strong className="text-[#F1F4F2]">MP4</strong>, <strong className="text-[#F1F4F2]">MOV</strong>, or <strong className="text-[#F1F4F2]">WebM</strong> flight recordings up to {MAX_FILE_SIZE_MB}MB.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-[#0D1210] hover:bg-[#17211d] text-[#F1F4F2] font-mono text-xs transition-colors border border-[#26302C]">
            <Film className="w-3.5 h-3.5 text-[#78AFA2]" />
            Browse Files
          </div>
        </div>
      ) : (
        /* Selected File Card */
        <div className="p-6 rounded-[14px] bg-[#121916] border border-[#26302C] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-[10px] bg-[#0D1210] border border-[#26302C] flex items-center justify-center text-[#78AFA2] shrink-0">
                <FileVideo className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#F1F4F2] truncate">
                  {file.name}
                </div>
                <div className="text-xs font-mono text-[#9BA6A1] flex items-center gap-2 mt-0.5">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span className="uppercase text-[#78AFA2]">
                    {file.name.split(".").pop()}
                  </span>
                  <span>•</span>
                  <span className="text-[#7FAE8D] flex items-center gap-1">
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
                className="h-8 px-3 text-[#9BA6A1] hover:text-[#F1F4F2] rounded-[6px] hover:bg-[#0D1210] transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Change</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveFile}
                title="Remove video file"
                className="p-1.5 text-[#68736E] hover:text-[#B87575] rounded-[6px] hover:bg-[#0D1210] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Upload Progress Bar */}
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-[#9BA6A1]">
              <span>{isUploading ? "Uploading flight video to local engine..." : "Video verified"}</span>
              <span className="text-[#78AFA2]">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-[#0D1210] h-2 rounded-[4px] overflow-hidden border border-[#26302C]">
              <div
                className="bg-[#78AFA2] h-full rounded-[4px] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Project Metadata Configuration Card */}
      {file && (
        <div className="p-6 rounded-[14px] bg-[#121916] border border-[#26302C] space-y-6">
          <div className="flex items-center gap-2 font-mono text-xs text-[#9BA6A1] pb-3 border-b border-[#26302C]">
            <Layers className="w-4 h-4 text-[#78AFA2]" />
            <span>PROJECT METADATA CONFIGURATION</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Project Name Field */}
            <div>
              <label className="block text-[#F1F4F2] mb-1.5 font-medium">
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
                className="w-full px-3.5 py-2.5 bg-[#0D1210] border border-[#26302C] rounded-[8px] text-[#F1F4F2] placeholder:text-[#68736E] focus:outline-none focus:border-[#78AFA2] transition-colors text-xs font-mono"
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-[#F1F4F2] mb-1.5 font-medium">
                DESCRIPTION
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
                placeholder="Brief summary of the drone pass, terrain characteristics, and mapping objectives..."
                className="w-full px-3.5 py-2.5 bg-[#0D1210] border border-[#26302C] rounded-[8px] text-[#F1F4F2] placeholder:text-[#68736E] focus:outline-none focus:border-[#78AFA2] transition-colors text-xs font-mono resize-none"
              />
            </div>
          </div>

          {/* Action Button: Start Reconstruction */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#26302C]">
            <div className="text-[11px] font-mono text-[#68736E]">
              Pipeline: <span className="text-[#9BA6A1]">Optical Flow $\to$ SIFT $\to$ Pose Solver $\to$ 3D Mesh</span>
            </div>

            <button
              onClick={handleStartReconstruction}
              disabled={isUploading || !file}
              className="w-full sm:w-auto h-11 px-6 rounded-[8px] bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-semibold font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#080B0A] border-t-transparent rounded-full animate-spin" />
                  <span>Initiating Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-[#080B0A]" />
                  Start Reconstruction
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Pre-calibrated Demo Flights Helper */}
      {!file && (
        <div className="p-5 rounded-[12px] bg-[#121916] border border-[#26302C] font-mono text-xs space-y-3">
          <div className="text-[#9BA6A1] flex items-center justify-between">
            <span className="font-medium text-[#F1F4F2]">
              Don&apos;t have drone footage ready?
            </span>
            <span className="text-[10px] text-[#68736E]">SIH 2026 PRESETS</span>
          </div>
          <p className="text-[11px] text-[#68736E] leading-relaxed">
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
              className="h-9 px-3.5 rounded-[8px] bg-[#0D1210] hover:bg-[#17211d] border border-[#26302C] hover:border-[#78AFA2] text-[#F1F4F2] text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Film className="w-3 h-3 text-[#78AFA2]" />
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
              className="h-9 px-3.5 rounded-[8px] bg-[#0D1210] hover:bg-[#17211d] border border-[#26302C] hover:border-[#78AFA2] text-[#F1F4F2] text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Film className="w-3 h-3 text-[#78AFA2]" />
              Use Zanskar Canyon Flight (MOV)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
