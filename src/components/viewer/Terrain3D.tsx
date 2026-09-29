"use client";

import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { ViewerDisplayMode, TelemetryPoint } from "@/lib/types";

interface Terrain3DProps {
  mode: ViewerDisplayMode;
  projectType?: "quarry" | "alpine" | "viaduct";
  showFlightPath?: boolean;
  telemetry?: TelemetryPoint[];
  measuring?: boolean;
  onPointClicked?: (point: THREE.Vector3) => void;
  measurementPoints?: THREE.Vector3[];
  sunAngle?: number;
  selectedKeyframeIndex?: number;
}

export function Terrain3D({
  mode,
  projectType = "quarry",
  showFlightPath = true,
  telemetry = [],
  measuring = false,
  onPointClicked,
  measurementPoints = [],
  sunAngle = 45,
  selectedKeyframeIndex = 0,
}: Terrain3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Generate procedural terrain geometry with authentic topography
  const { geometry, elevationTexture, heightMapFn, minElevation, maxElevation } = useMemo(() => {
    const width = 160;
    const height = 160;
    const segments = 128;
    const geo = new THREE.PlaneGeometry(width, height, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    let minH = 9999;
    let maxH = -9999;

    // Elevation generator based on survey type
    const getHeight = (x: number, z: number) => {
      const nx = x / 80;
      const nz = z / 80;

      if (projectType === "alpine") {
        // High steep ridge and canyon meander
        const ridge = Math.abs(Math.sin(nx * 1.8 + nz * 0.8)) * 36;
        const canyon = Math.cos(nz * 2.2) * 14 * Math.exp(-Math.pow(nx * 1.2, 2));
        const noise = Math.sin(nx * 8) * Math.cos(nz * 8) * 3 + Math.sin(nx * 18 + nz * 14) * 1.2;
        return ridge - canyon + noise + 10;
      } else if (projectType === "viaduct") {
        // River valley with embankments
        const valley = Math.sin(nx * 1.2) * 18;
        const roadEmbankment = Math.exp(-Math.pow((nz - 4) * 0.3, 2)) * 8;
        const ripple = Math.sin(nx * 9) * 1.2;
        return valley + roadEmbankment + ripple;
      } else {
        // Quarry with stepped terraces and haul roads
        const distFromCenter = Math.sqrt(nx * nx + nz * nz);
        const bowl = Math.pow(distFromCenter * 1.1, 1.8) * 24;
        // Terraces / benches step function
        const stepped = Math.floor(bowl / 4.5) * 4.2;
        // Haul road spiral cut
        const angle = Math.atan2(nz, nx);
        const spiralRoad = Math.sin(distFromCenter * 6 - angle * 1.5) * 2.0;
        const rockNoise = Math.sin(nx * 12 + nz * 10) * 1.2 + Math.cos(nx * 24 - nz * 18) * 0.6;
        return stepped + spiralRoad + rockNoise;
      }
    };

    // Apply heights & vertex colors
    const colors = new Float32Array(pos.count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = getHeight(x, z);
      pos.setY(i, y);

      if (y < minH) minH = y;
      if (y > maxH) maxH = y;
    }

    geo.computeVertexNormals();

    // Generate colors based on elevation and slope
    const normals = geo.attributes.normal;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const ny = normals.getY(i); // slope factor: 1 is flat, < 0.7 is steep
      const normH = (y - minH) / (maxH - minH || 1);

      if (projectType === "alpine") {
        if (normH > 0.85) {
          // Snow / rocky peak
          color.setHSL(0.6, 0.1, 0.85 + normH * 0.15);
        } else if (normH > 0.4) {
          // Exposed craggy rock
          color.setHSL(0.08, 0.2, 0.28 + normH * 0.25);
        } else {
          // Alpine scrub / canyon river bed
          color.setHSL(0.3, 0.35, 0.22 + normH * 0.15);
        }
      } else {
        // Quarry / geological earth tones
        if (ny < 0.65) {
          // Steep bench face - exposed rock fracture
          color.setHSL(0.08, 0.25, 0.22 + normH * 0.18);
        } else {
          // Flat bench / haul road - dusty aggregate
          color.setHSL(0.1, 0.28, 0.35 + normH * 0.15);
        }
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Generate synthetic contour line texture on canvas
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#1c1f24";
      ctx.fillRect(0, 0, 512, 512);

      // Grid overlay
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 512; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
      }

      // Contour rings
      ctx.strokeStyle = "rgba(245, 158, 11, 0.25)";
      ctx.lineWidth = 1.5;
      for (let r = 20; r < 240; r += 28) {
        ctx.beginPath();
        ctx.arc(256, 256, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);

    return {
      geometry: geo,
      elevationTexture: tex,
      heightMapFn: getHeight,
      minElevation: minH,
      maxElevation: maxH,
    };
  }, [projectType]);

  // Point cloud representation
  const pointCloudGeometry = useMemo(() => {
    const count = 45000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const col = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const rx = (Math.random() - 0.5) * 150;
      const rz = (Math.random() - 0.5) * 150;
      const ry = heightMapFn(rx, rz) + (Math.random() - 0.5) * 0.4;

      positions[i * 3] = rx;
      positions[i * 3 + 1] = ry;
      positions[i * 3 + 2] = rz;

      const norm = (ry - minElevation) / (maxElevation - minElevation || 1);

      if (mode === "elevation") {
        // Hypsometric tinting: Blue -> Cyan -> Green -> Yellow -> Red
        col.setHSL(0.65 - norm * 0.65, 0.9, 0.5);
      } else {
        col.setHSL(0.1 + norm * 0.05, 0.4, 0.4 + norm * 0.3);
      }

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [heightMapFn, minElevation, maxElevation, mode]);

  // Elevation shader colormap geometry for DEM mode
  const elevationColorsGeo = useMemo(() => {
    const geo = geometry.clone();
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const col = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const normH = Math.max(0, Math.min(1, (y - minElevation) / (maxElevation - minElevation || 1)));
      // Hypsometric tint colormap (Blue=lowest, Red/White=highest)
      col.setHSL((1 - normH) * 0.65, 0.95, 0.45);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [geometry, minElevation, maxElevation]);

  // Flight path spline and camera frustums
  const flightPoints = useMemo(() => {
    if (!telemetry || telemetry.length === 0) {
      // Create synthetic flight path corridor
      const pts: THREE.Vector3[] = [];
      const numPts = 12;
      for (let i = 0; i < numPts; i++) {
        const t = (i / (numPts - 1) - 0.5) * 130;
        const y = 35 + Math.sin(i * 0.6) * 3;
        const z = Math.sin(i * 0.8) * 20;
        pts.push(new THREE.Vector3(t, y, z));
      }
      return pts;
    }

    // Map telemetry coordinates to 3D scene space
    return telemetry.map((pt, idx) => {
      const t = (idx / (telemetry.length - 1 || 1) - 0.5) * 130;
      const alt = pt.altitudeM * 0.45; // scale to scene
      const wobble = Math.sin(idx * 0.5) * 15;
      return new THREE.Vector3(t, alt, wobble);
    });
  }, [telemetry]);

  const flightCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(flightPoints);
  }, [flightPoints]);

  const curvePoints = useMemo(() => {
    return flightCurve.getPoints(80);
  }, [flightCurve]);

  // Handle terrain click for GIS distance measurement
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!measuring || !onPointClicked) return;
    e.stopPropagation();
    if (e.point) {
      onPointClicked(e.point);
    }
  };

  // Active drone position from selected keyframe
  const activeDronePos = useMemo(() => {
    const fraction = Math.max(0, Math.min(1, selectedKeyframeIndex / Math.max(1, (telemetry.length || 10) - 1)));
    return flightCurve.getPointAt(fraction);
  }, [flightCurve, selectedKeyframeIndex, telemetry.length]);

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[
          Math.cos((sunAngle * Math.PI) / 180) * 80,
          65,
          Math.sin((sunAngle * Math.PI) / 180) * 80,
        ]}
        intensity={1.2}
        castShadow
      />
      <directionalLight position={[-40, 30, -40]} intensity={0.25} color="#60a5fa" />

      {/* Render based on selected display mode */}
      {mode === "pointcloud" ? (
        <points ref={pointsRef} geometry={pointCloudGeometry}>
          <pointsMaterial
            size={0.45}
            vertexColors
            sizeAttenuation
            transparent
            opacity={0.88}
          />
        </points>
      ) : mode === "elevation" ? (
        <mesh
          ref={meshRef}
          geometry={elevationColorsGeo}
          onClick={handleClick}
          receiveShadow
        >
          <meshStandardMaterial
            vertexColors
            roughness={0.85}
            metalness={0.1}
          />
        </mesh>
      ) : mode === "wireframe" ? (
        <mesh
          ref={meshRef}
          geometry={geometry}
          onClick={handleClick}
        >
          <meshBasicMaterial
            color="#f59e0b"
            wireframe
            transparent
            opacity={0.65}
          />
        </mesh>
      ) : mode === "normals" ? (
        <mesh
          ref={meshRef}
          geometry={geometry}
          onClick={handleClick}
        >
          <meshNormalMaterial />
        </mesh>
      ) : (
        /* Default: Textured 3D Mesh with photogrammetry details */
        <mesh
          ref={meshRef}
          geometry={geometry}
          onClick={handleClick}
          receiveShadow
        >
          <meshStandardMaterial
            vertexColors
            map={elevationTexture}
            roughness={0.82}
            metalness={0.08}
          />
        </mesh>
      )}

      {/* Drone Flight Trajectory Path */}
      {showFlightPath && (
        <group>
          {/* Continuous flight trajectory line */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[
                  new Float32Array(
                    curvePoints.flatMap((p) => [p.x, p.y, p.z])
                  ),
                  3,
                ]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#38bdf8" linewidth={2} />
          </line>

          {/* Camera frustums at sample positions along the trajectory */}
          {flightPoints.map((pt, i) => (
            <group key={i} position={pt}>
              <mesh>
                <sphereGeometry args={[0.5, 8, 8]} />
                <meshBasicMaterial color="#38bdf8" />
              </mesh>
              {/* Camera frustum pyramid pointing downward */}
              <mesh position={[0, -2, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[1.6, 2.8, 4]} />
                <meshBasicMaterial
                  color={i === selectedKeyframeIndex ? "#f59e0b" : "#38bdf8"}
                  wireframe
                  transparent
                  opacity={0.6}
                />
              </mesh>
            </group>
          ))}

          {/* Current active drone position marker */}
          <group position={activeDronePos}>
            <mesh>
              <sphereGeometry args={[1.2, 16, 16]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
            {/* Pulsing ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.8, 2.4, 32]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.7} side={THREE.DoubleSide} />
            </mesh>
            {/* Laser ground trace line */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[
                    new Float32Array([
                      0, 0, 0,
                      0, -(activeDronePos.y - heightMapFn(activeDronePos.x, activeDronePos.z)), 0
                    ]),
                    3,
                  ]}
                />
              </bufferGeometry>
              <lineDashedMaterial color="#f59e0b" dashSize={1} gapSize={0.5} />
            </line>
          </group>
        </group>
      )}

      {/* Interactive GIS Measurement Markers */}
      {measurementPoints.map((pt, index) => (
        <group key={index} position={pt}>
          <mesh>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 2.8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      ))}

      {/* Measurement line between 2 points */}
      {measurementPoints.length === 2 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  measurementPoints[0].x,
                  measurementPoints[0].y + 0.2,
                  measurementPoints[0].z,
                  measurementPoints[1].x,
                  measurementPoints[1].y + 0.2,
                  measurementPoints[1].z,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ef4444" linewidth={3} />
        </line>
      )}

      {/* Compass rose / scale ground grid */}
      <gridHelper args={[180, 18, "#27272a", "#18181b"]} position={[0, minElevation - 2, 0]} />
    </group>
  );
}
