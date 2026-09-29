export type ProjectStatus = "completed" | "processing" | "queued" | "failed";

export interface TelemetryPoint {
  timeSec: number;
  lat: number;
  lng: number;
  altitudeM: number;
  speedMs: number;
  pitchDeg: number;
  rollDeg: number;
  yawDeg: number;
  frameIndex: number;
  iso: number;
  shutter: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  category: "ingest" | "sfm" | "mvs" | "mesh" | "ortho";
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  durationSec: number;
  logMessage: string;
  details: string;
}

export interface GroundControlPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevationM: number;
  residualErrorM: number;
}

export interface ReconstructionProject {
  id: string;
  title: string;
  clientRef?: string;
  description: string;
  locationName: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  crs: string; // Coordinate Reference System, e.g. "EPSG:32643 (UTM Zone 43N)"
  areaHectares: number;
  gsdCmPerPixel: number; // Ground Sample Distance
  reprojectionErrorPx: number;
  pointCloudSize: number; // in thousands or millions
  triangleCount: number;
  status: ProjectStatus;
  progressPercent?: number;
  currentStage?: string;
  
  // Drone & Flight specs
  droneModel: string;
  cameraSensor: string;
  focalLengthMm: number;
  flightAltitudeM: number;
  avgFlightSpeedMs: number;
  captureDate: string;
  videoDurationSec: number;
  fps: number;
  totalVideoFrames: number;
  extractedKeyframes: number;
  thumbnailUrl: string;
  
  // Geospatial bounds & terrain stats
  elevation: {
    minM: number;
    maxM: number;
    avgM: number;
  };
  
  // Pipeline trace
  stages: PipelineStage[];
  telemetry: TelemetryPoint[];
  gcps: GroundControlPoint[];
  
  // Output artifacts
  artifacts: {
    objMeshSizeMb: number;
    plyCloudSizeMb: number;
    lasCloudSizeMb: number;
    geotiffDemMb: number;
    orthomosaicMb: number;
  };
}

export type ViewerDisplayMode = "textured" | "wireframe" | "pointcloud" | "elevation" | "normals";
