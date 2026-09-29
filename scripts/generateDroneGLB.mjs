import * as THREE from 'three';
import fs from 'fs';
import path from 'path';

// Polyfill FileReader for Node.js environment
if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    constructor() {
      this.result = null;
      this.onload = null;
      this.onerror = null;
    }
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buffer) => {
        this.result = buffer;
        if (typeof this.onload === 'function') {
          this.onload({ target: { result: buffer } });
        }
      }).catch((err) => {
        if (typeof this.onerror === 'function') {
          this.onerror(err);
        }
      });
    }
  };
}

const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');

const outputDir = path.resolve('public/models');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const scene = new THREE.Scene();
const droneGroup = new THREE.Group();
droneGroup.name = 'TerraRecon_Drone';

// Materials
const carbonBodyMat = new THREE.MeshStandardMaterial({
  color: 0x181a1f,
  roughness: 0.35,
  metalness: 0.85,
  name: 'CarbonFiberMat'
});

const darkMetalMat = new THREE.MeshStandardMaterial({
  color: 0x242830,
  roughness: 0.25,
  metalness: 0.9,
  name: 'DarkMetalMat'
});

const rotorGoldMat = new THREE.MeshStandardMaterial({
  color: 0xd97706,
  roughness: 0.3,
  metalness: 0.95,
  name: 'GoldAccentMat'
});

const propMat = new THREE.MeshStandardMaterial({
  color: 0x111317,
  roughness: 0.4,
  metalness: 0.7,
  name: 'PropellerMat'
});

const lensGlassMat = new THREE.MeshStandardMaterial({
  color: 0x050d1a,
  roughness: 0.1,
  metalness: 0.98,
  name: 'LensGlassMat'
});

// Central Fuselage
const chassisGeo = new THREE.BoxGeometry(2.2, 0.7, 3.6);
const chassis = new THREE.Mesh(chassisGeo, carbonBodyMat);
chassis.position.y = 0;
droneGroup.add(chassis);

const canopyGeo = new THREE.CylinderGeometry(0.8, 1.1, 0.5, 8);
canopyGeo.scale(1.1, 1, 1.8);
const canopy = new THREE.Mesh(canopyGeo, darkMetalMat);
canopy.position.set(0, 0.55, -0.2);
droneGroup.add(canopy);

const rtkBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.3, 16), darkMetalMat);
rtkBase.position.set(0, 0.95, -0.8);
droneGroup.add(rtkBase);

const rtkDome = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), carbonBodyMat);
rtkDome.position.set(0, 1.1, -0.8);
droneGroup.add(rtkDome);

// 4 Arms
const armOffsets = [
  { x: 1.8, z: -1.8, isFront: true, isRight: true },
  { x: 1.8, z: 1.8, isFront: false, isRight: true },
  { x: -1.8, z: 1.8, isFront: false, isRight: false },
  { x: -1.8, z: -1.8, isFront: true, isRight: false }
];

armOffsets.forEach((pos, idx) => {
  const armMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.6, 12), carbonBodyMat);
  armMesh.position.set(pos.x * 0.5, 0.1, pos.z * 0.5);
  armMesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(pos.x, 0, pos.z).normalize()
  );
  droneGroup.add(armMesh);

  const motorMount = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.5, 16), darkMetalMat);
  motorMount.position.set(pos.x, 0.2, pos.z);
  droneGroup.add(motorMount);

  const motorBell = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.4, 16), darkMetalMat);
  motorBell.position.set(pos.x, 0.5, pos.z);
  droneGroup.add(motorBell);

  const goldRing = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.04, 8, 24), rotorGoldMat);
  goldRing.rotation.x = Math.PI / 2;
  goldRing.position.set(pos.x, 0.5, pos.z);
  droneGroup.add(goldRing);

  const propGroup = new THREE.Group();
  propGroup.name = `Propeller_${idx + 1}`;
  propGroup.position.set(pos.x, 0.72, pos.z);

  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), darkMetalMat);
  propGroup.add(hub);

  const blade1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 2.4), propMat);
  blade1.rotation.y = idx % 2 === 0 ? 0.15 : -0.15;
  propGroup.add(blade1);

  droneGroup.add(propGroup);
});

// Dual Landing Skids
[-0.9, 0.9].forEach((sideX) => {
  const skid = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.4, 12), darkMetalMat);
  skid.rotation.x = Math.PI / 2;
  skid.position.set(sideX * 1.3, -1.3, 0);
  droneGroup.add(skid);

  const legFront = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8), carbonBodyMat);
  legFront.position.set(sideX * 1.1, -0.65, -1.1);
  legFront.rotation.z = -sideX * 0.25;
  legFront.rotation.x = -0.2;
  droneGroup.add(legFront);

  const legRear = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8), carbonBodyMat);
  legRear.position.set(sideX * 1.1, -0.65, 1.1);
  legRear.rotation.z = -sideX * 0.25;
  legRear.rotation.x = 0.2;
  droneGroup.add(legRear);
});

// Camera Gimbal
const gimbalGroup = new THREE.Group();
gimbalGroup.position.set(0, -0.45, -1.0);

const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.8), darkMetalMat);
camBody.position.set(0, -0.4, 0);
camBody.rotation.x = Math.PI * 0.2;
gimbalGroup.add(camBody);

const lensBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.5, 24), darkMetalMat);
lensBarrel.rotation.x = Math.PI / 2 + Math.PI * 0.2;
lensBarrel.position.set(0, -0.4, -0.45);
gimbalGroup.add(lensBarrel);

droneGroup.add(gimbalGroup);
scene.add(droneGroup);

// Export to binary GLB using Promise
console.log('Exporting GLB scene...');
const exporter = new GLTFExporter();
const gltf = await new Promise((resolve, reject) => {
  exporter.parse(scene, resolve, reject, { binary: true });
});

const dest = path.resolve('public/models/drone.glb');
fs.writeFileSync(dest, Buffer.from(gltf));
console.log('SUCCESS: Written drone.glb to', dest, `(${fs.statSync(dest).size} bytes)`);
