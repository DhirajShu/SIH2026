"use client";

import React, { useRef, useEffect, Suspense, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";

export interface DroneModelProps {
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  showCameraFrustum?: boolean;
  frustumColor?: string;
  frustumOpacity?: number;
  hoverAnimation?: boolean;
  scrollProgress?: number;
  className?: string;
}

/**
 * Real Survey Drone 3D Component
 * Loads the user-supplied drone GLB (/models/drone_optimized.glb with fallback to /models/drone.glb).
 * Strictly enforces intact drone visualization (hover flight with spinning rotors).
 * Disables exploded / disassembled animations.
 */
function RealDroneMesh({
  scale = 1.25,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  showCameraFrustum = false,
  frustumColor = "#78AFA2",
  frustumOpacity = 0.25,
  hoverAnimation = true,
  scrollProgress = 0,
}: DroneModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Load the web-optimized drone asset (6.4MB WebP) or original
  const { scene, animations } = useGLTF("/models/drone_optimized.glb");
  const { actions, names } = useAnimations(animations, groupRef);

  // Configure animations: play 'hover' flight and stop any disassembly animations
  useEffect(() => {
    if (actions["hover"]) {
      actions["hover"].reset().fadeIn(0.4).play();
    } else if (names.length > 0 && actions[names[0]]) {
      actions[names[0]]?.play();
    }

    if (actions["exploded_view"]) {
      actions["exploded_view"].stop();
    }
    if (actions["step_by_step"]) {
      actions["step_by_step"].stop();
    }

    // Ensure materials and shadows render smoothly
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [actions, names, scene]);

  // Subtle flight physics simulation (gentle pitch/roll/wobble)
  useFrame((state) => {
    if (!groupRef.current) return;
    if (hoverAnimation) {
      const t = state.clock.getElapsedTime();
      const hoverWobbleY = Math.sin(t * 1.8) * 0.12;
      const hoverRoll = Math.sin(t * 1.2) * 0.025;
      const hoverPitch = Math.cos(t * 1.5) * 0.02 - 0.05; // slight forward survey attitude

      groupRef.current.position.y = position[1] + hoverWobbleY - scrollProgress * 3;
      groupRef.current.rotation.z = rotation[2] + hoverRoll;
      groupRef.current.rotation.x = rotation[0] + hoverPitch;
    }
  });

  const finalScale = typeof scale === "number" ? [scale, scale, scale] : scale;

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={finalScale as [number, number, number]}
    >
      {/* Centering offset for drone chassis */}
      <primitive object={scene} position={[0, -0.32, 0]} />

      {/* Optical Sensor Video View Frustum for survey capture visualization */}
      {showCameraFrustum && (
        <group position={[0, -2.5, -1.6]} rotation={[Math.PI / 2 + 0.26, 0, 0]}>
          <mesh>
            <coneGeometry args={[2.8, 5.0, 4]} />
            <meshBasicMaterial
              color={frustumColor}
              wireframe
              transparent
              opacity={frustumOpacity}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

/**
 * Lightweight procedural fallback during asset download
 */
function DroneFallback({
  scale = 1.0,
  position = [0, 0, 0],
}: DroneModelProps) {
  const finalScale = typeof scale === "number" ? [scale, scale, scale] : scale;
  return (
    <group position={position} scale={finalScale as [number, number, number]}>
      <mesh>
        <boxGeometry args={[1.6, 0.4, 1.8]} />
        <meshStandardMaterial color="#121916" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Arms */}
      {[
        [-1, 0, -1],
        [1, 0, -1],
        [-1, 0, 1],
        [1, 0, 1],
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.08, 0.08, 1.2]} />
          <meshStandardMaterial color="#26302C" metalness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Error Boundary ensuring a GLB load failure never breaks the WebGL canvas
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
  componentDidCatch(error: any) {
    console.warn("Drone GLB could not be rendered, falling back to backup preview:", error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Reusable DroneModel component used across landing page, hero, and viewer previews.
 */
export function DroneModel(props: DroneModelProps) {
  return (
    <DroneErrorBoundary fallback={<DroneFallback {...props} />}>
      <Suspense fallback={<DroneFallback {...props} />}>
        <RealDroneMesh {...props} />
      </Suspense>
    </DroneErrorBoundary>
  );
}

// Preload optimized drone model
try {
  useGLTF.preload("/models/drone_optimized.glb");
} catch {
  // Ignored in SSR
}
