"use client";

import React, { useRef, useMemo, useEffect, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
import { NorthumberlandiaModel } from "@/components/viewer/NorthumberlandiaModel";

export interface DroneSceneProps {
  scrollProgress: number; // 0.0 to 1.0 master scrub
  terrainMode?: "textured" | "pointcloud" | "wireframe";
  isInteractive?: boolean;
  onResetCamera?: () => void;
  resetCameraTrigger?: number;
}

/**
 * Real Northumberlandia Terrain Loader for the Landing Page Reconstruction & Explore stages.
 * Automatically takes over as the reconstruction transitions into the final 3D terrain.
 */
function RealTerrainReconstruction({
  scrollProgress,
  mode = "textured",
}: {
  scrollProgress: number;
  mode: "textured" | "pointcloud" | "wireframe";
}) {
  const sparsePointsRef = useRef<THREE.Points>(null);
  const densePointsRef = useRef<THREE.Points>(null);

  // Transition opacities:
  // 0.68 - 0.78: Sparse point cloud emerges
  // 0.78 - 0.85: Dense point cloud takes over
  // 0.85 - 0.96: Real Northumberlandia 3D GLB model dominates
  // 0.96 - 1.00: Smoothly fades for final CTA
  const { sparseOpacity, denseOpacity, meshOpacity } = useMemo(() => {
    let sparse = 0;
    let dense = 0;
    let mesh = 0;

    if (scrollProgress >= 0.68 && scrollProgress < 0.78) {
      sparse = THREE.MathUtils.smoothstep(scrollProgress, 0.68, 0.74);
    } else if (scrollProgress >= 0.78 && scrollProgress < 0.85) {
      sparse = 1 - THREE.MathUtils.smoothstep(scrollProgress, 0.78, 0.84);
      dense = THREE.MathUtils.smoothstep(scrollProgress, 0.78, 0.83);
    } else if (scrollProgress >= 0.85 && scrollProgress < 0.96) {
      dense = 1 - THREE.MathUtils.smoothstep(scrollProgress, 0.85, 0.89);
      mesh = THREE.MathUtils.smoothstep(scrollProgress, 0.85, 0.90);
    } else if (scrollProgress >= 0.96) {
      mesh = 1 - THREE.MathUtils.smoothstep(scrollProgress, 0.96, 0.99);
    }

    return { sparseOpacity: sparse, denseOpacity: dense, meshOpacity: mesh };
  }, [scrollProgress]);

  // Procedural point clouds for sparse and dense reconstruction transition phases
  const { sparseGeo, denseGeo } = useMemo(() => {
    const sCount = 800;
    const sPos = new Float32Array(sCount * 3);
    const sCol = new Float32Array(sCount * 3);
    for (let i = 0; i < sCount; i++) {
      const rx = (Math.random() - 0.5) * 36;
      const rz = (Math.random() - 0.5) * 36;
      const ry = Math.sin(rx * 0.2) * Math.cos(rz * 0.2) * 2.5 - 2;
      sPos[i * 3] = rx;
      sPos[i * 3 + 1] = ry;
      sPos[i * 3 + 2] = rz;
      sCol[i * 3] = 0.47;
      sCol[i * 3 + 1] = 0.69;
      sCol[i * 3 + 2] = 0.64;
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    sGeo.setAttribute("color", new THREE.BufferAttribute(sCol, 3));

    const dCount = 6000;
    const dPos = new Float32Array(dCount * 3);
    const dCol = new Float32Array(dCount * 3);
    for (let i = 0; i < dCount; i++) {
      const rx = (Math.random() - 0.5) * 44;
      const rz = (Math.random() - 0.5) * 44;
      const ry = Math.sin(rx * 0.15) * Math.cos(rz * 0.15) * 3.2 - 2;
      dPos[i * 3] = rx;
      dPos[i * 3 + 1] = ry;
      dPos[i * 3 + 2] = rz;
      dCol[i * 3] = 0.47;
      dCol[i * 3 + 1] = 0.69;
      dCol[i * 3 + 2] = 0.64;
    }
    const dGeo = new THREE.BufferGeometry();
    dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
    dGeo.setAttribute("color", new THREE.BufferAttribute(dCol, 3));

    return { sparseGeo: sGeo, denseGeo: dGeo };
  }, []);

  const isExplore = scrollProgress >= 0.86 && scrollProgress <= 0.96;
  const showMesh = isExplore || meshOpacity > 0.02;
  const showDense = !isExplore && denseOpacity > 0.02;
  const showSparse = !isExplore && sparseOpacity > 0.02;

  if (scrollProgress < 0.68) return null;

  return (
    <group position={[0, -2, 0]}>
      {/* 1. Sparse Point Cloud Phase */}
      {showSparse && (
        <points ref={sparsePointsRef} geometry={sparseGeo}>
          <pointsMaterial
            size={0.22}
            vertexColors
            transparent
            opacity={sparseOpacity}
            sizeAttenuation
          />
        </points>
      )}

      {/* 2. Dense Point Cloud Phase */}
      {showDense && (
        <points ref={densePointsRef} geometry={denseGeo}>
          <pointsMaterial
            size={0.16}
            vertexColors
            transparent
            opacity={denseOpacity}
            sizeAttenuation
          />
        </points>
      )}

      {/* 3. Real Supplied Northumberlandia Model (Identical to Demo Reconstruction) */}
      {showMesh && (
        <Suspense fallback={null}>
          <group scale={[0.42, 0.42, 0.42]} position={[0, 2, 0]}>
            <NorthumberlandiaModel
              mode={mode}
              autoCenterCamera={false}
            />
          </group>
        </Suspense>
      )}
    </group>
  );
}

// =====================================================================
//  ANIMATED RAY VISUALIZERS (Sections 01–04)
// =====================================================================

/**
 * 01 — Animated Scanning Rays (Capture Section)
 * Fan of laser beams from the drone + sweeping ground scan line + dot grid.
 */
function CaptureFrustumVisualizer({ scrollProgress }: { scrollProgress: number }) {
  const raysRef = useRef<THREE.Group>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);

  const opacity = useMemo(() => {
    if (scrollProgress < 0.12) return 0;
    if (scrollProgress < 0.22) return THREE.MathUtils.smoothstep(scrollProgress, 0.12, 0.20);
    if (scrollProgress <= 0.34) return 1;
    if (scrollProgress <= 0.42) return 1 - THREE.MathUtils.smoothstep(scrollProgress, 0.34, 0.42);
    return 0;
  }, [scrollProgress]);

  const rayCount = 12;
  const rayData = useMemo(() =>
    Array.from({ length: rayCount }, (_, i) => ({
      angle: (i / rayCount) * Math.PI * 2,
      speed: 0.8 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
    })),
  []);

  // Ground scan dot grid
  const scanDotsGeo = useMemo(() => {
    const count = 64;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = ((i % 8) - 3.5) * 0.9;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = (Math.floor(i / 8) - 3.5) * 0.9;
      col[i * 3] = 0.47;
      col[i * 3 + 1] = 0.69;
      col[i * 3 + 2] = 0.64;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!raysRef.current || !scanLineRef.current) return;
    const t = state.clock.getElapsedTime();

    // Sweeping scan line
    scanLineRef.current.position.z = Math.sin(t * 1.2) * 3;
    (scanLineRef.current.material as THREE.MeshBasicMaterial).opacity =
      opacity * (0.4 + Math.sin(t * 3) * 0.15);

    // Pulse individual rays
    raysRef.current.children.forEach((child, i) => {
      const rd = rayData[i];
      if (!rd) return;
      const pulse = Math.sin(t * rd.speed + rd.phase);
      (child as THREE.Mesh).scale.y = 0.8 + pulse * 0.2;
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = opacity * (0.2 + Math.max(0, pulse) * 0.25);
    });
  });

  if (opacity <= 0.01) return null;

  return (
    <group position={[0, 8, -scrollProgress * 4]}>
      {/* Fan of scanning laser rays */}
      <group ref={raysRef}>
        {rayData.map((rd, i) => {
          const spreadX = Math.cos(rd.angle) * 2.8;
          const spreadZ = Math.sin(rd.angle) * 2.8;
          const len = Math.sqrt(spreadX * spreadX + 5.5 * 5.5 + spreadZ * spreadZ);
          const midX = spreadX * 0.5;
          const midZ = spreadZ * 0.5;
          const rotX = Math.atan2(Math.sqrt(spreadX * spreadX + spreadZ * spreadZ), 5.5);
          const rotY = Math.atan2(spreadX, spreadZ);
          return (
            <mesh key={i} position={[midX, -2.75, midZ]} rotation={[rotX, rotY, 0]}>
              <cylinderGeometry args={[0.008, 0.008, len, 4]} />
              <meshBasicMaterial color="#78AFA2" transparent opacity={opacity * 0.3} />
            </mesh>
          );
        })}
      </group>

      {/* Sweeping ground scan line */}
      <mesh ref={scanLineRef} position={[0, -5.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 0.06]} />
        <meshBasicMaterial color="#8CC2B4" transparent opacity={opacity * 0.5} />
      </mesh>

      {/* Ground dot grid */}
      <points geometry={scanDotsGeo} position={[0, -5.1, 0]}>
        <pointsMaterial size={0.08} vertexColors transparent opacity={opacity * 0.7} sizeAttenuation />
      </points>

      {/* Ground boundary ring */}
      <mesh position={[0, -5.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.6, 3.7, 4]} />
        <meshBasicMaterial color="#78AFA2" transparent opacity={opacity * 0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Flight corridor guide ray */}
      <mesh>
        <boxGeometry args={[0.02, 0.02, 50]} />
        <meshBasicMaterial color="#4F7F74" transparent opacity={opacity * 0.35} />
      </mesh>
    </group>
  );
}

