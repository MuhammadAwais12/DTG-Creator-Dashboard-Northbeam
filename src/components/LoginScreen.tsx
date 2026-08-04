import React, { useState } from "react";
import { LayoutGrid, LogIn, AlertCircle } from "lucide-react";
import { CreatorUser } from "../types";
import { validateCreatorCode } from "../services/api";
import { normalizeCreatorCode } from "../utils/creator";

interface LoginScreenProps {
  onLoginSuccess: (user: CreatorUser) => void;
  validCodes: string[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  validCodes,
}) => {
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const rawInput = code.trim();
    const normalizedInput = normalizeCreatorCode(rawInput);

    if (!fullName.trim() || !rawInput) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate via backend breakdown check or client cache
      const validation = await validateCreatorCode(rawInput, validCodes);

      console.log(
        `[LoginSubmit] Raw: "${rawInput}" -> Normalized: "${validation.normalizedCode}" | Valid: ${validation.isValid}`
      );

      if (!validation.isValid) {
        setErrorMessage(
          "Invalid unique code. This code was not found in our advertising data. Please check your code or contact support."
        );
        setIsSubmitting(false);
        return;
      }

      const user: CreatorUser = {
        name: fullName.trim(),
        code: validation.normalizedCode,
      };

      // Store persistent session in localStorage
      localStorage.setItem("influencer_user", JSON.stringify(user));

      onLoginSuccess(user);
    } catch (err) {
      console.error("Login submission error:", err);
      setErrorMessage("Connection error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md bg-[#141416] border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/20 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          {/* Logo/Icon Container matching screenshot 1 */}
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-5 border border-indigo-400/20">
            <LayoutGrid className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Influencer Portal
          </h1>
          <p className="text-sm text-zinc-400 font-normal">
            Enter your details to access your performance dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              FULL NAME
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Sophie Bennett"
              className="w-full bg-[#0d0d0e] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              UNIQUE CODE
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="CR-00"
              className="w-full bg-[#0d0d0e] border border-white/10 rounded-xl px-4 py-3.5 text-white uppercase placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm font-mono tracking-wider"
            />
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400 text-xs leading-relaxed animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? "Signing In..." : "Sign In"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
