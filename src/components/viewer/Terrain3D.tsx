"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { ViewerDisplayMode, TelemetryPoint } from "@/lib/types";

export interface ModelGeometryStats {
  vertexCount: number;
  triangleCount: number | null;
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
  minElevation: number;
  maxElevation: number;
  activeMode: string;
}

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
  onGeometryCalculated?: (stats: ModelGeometryStats) => void;
}

export function Terrain3D({
  mode,
  projectType = "quarry",
  showFlightPath = true,
  telemetry = [],
  measuring = false,
  onPointClicked,
  measurementPoints = [],
  sunAngle = 55,
  selectedKeyframeIndex = 0,
  onGeometryCalculated,
}: Terrain3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Generate procedural terrain geometry with authentic topography
  const { geometry, elevationTexture, heightMapFn, minElevation, maxElevation, boundingBoxDims } = useMemo(() => {
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
        const ridge = Math.abs(Math.sin(nx * 1.8 + nz * 0.8)) * 36;
        const canyon = Math.cos(nz * 2.2) * 14 * Math.exp(-Math.pow(nx * 1.2, 2));
        const noise = Math.sin(nx * 8) * Math.cos(nz * 8) * 3 + Math.sin(nx * 18 + nz * 14) * 1.2;
        return ridge - canyon + noise + 10;
      } else if (projectType === "viaduct") {
        const valley = Math.sin(nx * 1.2) * 18;
        const roadEmbankment = Math.exp(-Math.pow((nz - 4) * 0.3, 2)) * 8;
        const ripple = Math.sin(nx * 9) * 1.2;
        return valley + roadEmbankment + ripple;
      } else {
        const distFromCenter = Math.sqrt(nx * nx + nz * nz);
        const bowl = Math.pow(distFromCenter * 1.1, 1.8) * 24;
        const stepped = Math.floor(bowl / 4.5) * 4.2;
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
    geo.computeBoundingBox();

    const box = geo.boundingBox!;
    const boundingBoxDims = {
      x: Number((box.max.x - box.min.x).toFixed(1)),
      y: Number((box.max.y - box.min.y).toFixed(1)),
      z: Number((box.max.z - box.min.z).toFixed(1)),
    };

    // Generate colors based on elevation and slope
    const normals = geo.attributes.normal;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const ny = normals.getY(i);
      const normH = (y - minH) / (maxH - minH || 1);

      if (projectType === "alpine") {
        if (normH > 0.85) {
          color.setHSL(0.6, 0.1, 0.85 + normH * 0.15);
        } else if (normH > 0.4) {
          color.setHSL(0.08, 0.2, 0.28 + normH * 0.25);
        } else {
          color.setHSL(0.3, 0.35, 0.22 + normH * 0.15);
        }
      } else {
        if (ny < 0.65) {
          color.setHSL(0.08, 0.25, 0.22 + normH * 0.18);
        } else {
          color.setHSL(0.1, 0.28, 0.35 + normH * 0.15);
        }
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Contour line texture
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#1c1f24";
      ctx.fillRect(0, 0, 512, 512);

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
      boundingBoxDims,
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
      col.setHSL(0.1 + norm * 0.05, 0.4, 0.4 + norm * 0.3);

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [heightMapFn, minElevation, maxElevation]);

  // Notify parent of actual calculated geometry properties
  useEffect(() => {
    if (onGeometryCalculated) {
      const isPoint = mode === "pointcloud";
      const vCount = isPoint ? 45000 : geometry.attributes.position.count;
      const tCount = isPoint ? null : (geometry.index ? geometry.index.count / 3 : 128 * 128 * 2);

      onGeometryCalculated({
        vertexCount: vCount,
        triangleCount: tCount,
        dimensions: boundingBoxDims,
        minElevation: Number(minElevation.toFixed(1)),
        maxElevation: Number(maxElevation.toFixed(1)),
        activeMode: mode,
      });
    }
  }, [geometry, minElevation, maxElevation, mode, boundingBoxDims, onGeometryCalculated]);

  // Handle terrain click for model-space distance measurement
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!measuring || !onPointClicked) return;
    e.stopPropagation();
    if (e.point) {
      onPointClicked(e.point);
    }
  };

  return (
    <group>
      {/* Dynamic Lighting */}
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[
          Math.cos((sunAngle * Math.PI) / 180) * 80,
          65,
          Math.sin((sunAngle * Math.PI) / 180) * 80,
        ]}
        intensity={1.25}
        castShadow
      />
      <directionalLight position={[-40, 30, -40]} intensity={0.25} color="#60a5fa" />

      {/* Render based on selected display mode */}
      {mode === "pointcloud" ? (
        <points ref={pointsRef} geometry={pointCloudGeometry}>
          <pointsMaterial
            size={0.48}
            vertexColors
            sizeAttenuation
            transparent
            opacity={0.9}
          />
        </points>
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
      ) : (
        /* Default: Solid Textured 3D Mesh */
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

      {/* Interactive Model-Space Measurement Markers */}
      {measurementPoints.map((pt, index) => (
        <group key={index} position={pt}>
          <mesh>
            <sphereGeometry args={[1.0, 16, 16]} />
            <meshStandardMaterial color="#f59e0b" emissive="#b45309" roughness={0.2} />
          </mesh>
          <mesh position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 3.6]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 2.2, 24]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Measurement line between the 2 selected points */}
      {measurementPoints.length === 2 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  measurementPoints[0].x,
                  measurementPoints[0].y + 0.3,
                  measurementPoints[0].z,
                  measurementPoints[1].x,
                  measurementPoints[1].y + 0.3,
                  measurementPoints[1].z,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#f59e0b" linewidth={3} />
        </line>
      )}

      {/* Ground reference grid */}
      <gridHelper args={[180, 18, "#27272a", "#18181b"]} position={[0, minElevation - 2, 0]} />
    </group>
  );
}
