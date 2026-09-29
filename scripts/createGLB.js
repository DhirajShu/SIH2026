import fs from 'fs';
import path from 'path';

// Construct a valid minimal standalone GLB binary
const gltfJson = {
  asset: { version: "2.0", generator: "TerraRecon GLB Generator" },
  scenes: [{ nodes: [0] }],
  nodes: [
    {
      name: "Drone_Root",
      mesh: 0,
      scale: [1, 1, 1]
    }
  ],
  meshes: [
    {
      name: "Drone_Fuselage",
      primitives: [
        {
          attributes: { POSITION: 0, NORMAL: 1 },
          indices: 2,
          material: 0
        }
      ]
    }
  ],
  materials: [
    {
      name: "CarbonFiber",
      pbrMetallicRoughness: {
        baseColorFactor: [0.12, 0.14, 0.18, 1.0],
        metallicFactor: 0.85,
        roughnessFactor: 0.35
      }
    }
  ],
  accessors: [
    {
      bufferView: 0,
      byteOffset: 0,
      componentType: 5126,
      count: 24,
      type: "VEC3",
      max: [1.1, 0.4, 1.8],
      min: [-1.1, -0.4, -1.8]
    },
    {
      bufferView: 1,
      byteOffset: 0,
      componentType: 5126,
      count: 24,
      type: "VEC3",
      max: [1, 1, 1],
      min: [-1, -1, -1]
    },
    {
      bufferView: 2,
      byteOffset: 0,
      componentType: 5123,
      count: 36,
      type: "SCALAR",
      max: [23],
      min: [0]
    }
  ],
  bufferViews: [
    { buffer: 0, byteOffset: 0, byteLength: 288, target: 34962 },
    { buffer: 0, byteOffset: 288, byteLength: 288, target: 34962 },
    { buffer: 0, byteOffset: 576, byteLength: 72, target: 34963 }
  ],
  buffers: [{ byteLength: 648 }]
};

// Generate binary buffers (cube with vertices, normals, indices)
const positions = new Float32Array([
  // Front
  -1.1, -0.4,  1.8,   1.1, -0.4,  1.8,   1.1,  0.4,  1.8,  -1.1,  0.4,  1.8,
  // Back
  -1.1, -0.4, -1.8,  -1.1,  0.4, -1.8,   1.1,  0.4, -1.8,   1.1, -0.4, -1.8,
  // Top
  -1.1,  0.4, -1.8,  -1.1,  0.4,  1.8,   1.1,  0.4,  1.8,   1.1,  0.4, -1.8,
  // Bottom
  -1.1, -0.4, -1.8,   1.1, -0.4, -1.8,   1.1, -0.4,  1.8,  -1.1, -0.4,  1.8,
  // Right
   1.1, -0.4, -1.8,   1.1,  0.4, -1.8,   1.1,  0.4,  1.8,   1.1, -0.4,  1.8,
  // Left
  -1.1, -0.4, -1.8,  -1.1, -0.4,  1.8,  -1.1,  0.4,  1.8,  -1.1,  0.4, -1.8,
]);

const normals = new Float32Array([
  0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
  0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
  0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
  0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
  1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
  -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
]);

const indices = new Uint16Array([
  0, 1, 2,   0, 2, 3,
  4, 5, 6,   4, 6, 7,
  8, 9, 10,  8, 10, 11,
  12, 13, 14, 12, 14, 15,
  16, 17, 18, 16, 18, 19,
  20, 21, 22, 20, 22, 23
]);

const binBuffer = Buffer.concat([
  Buffer.from(positions.buffer),
  Buffer.from(normals.buffer),
  Buffer.from(indices.buffer)
]);

// Pad JSON string with spaces to 4-byte boundary
let jsonString = JSON.stringify(gltfJson);
while (jsonString.length % 4 !== 0) {
  jsonString += " ";
}
const jsonBuffer = Buffer.from(jsonString, "utf8");

// Pad binary buffer with 0x00 to 4-byte boundary
let binPadding = 0;
if (binBuffer.length % 4 !== 0) {
  binPadding = 4 - (binBuffer.length % 4);
}
const binPadded = Buffer.concat([binBuffer, Buffer.alloc(binPadding)]);

// Total GLB length = 12 (header) + 8 (json chunk header) + jsonBuffer.length + 8 (bin chunk header) + binPadded.length
const totalLength = 12 + 8 + jsonBuffer.length + 8 + binPadded.length;

const glbHeader = Buffer.alloc(12);
glbHeader.writeUInt32LE(0x46546C67, 0); // "glTF"
glbHeader.writeUInt32LE(2, 4);          // version 2
glbHeader.writeUInt32LE(totalLength, 8); // total length

const jsonChunkHeader = Buffer.alloc(8);
jsonChunkHeader.writeUInt32LE(jsonBuffer.length, 0);
jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4); // "JSON"

const binChunkHeader = Buffer.alloc(8);
binChunkHeader.writeUInt32LE(binPadded.length, 0);
binChunkHeader.writeUInt32LE(0x004E4942, 4); // "BIN\0"

const finalGlb = Buffer.concat([
  glbHeader,
  jsonChunkHeader,
  jsonBuffer,
  binChunkHeader,
  binPadded
]);

const dest = path.resolve('public/models/drone.glb');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, finalGlb);
console.log('✓ Successfully wrote valid GLB file to:', dest, `(${finalGlb.length} bytes)`);
