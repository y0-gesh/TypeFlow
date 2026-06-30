"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
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
import { Mail, Lock, AlertCircle, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { user, signIn, isMock } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error: authError } = await signIn(email, password);
      if (authError) {
        setError(authError.message || "Invalid credentials");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockLogin = () => {
    setEmail("demo@typeflow.com");
    setPassword("demopass123");
  };

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
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <Logo className="h-16 w-16" />
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500 tracking-tighter hover:opacity-90 transition-opacity">
              TYPEFLOW
            </h1>
          </Link>
          <p className="text-muted-foreground text-sm mt-2">
            Content-driven typing practice for professionals.
          </p>
        </div>

        <Card className="shadow-xl border-border/60 p-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to resume practicing your custom libraries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                  Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-11"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    href="/auth/reset-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-11"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="default"
                size="default"
                className="w-full mt-2 h-11 font-semibold cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            {isMock && (
              <div className="relative mt-8 mb-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground font-semibold">
                    Demo Credentials (Local Mock)
                  </span>
                </div>
              </div>
            )}

            {isMock && (
              <Button
                onClick={handleMockLogin}
                variant="outline"
                className="w-full text-sm flex items-center justify-center gap-2 border-dashed h-11 cursor-pointer"
                disabled={isLoading}
              >
                <Sparkles className="h-4 w-4" />
                Auto-fill Demo Credentials
              </Button>
            )}
          </CardContent>
          <CardFooter className="justify-center pt-2">
            <span className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="text-primary hover:underline font-semibold"
              >
                Sign Up
              </Link>
            </span>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
