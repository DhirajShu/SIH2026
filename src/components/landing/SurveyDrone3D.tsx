"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface SurveyDrone3DProps {
  scrollProgress?: number; // 0 to 1
  cameraTarget?: boolean;
}

export function SurveyDrone3D({
  scrollProgress = 0,
  cameraTarget = false,
}: SurveyDrone3DProps) {
  const droneRef = useRef<THREE.Group>(null);
  const prop1Ref = useRef<THREE.Group>(null);
  const prop2Ref = useRef<THREE.Group>(null);
  const prop3Ref = useRef<THREE.Group>(null);
  const prop4Ref = useRef<THREE.Group>(null);
  const gimbalRef = useRef<THREE.Group>(null);

  // Materials with aerospace engineering aesthetic
  const materials = React.useMemo(() => {
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
      glass: new THREE.MeshStandardMaterial({
        color: 0x071526,
        roughness: 0.1,
        metalness: 0.95,
      }),
      ledRed: new THREE.MeshBasicMaterial({ color: 0xef4444 }),
      ledGreen: new THREE.MeshBasicMaterial({ color: 0x22c55e }),
      ledAmber: new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
    };
  }, []);

  // Frame animation: Propeller spinning & realistic flight attitude
  useFrame((state, delta) => {
    // 1. High-speed propeller spin
    const propSpeed = 45;
    if (prop1Ref.current) prop1Ref.current.rotation.y += propSpeed * delta;
    if (prop2Ref.current) prop2Ref.current.rotation.y -= propSpeed * delta;
    if (prop3Ref.current) prop3Ref.current.rotation.y += propSpeed * delta;
    if (prop4Ref.current) prop4Ref.current.rotation.y -= propSpeed * delta;

    // 2. Realistic flight dynamics: gentle hover sway + banking into forward motion
    if (droneRef.current) {
      const t = state.clock.getElapsedTime();
      const hoverWobbleY = Math.sin(t * 1.8) * 0.15;
      const hoverRoll = Math.sin(t * 1.2) * 0.03;
      const hoverPitch = Math.cos(t * 1.5) * 0.02 - 0.08; // slightly pitched forward for flight

      droneRef.current.position.y = 8 + hoverWobbleY - scrollProgress * 4;
      droneRef.current.rotation.z = hoverRoll;
      droneRef.current.rotation.x = hoverPitch;
    }

    // 3. 3-Axis Gimbal active stabilization (compensating for drone body pitch)
    if (gimbalRef.current) {
      // Point down toward terrain at fixed ~40 degrees regardless of body pitch
      gimbalRef.current.rotation.x = Math.PI * 0.22;
    }
  });

  return (
    /* Entire Drone strictly contained within one single parent group.
       It CANNOT break apart because all children are positioned relative to this root frame. */
    <group ref={droneRef} position={[0, 8, 0]} scale={[1.1, 1.1, 1.1]}>
      {/* 1. Main Aerodynamic Fuselage */}
      <mesh material={materials.chassis} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.65, 2.8]} />
      </mesh>

      {/* Aerodynamic Top Canopy Shell */}
      <mesh position={[0, 0.45, -0.1]} material={materials.darkMetal} castShadow>
        <cylinderGeometry args={[0.65, 0.9, 0.4, 8]} />
      </mesh>

      {/* RTK / GNSS Antenna Puck on Top Deck */}
      <group position={[0, 0.8, -0.5]}>
        <mesh material={materials.darkMetal}>
          <cylinderGeometry args={[0.22, 0.22, 0.22, 16]} />
        </mesh>
        <mesh position={[0, 0.16, 0]} material={materials.chassis}>
          <sphereGeometry args={[0.26, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      </group>

      {/* Rear Avionics & Heat-sink Louvers */}
      {[-0.36, -0.18, 0, 0.18, 0.36].map((x, i) => (
        <mesh key={i} position={[x, 0.36, 1.0]} material={materials.darkMetal}>
          <boxGeometry args={[0.04, 0.2, 0.45]} />
        </mesh>
      ))}

      {/* 2. 4 Rigid Carbon Fiber Quadcopter Boom Arms */}
      {[
        { x: 1.5, z: -1.5, isFront: true, isRight: true, propRef: prop1Ref },
        { x: 1.5, z: 1.5, isFront: false, isRight: true, propRef: prop2Ref },
        { x: -1.5, z: 1.5, isFront: false, isRight: false, propRef: prop3Ref },
        { x: -1.5, z: -1.5, isFront: true, isRight: false, propRef: prop4Ref },
      ].map((arm, index) => {
        const armLength = Math.sqrt(arm.x * arm.x + arm.z * arm.z);
        return (
          <group key={index}>
            {/* Boom Tube */}
            <mesh
              position={[arm.x * 0.5, 0.08, arm.z * 0.5]}
              material={materials.carbonMat}
              quaternion={new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(arm.x, 0, arm.z).normalize()
              )}
              castShadow
            >
              <cylinderGeometry args={[0.1, 0.12, armLength * 0.85, 12]} />
            </mesh>

            {/* Motor Mount Housing */}
            <mesh position={[arm.x, 0.15, arm.z]} material={materials.darkMetal}>
              <cylinderGeometry args={[0.28, 0.28, 0.38, 16]} />
            </mesh>

            {/* Brushless Motor Bell */}
            <mesh position={[arm.x, 0.4, arm.z]} material={materials.darkMetal}>
              <cylinderGeometry args={[0.25, 0.25, 0.32, 16]} />
            </mesh>

            {/* Precision Gold Anodized Motor Ring */}
            <mesh position={[arm.x, 0.4, arm.z]} rotation={[Math.PI / 2, 0, 0]} material={materials.goldAccent}>
              <torusGeometry args={[0.26, 0.03, 8, 24]} />
            </mesh>

            {/* Spinning Rotor Propeller Assembly */}
            <group ref={arm.propRef} position={[arm.x, 0.58, arm.z]}>
              {/* Center Hub */}
              <mesh material={materials.darkMetal}>
                <sphereGeometry args={[0.14, 12, 12]} />
              </mesh>
              {/* Dual Aerofoil Propeller Blades */}
              <mesh material={materials.propeller} castShadow>
                <boxGeometry args={[0.18, 0.02, 2.0]} />
              </mesh>
              {/* Blade Tip Accents */}
              <mesh position={[0, 0, 0.92]} material={materials.goldAccent}>
                <boxGeometry args={[0.19, 0.025, 0.16]} />
              </mesh>
              <mesh position={[0, 0, -0.92]} material={materials.goldAccent}>
                <boxGeometry args={[0.19, 0.025, 0.16]} />
              </mesh>
            </group>

            {/* Flight Navigation LED Beacons under Motor Base */}
            <mesh
              position={[arm.x, -0.06, arm.z]}
              material={arm.isFront ? (arm.isRight ? materials.ledGreen : materials.ledRed) : materials.ledAmber}
            >
              <sphereGeometry args={[0.08, 8, 8]} />
            </mesh>
          </group>
        );
      })}

      {/* 3. Dual Carbon Fiber Landing Gear Skids */}
      {[-0.8, 0.8].map((sideX, i) => (
        <group key={i}>
          {/* Horizontal Ground Contact Skid */}
          <mesh
            position={[sideX * 1.15, -1.1, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            material={materials.darkMetal}
            castShadow
          >
            <cylinderGeometry args={[0.065, 0.065, 3.4, 12]} />
          </mesh>

          {/* Curved Skid Tips */}
          <mesh position={[sideX * 1.15, -1.08, -1.7]} material={materials.goldAccent}>
            <sphereGeometry args={[0.08, 8, 8]} />
          </mesh>
          <mesh position={[sideX * 1.15, -1.08, 1.7]} material={materials.goldAccent}>
            <sphereGeometry args={[0.08, 8, 8]} />
          </mesh>

          {/* Angled Vertical Carbon Support Struts */}
          <mesh
            position={[sideX * 0.98, -0.55, -0.8]}
            rotation={[-0.2, 0, -sideX * 0.22]}
            material={materials.carbonMat}
          >
            <cylinderGeometry args={[0.065, 0.065, 1.2, 8]} />
          </mesh>
          <mesh
            position={[sideX * 0.98, -0.55, 0.8]}
            rotation={[0.2, 0, -sideX * 0.22]}
            material={materials.carbonMat}
          >
            <cylinderGeometry args={[0.065, 0.065, 1.2, 8]} />
          </mesh>
        </group>
      ))}

      {/* 4. Gyro-Stabilized 3-Axis Camera Gimbal Unit (Mounted underneath) */}
      <group ref={gimbalRef} position={[0, -0.4, -0.7]}>
        {/* Gimbal Yaw Base */}
        <mesh material={materials.darkMetal}>
          <cylinderGeometry args={[0.16, 0.16, 0.2, 12]} />
        </mesh>

        {/* Gimbal Roll Bracket */}
        <mesh position={[0.26, -0.18, 0]} material={materials.darkMetal}>
          <boxGeometry args={[0.1, 0.36, 0.14]} />
        </mesh>

        {/* Survey Camera Body */}
        <mesh position={[0, -0.32, 0]} material={materials.darkMetal} castShadow>
          <boxGeometry args={[0.55, 0.48, 0.65]} />
        </mesh>

        {/* Photogrammetry Optical Lens Barrel */}
        <mesh
          position={[0, -0.32, -0.38]}
          rotation={[Math.PI / 2, 0, 0]}
          material={materials.darkMetal}
        >
          <cylinderGeometry args={[0.2, 0.22, 0.4, 24]} />
        </mesh>

        {/* Lens Element (Coated Optical Glass) */}
        <mesh
          position={[0, -0.32, -0.59]}
          rotation={[0, 0, 0]}
          material={materials.glass}
        >
          <circleGeometry args={[0.19, 24]} />
        </mesh>

        {/* Precision Lens Bezel Trim */}
        <mesh position={[0, -0.32, -0.57]} material={materials.goldAccent}>
          <torusGeometry args={[0.21, 0.02, 8, 24]} />
        </mesh>

        {/* Optical Sensor Video View Frustum (Visualizing Corridor Video Capture) */}
        <mesh position={[0, -2.5, -2.2]} rotation={[Math.PI / 2 + 0.3, 0, 0]}>
          <coneGeometry args={[2.8, 5.0, 4]} />
          <meshBasicMaterial
            color="#f59e0b"
            wireframe
            transparent
            opacity={0.18}
          />
        </mesh>
      </group>

      {/* Forward Obstacle Avoidance Stereo Sensors */}
      {[-0.4, 0.4].map((sx, i) => (
        <mesh key={i} position={[sx, 0.08, -1.42]} material={materials.darkMetal}>
          <sphereGeometry args={[0.07, 8, 8]} />
        </mesh>
      ))}
    </group>
  );
}
