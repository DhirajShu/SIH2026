"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  createdAt: string;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const STORAGE_SESSION_KEY = "terra_recon_auth_session_v2";
const STORAGE_USERS_KEY = "terra_recon_registered_users_v2";

const DEFAULT_DEMO_USERS = [
  {
    id: "usr-dhiraj-01",
    name: "Dr. Dhiraj Sharma",
    email: "surveyor@terra-recon.io",
    password: "password123",
    organization: "National Geospatial Laboratory",
    role: "Chief Photogrammetry Specialist",
    createdAt: "2026-08-01",
  },
  {
    id: "usr-sih-jury",
    name: "SIH Jury Evaluator",
    email: "evaluator@sih.gov.in",
    password: "password123",
    organization: "Smart India Hackathon 2026",
    role: "Technical Evaluator",
    createdAt: "2026-09-20",
  },
];

function getStoredUsers() {
  if (typeof window === "undefined") return DEFAULT_DEMO_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_DEMO_USERS));
      return DEFAULT_DEMO_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_DEMO_USERS;
  } catch (e) {
    return DEFAULT_DEMO_USERS;
  }
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session on mount
  useEffect(() => {
    try {
      const rawSession = localStorage.getItem(STORAGE_SESSION_KEY);
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      } else {
        // Initial prototype default: auto-login Dr. Dhiraj Sharma
        const defaultUser: UserSession = {
          id: DEFAULT_DEMO_USERS[0].id,
          name: DEFAULT_DEMO_USERS[0].name,
          email: DEFAULT_DEMO_USERS[0].email,
          organization: DEFAULT_DEMO_USERS[0].organization,
          role: DEFAULT_DEMO_USERS[0].role,
          createdAt: DEFAULT_DEMO_USERS[0].createdAt,
        };
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(defaultUser));
        setUser(defaultUser);
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Simulate brief network authentication roundtrip
    await new Promise((r) => setTimeout(r, 600));

    const users = getStoredUsers();
    const found = users.find(
      (u: any) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (!found) {
      setIsLoading(false);
      return { success: false, error: "No account registered with this email address." };
    }

    if (found.password && found.password !== password) {
      setIsLoading(false);
      return { success: false, error: "Incorrect password. Please verify your credentials." };
    }

    const sessionUser: UserSession = {
      id: found.id || `usr-${Date.now()}`,
      name: found.name,
      email: found.email,
      organization: found.organization || "Geospatial Operations",
      role: found.role || "UAV Photogrammetrist",
      createdAt: found.createdAt || new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    setIsLoading(false);
    return { success: true };
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    const users = getStoredUsers();
    const existing = users.find(
      (u: any) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (existing) {
      setIsLoading(false);
      return { success: false, error: "An account with this email address already exists. Please sign in." };
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      organization: "Autonomous Flight Command",
      role: "Lead Field Surveyor",
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updatedUsers));

    const sessionUser: UserSession = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      organization: newUser.organization,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Fallback helper for non-react components
export function getStoredUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function logoutUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_SESSION_KEY);
}
