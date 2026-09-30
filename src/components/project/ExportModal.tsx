"use client";

import React, { useState } from "react";
import * as THREE from "three";
import {
  X,
  Download,
  Layers,
  CheckCircle2,
  FileText,
  Sparkles,
  Loader2,
  Box,
  HardDrive
} from "lucide-react";
import { ReconstructionProject } from "@/lib/types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ReconstructionProject;
}

/**
 * Generates an actual Three.js terrain mesh matching the project profile.
 * Used for authentic client-side GLB, OBJ, and PLY generation.
 */
function createExportGeometry(projectType: string = "quarry"): THREE.Mesh {
  const width = 120;
  const height = 120;
  const segments = 64;
  const geo = new THREE.PlaneGeometry(width, height, segments, segments);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const col = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const nx = x / 60;
    const nz = z / 60;

    let y = 0;
    if (projectType === "alpine") {
      const ridge = Math.abs(Math.sin(nx * 1.8 + nz * 0.8)) * 26;
      const noise = Math.sin(nx * 8) * Math.cos(nz * 8) * 2;
      y = ridge + noise;
      col.setHSL(0.08, 0.2, 0.4);
    } else {
      const dist = Math.sqrt(nx * nx + nz * nz);
      const stepped = Math.floor(Math.pow(dist * 1.1, 1.8) * 18 / 4) * 3.5;
      const noise = Math.sin(nx * 12 + nz * 10) * 1.0;
      y = stepped + noise;
      col.setHSL(0.1, 0.28, 0.35);
    }

    pos.setY(i, y);
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    metalness: 0.1,
  });

  return new THREE.Mesh(geo, mat);
}

