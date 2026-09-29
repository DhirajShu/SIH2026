"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, User, Building, Mail, Lock, ArrowRight } from "lucide-react";
import { saveUserSession } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("UAV Photogrammetrist");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      saveUserSession({
        name: name || "Surveyor Specialist",
        organization: organization || "Geospatial Field Team",
        email: email || "surveyor@recon.local",
        role,
      });
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-neutral-950 font-sans select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-amber-500 mb-2">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-100">
            Register Ground Station
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            ENROLL SURVEYOR & FLIGHT CREW CREDENTIALS
          </p>
        </div>

        {/* Card */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                FULL NAME
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Captain Rajesh Verma"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                ORGANIZATION / AGENCY
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Geological Survey of India"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                OFFICIAL EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500"
                  placeholder="surveyor@gsi.gov.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1.5">
                OPERATIONAL ROLE
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500"
              >
                <option value="UAV Photogrammetrist">UAV Photogrammetrist</option>
                <option value="GIS Geotechnical Engineer">GIS Geotechnical Engineer</option>
                <option value="Survey Directorate Lead">Survey Directorate Lead</option>
                <option value="Disaster Rapid Response Specialist">Disaster Rapid Response Specialist</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium text-xs font-mono rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <span className="animate-pulse">Enrolling Certificate...</span>
              ) : (
                <>
                  Register & Open Console <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs font-mono text-neutral-400 hover:text-amber-400 transition-colors"
            >
              Already registered? Sign In to Console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
