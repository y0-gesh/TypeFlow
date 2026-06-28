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
import { Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const { user, signUp } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
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

    // Validations
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters long");
    }

    setIsLoading(true);

    try {
      const { error: authError } = await signUp(email, password, username);
      if (authError) {
        setError(authError.message || "Failed to create account");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background transition-colors duration-300 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl -z-10" />

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-indigo-500 to-purple-600 tracking-tighter mb-2 hover:opacity-90 transition-opacity">
              TYPEFLOW
            </h1>
          </Link>
          <p className="text-muted-foreground text-sm">
            Unlock your potential through target typing.
          </p>
        </div>

        <Card className="shadow-xl border-border/60 p-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-center">
              Create Account
            </CardTitle>
            <CardDescription className="text-center">
              Start building your personalized learning libraries today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-sm flex items-start gap-2.5 animate-fade-in">
                <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>Account created successfully! Redirecting...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-11 h-11"
                    required
                    disabled={isLoading || success}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-11"
                    required
                    disabled={isLoading || success}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="password"
                    placeholder="Password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-11"
                    required
                    disabled={isLoading || success}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 h-11"
                    required
                    disabled={isLoading || success}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="default"
                size="default"
                className="w-full mt-2 h-11 font-semibold cursor-pointer"
                disabled={isLoading || success}
              >
                {isLoading ? "Signing Up..." : "Sign Up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center pt-2">
            <span className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-primary hover:underline font-semibold"
              >
                Sign In
              </Link>
            </span>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
