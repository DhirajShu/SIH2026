"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { ViewerDisplayMode } from "@/lib/types";
import { ModelGeometryStats } from "./Terrain3D";

interface NorthumberlandiaModelProps {
  mode: ViewerDisplayMode; // "textured" | "pointcloud" | "wireframe"
  onGeometryCalculated?: (stats: ModelGeometryStats) => void;
  onModelLoaded?: () => void;
  measuring?: boolean;
  onPointClicked?: (point: THREE.Vector3) => void;
  measurementPoints?: THREE.Vector3[];
  sunAngle?: number;
  autoCenterCamera?: boolean;
}

/**
 * Real 3D Terrain Model Loader for Northumberlandia Land Sculpture.
 * Dynamically computes bounding box, centers the model, frames the camera,
 * and extracts genuine geometry stats (vertices, triangles, bounding box dimensions).
 */
export function NorthumberlandiaModel({
  mode = "textured",
  onGeometryCalculated,
  onModelLoaded,
  measuring = false,
  onPointClicked,
  measurementPoints = [],
  sunAngle = 55,
  autoCenterCamera = true,
}: NorthumberlandiaModelProps) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const [modelReady, setModelReady] = useState(false);

  // Load the web-optimized standard GLB (8.55 MB with WebP texture, zero decoder friction)
  const gltf = useGLTF("/models/northumberlandia_standard.glb");

  // Clone scene so material mutations (wireframe / colors) don't pollute the cached asset
  const { clonedScene, pointCloudGeometry, computedStats, centerOffset, normalizedScale } = useMemo(() => {
    const sceneCopy = gltf.scene.clone(true);

    let totalVertices = 0;
    let totalTriangles = 0;
    const allPositions: number[] = [];

    // Calculate global bounding box before transformations
    const box = new THREE.Box3().setFromObject(sceneCopy);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    // Scale model to a comfortable, dominant viewport footprint (~80 units wide)
    const maxDim = Math.max(size.x, size.z, size.y) || 1;
    const targetDim = 85;
    const scaleFactor = targetDim / maxDim;

    // Traverse all meshes to count genuine geometry and extract point cloud positions
    sceneCopy.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const geo = mesh.geometry;
        if (geo && geo.attributes.position) {
          const posAttr = geo.attributes.position;
          totalVertices += posAttr.count;

          if (geo.index) {
            totalTriangles += geo.index.count / 3;
          } else {
            totalTriangles += posAttr.count / 3;
          }

          // Sample vertex points for genuine point-cloud mode
          const stride = posAttr.count > 50000 ? 2 : 1;
          for (let i = 0; i < posAttr.count; i += stride) {
            // Apply mesh local transform to world relative
            const v = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
            v.applyMatrix4(mesh.matrixWorld);
            // Apply scale and center offset
            v.sub(center).multiplyScalar(scaleFactor);
            allPositions.push(v.x, v.y, v.z);
          }
        }
      }
    });

    // Create real point-cloud geometry derived directly from the GLB vertices
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(allPositions, 3)
    );

    const stats: ModelGeometryStats = {
      vertexCount: totalVertices,
      triangleCount: Math.round(totalTriangles),
      dimensions: {
        x: Number((size.x * scaleFactor).toFixed(1)),
        y: Number((size.y * scaleFactor).toFixed(1)),
        z: Number((size.z * scaleFactor).toFixed(1)),
      },
      minElevation: Number((-size.y * 0.5 * scaleFactor).toFixed(1)),
      maxElevation: Number((size.y * 0.5 * scaleFactor).toFixed(1)),
      activeMode: mode,
    };

    return {
      clonedScene: sceneCopy,
      pointCloudGeometry: ptGeo,
      computedStats: stats,
      centerOffset: center,
      normalizedScale: scaleFactor,
    };
  }, [gltf.scene, mode]);

  // Initial Camera Framing: automatically calculate bounding box and frame camera so terrain dominates
  useEffect(() => {
    if (!autoCenterCamera) return;

    // Position camera to view the full terrain from an optimal elevated 35-degree perspective
    camera.position.set(0, 55, 75);
    camera.lookAt(0, 0, 0);

    setModelReady(true);
    if (onModelLoaded) onModelLoaded();
  }, [camera, autoCenterCamera, onModelLoaded]);

  // Notify parent of genuine geometry statistics calculated from the loaded GLB
  useEffect(() => {
    if (onGeometryCalculated && computedStats) {
      onGeometryCalculated({
        ...computedStats,
        activeMode: mode,
      });
    }
  }, [computedStats, mode, onGeometryCalculated]);

  // Apply visual modes to the scene:
  // - Textured: natural realistic photographic surface
  // - Wireframe: subtle TerraRecon teal overlay
  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => {
            if (mat && "wireframe" in mat) {
              (mat as any).wireframe = mode === "wireframe";
              if (mode === "wireframe") {
                (mat as any).color = new THREE.Color("#78AFA2");
              }
            }
          });
        } else if (mesh.material && "wireframe" in mesh.material) {
          (mesh.material as any).wireframe = mode === "wireframe";
          if (mode === "wireframe") {
            (mesh.material as any).color = new THREE.Color("#78AFA2");
          }
        }
      }
    });
  }, [clonedScene, mode]);

  // Handle terrain clicks for model-space measurement tool
  const handleClick = (e: any) => {
    if (!measuring || !onPointClicked) return;
    e.stopPropagation();
    if (e.point) {
      onPointClicked(e.point);
    }
  };

  // Safe measurement line using Three.Line primitive
  const measurementLineObject = useMemo(() => {
    if (measurementPoints.length !== 2) return null;
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(measurementPoints[0].x, measurementPoints[0].y + 0.3, measurementPoints[0].z),
      new THREE.Vector3(measurementPoints[1].x, measurementPoints[1].y + 0.3, measurementPoints[1].z),
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: "#78AFA2", linewidth: 2 });
    return new THREE.Line(lineGeo, lineMat);
  }, [measurementPoints]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Lighting tailored for realistic earth/terrain visualization */}
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[
          Math.cos((sunAngle * Math.PI) / 180) * 90,
          75,
          Math.sin((sunAngle * Math.PI) / 180) * 90,
        ]}
        intensity={1.3}
        castShadow
      />
      {/* Subtle aviation teal fill light */}
      <directionalLight position={[-50, 40, -50]} intensity={0.25} color="#78AFA2" />

      {/* RENDER MODE: POINT CLOUD (Real points derived directly from GLB vertices) */}
      {mode === "pointcloud" ? (
        <points geometry={pointCloudGeometry}>
          <pointsMaterial
            size={0.16}
            color="#78AFA2"
            sizeAttenuation
            transparent
            opacity={0.85}
          />
        </points>
      ) : (
        /* RENDER MODE: TEXTURED TERRAIN or WIREFRAME */
        <group
          position={[
            -centerOffset.x * normalizedScale,
            -centerOffset.y * normalizedScale,
            -centerOffset.z * normalizedScale,
          ]}
          scale={[normalizedScale, normalizedScale, normalizedScale]}
          onClick={handleClick}
        >
          <primitive object={clonedScene} />
        </group>
      )}

      {/* Interactive Model-Space Measurement Markers */}
      {measurementPoints.map((pt, index) => (
        <group key={index} position={pt}>
          <mesh>
            <sphereGeometry args={[0.9, 16, 16]} />
            <meshStandardMaterial color="#78AFA2" emissive="#4F7F74" roughness={0.2} />
          </mesh>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 3.2]} />
            <meshBasicMaterial color="#78AFA2" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 1.8, 24]} />
            <meshBasicMaterial color="#78AFA2" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Measurement line between points */}
      {measurementLineObject && <primitive object={measurementLineObject} />}

      {/* Subtle geospatial reference grid */}
      <gridHelper args={[160, 20, "#26302C", "#121916"]} position={[0, -12, 0]} />
    </group>
  );
}

// Preload the standard terrain GLB
try {
  useGLTF.preload("/models/northumberlandia_standard.glb");
} catch {
  // Ignored in SSR
}
