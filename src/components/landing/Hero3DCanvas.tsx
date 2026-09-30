"use client";

import React, { useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { SurveyDrone3D } from "./SurveyDrone3D";

interface Hero3DCanvasProps {
  scrollProgress?: number;
}

function LandscapeMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate realistic undulating survey landscape
  const { geometry, texture } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(180, 180, 96, 96);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const nx = x / 60;
      const nz = z / 60;

      // Realistic topography: terraces and natural ridges
      const dist = Math.sqrt(nx * nx + nz * nz);
      const baseBowl = Math.pow(dist, 1.4) * 8;
      const benches = Math.floor(baseBowl / 3) * 2.8;
      const ridges = Math.sin(nx * 4 + nz * 2) * 2.2 + Math.cos(nz * 5) * 1.5;
      const fineNoise = Math.sin(nx * 12) * Math.cos(nz * 12) * 0.4;

      pos.setY(i, benches + ridges + fineNoise - 6);
    }
    geo.computeVertexNormals();

    // Create subtle grid & elevation texture
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#111317";
      ctx.fillRect(0, 0, 512, 512);

      // Fine topographical lines
      ctx.strokeStyle = "rgba(245, 158, 11, 0.15)";
      ctx.lineWidth = 1;
      for (let y = 0; y < 512; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }
      for (let x = 0; x < 512; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);

    return { geometry: geo, texture: tex };
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow position={[0, -2, 0]}>
      <meshStandardMaterial
        color="#15181e"
        map={texture}
        roughness={0.88}
        metalness={0.12}
      />
    </mesh>
  );
}

// Camera flight controller
function SceneCameraRig({ scrollProgress = 0 }: { scrollProgress: number }) {
  useFrame((state) => {
    // Camera gently orbits and moves down toward the drone as user begins scroll
    const t = state.clock.getElapsedTime();
    const radius = 18 - scrollProgress * 6;
    const angle = 0.4 + Math.sin(t * 0.15) * 0.1;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, Math.sin(angle) * radius, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 11 - scrollProgress * 3, 0.05);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, Math.cos(angle) * radius, 0.05);
    state.camera.lookAt(0, 7.5 - scrollProgress * 2, 0);
  });

  return null;
}

export function Hero3DCanvas({ scrollProgress = 0 }: Hero3DCanvasProps) {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
      <Canvas
        camera={{ position: [0, 12, 18], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        <color attach="background" args={["#08090b"]} />
        <fog attach="fog" args={["#08090b", 22, 90]} />

        {/* Cinematic Aerospace Lighting */}
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[30, 45, 20]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          color="#fff6e5"
        />
        <directionalLight position={[-25, 20, -25]} intensity={0.35} color="#38bdf8" />

        {/* 3D Scene Elements */}
        <SceneCameraRig scrollProgress={scrollProgress} />
        <SurveyDrone3D scrollProgress={scrollProgress} />
        <LandscapeMesh />

        {/* Survey Flight Path Guide Wire */}
        <group position={[0, 8, 0]}>
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[
                  new Float32Array([
                    0, 0, -40,
                    0, 0, 40
                  ]),
                  3,
                ]}
              />
            </bufferGeometry>
            <lineDashedMaterial color="#78AFA2" dashSize={1.5} gapSize={1.0} opacity={0.35} transparent />
          </line>
        </group>
      </Canvas>
    </div>
  );
}
