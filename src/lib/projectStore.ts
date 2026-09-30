import { ReconstructionProject } from "./types";
import { SAMPLE_PROJECTS } from "./mockData";

const STORAGE_KEY = "terra_recon_projects_v2";

export function getProjects(): ReconstructionProject[] {
  if (typeof window === "undefined") {
    return SAMPLE_PROJECTS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      // First initialization: seed with realistic SIH sample projects
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_PROJECTS));
      return SAMPLE_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load projects from localStorage", e);
  }
  return [];
}

export function getProjectById(id: string): ReconstructionProject | undefined {
  const all = getProjects();
  return all.find((p) => p.id === id);
}

export function saveProject(project: ReconstructionProject): void {
  if (typeof window === "undefined") return;
  try {
    const current = getProjects();
    const existingIndex = current.findIndex((p) => p.id === project.id);
    let updated: ReconstructionProject[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = project;
    } else {
      updated = [project, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save project to localStorage", e);
  }
}

export function deleteProject(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getProjects();
    const updated = current.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete project from localStorage", e);
  }
}

export function clearAllProjects(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

export function resetDemoProjects(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_PROJECTS));
}
