"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Button } from "@/vendors/ui/button";
import { Input } from "@/vendors/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/vendors/ui/card";
import ThemeToggle from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import {
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Check,
  Loader2
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword, updatePassword, isMock, user } = useAuth();

  // Step state: "request" (email) | "update" (new password) | "complete" (success)
  const [step, setStep] = useState<"request" | "update" | "complete">("request");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check URL hash / query / auth state for recovery tokens on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      
      if (
        hash.includes("type=recovery") ||
        search.includes("type=recovery") ||
        hash.includes("access_token=") ||
        search.includes("code=")
      ) {
        setStep("update");
      }
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setStep("update");
        if (session?.user?.email) {
          setEmail(session.user.email);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Pre-fill email from logged-in user if present
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  // Handle Step 1: Request Password Reset
  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const { error: authError } = await resetPassword(email);
      if (authError) {
        setError(authError.message || "Failed to initiate password reset");
      } else {
        setSuccessMsg("Verification confirmed! Now choose your new password below.");
        // Immediately transition to the new password step for an effortless UX
        setStep("update");
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 2: Set New Password
  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await updatePassword(password, email);
      if (updateError) {
        setError(updateError.message || "Failed to update password.");
      } else {
        setStep("complete");
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500 text-red-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-yellow-500 text-yellow-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500 text-blue-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500 text-emerald-500" };
  };

  const strength = getPasswordStrength(password);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background transition-colors duration-300 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl -z-10" />

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo / Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <Link href="/" className="inline-flex flex-col items-center gap-2.5">
            <Logo className="h-14 w-14" />
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500 tracking-tighter hover:opacity-90 transition-opacity">
              TYPEFLOW
            </h1>
          </Link>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Secure Account Recovery & Password Reset
          </p>
        </div>

        <Card className="shadow-2xl border-border/60 p-2 backdrop-blur-xs">
          {/* STEP 1: REQUEST RESET VIA EMAIL */}
          {step === "request" && (
            <>
              <CardHeader className="pb-3 text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <Mail className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-black">Reset Password</CardTitle>
                <CardDescription className="text-xs">
                  Enter your registered email address to verify your account and set a new password.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs flex items-start gap-2 animate-fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                      Your Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 text-sm rounded-xl"
                        required
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-bold rounded-xl gap-2 cursor-pointer"
                    disabled={isLoading || !email.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Continue to Set Password
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep("update");
                    }}
                    className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                  >
                    Already have a recovery token or link? Set password directly
                  </button>
                </div>
              </CardContent>

              <CardFooter className="justify-between pt-2 border-t border-border/40">
                <Link
                  href="/auth/login"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 font-bold transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Login
                </Link>
              </CardFooter>
            </>
          )}

          {/* STEP 2: ENTER NEW PASSWORD */}
          {step === "update" && (
            <>
              <CardHeader className="pb-3 text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <KeyRound className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-black">Set New Password</CardTitle>
                <CardDescription className="text-xs">
                  {email ? (
                    <span>
                      Create a new password for <strong className="text-foreground">{email}</strong>
                    </span>
                  ) : (
                    "Choose a secure new password for your account."
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {successMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2 animate-fade-in font-medium">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs flex items-start gap-2 animate-fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {/* Email Field (editable if not previously specified) */}
                  {!email && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                        Confirm Account Email
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-11 text-sm rounded-xl"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  {/* New Password Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                      New Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-11 text-sm rounded-xl"
                        required
                        disabled={isLoading}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="pt-1.5 space-y-1 animate-fade-in">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-muted-foreground">Strength:</span>
                          <span className={strength.color.split(" ")[1]}>{strength.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden flex gap-1">
                          {[1, 2, 3, 4].map((bar) => (
                            <div
                              key={bar}
                              className={`h-full flex-1 rounded-full transition-all duration-300 ${
                                strength.score >= bar ? strength.color.split(" ")[0] : "bg-transparent"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center justify-between">
                      <span>Confirm New Password</span>
                      {confirmPassword && password === confirmPassword && (
                        <span className="text-emerald-500 flex items-center gap-1 normal-case text-[10px]">
                          <Check className="h-3 w-3 stroke-[3]" /> Passwords match
                        </span>
                      )}
                    </label>
                    <div className="relative flex items-center">
                      <KeyRound className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`pl-10 pr-10 h-11 text-sm rounded-xl ${
                          confirmPassword && password !== confirmPassword
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-bold rounded-xl gap-2 cursor-pointer shadow-md mt-2"
                    disabled={isLoading || !password || !confirmPassword}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving Password...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Save New Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="justify-between pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccessMsg("");
                    setStep("request");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Use different email
                </button>
                <Link
                  href="/auth/login"
                  className="text-xs text-muted-foreground hover:text-foreground font-semibold"
                >
                  Back to Login
                </Link>
              </CardFooter>
            </>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === "complete" && (
            <>
              <CardHeader className="pb-4 text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 animate-bounce">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl font-black text-foreground">
                  Password Updated!
                </CardTitle>
                <CardDescription className="text-xs max-w-xs mx-auto">
                  Your new password has been successfully saved. You can now log into your TypeFlow account.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Button
                  onClick={() => router.push("/auth/login")}
                  className="w-full h-11 font-black rounded-xl gap-2 cursor-pointer shadow-lg"
                >
                  Proceed to Login
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>

              <CardFooter className="justify-center pt-2">
                <p className="text-[11px] text-muted-foreground">
                  Need help? Contact support or revisit the reset steps anytime.
                </p>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
