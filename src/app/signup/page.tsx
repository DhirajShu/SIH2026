"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { TerraReconLogo } from "@/components/layout/TerraReconLogo";

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
    <div className="flex-1 min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#080B0A] font-sans select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group transition-opacity hover:opacity-90">
            <TerraReconLogo size={28} subtext="NEW RECONSTRUCTION WORKSPACE" />
          </Link>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F1F4F2]">
            Create your workspace
          </h1>
          <p className="text-xs font-mono text-[#9BA6A1]">
            INITIALIZE DRONE PHOTOGRAMMETRY GROUND STATION CREDENTIALS
          </p>
        </div>

        {/* Signup Card */}
        <div className="p-6 sm:p-8 rounded-[14px] bg-[#121916] border border-[#26302C] shadow-2xl space-y-5">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-[8px] bg-[#B87575]/12 border border-[#B87575]/35 text-[#B87575] font-mono text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            {/* Full Name */}
            <div>
              <label className="block text-[#F1F4F2] mb-1.5 font-medium">
                SURVEYOR NAME / OPERATOR
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#68736E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0D1210] border border-[#26302C] rounded-[8px] text-[#F1F4F2] placeholder:text-[#68736E] focus:outline-none focus:border-[#78AFA2] disabled:opacity-50 transition-colors"
                  placeholder="Capt. Rajesh Kumar"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-[#F1F4F2] mb-1.5 font-medium">
                OFFICIAL WORK EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#68736E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0D1210] border border-[#26302C] rounded-[8px] text-[#F1F4F2] placeholder:text-[#68736E] focus:outline-none focus:border-[#78AFA2] disabled:opacity-50 transition-colors"
                  placeholder="surveyor@organisation.org"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#F1F4F2] mb-1.5 font-medium">
                MASTER PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#68736E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0D1210] border border-[#26302C] rounded-[8px] text-[#F1F4F2] placeholder:text-[#68736E] focus:outline-none focus:border-[#78AFA2] disabled:opacity-50 transition-colors"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[#F1F4F2] mb-1.5 font-medium">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#68736E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0D1210] border border-[#26302C] rounded-[8px] text-[#F1F4F2] placeholder:text-[#68736E] focus:outline-none focus:border-[#78AFA2] disabled:opacity-50 transition-colors"
                  placeholder="Repeat master password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 px-4 bg-[#78AFA2] hover:bg-[#8CC2B4] text-[#080B0A] font-semibold text-xs font-mono rounded-[8px] flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#080B0A] border-t-transparent rounded-full animate-spin" />
                  <span>Registering Station...</span>
                </div>
              ) : (
                <>
                  Register Workspace <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="text-center pt-3 border-t border-[#26302C] font-mono text-xs text-[#9BA6A1]">
            Already hold an operator profile?{" "}
            <Link href="/login" className="text-[#78AFA2] hover:text-[#8CC2B4] font-medium hover:underline">
              Sign in to console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
