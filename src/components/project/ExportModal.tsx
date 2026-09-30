"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  FileCode,
  Layers,
  MapPin,
  CheckCircle,
  FileText,
  Database,
  ArrowRight,
  HardDrive
} from "lucide-react";
import { ReconstructionProject } from "@/lib/types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ReconstructionProject;
}

export function ExportModal({ isOpen, onClose, project }: ExportModalProps) {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = (format: string, filename: string, contentMock: string) => {
    setDownloadingFormat(format);
    setDownloadedFormat(null);

    setTimeout(() => {
      // Create real downloadable blob
      const blob = new Blob([contentMock], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadingFormat(null);
      setDownloadedFormat(format);
      setTimeout(() => setDownloadedFormat(null), 3500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div>
            <h3 className="text-lg font-medium text-neutral-100 flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-500" />
              Export Geospatial Products
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Project: {project.title} • {project.crs}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 3D Surface Meshes */}
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              3D Surface Models & Meshes
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex flex-col justify-between hover:border-neutral-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-200 text-sm">Wavefront OBJ + MTL</span>
                    <span className="text-[11px] font-mono text-neutral-400">{project.artifacts.objMeshSizeMb} MB</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Triangulated mesh with 8K UV texture maps. Compatible with Blender, Unreal Engine, ArcGIS 3D.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleDownload(
                      "obj",
                      `${project.id}_mesh.obj`,
                      `# TerraRecon v2.4 OBJ Export\n# Project: ${project.title}\n# CRS: ${project.crs}\n# Triangle Count: ${project.triangleCount}\n# GSD: ${project.gsdCmPerPixel} cm/px\nv 0.000 0.000 0.000\nv 1.000 0.000 0.000\nv 0.000 1.000 0.000\nvn 0.0 1.0 0.0\nf 1//1 2//1 3//1\n`
                    )
                  }
                  disabled={downloadingFormat === "obj"}
                  className="mt-3 w-full py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                >
                  {downloadingFormat === "obj" ? (
                    <span className="animate-pulse">Packaging Archive...</span>
                  ) : downloadedFormat === "obj" ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Download Complete
                    </span>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" /> Download OBJ Package
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex flex-col justify-between hover:border-neutral-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-200 text-sm">GLTF / GLB Binary</span>
                    <span className="text-[11px] font-mono text-neutral-400">{(project.artifacts.objMeshSizeMb * 0.7).toFixed(1)} MB</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Lightweight web-ready PBR mesh format for CesiumJS, three.js, and augmented reality viewers.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleDownload(
                      "glb",
                      `${project.id}_model.glb`,
                      `glTF-Binary-TerraRecon-Simulated-Payload-Project-${project.id}`
                    )
                  }
                  disabled={downloadingFormat === "glb"}
                  className="mt-3 w-full py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                >
                  {downloadingFormat === "glb" ? (
                    <span className="animate-pulse">Exporting GLB...</span>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" /> Download GLB
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Point Clouds */}
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              Georeferenced Point Clouds
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex flex-col justify-between hover:border-neutral-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-200 text-sm">ASPRS LAS / LAZ 1.4</span>
                    <span className="text-[11px] font-mono text-neutral-400">{project.artifacts.lasCloudSizeMb} MB</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Industry-standard LiDAR & photogrammetric point cloud with RGB values, intensity, and GPS timestamps.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleDownload(
                      "las",
                      `${project.id}_points.laz`,
                      `LASF_TerraRecon_Dense_Cloud_CRS_${project.crs}_Points_${project.pointCloudSize}`
                    )
                  }
                  disabled={downloadingFormat === "las"}
                  className="mt-3 w-full py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                >
                  {downloadingFormat === "las" ? (
                    <span className="animate-pulse">Compressing LAZ...</span>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" /> Download LAZ
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex flex-col justify-between hover:border-neutral-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-200 text-sm">Stanford PLY (Color)</span>
                    <span className="text-[11px] font-mono text-neutral-400">{project.artifacts.plyCloudSizeMb} MB</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Dense RGB point cloud format for CloudCompare, MeshLab, and scientific point processing.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleDownload(
                      "ply",
                      `${project.id}_dense.ply`,
                      `ply\nformat ascii 1.0\ncomment TerraRecon dense cloud export\nelement vertex ${project.pointCloudSize}\nproperty float x\nproperty float y\nproperty float z\nproperty uchar red\nproperty uchar green\nproperty uchar blue\nend_header\n0.0 0.0 0.0 255 255 255\n`
                    )
                  }
                  disabled={downloadingFormat === "ply"}
                  className="mt-3 w-full py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download PLY
                </button>
              </div>
            </div>
          </div>

          {/* GIS Rasters & Quality Report */}
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              GIS Rasters & QA/QC Survey Report
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex flex-col justify-between hover:border-neutral-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-200 text-sm">GeoTIFF DEM & Ortho</span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {(project.artifacts.geotiffDemMb + project.artifacts.orthomosaicMb).toFixed(0)} MB
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    32-bit floating point elevation raster (DEM) and georeferenced orthomosaic TIFF with worldfiles (.tfw).
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleDownload(
                      "geotiff",
                      `${project.id}_dem_ortho_bundle.zip`,
                      `GeoTIFF Bundle Metadata\nProject: ${project.title}\nResolution: ${project.gsdCmPerPixel} cm/pixel\nBounds: [${project.coordinates.lat}, ${project.coordinates.lng}]`
                    )
                  }
                  className="mt-3 w-full py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download GeoTIFF Pack
                </button>
              </div>

              <div className="p-4 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex flex-col justify-between hover:border-neutral-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-200 text-sm">SIH Photogrammetry QA Report</span>
                    <span className="text-[11px] font-mono text-neutral-400">PDF (2.4 MB)</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Complete engineering audit report including GCP residuals, camera calibration parameters, overlap map, and flight telemetry.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleDownload(
                      "pdf",
                      `${project.id}_QA_QC_Report.txt`,
                      `=================================================================\nTERRARECON SINGLE-PASS DRONE 3D RECONSTRUCTION REPORT\nPROTOTYPE DEMONSTRATION WORKFLOW\n=================================================================\nProject: ${project.title}\nSource Video: ${project.sourceVideoName || "Uploaded Drone Flight Footage"}\nClient Reference: ${project.clientRef || "UAV-DEMO"}\nDate: ${project.captureDate}\nLocation: ${project.locationName || "Corridor Sector"}\n\nSPECIFICATIONS:\n- Drone Airframe: ${project.droneModel || "Survey UAV"}\n- Camera / Sensor: ${project.cameraSensor || "Optical Sensor"}\n- Status: ${project.status.toUpperCase()}\n- Model Type: Explorable 3D Terrain Model (Terrain, Point Cloud, Wireframe)\n\nRECONSTRUCTION PIPELINE SUMMARY:\n- 01 Video Ingestion\n- 02 Frame Extraction\n- 03 Feature Detection\n- 04 Feature Matching\n- 05 Camera Pose Estimation\n- 06 Point Cloud Generation\n- 07 Mesh Generation\n- 08 3D Terrain Ready\n\nNotice: High-fidelity procedural 3D terrain environment demonstrating interactive model exploration for the SIH 2026 prototype.\n=================================================================`
                    )
                  }
                  className="mt-3 w-full py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded text-xs font-mono flex items-center justify-center gap-1.5 transition-colors font-medium"
                >
                  <Download className="w-3.5 h-3.5" /> Download Survey Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-neutral-800 bg-neutral-950 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-neutral-400" />
            Total Deliverable Size:{" "}
            <span className="text-neutral-200">
              {(
                project.artifacts.objMeshSizeMb +
                project.artifacts.lasCloudSizeMb +
                project.artifacts.geotiffDemMb +
                project.artifacts.orthomosaicMb
              ).toFixed(1)}{" "}
              MB
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
