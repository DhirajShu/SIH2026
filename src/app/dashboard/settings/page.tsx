"use client";

import React, { useState } from "react";
import {
  User,
  Eye,
  Sliders,
  Cpu,
  Save,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  // 1. Account State
  const [operatorName, setOperatorName] = useState(user?.name || "Survey Specialist");
  const [operatorEmail, setOperatorEmail] = useState(user?.email || "user@terra-recon.io");
  const [organization, setOrganization] = useState("Geospatial & Drone Operations Lab");
  const [pilotLicense, setPilotLicense] = useState("UAV-COMM-94281-RTK");

  // 2. Appearance State
  const [defaultViewportMode, setDefaultViewportMode] = useState("textured");
  const [highDpiCanvas, setHighDpiCanvas] = useState(true);
  const [fpsOverlay, setFpsOverlay] = useState(false);

  // 3. Preferences State
  const [defaultCrs, setDefaultCrs] = useState("EPSG:32643 (WGS 84 / UTM Zone 43N)");
  const [geoidDatum, setGeoidDatum] = useState("EGM96 Global Orthometric");
  const [unitsSystem, setUnitsSystem] = useState("metric");
  const [audioNotification, setAudioNotification] = useState(true);

  // 4. Application State
  const [cudaWorkers, setCudaWorkers] = useState("8");
  const [keyframeOverlap, setKeyframeOverlap] = useState("80");
  const [octreeDepth, setOctreeDepth] = useState("11");
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  return (
    <div className="flex-1 bg-[#080B0A] font-sans text-[#F1F4F2] py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-[#26302C]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#68736E]">
            <span>STATION CONFIGURATION</span>
            <span>/</span>
            <span>SETTINGS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F1F4F2] mt-1">
            System & Station Settings
          </h1>
          <p className="text-xs text-[#9BA6A1] mt-1 font-mono">
            Manage operator identity, appearance, geodetic preferences, and reconstruction pipelines.
          </p>
        </div>

        {saved && (
          <div className="p-4 rounded-[8px] bg-[#78AFA2]/12 border border-[#78AFA2]/40 text-[#78AFA2] font-mono text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#78AFA2]" />
            <span>Station settings successfully synchronized and committed to local engine cache.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* =========================================================================
              SECTION 1: ACCOUNT
          ========================================================================= */}
          <div className="p-6 rounded-xl bg-[#121916] border border-[#26302C] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#26302C]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F1F4F2] font-mono">
                <User className="w-4 h-4 text-[#78AFA2]" />
                <span>01 / ACCOUNT</span>
              </div>
              <span className="text-[11px] font-mono text-[#68736E]">OPERATOR CREDENTIALS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="text-[10px] text-[#68736E] uppercase tracking-wider block mb-1.5">
                  OPERATOR CALLSIGN / NAME
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080B0A] border border-[#26302C] rounded-[8px] text-[#F1F4F2] text-xs focus:border-[#78AFA2] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#68736E] uppercase tracking-wider block mb-1.5">
                  REGISTERED EMAIL
                </label>
                <input
                  type="email"
                  value={operatorEmail}
                  onChange={(e) => setOperatorEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080B0A] border border-[#26302C] rounded-[8px] text-[#F1F4F2] text-xs focus:border-[#78AFA2] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#68736E] uppercase tracking-wider block mb-1.5">
                  ORGANIZATION / SURVEY AGENCY
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080B0A] border border-[#26302C] rounded-[8px] text-[#F1F4F2] text-xs focus:border-[#78AFA2] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#68736E] uppercase tracking-wider block mb-1.5">
                  UAV PILOT CERTIFICATION ID
                </label>
                <input
                  type="text"
                  value={pilotLicense}
                  onChange={(e) => setPilotLicense(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080B0A] border border-[#26302C] rounded-[8px] text-[#F1F4F2] text-xs focus:border-[#78AFA2] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 2: APPEARANCE
          ========================================================================= */}
          <div className="p-6 rounded-xl bg-[#121916] border border-[#26302C] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#26302C]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F1F4F2] font-mono">
                <Eye className="w-4 h-4 text-[#78AFA2]" />
                <span>02 / APPEARANCE</span>
              </div>
              <span className="text-[11px] font-mono text-[#68736E]">VIEWPORT & THEME</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="text-[10px] text-[#68736E] uppercase tracking-wider block mb-1.5">
                  GLOBAL VISUAL THEME
                </label>
                <div className="px-3.5 py-2.5 bg-[#080B0A] border border-[#26302C] rounded-[8px] text-[#F1F4F2] text-xs flex items-center justify-between">
                  <span>Dark Graphite + Aviation Teal</span>
                  <span className="text-[10px] text-[#78AFA2] font-bold">LOCKED</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#68736E] uppercase tracking-wider block mb-1.5">
                  DEFAULT 3D VIEWPORT MODE
                </label>
                <select
                  value={defaultViewportMode}
                  onChange={(e) => setDefaultViewportMode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080B0A] border border-[#26302C] rounded-[8px] text-[#F1F4F2] text-xs focus:border-[#78AFA2] focus:outline-none cursor-pointer"
                >
                  <option value="textured">Textured Photogrammetric Mesh</option>
                  <option value="pointcloud">3D Spatial Point Cloud</option>
                  <option value="wireframe">Triangulated TIN Wireframe</option>
                </select>
              </div>

              <div className="sm:col-span-2 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#080B0A] border border-[#26302C] rounded-[8px]">
                <div>
                  <span className="font-semibold block text-[#F1F4F2] text-xs">High-DPI WebGL Canvas Sampling</span>
                  <span className="text-[11px] text-[#68736E]">Render 3D viewport at native display pixel ratio for sharper edge fidelity.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHighDpiCanvas(!highDpiCanvas)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    highDpiCanvas ? "bg-[#78AFA2]" : "bg-[#26302C]"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-[#080B0A] transition-transform absolute top-1 ${
                      highDpiCanvas ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 3: PREFERENCES
          ========================================================================= */}
          <div className="p-6 rounded-xl bg-[#121916] border border-[#26302C] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#26302C]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F1F4F2] font-mono">
                <Sliders className="w-4 h-4 text-[#78AFA2]" />
                <span>03 / PREFERENCES</span>
              </div>
              <span className="text-[11px] font-mono text-[#68736E]">GEODETIC & MEASUREMENT</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="text-[10px] text-[#68736E] uppercase tracking-wider block mb-1.5">
                  DEFAULT SURVEY CRS
                </label>
                <select
                  value={defaultCrs}
                  onChange={(e) => setDefaultCrs(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080B0A] border border-[#26302C] rounded-[8px] text-[#F1F4F2] text-xs focus:border-[#78AFA2] focus:outline-none cursor-pointer"
                >
                  <option value="EPSG:32643 (WGS 84 / UTM Zone 43N)">EPSG:32643 (WGS 84 / UTM Zone 43N)</option>
                  <option value="EPSG:32644 (WGS 84 / UTM Zone 44N)">EPSG:32644 (WGS 84 / UTM Zone 44N)</option>
                  <option value="EPSG:4326 (WGS 84 Geographic 2D)">EPSG:4326 (WGS 84 Geographic 2D)</option>
                  <option value="EPSG:7755 (India National Grid Zone 1)">EPSG:7755 (India National Grid Zone 1)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#68736E] uppercase tracking-wider block mb-1.5">
                  VERTICAL GEOID MODEL
                </label>
                <select
                  value={geoidDatum}
                  onChange={(e) => setGeoidDatum(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080B0A] border border-[#26302C] rounded-[8px] text-[#F1F4F2] text-xs focus:border-[#78AFA2] focus:outline-none cursor-pointer"
                >
                  <option value="EGM96 Global Orthometric">EGM96 Global Orthometric (Standard)</option>
                  <option value="EGM2008 2.5-Minute Grid">EGM2008 2.5-Minute Grid (High Precision)</option>
                  <option value="WGS84 Ellipsoidal Height">WGS84 Ellipsoidal Height</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#68736E] uppercase tracking-wider block mb-1.5">
                  MEASUREMENT UNITS
                </label>
                <select
                  value={unitsSystem}
                  onChange={(e) => setUnitsSystem(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080B0A] border border-[#26302C] rounded-[8px] text-[#F1F4F2] text-xs focus:border-[#78AFA2] focus:outline-none cursor-pointer"
                >
                  <option value="metric">Metric (Meters, Hectares, km/h)</option>
                  <option value="imperial">Imperial (Feet, Acres, mph)</option>
                </select>
              </div>

              <div className="pt-2 flex flex-col justify-end">
                <div className="flex items-center justify-between p-2.5 bg-[#080B0A] border border-[#26302C] rounded-[8px]">
                  <span className="text-xs text-[#9BA6A1]">Pipeline Completion Audio Alert</span>
                  <button
                    type="button"
                    onClick={() => setAudioNotification(!audioNotification)}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                      audioNotification ? "bg-[#78AFA2]" : "bg-[#26302C]"
                    }`}
                  >
                    <span
                      className={`block w-3.5 h-3.5 rounded-full bg-[#080B0A] transition-transform absolute top-0.5 ${
                        audioNotification ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 4: APPLICATION
          ========================================================================= */}
          <div className="p-6 rounded-xl bg-[#121916] border border-[#26302C] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#26302C]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F1F4F2] font-mono">
                <Cpu className="w-4 h-4 text-[#78AFA2]" />
                <span>04 / APPLICATION</span>
              </div>
              <span className="text-[11px] font-mono text-[#68736E]">HARDWARE ACCELERATION & CACHE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div>
                <label className="text-[10px] text-[#68736E] uppercase tracking-wider block mb-1.5">
                  NVDEC DECODE THREADS
                </label>
                <select
                  value={cudaWorkers}
                  onChange={(e) => setCudaWorkers(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080B0A] border border-[#26302C] rounded-[8px] text-[#F1F4F2] text-xs focus:border-[#78AFA2] focus:outline-none cursor-pointer"
                >
                  <option value="4">4 Parallel Threads</option>
                  <option value="8">8 Parallel Threads (Optimal)</option>
                  <option value="16">16 Threads (Multi-GPU)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#68736E] uppercase tracking-wider block mb-1.5">
                  KEYFRAME OVERLAP (%)
                </label>
                <input
                  type="number"
                  min="60"
                  max="95"
                  value={keyframeOverlap}
                  onChange={(e) => setKeyframeOverlap(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080B0A] border border-[#26302C] rounded-[8px] text-[#F1F4F2] text-xs focus:border-[#78AFA2] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#68736E] uppercase tracking-wider block mb-1.5">
                  POISSON OCTREE DEPTH
                </label>
                <select
                  value={octreeDepth}
                  onChange={(e) => setOctreeDepth(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080B0A] border border-[#26302C] rounded-[8px] text-[#F1F4F2] text-xs focus:border-[#78AFA2] focus:outline-none cursor-pointer"
                >
                  <option value="9">Depth 9 (~200k polys)</option>
                  <option value="10">Depth 10 (~500k polys)</option>
                  <option value="11">Depth 11 (~1.2M polys - Recommended)</option>
                  <option value="12">Depth 12 (~4.0M polys - Ultra)</option>
                </select>
              </div>
            </div>

            {/* Offline Cache Cleanup */}
            <div className="pt-3 border-t border-[#26302C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-semibold block text-[#F1F4F2] text-xs font-mono">Offline Terrain Cache</span>
                <span className="text-[11px] text-[#68736E] font-sans">
                  {cacheCleared ? "Cache purged successfully." : "Purge temporary GLB geometry and texture scratch memory."}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearCache}
                className="px-3.5 py-2 rounded-[8px] bg-[#080B0A] hover:bg-[#121916] text-[#9BA6A1] hover:text-[#B87575] border border-[#26302C] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{cacheCleared ? "Cleared" : "Clear Cache"}</span>
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="h-[44px] px-6 rounded-[8px] bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-bold font-mono text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>SAVE CONFIGURATION</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
