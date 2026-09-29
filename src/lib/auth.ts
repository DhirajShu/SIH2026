"use client";

import { useState, useEffect } from "react";

export interface UserSession {
  email: string;
  name: string;
  organization: string;
  role: string;
}

const DEFAULT_USER: UserSession = {
  email: "surveyor@terra-recon.io",
  name: "Dr. Dhiraj Sharma",
  organization: "National Geospatial Laboratory",
  role: "Chief Photogrammetry Specialist",
};

export function getStoredUser(): UserSession | null {
  if (typeof window === "undefined") return DEFAULT_USER;
  try {
    const raw = localStorage.getItem("terra_recon_user");
    if (!raw) {
      localStorage.setItem("terra_recon_user", JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_USER;
  }
}

export function saveUserSession(user: UserSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("terra_recon_user", JSON.stringify(user));
}

export function logoutUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("terra_recon_user");
}
