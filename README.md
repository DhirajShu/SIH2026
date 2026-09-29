# TerraRecon

### Single-Pass Drone Video to 3D Terrain Reconstruction

TerraRecon is a web-based prototype that demonstrates how a single drone flight can be transformed into an interactive 3D reconstruction workflow.

The platform takes drone video as input and presents the complete reconstruction journey — from captured footage and visual feature analysis to 3D structure, terrain visualization, inspection, and export.

> **SIH 2026 Prototype — Single-Pass Drone Video to Accurate 3D Model Generation System**

---

## Overview

Traditional 3D mapping and terrain reconstruction can require specialized equipment, extensive manual processing, or multiple data sources.

TerraRecon explores a simpler workflow:

```text
Drone Flight
     ↓
Drone Video
     ↓
Frame Extraction
     ↓
Feature Analysis
     ↓
Camera Pose Estimation
     ↓
3D Point Cloud
     ↓
Mesh Generation
     ↓
Interactive 3D Terrain
```

The prototype focuses on demonstrating this workflow through an intuitive and cinematic web experience.

---

## Features

### Cinematic Landing Page

A scroll-driven visual explanation of the complete reconstruction pipeline.

* Interactive 3D drone scene
* Drone video visualization
* Frame extraction visualization
* Feature matching visualization
* Camera movement reconstruction
* Point cloud formation
* 3D terrain generation visualization
* Interactive terrain preview

### Reconstruction Workflow

The prototype provides a complete application flow:

* Upload drone footage
* Create reconstruction projects
* Track processing stages
* View generated 3D terrain
* Inspect reconstruction geometry
* Toggle terrain, point cloud and wireframe views
* Perform model-space measurements
* Export supported 3D models

### Project Management

Users can:

* Create projects
* View previous projects
* Open reconstructions
* Rename projects
* Delete projects
* Track reconstruction status

### 3D Viewer

Built around WebGL-based 3D visualization.

Supported interactions include:

* Orbit
* Zoom
* Pan
* Reset view
* Terrain view
* Point cloud view
* Wireframe view
* Model inspection

---

## Technology Stack

### Frontend

* Next.js
* TypeScript
* React
* Tailwind CSS
* shadcn/ui
* Lucide React
* GSAP
* ScrollTrigger
* Framer Motion
* Three.js
* React Three Fiber
* Drei

### Prototype Backend

The prototype uses a lightweight architecture focused on demonstrating the complete workflow without requiring GPU infrastructure or a production-scale reconstruction pipeline.

Depending on the current implementation, persistence/storage can use:

* Local browser storage
* Supabase
* API routes

### 3D

* Three.js
* React Three Fiber
* Drei
* GLB/glTF assets
* Procedural/precomputed terrain for prototype demonstrations

---

## Project Structure

```text
terrarecon/
│
├── app/
│   ├── page.tsx
│   ├── login/
│   ├── signup/
│   └── dashboard/
│       ├── page.tsx
│       ├── projects/
│       ├── new/
│       └── projects/[id]/
│
├── components/
│   ├── landing/
│   ├── dashboard/
│   ├── viewer/
│   ├── upload/
│   └── ui/
│
├── public/
│   ├── models/
│   ├── textures/
│   └── assets/
│
├── lib/
│   ├── auth/
│   ├── projects/
│   ├── storage/
│   └── reconstruction/
│
├── hooks/
│
├── types/
│
└── README.md
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create:

```text
.env.local
```

Add the environment variables required by the current implementation.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

If Supabase authentication/storage is not being used in the current prototype, these variables are not required.

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Demo Mode

TerraRecon includes a **Demo Reconstruction** workflow for presentations.

This allows the 3D reconstruction experience to be demonstrated without waiting for a computationally expensive photogrammetry pipeline.

The demo model is clearly identified as a prototype/precomputed reconstruction.

This ensures the application's primary demonstration remains reliable during an SIH presentation.

---

## Prototype vs Production

### Currently Demonstrated

The prototype demonstrates:

* Drone-to-3D workflow
* Video upload interface
* Reconstruction pipeline visualization
* Project management
* Interactive 3D terrain
* Point cloud visualization
* Wireframe visualization
* Model inspection
* Model-space measurement
* Export workflow
* Responsive web interface

### Prototype Components

Some reconstruction stages may use:

* Precomputed models
* Procedural terrain
* Simulated processing stages
* Prototype storage/authentication

These are intentionally used to demonstrate the complete product experience without requiring production GPU infrastructure.

They are **not represented as real photogrammetric results**.

---

## Future Production Pipeline

A production implementation can replace the prototype processing layer with a real photogrammetry pipeline:

```text
Drone Video
     ↓
FFmpeg
     ↓
Frame Extraction
     ↓
OpenCV
     ↓
Feature Detection & Matching
     ↓
COLMAP / PyCOLMAP
     ↓
Structure from Motion
     ↓
Camera Pose Estimation
     ↓
Multi-View Stereo
     ↓
Dense Point Cloud
     ↓
Open3D
     ↓
Surface Reconstruction
     ↓
Mesh Optimization
     ↓
GLB / OBJ / PLY / LAS / LAZ
```

Potential production infrastructure:

* Python
* FastAPI
* PostgreSQL
* Redis
* Celery
* Docker
* GPU workers
* OpenCV
* COLMAP
* Open3D
* PyMeshLab

Geographic accuracy would require appropriate georeferencing information such as GPS, RTK, GCPs, or other valid scale/reference data.

---

## Accuracy Disclaimer

A 3D model does not automatically have geographic accuracy simply because it was generated from drone footage.

Absolute scale and geographic accuracy depend on available information such as:

* GPS
* RTK
* Ground Control Points
* Camera calibration
* Flight characteristics
* Image quality
* Image overlap
* Reconstruction quality

TerraRecon does not fabricate accuracy measurements in the prototype.

---

## SIH 2026

TerraRecon was developed as a prototype for the Smart India Hackathon 2026 problem:

**Single-Pass Drone Video to Accurate 3D Model Generation System**

The objective is to demonstrate a practical workflow for converting drone video into an interactive 3D representation of the captured environment.

---

## Roadmap

### Phase 1 — Prototype

* [x] Cinematic landing page
* [x] Drone visualization
* [x] Scroll-driven workflow
* [x] Dashboard
* [x] Video upload
* [x] Reconstruction workflow
* [x] Interactive 3D terrain
* [x] Point cloud visualization
* [x] Wireframe mode
* [x] Model inspection
* [x] Prototype export
* [x] Demo reconstruction

### Phase 2 — Real Reconstruction

* [ ] Real frame extraction
* [ ] Feature detection
* [ ] Feature matching
* [ ] Structure from Motion
* [ ] Camera pose estimation
* [ ] Dense reconstruction
* [ ] Real point clouds
* [ ] Real mesh generation
* [ ] Georeferencing
* [ ] Real-world measurement
* [ ] GPU processing

### Phase 3 — Production Platform

* [ ] Scalable processing workers
* [ ] Real-time processing updates
* [ ] Cloud storage
* [ ] Authentication
* [ ] Project collaboration
* [ ] Advanced GIS tools
* [ ] Large-scale terrain processing
* [ ] Production deployment

---

## Contributing

Contributions and suggestions are welcome.

For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is currently an SIH 2026 prototype.

Add an appropriate open-source license before distributing the project publicly if required by your team or institution.
