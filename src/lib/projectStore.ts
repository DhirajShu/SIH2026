import { ReconstructionProject } from "./types";
import { SAMPLE_PROJECTS } from "./mockData";

const STORAGE_KEY = "terra_recon_projects_v2";

/**
 * Returns the user's actual saved projects from browser persistence.
 * No hardcoded fake projects are forced if none exist.
 */
export function getProjects(): ReconstructionProject[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return [];
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

export function renameProject(id: string, newTitle: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getProjects();
    const existingIndex = current.findIndex((p) => p.id === id);
    if (existingIndex === -1) return false;

    const updated = [...current];
    updated[existingIndex] = {
      ...updated[existingIndex],
      title: newTitle.trim(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error("Failed to rename project in localStorage", e);
    return false;
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

export function loadSampleProjects(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_PROJECTS));
}

// Deprecated alias for backwards-compatibility
export const resetDemoProjects = loadSampleProjects;