/**
 * 02 — Animated Frame Extraction Rays (Video Section)
 * Pulsing light rays from the drone to each video frame thumbnail.
 */
function VideoFramesSequence({ scrollProgress }: { scrollProgress: number }) {
  const raysGroupRef = useRef<THREE.Group>(null);

  const opacity = useMemo(() => {
    if (scrollProgress < 0.27) return 0;
    if (scrollProgress < 0.34) return THREE.MathUtils.smoothstep(scrollProgress, 0.27, 0.33);
    if (scrollProgress <= 0.44) return 1;
    if (scrollProgress <= 0.50) return 1 - THREE.MathUtils.smoothstep(scrollProgress, 0.44, 0.50);
    return 0;
  }, [scrollProgress]);

  const frameTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return loader.load("https://img.youtube.com/vi/lQoKTgduJsU/hqdefault.jpg");
  }, []);

  const frameOffsets = [-3.8, -1.2, 1.4, 4.0];

  useFrame((state) => {
    if (!raysGroupRef.current) return;
    const t = state.clock.getElapsedTime();
    raysGroupRef.current.children.forEach((child, i) => {
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      if (mat) {
        const pulse = Math.sin(t * 2.5 - i * 0.8);
        mat.opacity = opacity * (0.12 + Math.max(0, pulse) * 0.35);
      }
    });
  });

  if (opacity <= 0.01) return null;

  return (
    <group position={[0, 7.5, 0]}>
      {/* Extraction rays from drone area to each frame */}
      <group ref={raysGroupRef}>
        {frameOffsets.map((offsetZ, i) => {
          const spreadX = (i - 1.5) * 2.8;
          const frameY = -0.6 + i * 0.15;
          const dx = spreadX;
          const dy = frameY - 1;
          const dz = offsetZ;
          const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const midX = dx * 0.5;
          const midY = (1 + frameY) * 0.5;
          const midZ = dz * 0.5;
          const dir = new THREE.Vector3(dx, dy, dz).normalize();
          const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
          const euler = new THREE.Euler().setFromQuaternion(quat);
          return (
            <mesh key={`ray-${i}`} position={[midX, midY, midZ]} rotation={euler}>
              <cylinderGeometry args={[0.012, 0.012, len, 4]} />
              <meshBasicMaterial color="#78AFA2" transparent opacity={opacity * 0.25} />
            </mesh>
          );
        })}
      </group>

      {/* Video frames with teal edge glow + corner markers */}
      {frameOffsets.map((offsetZ, i) => {
        const spreadX = (i - 1.5) * 2.8;
        return (
          <group
            key={i}
            position={[spreadX, -0.6 + i * 0.15, offsetZ]}
            rotation={[0.1, -0.15 * (i - 1.5), 0]}
          >
            <mesh>
              <planeGeometry args={[2.5, 1.5]} />
              <meshBasicMaterial map={frameTexture} transparent opacity={opacity * 0.88} />
            </mesh>
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[2.6, 1.6]} />
              <meshBasicMaterial color="#78AFA2" transparent opacity={opacity * 0.18} />
            </mesh>
            {/* Corner marker dots */}
            {[[-1.2, 0.72], [1.2, 0.72], [-1.2, -0.72], [1.2, -0.72]].map(([cx, cy], ci) => (
              <mesh key={ci} position={[cx!, cy!, 0.01]}>
                <circleGeometry args={[0.04, 8]} />
                <meshBasicMaterial color="#8CC2B4" transparent opacity={opacity * 0.8} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

/**
 * 03 — Animated Feature-Matching Rays (Analysis Section)
 * Sequential pulse rays between detected keypoints + scanning sweep beam.
 */
function FeatureAnalysisVisualizer({ scrollProgress }: { scrollProgress: number }) {
  const matchRaysRef = useRef<THREE.Group>(null);
  const sweepRef = useRef<THREE.Mesh>(null);

  const opacity = useMemo(() => {
    if (scrollProgress < 0.42) return 0;
    if (scrollProgress < 0.48) return THREE.MathUtils.smoothstep(scrollProgress, 0.42, 0.48);
    if (scrollProgress <= 0.58) return 1;
    if (scrollProgress <= 0.64) return 1 - THREE.MathUtils.smoothstep(scrollProgress, 0.58, 0.64);
    return 0;
  }, [scrollProgress]);

  const { pointsGeo, matchRayData } = useMemo(() => {
    const pCount = 36;
    const pos = new Float32Array(pCount * 3);
    const colors = new Float32Array(pCount * 3);
    const rays: { from: number[]; to: number[] }[] = [];

    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const r = 1.0 + Math.sin(i * 3) * 0.5;
      const x = -2.5 + Math.cos(angle) * r;
      const y = 6.8 + Math.sin(angle) * (r * 0.6);
      const z = 0.5 + (i % 3) * 0.2;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      colors[i * 3] = 0.47;
      colors[i * 3 + 1] = 0.69;
      colors[i * 3 + 2] = 0.64;

      const tx = x + 5.0 + Math.sin(i * 2) * 0.3;
      const ty = y - 0.2 + Math.cos(i * 2) * 0.2;
      const tz = z - 0.4;
      pos[(18 + i) * 3] = tx;
      pos[(18 + i) * 3 + 1] = ty;
      pos[(18 + i) * 3 + 2] = tz;
      colors[(18 + i) * 3] = 0.55;
      colors[(18 + i) * 3 + 1] = 0.76;
      colors[(18 + i) * 3 + 2] = 0.71;

      rays.push({ from: [x, y, z], to: [tx, ty, tz] });
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return { pointsGeo: pGeo, matchRayData: rays };
  }, []);

  useFrame((state) => {
    if (!matchRaysRef.current || !sweepRef.current) return;
    const t = state.clock.getElapsedTime();

    // Sequential pulse activation
    matchRaysRef.current.children.forEach((child, i) => {
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      if (mat) {
        const activation = (t * 1.5 - i * 0.15) % (Math.PI * 2);
        const pulse = Math.max(0, Math.sin(activation)) * 0.55;
        mat.opacity = opacity * (0.06 + pulse);
      }
    });

    // Sweep beam rotation
    sweepRef.current.rotation.z = t * 0.6;
    (sweepRef.current.material as THREE.MeshBasicMaterial).opacity =
      opacity * (0.1 + Math.sin(t * 2) * 0.05);
  });

  if (opacity <= 0.01) return null;

  return (
    <group>
      {/* Feature keypoints */}
      <points geometry={pointsGeo}>
        <pointsMaterial size={0.16} vertexColors transparent opacity={opacity * 0.95} sizeAttenuation />
      </points>

      {/* Animated match rays */}
      <group ref={matchRaysRef}>
        {matchRayData.map((ray, i) => {
          const dx = ray.to[0] - ray.from[0];
          const dy = ray.to[1] - ray.from[1];
          const dz = ray.to[2] - ray.from[2];
          const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const midX = (ray.from[0] + ray.to[0]) * 0.5;
          const midY = (ray.from[1] + ray.to[1]) * 0.5;
          const midZ = (ray.from[2] + ray.to[2]) * 0.5;
          const dir = new THREE.Vector3(dx, dy, dz).normalize();
          const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
          const euler = new THREE.Euler().setFromQuaternion(quat);
          return (
            <mesh key={i} position={[midX, midY, midZ]} rotation={euler}>
              <cylinderGeometry args={[0.006, 0.006, len, 3]} />
              <meshBasicMaterial color="#78AFA2" transparent opacity={opacity * 0.25} />
            </mesh>
          );
        })}
      </group>

      {/* Scanning sweep beam */}
      <mesh ref={sweepRef} position={[0, 6.8, 0.3]}>
        <planeGeometry args={[12, 0.03]} />
        <meshBasicMaterial color="#8CC2B4" transparent opacity={opacity * 0.12} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/**
 * 04 — Animated Camera Path with Reconstruction Rays
 * Glowing pulse traveling the path + rays shooting down from each camera pose.
 */
function CameraPathTrajectoryVisualizer({ scrollProgress }: { scrollProgress: number }) {
  const pathPulseRef = useRef<THREE.Mesh>(null);
  const reconRaysRef = useRef<THREE.Group>(null);

  const opacity = useMemo(() => {
    if (scrollProgress < 0.57) return 0;
    if (scrollProgress < 0.63) return THREE.MathUtils.smoothstep(scrollProgress, 0.57, 0.63);
    if (scrollProgress <= 0.74) return 1;
    if (scrollProgress <= 0.82) return 1 - THREE.MathUtils.smoothstep(scrollProgress, 0.74, 0.82);
    return 0;
  }, [scrollProgress]);

  const { pathLineGeo, frustumIndices, curvePoints } = useMemo(() => {
    const points = [
      new THREE.Vector3(-8, 9.5, 8),
      new THREE.Vector3(-4, 9.0, 4),
      new THREE.Vector3(0, 8.5, 0),
      new THREE.Vector3(4, 9.2, -4),
      new THREE.Vector3(8, 10.0, -8),
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const sampled = curve.getPoints(60);
    const positions = new Float32Array(sampled.length * 3);
    sampled.forEach((pt, i) => {
      positions[i * 3] = pt.x;
      positions[i * 3 + 1] = pt.y;
      positions[i * 3 + 2] = pt.z;
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { pathLineGeo: geo, frustumIndices: [6, 18, 30, 42, 54], curvePoints: sampled };
  }, []);

  // Line material created once
  const pathLineMat = useMemo(() =>
    new THREE.LineBasicMaterial({ color: 0x78afa2, transparent: true, opacity: 0.6, linewidth: 2 }),
  []);
  const pathLineObj = useMemo(() => new THREE.Line(pathLineGeo, pathLineMat), [pathLineGeo, pathLineMat]);

  useFrame((state) => {
    if (!pathPulseRef.current || !reconRaysRef.current) return;
    const t = state.clock.getElapsedTime();

    // Update line opacity
    pathLineMat.opacity = opacity * 0.6;

    // Pulse traveling along path
    const pulsePos = (t * 0.3) % 1;
    const idx = Math.floor(pulsePos * (curvePoints.length - 1));
    const pt = curvePoints[Math.min(idx, curvePoints.length - 1)];
    pathPulseRef.current.position.set(pt.x, pt.y, pt.z);
    (pathPulseRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.8;

    // Reconstruction rays pulsing
    reconRaysRef.current.children.forEach((child, i) => {
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      if (mat) {
        const pulse = Math.sin(t * 1.8 - i * 0.9);
        mat.opacity = opacity * (0.08 + Math.max(0, pulse) * 0.3);
      }
      const s = 1 + Math.sin(t * 2 - i * 0.6) * 0.08;
      (child as THREE.Mesh).scale.set(1, s, 1);
    });
  });

  if (opacity <= 0.01) return null;

  return (
    <group>
      {/* Camera flight path */}
      <primitive object={pathLineObj} />

      {/* Traveling pulse dot */}
      <mesh ref={pathPulseRef}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshBasicMaterial color="#8CC2B4" transparent opacity={opacity * 0.8} />
      </mesh>

      {/* Camera poses + frustum cones */}
      {frustumIndices.map((fidx, i) => {
        const pt = curvePoints[Math.min(fidx, curvePoints.length - 1)];
        return (
          <group key={i} position={[pt.x, pt.y, pt.z]}>
            <mesh>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color="#8CC2B4" transparent opacity={opacity * 0.9} />
            </mesh>
            <mesh position={[0, -0.6, 0]} rotation={[0.4, 0, 0]}>
              <coneGeometry args={[0.5, 1.0, 4]} />
              <meshBasicMaterial color="#78AFA2" wireframe transparent opacity={opacity * 0.45} />
            </mesh>
          </group>
        );
      })}

      {/* Reconstruction rays shooting down from each camera */}
      <group ref={reconRaysRef}>
        {frustumIndices.flatMap((fidx, i) => {
          const pt = curvePoints[Math.min(fidx, curvePoints.length - 1)];
          return [0, -0.3, 0.3].map((offset, ri) => (
            <mesh
              key={`${i}-${ri}`}
              position={[pt.x + offset, pt.y - 2.5, pt.z + offset * 0.5]}
            >
              <cylinderGeometry args={[0.005, 0.005, 4.5, 3]} />
              <meshBasicMaterial color="#78AFA2" transparent opacity={opacity * 0.18} />
            </mesh>
          ));
        })}
      </group>
    </group>
  );
}

// =====================================================================
//  DRONE — Animated Flight → Deceleration → Stable Stop
// =====================================================================

/**
 * Real Survey Drone with animated flight.
 * Hero: dynamic swooping/banking entrance.
 * Sections 01-05: active flight with movement.
 * Terrain/Explore (06+): decelerates, comes to a complete stable stop.
 */
function PhysicalDrone({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/drone_optimized.glb");
  const { actions, names } = useAnimations(animations, groupRef);

  useEffect(() => {
    if (actions["hover"]) {
      actions["hover"].reset().fadeIn(0.4).play();
    } else if (names.length > 0 && actions[names[0]]) {
      actions[names[0]]?.play();
    }

    if (actions["exploded_view"]) actions["exploded_view"].stop();
    if (actions["step_by_step"]) actions["step_by_step"].stop();

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [actions, names, scene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Dynamic flight wobble — decreases as we approach terrain section
    // In terrain/explore (0.88+), wobble approaches zero = stable stop
    const wobbleFactor =
      scrollProgress <= 0.72
        ? 1
        : scrollProgress <= 0.88
        ? 1 - THREE.MathUtils.smoothstep(scrollProgress, 0.72, 0.88)
        : 0;

    const hoverWobbleY = Math.sin(t * 1.5) * 0.1 * wobbleFactor;
    const hoverRoll = Math.sin(t * 1.0) * 0.015 * wobbleFactor;

    // Banking/yaw motion during active flight sections
    const bankFactor =
      scrollProgress <= 0.60
        ? 1
        : scrollProgress <= 0.72
        ? 1 - THREE.MathUtils.smoothstep(scrollProgress, 0.60, 0.72)
        : 0;

    const bankAngle = Math.sin(t * 0.7) * 0.06 * bankFactor;
    const yawDrift = Math.sin(t * 0.4) * 0.04 * bankFactor;

    let targetX = 3.5;
    let targetY = 8;
    let targetZ = 2;
    let targetRotX = -0.04;
    let targetRotY = -0.25;
    let targetRotZ = 0;
    let targetScale = 2.8;
    let lerpSpeed = 0.07;

    if (scrollProgress <= 0.15) {
      // Hero phase: large drone, center-right, overlapping text, active flight wobble
      const p = scrollProgress / 0.15;
      targetX = 3.5 + Math.sin(t * 0.5) * 0.3 * bankFactor;
      targetY = 8 + hoverWobbleY;
      targetZ = 2 - p * 1.5;
      targetRotX = -0.04 + p * 0.06 + bankAngle;
      targetRotY = -0.25 + p * 0.15 + yawDrift;
      targetRotZ = hoverRoll + Math.sin(t * 0.8) * 0.02 * bankFactor;
      targetScale = 2.8;
    } else if (scrollProgress <= 0.30) {
      // Transition — drone banks and flies away from text
      const p = (scrollProgress - 0.15) / 0.15;
      targetX = THREE.MathUtils.lerp(3.5, 0, p) + Math.sin(t * 0.6) * 0.4 * bankFactor;
      targetY = 8 + hoverWobbleY;
      targetZ = 0.5 - p * 2.5;
      targetRotX = 0.06 + bankAngle;
      targetRotY = THREE.MathUtils.lerp(-0.1, 0, p) + yawDrift;
      targetRotZ = hoverRoll + Math.sin(t * 0.9) * 0.03 * bankFactor;
      targetScale = THREE.MathUtils.lerp(2.8, 1.6, p);
    } else if (scrollProgress <= 0.45) {
      // Capture — drone sways side-to-side, active scanning
      const p = (scrollProgress - 0.30) / 0.15;
      targetX = Math.sin(p * Math.PI) * 0.8 + Math.sin(t * 0.7) * 0.5 * bankFactor;
      targetY = 8.2 + hoverWobbleY;
      targetZ = -2.0 + p * 1.2;
      targetRotX = 0.04 + bankAngle;
      targetRotY = 0.25 * Math.sin(p * Math.PI) + yawDrift;
      targetRotZ = hoverRoll - 0.04 * Math.sin(p * Math.PI) + bankAngle;
      targetScale = 1.5;
    } else if (scrollProgress <= 0.60) {
      // Analysis — drone circles slowly
      const p = (scrollProgress - 0.45) / 0.15;
      targetX = Math.sin(t * 0.3) * 0.6 * bankFactor;
      targetY = 8.8 + hoverWobbleY;
      targetZ = -1.2 - p * 1.0;
      targetRotX = 0.08 + bankAngle;
      targetRotY = yawDrift;
      targetRotZ = hoverRoll;
      targetScale = 1.4;
    } else if (scrollProgress <= 0.72) {
      // Camera path — drone follows a gentle arc, banking decreases
      const p = (scrollProgress - 0.60) / 0.12;
      targetX = Math.sin(p * 2.5) * 2.0 * (1 - p * 0.5);
      targetY = 9.2 + hoverWobbleY;
      targetZ = -2.2 - p * 2.0;
      targetRotX = 0.06 + bankAngle * (1 - p);
      targetRotY = 0.15 * p;
      targetRotZ = hoverRoll;
      targetScale = 1.3;
    } else if (scrollProgress <= 0.88) {
      // Reconstruction — drone decelerates, wobble fading out
      const p = (scrollProgress - 0.72) / 0.16;
      targetX = THREE.MathUtils.lerp(1.5, 0, p);
      targetY = 10.5 + hoverWobbleY;
      targetZ = -4.2 + p * 2.0;
      targetRotX = 0.1 * (1 - p * 0.5);
      targetRotY = p * 0.2 * (1 - p);
      targetRotZ = hoverRoll;
      targetScale = 1.2;
      lerpSpeed = THREE.MathUtils.lerp(0.07, 0.04, p); // slower = smoother deceleration
    } else if (scrollProgress <= 0.95) {
      // Terrain / Explore — STABLE STOP. No wobble, no banking.
      targetX = 0;
      targetY = 11.2;
      targetZ = -2.2;
      targetRotX = 0.04;
      targetRotY = 0;
      targetRotZ = 0;
      targetScale = 1.1;
      lerpSpeed = 0.035; // very smooth settling
    } else {
      // Final CTA — drone gently returns to hero position, still stable
      const p = (scrollProgress - 0.95) / 0.05;
      targetX = 0;
      targetY = THREE.MathUtils.lerp(11.2, 8.0, p);
      targetZ = THREE.MathUtils.lerp(-2.2, 2, p);
      targetRotX = THREE.MathUtils.lerp(0.04, -0.04, p);
      targetRotY = THREE.MathUtils.lerp(0, -0.25, p);
      targetRotZ = 0;
      targetScale = THREE.MathUtils.lerp(1.1, 2.8, p);
      lerpSpeed = 0.04;
    }

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, lerpSpeed);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, lerpSpeed);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, lerpSpeed);

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, lerpSpeed);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, lerpSpeed);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, lerpSpeed);

    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, lerpSpeed);
    groupRef.current.scale.set(newScale, newScale, newScale);
  });

  return (
    <group ref={groupRef} position={[3.5, 8, 2]} scale={[2.8, 2.8, 2.8]}>
      <primitive object={scene} position={[0, -0.36, 0]} />
    </group>
  );
}

/**
 * Fallback Procedural Drone if GLB is loading
 */
function FallbackProceduralDrone({ scrollProgress }: { scrollProgress: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.y = 8 + Math.sin(t * 1.5) * 0.1;
  });

  return (
    <group ref={ref} position={[0, 8, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.5, 2.4]} />
        <meshStandardMaterial color="#121916" roughness={0.4} metalness={0.8} />
      </mesh>
    </group>
  );
}

class DroneErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: unknown) {
    console.warn("Drone GLTF could not be rendered, falling back cleanly:", err);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/**
 * Cinematic Camera Rig with smooth OrbitControls in Explore mode
 */
function CameraController({
  scrollProgress,
  isInteractive,
  resetCameraTrigger = 0,
}: {
  scrollProgress: number;
  isInteractive: boolean;
  resetCameraTrigger?: number;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);

  useEffect(() => {
    if (controlsRef.current && isInteractive) {
      controlsRef.current.reset();
      camera.position.set(0, 16, 26);
      controlsRef.current.target.set(0, 3, 0);
      controlsRef.current.update();
    }
  }, [resetCameraTrigger, isInteractive, camera]);

  useFrame((state) => {
    if (isInteractive) return;

    const t = state.clock.getElapsedTime();
    let targetPosX = 0;
    let targetPosY = 11;
    let targetPosZ = 18;
    let targetLookAtY = 7.5;

    if (scrollProgress <= 0.15) {
      // Camera positioned to frame the larger drone with the hero text
      const angle = 0.2 + Math.sin(t * 0.1) * 0.03;
      const radius = 19;
      targetPosX = Math.sin(angle) * radius;
      targetPosY = 10.8;
      targetPosZ = Math.cos(angle) * radius;
      targetLookAtY = 7.6;
    } else if (scrollProgress <= 0.30) {
      targetPosX = 0;
      targetPosY = 11.5;
      targetPosZ = 16.5;
      targetLookAtY = 7.2;
    } else if (scrollProgress <= 0.45) {
      targetPosX = 1.2;
      targetPosY = 11.0;
      targetPosZ = 16.0;
      targetLookAtY = 7.4;
    } else if (scrollProgress <= 0.60) {
      targetPosX = 0;
      targetPosY = 10.8;
      targetPosZ = 15.5;
      targetLookAtY = 7.0;
    } else if (scrollProgress <= 0.72) {
      targetPosX = -2.5;
      targetPosY = 12.0;
      targetPosZ = 18.0;
      targetLookAtY = 7.2;
    } else if (scrollProgress <= 0.88) {
      const p = (scrollProgress - 0.72) / 0.16;
      targetPosX = THREE.MathUtils.lerp(-2.5, 0, p);
      targetPosY = THREE.MathUtils.lerp(12.0, 16.0, p);
      targetPosZ = THREE.MathUtils.lerp(18.0, 26.0, p);
      targetLookAtY = THREE.MathUtils.lerp(7.2, 3.5, p);
    } else if (scrollProgress <= 0.95) {
      targetPosX = 0;
      targetPosY = 16.0;
      targetPosZ = 26.0;
      targetLookAtY = 3.5;
    } else {
      const p = (scrollProgress - 0.95) / 0.05;
      targetPosX = 0;
      targetPosY = THREE.MathUtils.lerp(16.0, 11.0, p);
      targetPosZ = THREE.MathUtils.lerp(26.0, 17.0, p);
      targetLookAtY = THREE.MathUtils.lerp(3.5, 7.5, p);
    }

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetPosX, 0.06);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetPosY, 0.06);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetPosZ, 0.06);
    state.camera.lookAt(0, targetLookAtY, 0);
  });

  return isInteractive ? (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={10}
      maxDistance={45}
      maxPolarAngle={Math.PI / 2 - 0.05}
    />
  ) : null;
}

/**
 * Dedicated DroneScene Component
 */
export function DroneScene({
  scrollProgress = 0,
  terrainMode = "textured",
  isInteractive = false,
  resetCameraTrigger = 0,
}: DroneSceneProps) {
  return (
    <div className="absolute inset-0 w-full h-full select-none">
      <Canvas
        camera={{ position: [0, 11, 18], fov: 40 }}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        className="w-full h-full"
      >
        <color attach="background" args={["#080B0A"]} />
        <fog attach="fog" args={["#080B0A", 30, 100]} />

        {/* Improved Studio Lighting for larger drone */}
        <ambientLight intensity={0.45} />
        <directionalLight position={[20, 35, 20]} intensity={1.8} castShadow color="#FFFBF5" />
        <directionalLight position={[-18, 15, 10]} intensity={0.5} color="#E8EDE9" />
        <directionalLight position={[-10, 20, -25]} intensity={0.55} color="#78AFA2" />
        <directionalLight position={[15, 8, -18]} intensity={0.3} color="#8CC2B4" />
        <hemisphereLight args={["#1a2420", "#080B0A", 0.5]} />

        {/* Camera Rig */}
        <CameraController
          scrollProgress={scrollProgress}
          isInteractive={isInteractive}
          resetCameraTrigger={resetCameraTrigger}
        />

        {/* Real 3D Physical Drone Model */}
        <DroneErrorBoundary fallback={<FallbackProceduralDrone scrollProgress={scrollProgress} />}>
          <Suspense fallback={<FallbackProceduralDrone scrollProgress={scrollProgress} />}>
            <PhysicalDrone scrollProgress={scrollProgress} />
          </Suspense>
        </DroneErrorBoundary>

        {/* Story Visualizers — Animated Rays */}
        <CaptureFrustumVisualizer scrollProgress={scrollProgress} />
        <VideoFramesSequence scrollProgress={scrollProgress} />
        <FeatureAnalysisVisualizer scrollProgress={scrollProgress} />
        <CameraPathTrajectoryVisualizer scrollProgress={scrollProgress} />

        {/* Real Northumberlandia 3D Terrain Model */}
        <RealTerrainReconstruction
          scrollProgress={scrollProgress}
          mode={terrainMode}
        />
      </Canvas>
    </div>
  );
}

// Preload assets for instant caching
try {
  useGLTF.preload("/models/drone_optimized.glb");
  useGLTF.preload("/models/northumberlandia_standard.glb");
} catch {
  // Ignored in SSR
}
