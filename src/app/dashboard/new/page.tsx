"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/image";
import {
  Upload,
  Video,
  Play,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Activity,
  HardDrive,
  FileCheck,
  Compass,
  AlertCircle,
  Clock,
  ArrowRight,
  Settings2
} from "lucide-react";
import { DEMO_PRESET_VIDEOS } from "@/lib/mockData";
import { ReconstructionProject, PipelineStage } from "@/lib/types";
import { saveProject } from "@/lib/projectStore";

export default function NewReconstructionPage() {
  const router = useRouter();

  // Wizard state
  const [selectedPresetId, setSelectedPresetId] = useState<string>("sample-quarry");
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("Khadki Quarry Corridor - Pass 04");
  const [locationName, setLocationName] = useState("Khadki Basalt Formation, Maharashtra");
  const [droneModel, setDroneModel] = useState("DJI Matrice 350 RTK");
  const [sensorType, setSensorType] = useState("Zenmuse P1 (45MP Full-Frame 35mm)");
  const [focalLength, setFocalLength] = useState("35.0");
  const [crs, setCrs] = useState("EPSG:32643 (WGS 84 / UTM Zone 43N)");
  const [qualityPreset, setQualityPreset] = useState<"ultra" | "balanced" | "fast">("ultra");

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [completedProjectId, setCompletedProjectId] = useState<string | null>(null);

  const selectedPreset = DEMO_PRESET_VIDEOS.find((p) => p.id === selectedPresetId);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomFile(file);
      setProjectName(`UAV Flight - ${file.name.replace(/\.[^/.]+$/, "")}`);
    }
  };

  const startReconstruction = () => {
    setIsProcessing(true);
    setCompletedProjectId(null);
    setCurrentStageIdx(0);
    setStageProgress(0);

    const stagesList: { name: string; category: PipelineStage["category"]; log: string }[] = [
      {
        name: "Hardware Video Decoding & Optical Flow Keyframing",
        category: "ingest",
        log: "NVDEC: Ingesting 4K 60fps single-pass stream... Extracting 368 high-overlap keyframes.",
      },
      {
        name: "SIFT Feature Matching & Epipolar Trajectory Filter",
        category: "sfm",
        log: "Detecting multi-scale keypoints... 1,248,900 feature correspondences matched.",
      },
      {
        name: "RTK Pose Graph Optimization & Bundle Adjustment",
        category: "sfm",
        log: "Solving camera poses... Levenberg-Marquardt converged. Reprojection RMSE: 0.62 px.",
      },
      {
        name: "Multi-View Stereo (MVS) Dense Depth Fusion",
        category: "mvs",
        log: "Executing patch-match stereo depth maps... 3,420,000 spatial points generated.",
      },
      {
        name: "Screened Poisson Surface Meshing & UV Texturing",
        category: "mesh",
        log: "Building watertight Delaunay-Poisson TIN mesh... 684,000 triangles texturized.",
      },
    ];

    setConsoleLogs([
      `[${new Date().toLocaleTimeString()}] INITIALIZING TERRARECON PIPELINE KERNEL v2.4`,
      `[${new Date().toLocaleTimeString()}] SENSOR: ${sensorType} | CRS: ${crs}`,
      `[${new Date().toLocaleTimeString()}] ACCELERATOR: NVIDIA CUDA / TENSORRT DETECTED`,
    ]);

    let stage = 0;
    let progress = 0;

    const interval = setInterval(() => {
      progress += 6;
      setStageProgress(Math.min(100, progress));

      if (progress >= 100) {
        progress = 0;
        setConsoleLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✓ ${stagesList[stage].log}`,
        ]);

        stage++;
        setCurrentStageIdx(stage);

        if (stage >= stagesList.length) {
          clearInterval(interval);

          // Build new project and persist
          const newId = `proj-flight-${Date.now().toString().slice(-5)}`;
          const newProject: ReconstructionProject = {
            id: newId,
            title: projectName || "Single-Pass Drone Flight Reconstructed",
            clientRef: `SIH-AUTO-${Math.floor(100 + Math.random() * 900)}`,
            description: `Single-pass continuous drone photogrammetry reconstruction completed with GSD 1.84 cm/px using ${sensorType}.`,
            locationName: locationName || "Field Survey Test Site",
            country: "India",
            coordinates: { lat: 18.7324, lng: 73.8567 },
            crs,
            areaHectares: 14.8,
            gsdCmPerPixel: 1.84,
            reprojectionErrorPx: 0.62,
            pointCloudSize: 3420000,
            triangleCount: 684000,
            status: "completed",
            progressPercent: 100,
            currentStage: "Reconstruction complete",
            droneModel,
            cameraSensor: sensorType,
            focalLengthMm: Number(focalLength) || 35.0,
            flightAltitudeM: 65.4,
            avgFlightSpeedMs: 5.2,
            captureDate: new Date().toLocaleDateString("en-GB") + " " + new Date().toLocaleTimeString("en-GB"),
            videoDurationSec: 184,
            fps: 60,
            totalVideoFrames: 5520,
            extractedKeyframes: 368,
            thumbnailUrl: selectedPreset?.thumbnail || "/images/quarry.jpg",
            elevation: {
              minM: 542.1,
              maxM: 628.7,
              avgM: 585.4,
            },
            stages: stagesList.map((stg, i) => ({
              id: `stg-${i + 1}`,
              name: stg.name,
              category: stg.category,
              status: "completed",
              progress: 100,
              durationSec: 12 + i * 8,
              logMessage: stg.log,
              details: "Solved using continuous motion parallax constraints.",
            })),
            telemetry: [
              { timeSec: 0, lat: 18.7321, lng: 73.8561, altitudeM: 65.0, speedMs: 5.1, pitchDeg: -35.2, rollDeg: 1.1, yawDeg: 42.0, frameIndex: 1, iso: 100, shutter: "1/1000s" },
              { timeSec: 45, lat: 18.7324, lng: 73.8565, altitudeM: 65.8, speedMs: 5.3, pitchDeg: -36.0, rollDeg: 0.8, yawDeg: 43.5, frameIndex: 1350, iso: 100, shutter: "1/1000s" },
              { timeSec: 90, lat: 18.7327, lng: 73.8569, altitudeM: 66.2, speedMs: 5.0, pitchDeg: -38.4, rollDeg: -0.5, yawDeg: 48.2, frameIndex: 2700, iso: 100, shutter: "1/1250s" },
              { timeSec: 135, lat: 18.7331, lng: 73.8574, altitudeM: 65.9, speedMs: 5.2, pitchDeg: -40.1, rollDeg: 1.4, yawDeg: 54.0, frameIndex: 4050, iso: 100, shutter: "1/1250s" },
              { timeSec: 184, lat: 18.7338, lng: 73.8585, altitudeM: 65.2, speedMs: 4.8, pitchDeg: -35.0, rollDeg: 0.2, yawDeg: 74.5, frameIndex: 5520, iso: 100, shutter: "1/1000s" },
            ],
            gcps: [
              { id: "gcp-1", name: "GCP-101 (Bench Alpha)", lat: 18.7322, lng: 73.8562, elevationM: 545.2, residualErrorM: 0.014 },
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
          setCompletedProjectId(newId);
          setIsProcessing(false);
        }
      }
    }, 180);
  };

  return (
    <div className="flex-1 bg-neutral-950 font-sans text-neutral-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>MISSION INGESTION</span>
            <span className="text-neutral-600">/</span>
            <span>SINGLE-PASS DRONE RECONSTRUCTION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100 mt-1">
            New 3D Terrain Reconstruction
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Ingest continuous video stream footage from a single drone corridor pass and recover dense 3D terrain geometry.
          </p>
        </div>

        {/* Processing Modal / Overlay if active */}
        {isProcessing && (
          <div className="p-6 rounded-xl bg-neutral-900 border border-amber-500/50 shadow-2xl font-mono text-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-amber-400 font-semibold">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                <span>PHOTOGRAMMETRY GPU PIPELINE ACTIVE</span>
              </div>
              <span className="text-neutral-400">
                Stage {Math.min(5, currentStageIdx + 1)} of 5
              </span>
            </div>

            {/* Current Stage title */}
            <div className="text-sm font-semibold text-neutral-100">
              {currentStageIdx === 0 && "Step 1: NVDEC Hardware Decoding & Motion-Compensated Keyframing"}
              {currentStageIdx === 1 && "Step 2: SIFT Feature Extraction & Epipolar Trajectory Constraints"}
              {currentStageIdx === 2 && "Step 3: Levenberg-Marquardt Bundle Adjustment & Pose Solvers"}
              {currentStageIdx === 3 && "Step 4: Multi-View Stereo (MVS) Dense Depth Field Matching"}
              {currentStageIdx === 4 && "Step 5: Screened Poisson Surface Meshing & Orthorectified UV Blending"}
              {currentStageIdx >= 5 && "Reconstruction Complete! Generating deliverables..."}
            </div>

            {/* Stage progress bar */}
            <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-150"
                style={{ width: `${stageProgress}%` }}
              />
            </div>

            {/* Live Terminal Log Stream */}
            <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-400 space-y-1.5 max-h-48 overflow-y-auto">
              <div className="text-neutral-500 pb-1 border-b border-neutral-900">
                [LIVE KERNEL STDOUT]
              </div>
              {consoleLogs.map((log, i) => (
                <div key={i} className="text-neutral-300">
                  {log}
                </div>
              ))}
              <div className="text-amber-400/80 animate-pulse">
                &gt; Processing frame buffer with CUDA stream #0... ({stageProgress}%)
              </div>
            </div>
          </div>
        )}

        {/* Completion Card */}
        {completedProjectId && (
          <div className="p-6 rounded-xl bg-neutral-900 border border-emerald-500/50 font-mono text-xs space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>3D RECONSTRUCTION SOLVED SUCCESSFULLY</span>
            </div>
            <p className="text-neutral-300">
              Your single-pass flight footage was processed into a 3D terrain model (3.42M dense points, 684k TIN triangles, 1.84 cm/px GSD).
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => router.push(`/dashboard/projects/${completedProjectId}`)}
                className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold font-mono text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                Launch 3D Terrain Model Explorer <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCompletedProjectId(null)}
                className="px-4 py-2.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-xs font-mono transition-colors"
              >
                Configure Another Pass
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Select Flight Video Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs font-mono text-amber-500">
                1
              </span>
              Select Drone Flight Video Input
            </h2>
            <span className="text-xs font-mono text-neutral-400">
              Pre-calibrated SIH benchmark datasets available
            </span>
          </div>

          {/* Preset Drone Flights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEMO_PRESET_VIDEOS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => {
                  setSelectedPresetId(preset.id);
                  setCustomFile(null);
                  if (preset.id === "sample-quarry") {
                    setProjectName("Khadki Quarry Corridor - Pass 04");
                    setLocationName("Khadki Basalt Formation, Maharashtra");
                    setSensorType("Zenmuse P1 (45MP Full-Frame 35mm)");
                    setFocalLength("35.0");
                  } else {
                    setProjectName("Zanskar Canyon Alpine Ridge - Single Pass");
                    setLocationName("Padum Gorge, Ladakh");
                    setSensorType("Sony RX0 II (20MP 1-inch)");
                    setFocalLength("24.0");
                  }
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedPresetId === preset.id && !customFile
                    ? "bg-neutral-900 border-amber-500 shadow-lg shadow-amber-500/10"
                    : "bg-neutral-900/40 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div>
                  <div className="relative h-32 w-full rounded-lg overflow-hidden mb-3 bg-neutral-800">
                    <Image
                      src={preset.thumbnail}
                      alt={preset.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-neutral-950/80 backdrop-blur font-mono text-[10px] text-amber-400 border border-neutral-700">
                      {preset.duration}
                    </div>
                  </div>

                  <h3 className="font-semibold text-neutral-100 text-sm">{preset.title}</h3>
                  <p className="text-xs text-neutral-400 mt-1">{preset.notes}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-800 font-mono text-[11px] text-neutral-400 flex items-center justify-between">
                  <span>{preset.sensor}</span>
                  <span className="text-neutral-500">{preset.resolution}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Or upload custom video file */}
          <div className="mt-3">
            <label className="border-2 border-dashed border-neutral-800 hover:border-neutral-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-neutral-950/40 transition-colors">
              <Upload className="w-8 h-8 text-neutral-500 mb-2" />
              <span className="text-xs font-mono text-neutral-300">
                {customFile ? (
                  <strong className="text-amber-400">{customFile.name} ({(customFile.size / 1024 / 1024).toFixed(1)} MB)</strong>
                ) : (
                  "Or click to upload custom drone video (MP4 / MOV / H.264)"
                )}
              </span>
              <span className="text-[11px] font-mono text-neutral-500 mt-1">
                Supports single-pass linear corridor or oblique flights up to 4K 60fps
              </span>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Step 2: Survey & Camera Metadata */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs font-mono text-amber-500">
              2
            </span>
            Photogrammetric Parameters & Coordinate Georeferencing
          </h2>

          <div className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="block text-neutral-400 mb-1.5">PROJECT / MISSION TITLE</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1.5">LOCATION / REGION</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1.5">UAV DRONE AIRFRAME</label>
              <select
                value={droneModel}
                onChange={(e) => setDroneModel(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500"
              >
                <option value="DJI Matrice 350 RTK">DJI Matrice 350 RTK</option>
                <option value="IdeaForge SWITCH UAV">IdeaForge SWITCH UAV</option>
                <option value="Skydio X2 Color/Thermal">Skydio X2 Color/Thermal</option>
                <option value="Custom Fixed-Wing VTOL">Custom Fixed-Wing VTOL</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1.5">OPTICAL SENSOR & PAYLOAD</label>
              <select
                value={sensorType}
                onChange={(e) => setSensorType(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Zenmuse P1 (45MP Full-Frame 35mm)">Zenmuse P1 (45MP Full-Frame 35mm)</option>
                <option value="Sony RX0 II (20MP 1-inch)">Sony RX0 II (20MP 1-inch)</option>
                <option value="Dual 12MP 4K HDR">Dual 12MP 4K HDR</option>
                <option value="Zenmuse L1 LiDAR + RGB">Zenmuse L1 LiDAR + RGB</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1.5">COORDINATE REFERENCE SYSTEM (CRS)</label>
              <select
                value={crs}
                onChange={(e) => setCrs(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500"
              >
                <option value="EPSG:32643 (WGS 84 / UTM Zone 43N)">EPSG:32643 (WGS 84 / UTM Zone 43N)</option>
                <option value="EPSG:32644 (WGS 84 / UTM Zone 44N)">EPSG:32644 (WGS 84 / UTM Zone 44N)</option>
                <option value="EPSG:4326 (WGS 84 Geographic 2D)">EPSG:4326 (WGS 84 Geographic 2D)</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1.5">DENSITY RESOLUTION PRESET</label>
              <select
                value={qualityPreset}
                onChange={(e) => setQualityPreset(e.target.value as any)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ultra">Ultra Density (1.8 cm GSD • Poisson Octree 11)</option>
                <option value="balanced">Balanced Survey (3.2 cm GSD • Poisson Octree 9)</option>
                <option value="fast">Rapid Field Preview (5.5 cm GSD • Poisson Octree 8)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Launch Button */}
        <div className="pt-2 flex items-center justify-end gap-4">
          <button
            onClick={startReconstruction}
            disabled={isProcessing}
            className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold font-mono text-xs flex items-center gap-2 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 hover:scale-[1.02]"
          >
            <Play className="w-4 h-4 fill-neutral-950" />
            Run Single-Pass Reconstruction Pipeline
          </button>
        </div>
      </div>
    </div>
  );
}
