"use client";

import React, { useRef, useEffect, Suspense, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";

interface SurveyDrone3DProps {
  scrollProgress?: number; // 0 to 1
  cameraTarget?: boolean;
}

/**
 * GLTF Drone Model loaded from public/models/flying_drone_animation.glb
 * Provided by the user in the repository root.
 * Strictly plays the 'hover' animation (hovering flight with spinning propellers)
 * and strictly prevents 'exploded_view' or disassembly.
 */
function UserDroneModel({
  scrollProgress = 0,
}: {
  scrollProgress: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/drone.glb");
  const { actions, names } = useAnimations(animations, groupRef);

  useEffect(() => {
    // CRITICAL CREATIVE DIRECTION: Keep drone intact as one piece.
    // Explicitly play 'hover' and ensure exploded_view is NEVER activated.
    if (actions["hover"]) {
      actions["hover"].reset().fadeIn(0.5).play();
    } else if (names.length > 0 && actions[names[0]]) {
      actions[names[0]]?.play();
    }

    if (actions["exploded_view"]) {
      actions["exploded_view"].stop();
    }
    if (actions["step_by_step"]) {
      actions["step_by_step"].stop();
    }

    // Traverse scene to enable shadows and ensure materials render crisply
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [actions, names, scene]);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      const hoverWobbleY = Math.sin(t * 1.8) * 0.15;
      const hoverRoll = Math.sin(t * 1.2) * 0.03;
      const hoverPitch = Math.cos(t * 1.5) * 0.02 - 0.06; // slight forward flight tilt

      groupRef.current.position.y = 8 + hoverWobbleY - scrollProgress * 4;
      groupRef.current.rotation.z = hoverRoll;
      groupRef.current.rotation.x = hoverPitch;
    }
  });

  return (
    <group ref={groupRef} position={[0, 8, 0]} scale={[1.25, 1.25, 1.25]}>
      {/* Offset scene center so origin is centered */}
      <primitive object={scene} position={[0, -0.36, 0]} />

      {/* Optical Sensor Video View Frustum (Visualizing Single-Pass Corridor Video Capture) */}
      <mesh position={[0, -2.6, -1.8]} rotation={[Math.PI / 2 + 0.28, 0, 0]}>
        <coneGeometry args={[2.8, 5.0, 4]} />
        <meshBasicMaterial
          color="#f59e0b"
          wireframe
          transparent
          opacity={0.16}
        />
      </mesh>
    </group>
  );
}

/**
 * Fallback Procedural Drone rendered while GLTF model is downloading
 */
function ProceduralDroneFallback({
  scrollProgress = 0,
}: {
  scrollProgress: number;
}) {
  const droneRef = useRef<THREE.Group>(null);
  const prop1Ref = useRef<THREE.Group>(null);
  const prop2Ref = useRef<THREE.Group>(null);
  const prop3Ref = useRef<THREE.Group>(null);
  const prop4Ref = useRef<THREE.Group>(null);

  const materials = useMemo(() => {
    return {
      chassis: new THREE.MeshStandardMaterial({
        color: 0x181a20,
        roughness: 0.35,
        metalness: 0.85,
      }),
      carbonMat: new THREE.MeshStandardMaterial({
        color: 0x0f1115,
        roughness: 0.45,
        metalness: 0.6,
      }),
      darkMetal: new THREE.MeshStandardMaterial({
        color: 0x272c35,
        roughness: 0.25,
        metalness: 0.9,
      }),
      goldAccent: new THREE.MeshStandardMaterial({
        color: 0xeab308,
        roughness: 0.3,
        metalness: 0.95,
      }),
      propeller: new THREE.MeshStandardMaterial({
        color: 0x1e232b,
        roughness: 0.4,
        metalness: 0.6,
        transparent: true,
        opacity: 0.88,
      }),
    };
  }, []);

  useFrame((state, delta) => {
    const propSpeed = 45;
    if (prop1Ref.current) prop1Ref.current.rotation.y += propSpeed * delta;
    if (prop2Ref.current) prop2Ref.current.rotation.y -= propSpeed * delta;
    if (prop3Ref.current) prop3Ref.current.rotation.y += propSpeed * delta;
    if (prop4Ref.current) prop4Ref.current.rotation.y -= propSpeed * delta;

    if (droneRef.current) {
      const t = state.clock.getElapsedTime();
      const hoverWobbleY = Math.sin(t * 1.8) * 0.15;
      const hoverRoll = Math.sin(t * 1.2) * 0.03;
      const hoverPitch = Math.cos(t * 1.5) * 0.02 - 0.08;

      droneRef.current.position.y = 8 + hoverWobbleY - scrollProgress * 4;
      droneRef.current.rotation.z = hoverRoll;
      droneRef.current.rotation.x = hoverPitch;
    }
  });

  return (
    <group ref={droneRef} position={[0, 8, 0]} scale={[1.1, 1.1, 1.1]}>
      <mesh material={materials.chassis} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.65, 2.8]} />
      </mesh>
      <mesh position={[0, 0.45, -0.1]} material={materials.darkMetal} castShadow>
        <cylinderGeometry args={[0.65, 0.9, 0.4, 8]} />
      </mesh>
      {[
        { x: 1.5, z: -1.5, propRef: prop1Ref },
        { x: 1.5, z: 1.5, propRef: prop2Ref },
        { x: -1.5, z: 1.5, propRef: prop3Ref },
        { x: -1.5, z: -1.5, propRef: prop4Ref },
      ].map((arm, index) => (
        <group key={index}>
          <mesh position={[arm.x, 0.15, arm.z]} material={materials.darkMetal}>
            <cylinderGeometry args={[0.28, 0.28, 0.38, 16]} />
          </mesh>
          <group ref={arm.propRef} position={[arm.x, 0.58, arm.z]}>
            <mesh material={materials.propeller} castShadow>
              <boxGeometry args={[0.18, 0.02, 2.0]} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

// Error boundary state wrapper for safe GLTF rendering
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
    console.warn("Drone GLTF could not be rendered, falling back to procedural model:", error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function SurveyDrone3D({
  scrollProgress = 0,
}: SurveyDrone3DProps) {
  return (
    <DroneErrorBoundary fallback={<ProceduralDroneFallback scrollProgress={scrollProgress} />}>
      <Suspense fallback={<ProceduralDroneFallback scrollProgress={scrollProgress} />}>
        <UserDroneModel scrollProgress={scrollProgress} />
      </Suspense>
    </DroneErrorBoundary>
  );
}

// Preload the user's drone model for instant caching
try {
  useGLTF.preload("/models/drone.glb");
} catch {
  // Ignored if called in SSR
}