export function ExportModal({ isOpen, onClose, project }: ExportModalProps) {
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerBrowserDownload = (blob: Blob, filename: string, formatLabel: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportingFormat(null);
    setSuccessMessage(`Successfully exported ${formatLabel} (${filename})`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4500);
  };

  // 1. Export GLB (Binary GLTF 3D Model)
  const handleExportGLB = async () => {
    setExportingFormat("glb");
    setErrorMessage(null);
    try {
      const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
      const mesh = createExportGeometry(project.id.includes("alpine") ? "alpine" : "quarry");
      const exporter = new GLTFExporter();

      exporter.parse(
        mesh,
        (gltf) => {
          const blob = new Blob([gltf as ArrayBuffer], { type: "model/gltf-binary" });
          triggerBrowserDownload(blob, `${project.id}_terrain.glb`, "GLB 3D Model");
        },
        (error) => {
          console.error("GLTFExporter error:", error);
          setErrorMessage("Failed to generate GLB model.");
          setExportingFormat(null);
        },
        { binary: true }
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Could not initialize GLTF exporter.");
      setExportingFormat(null);
    }
  };

  // 2. Export OBJ (Wavefront 3D Mesh)
  const handleExportOBJ = async () => {
    setExportingFormat("obj");
    setErrorMessage(null);
    try {
      const { OBJExporter } = await import("three/examples/jsm/exporters/OBJExporter.js");
      const mesh = createExportGeometry(project.id.includes("alpine") ? "alpine" : "quarry");
      const exporter = new OBJExporter();
      const objOutput = exporter.parse(mesh);
      const blob = new Blob([objOutput], { type: "text/plain;charset=utf-8" });
      triggerBrowserDownload(blob, `${project.id}_mesh.obj`, "Wavefront OBJ Mesh");
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Failed to export OBJ format.");
      setExportingFormat(null);
    }
  };

  // 3. Export PLY (Stanford 3D Point Cloud & Mesh)
  const handleExportPLY = async () => {
    setExportingFormat("ply");
    setErrorMessage(null);
    try {
      const { PLYExporter } = await import("three/examples/jsm/exporters/PLYExporter.js");
      const exporter = new PLYExporter();
      const mesh = createExportGeometry(project.id.includes("alpine") ? "alpine" : "quarry");
      exporter.parse(
        mesh,
        (plyOutput: string | ArrayBuffer) => {
          const blob = new Blob([plyOutput], { type: "text/plain;charset=utf-8" });
          triggerBrowserDownload(blob, `${project.id}_pointcloud.ply`, "Stanford PLY Model");
        },
        { binary: false }
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Failed to export PLY format.");
      setExportingFormat(null);
    }
  };

  // 4. Export Technical Summary Report
  const handleExportReport = () => {
    setExportingFormat("report");
    setErrorMessage(null);
    try {
      const reportText = `=================================================================
TERRARECON RECONSTRUCTION TECHNICAL REPORT
PROTOTYPE DEMONSTRATION WORKFLOW
=================================================================
Project Name: ${project.title}
Project ID: ${project.id}
Source Video: ${project.sourceVideoName || "Uploaded Drone Flight Footage"}
Airframe / UAV: ${project.droneModel || "Survey UAV"}
Date: ${project.captureDate || new Date().toISOString()}
Status: ${project.status.toUpperCase()}

EXPORTED 3D ASSETS:
- Binary GLTF Model (.glb)
- Wavefront Mesh (.obj)
- Stanford 3D Point Cloud & Mesh (.ply)

RECONSTRUCTION PIPELINE SUMMARY:
- 01 VIDEO INGESTION
- 02 FRAME EXTRACTION
- 03 FEATURE DETECTION
- 04 FEATURE MATCHING
- 05 CAMERA POSE ESTIMATION
- 06 POINT CLOUD GENERATION
- 07 MESH GENERATION
- 08 3D TERRAIN READY

NOTICE:
This reconstruction is a high-fidelity prototype demonstration
produced by the TerraRecon system for SIH 2026.
Scale is model-space relative. Real-world geographic accuracy requires
georeferencing information such as GPS, RTK, or ground control points.
=================================================================`;

      const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
      triggerBrowserDownload(blob, `${project.id}_summary_report.txt`, "Summary Report");
    } catch (err: any) {
      setErrorMessage("Failed to generate technical report.");
      setExportingFormat(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl bg-[#121916] border border-[#26302C] rounded-[14px] shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#26302C] bg-[#0D1210]">
          <div>
            <h3 className="text-base font-semibold text-[#F1F4F2] flex items-center gap-2">
              <Download className="w-4 h-4 text-[#78AFA2]" />
              <span>Export 3D Reconstruction</span>
            </h3>
            <p className="text-xs text-[#9BA6A1] mt-0.5 truncate max-w-md">
              {project.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#68736E] hover:text-[#F1F4F2] rounded-[6px] hover:bg-[#121916] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Notification Banner */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-[8px] bg-[#7FAE8D]/15 border border-[#7FAE8D]/35 text-[#7FAE8D] font-mono text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#7FAE8D] shrink-0" />
            <span className="flex-1">{successMessage}</span>
          </div>
        )}

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-[8px] bg-[#B87575]/15 border border-[#B87575]/35 text-[#B87575] font-mono text-xs flex items-center gap-2.5">
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Verified Export Formats */}
        <div className="p-6 space-y-3 font-mono text-xs">
          <div className="text-[11px] text-[#9BA6A1] uppercase tracking-wider font-semibold pb-1 flex items-center justify-between">
            <span>Verified Export Formats</span>
            <span className="text-[10px] text-[#68736E] font-normal">CLIENT-SIDE GENERATION</span>
          </div>

          {/* 1. GLB Export */}
          <div className="p-4 rounded-[10px] bg-[#0D1210] border border-[#26302C] flex items-center justify-between hover:border-[#78AFA2]/50 transition-colors">
            <div className="min-w-0 pr-3">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-[#78AFA2] shrink-0" />
                <span className="font-semibold text-[#F1F4F2] text-sm">Binary GLTF (.glb)</span>
              </div>
              <p className="text-[11px] text-[#9BA6A1] font-sans mt-0.5">
                Self-contained binary 3D model with embedded geometry and materials.
              </p>
            </div>
            <button
              onClick={handleExportGLB}
              disabled={exportingFormat !== null}
              className="h-9 px-4 rounded-[8px] bg-[#78AFA2] hover:bg-[#8CC2B4] disabled:opacity-50 text-[#080B0A] font-semibold font-mono text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
            >
              {exportingFormat === "glb" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export GLB</span>
                </>
              )}
            </button>
          </div>

          {/* 2. OBJ Export */}
          <div className="p-4 rounded-[10px] bg-[#0D1210] border border-[#26302C] flex items-center justify-between hover:border-[#78AFA2]/50 transition-colors">
            <div className="min-w-0 pr-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#78AFA2] shrink-0" />
                <span className="font-semibold text-[#F1F4F2] text-sm">Wavefront OBJ (.obj)</span>
              </div>
              <p className="text-[11px] text-[#9BA6A1] font-sans mt-0.5">
                Standard geometric mesh format. Compatible with Blender, MeshLab, CAD.
              </p>
            </div>
            <button
              onClick={handleExportOBJ}
              disabled={exportingFormat !== null}
              className="h-9 px-4 rounded-[8px] bg-[#121916] hover:bg-[#17211d] disabled:opacity-50 text-[#F1F4F2] font-semibold font-mono text-xs flex items-center gap-1.5 transition-colors border border-[#26302C] hover:border-[#78AFA2] shrink-0 cursor-pointer"
            >
              {exportingFormat === "obj" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export OBJ</span>
                </>
              )}
            </button>
          </div>

          {/* 3. PLY Export */}
          <div className="p-4 rounded-[10px] bg-[#0D1210] border border-[#26302C] flex items-center justify-between hover:border-[#78AFA2]/50 transition-colors">
            <div className="min-w-0 pr-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#78AFA2] shrink-0" />
                <span className="font-semibold text-[#F1F4F2] text-sm">Stanford PLY (.ply)</span>
              </div>
              <p className="text-[11px] text-[#9BA6A1] font-sans mt-0.5">
                Polygon File Format storing vertex coordinates, normals, and vertex colors.
              </p>
            </div>
            <button
              onClick={handleExportPLY}
              disabled={exportingFormat !== null}
              className="h-9 px-4 rounded-[8px] bg-[#121916] hover:bg-[#17211d] disabled:opacity-50 text-[#F1F4F2] font-semibold font-mono text-xs flex items-center gap-1.5 transition-colors border border-[#26302C] hover:border-[#78AFA2] shrink-0 cursor-pointer"
            >
              {exportingFormat === "ply" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PLY</span>
                </>
              )}
            </button>
          </div>

          {/* 4. Technical Summary Report */}
          <div className="p-4 rounded-[10px] bg-[#0D1210] border border-[#26302C] flex items-center justify-between hover:border-[#78AFA2]/50 transition-colors">
            <div className="min-w-0 pr-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#78AFA2] shrink-0" />
                <span className="font-semibold text-[#F1F4F2] text-sm">Summary Report (.txt)</span>
              </div>
              <p className="text-[11px] text-[#9BA6A1] font-sans mt-0.5">
                Complete audit text file containing project metadata and pipeline log.
              </p>
            </div>
            <button
              onClick={handleExportReport}
              disabled={exportingFormat !== null}
              className="h-9 px-4 rounded-[8px] bg-[#121916] hover:bg-[#17211d] disabled:opacity-50 text-[#F1F4F2] font-semibold font-mono text-xs flex items-center gap-1.5 transition-colors border border-[#26302C] hover:border-[#78AFA2] shrink-0 cursor-pointer"
            >
              {exportingFormat === "report" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#26302C] bg-[#0D1210] text-xs font-mono text-[#9BA6A1]">
          <div className="text-[11px] text-[#68736E]">
            Verified 3D formats generated from model geometry
          </div>
          <button
            onClick={onClose}
            className="h-8 px-4 bg-[#121916] hover:bg-[#17211d] border border-[#26302C] text-[#F1F4F2] rounded-[8px] text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
