"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Download,
  Share2,
  Layers,
  Sparkles,
  Activity,
  Compass,
  MapPin,
  Camera,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sliders,
  Table,
  Cpu,
  FileText,
  TrendingUp,
  Maximize2
} from "lucide-react";
import { ReconstructionProject } from "@/lib/types";
import { getProjectById } from "@/lib/projectStore";
import { TerrainViewer } from "@/components/viewer/TerrainViewer";
import { ExportModal } from "@/components/project/ExportModal";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [project, setProject] = useState<ReconstructionProject | null>(null);
  const [selectedKeyframeIndex, setSelectedKeyframeIndex] = useState(0);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "stages" | "gcps" | "telemetry">("overview");

  useEffect(() => {
    const found = getProjectById(resolvedParams.id);
    if (found) {
      setProject(found);
    }
  }, [resolvedParams.id]);

  if (!project) {
    return (
      <div className="flex-1 bg-neutral-950 flex items-center justify-center font-mono text-xs text-neutral-400 p-8">
        <div className="space-y-3 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
          <div>LOADING GEOSPATIAL DATASET: {resolvedParams.id}...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-neutral-950 font-sans text-neutral-100 flex flex-col">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="border-b border-neutral-800 bg-neutral-950/80 px-4 sm:px-6 py-3 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/projects"
              className="p-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                <span>PROJECT ID: {project.id}</span>
                <span className="text-neutral-600">|</span>
                <span className="text-amber-400">{project.crs}</span>
              </div>
              <h1 className="text-lg font-semibold text-neutral-100 truncate">
                {project.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`px-2.5 py-1 rounded font-mono text-xs border ${
                project.status === "completed"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-amber-500/20 text-amber-400 border-amber-500/40"
              }`}
            >
              {project.status.toUpperCase()}
            </span>

            <button
              onClick={() => setIsExportOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold font-mono text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              Export Model & Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Inspection Suite */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Interactive 3D Terrain & Telemetry Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 text-neutral-200">
              <Compass className="w-4 h-4 text-amber-500" />
              Interactive Photogrammetric 3D Scene
            </span>
            <span className="text-[11px] text-neutral-500 hidden sm:inline">
              Controls: Left Click to Orbit • Right Click to Pan • Scroll to Zoom
            </span>
          </div>

          <TerrainViewer
            project={project}
            selectedKeyframeIndex={selectedKeyframeIndex}
            onKeyframeChange={setSelectedKeyframeIndex}
            onOpenExportModal={() => setIsExportOpen(true)}
          />
        </div>

        {/* Tabbed Engineering Details Section */}
        <div className="border border-neutral-800 rounded-xl bg-neutral-900/60 overflow-hidden font-sans">
          {/* Tab headers */}
          <div className="flex items-center border-b border-neutral-800 bg-neutral-950/80 px-4 font-mono text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 px-4 border-b-2 font-medium transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === "overview"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Mission Specs & Demographics
            </button>
            <button
              onClick={() => setActiveTab("stages")}
              className={`py-3 px-4 border-b-2 font-medium transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === "stages"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Photogrammetry Pipeline Log ({project.stages.length})
            </button>
            <button
              onClick={() => setActiveTab("gcps")}
              className={`py-3 px-4 border-b-2 font-medium transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === "gcps"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              GCP Georeferencing Accuracy
            </button>
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`py-3 px-4 border-b-2 font-medium transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === "telemetry"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Synchronized Frame Telemetry ({project.telemetry.length})
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Flight & Sensor parameters */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="text-neutral-300 font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-500" />
                    UAV & Sensor Configuration
                  </div>
                  <div className="p-4 rounded-lg bg-neutral-950/80 border border-neutral-800 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Drone Airframe:</span>
                      <span className="text-neutral-200 font-semibold">{project.droneModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Optics / Sensor:</span>
                      <span className="text-neutral-200">{project.cameraSensor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Focal Length:</span>
                      <span className="text-neutral-200">{project.focalLengthMm} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Flight Altitude:</span>
                      <span className="text-neutral-200">{project.flightAltitudeM} m AGL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Average Velocity:</span>
                      <span className="text-neutral-200">{project.avgFlightSpeedMs} m/s</span>
                    </div>
                  </div>
                </div>

                {/* Accuracy & Geometry Stats */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="text-neutral-300 font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Reconstruction Quality & GSD
                  </div>
                  <div className="p-4 rounded-lg bg-neutral-950/80 border border-neutral-800 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Ground Sample Dist (GSD):</span>
                      <span className="text-amber-400 font-semibold">{project.gsdCmPerPixel} cm/pixel</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Reprojection Error:</span>
                      <span className="text-emerald-400 font-semibold">{project.reprojectionErrorPx} px RMSE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Dense 3D Points:</span>
                      <span className="text-neutral-200">{(project.pointCloudSize / 1000000).toFixed(2)} Million</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">TIN Triangles:</span>
                      <span className="text-neutral-200">{(project.triangleCount / 1000).toFixed(0)}k facets</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Elevation Relief:</span>
                      <span className="text-neutral-200">
                        {project.elevation.minM}m - {project.elevation.maxM}m (Δ {(project.elevation.maxM - project.elevation.minM).toFixed(1)}m)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coordinate Georeferencing */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="text-neutral-300 font-semibold uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    Geodetic Coordinate Envelope
                  </div>
                  <div className="p-4 rounded-lg bg-neutral-950/80 border border-neutral-800 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">CRS Standard:</span>
                      <span className="text-neutral-200">{project.crs.split(" ")[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Centroid Lat:</span>
                      <span className="text-neutral-200">{project.coordinates.lat}° N</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Centroid Lng:</span>
                      <span className="text-neutral-200">{project.coordinates.lng}° E</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Survey Footprint:</span>
                      <span className="text-neutral-200">{project.areaHectares} Hectares</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Keyframe Ratio:</span>
                      <span className="text-neutral-200">{project.extractedKeyframes} / {project.totalVideoFrames} frames</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Technical Summary */}
              <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                <span className="text-neutral-400 font-mono uppercase tracking-wider font-semibold">
                  Field Survey Abstract:
                </span>
                <p className="text-neutral-300 leading-relaxed">
                  {project.description} This single-pass continuous video capture was ingested through the GPU hardware decoder pipeline, applying feature trajectory constraints to calibrate camera focal shift and solve structure-from-motion without requiring cross-grid survey lines.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Stages */}
          {activeTab === "stages" && (
            <div className="p-6 space-y-4">
              <div className="text-xs font-mono text-neutral-400">
                Single-pass deterministic photogrammetry execution trace:
              </div>
              <div className="space-y-3 font-mono text-xs">
                {project.stages.map((stage, idx) => (
                  <div
                    key={stage.id}
                    className="p-4 rounded-lg bg-neutral-950/80 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 font-semibold">STAGE {idx + 1}:</span>
                        <span className="text-neutral-200 font-medium">{stage.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400">
                          {stage.category.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-neutral-400 text-xs">{stage.logMessage}</p>
                      <p className="text-neutral-500 text-[11px]">{stage.details}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                      </span>
                      <span className="text-neutral-500 text-[11px]">({stage.durationSec}s)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: GCPs */}
          {activeTab === "gcps" && (
            <div className="p-6 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">
                  Ground Control Point (GCP) RTK Verification Residuals:
                </span>
                <span className="text-emerald-400 text-[11px]">
                  Total Mean Residual: &lt; 0.021 m (2.1 cm)
                </span>
              </div>

              {project.gcps.length > 0 ? (
                <div className="rounded-lg border border-neutral-800 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] border-b border-neutral-800">
                      <tr>
                        <th className="py-2.5 px-4">GCP ID</th>
                        <th className="py-2.5 px-4">Description</th>
                        <th className="py-2.5 px-4">Latitude</th>
                        <th className="py-2.5 px-4">Longitude</th>
                        <th className="py-2.5 px-4">Elevation</th>
                        <th className="py-2.5 px-4 text-right">Residual Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/80 bg-neutral-950/60">
                      {project.gcps.map((gcp) => (
                        <tr key={gcp.id}>
                          <td className="py-2.5 px-4 text-amber-400 font-semibold">{gcp.id}</td>
                          <td className="py-2.5 px-4 text-neutral-300">{gcp.name}</td>
                          <td className="py-2.5 px-4 text-neutral-400">{gcp.lat}°</td>
                          <td className="py-2.5 px-4 text-neutral-400">{gcp.lng}°</td>
                          <td className="py-2.5 px-4 text-neutral-300">{gcp.elevationM} m</td>
                          <td className="py-2.5 px-4 text-right text-emerald-400">
                            {(gcp.residualErrorM * 100).toFixed(1)} cm
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-500">
                  Direct georeferenced via RTK onboard telemetry without terrestrial GCP stakes.
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Telemetry */}
          {activeTab === "telemetry" && (
            <div className="p-6 space-y-4 font-mono text-xs">
              <div className="text-neutral-400">
                Drone flight state synchronized with camera shutter frames:
              </div>
              <div className="rounded-lg border border-neutral-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] border-b border-neutral-800">
                    <tr>
                      <th className="py-2 px-3">Frame #</th>
                      <th className="py-2 px-3">Time (s)</th>
                      <th className="py-2 px-3">Altitude AGL</th>
                      <th className="py-2 px-3">Speed</th>
                      <th className="py-2 px-3">Pitch / Roll</th>
                      <th className="py-2 px-3">Exposure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80 bg-neutral-950/60">
                    {project.telemetry.map((pt, i) => (
                      <tr
                        key={i}
                        className={`cursor-pointer transition-colors ${
                          i === selectedKeyframeIndex ? "bg-amber-500/20 text-amber-200" : "hover:bg-neutral-800/40"
                        }`}
                        onClick={() => setSelectedKeyframeIndex(i)}
                      >
                        <td className="py-2 px-3 text-neutral-200 font-semibold">#{pt.frameIndex}</td>
                        <td className="py-2 px-3 text-neutral-400">{pt.timeSec}s</td>
                        <td className="py-2 px-3 text-neutral-300">{pt.altitudeM.toFixed(1)}m</td>
                        <td className="py-2 px-3 text-neutral-300">{pt.speedMs.toFixed(1)}m/s</td>
                        <td className="py-2 px-3 text-neutral-400">{pt.pitchDeg}° / {pt.rollDeg}°</td>
                        <td className="py-2 px-3 text-neutral-500">{pt.shutter} ISO {pt.iso}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Deliverables Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
      />
    </div>
  );
}
