"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Building
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!name.trim()) {
      setErrorMsg("Your full name is required.");
      return false;
    }
    if (!email.trim()) {
      setErrorMsg("Email address is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg("Please provide a valid email format.");
      return false;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await signup(name, email, password);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setErrorMsg(res.error || "Failed to create workspace account.");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred while registering your workspace.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-[85vh] flex items-center justify-center px-4 py-12 bg-neutral-950 font-sans select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-500 group-hover:border-amber-500/50 transition-colors">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-mono text-sm tracking-wider font-semibold text-neutral-100">
              TERRARECON
            </span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100">
            Create your workspace
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            INITIALIZE DRONE PHOTOGRAMMETRY GROUND STATION CREDENTIALS
          </p>
        </div>

        {/* Signup Card */}
        <div className="p-6 sm:p-8 rounded-xl bg-neutral-900/80 border border-neutral-800 shadow-2xl backdrop-blur space-y-5">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            {/* Name Field */}
            <div>
              <label className="block text-neutral-300 mb-1.5 font-medium">
                FULL NAME
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 disabled:opacity-50 transition-colors"
                  placeholder="e.g. Commander Vikram Nair"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-neutral-300 mb-1.5 font-medium">
                OFFICIAL EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 disabled:opacity-50 transition-colors"
                  placeholder="surveyor@organisation.gov.in"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-neutral-300 mb-1.5 font-medium">
                PASSWORD (MIN. 6 CHARS)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 disabled:opacity-50 transition-colors"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-neutral-300 mb-1.5 font-medium">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 disabled:opacity-50 transition-colors"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs font-mono rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer pt-3"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Provisioning Workspace...</span>
                </div>
              ) : (
                <>
                  Create account <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Navigation */}
        <div className="text-center font-mono text-xs text-neutral-500 space-y-1">
          <div>
            Already registered?{" "}
            <Link href="/login" className="text-amber-400 hover:underline">
              Sign in to your account
            </Link>
          </div>
          <div>All survey projects and flight passes remain saved in local storage.</div>
        </div>
      </div>
    </div>
  );
}
