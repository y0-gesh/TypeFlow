"use client";
import React, { useState } from "react";
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
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      const { error: authError } = await resetPassword(email);
      if (authError) {
        setError(authError.message || "Failed to send reset link");
      } else {
        setSuccess(true);
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
            Resume your learning journey securely.
          </p>
        </div>

        <Card className="shadow-xl border-border/60 p-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-center">
              Reset Password
            </CardTitle>
            <CardDescription className="text-center">
              We&apos;ll send a password recovery link to your inbox
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
                <span>Password reset link sent! Please check your email.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Button
                type="submit"
                variant="default"
                size="default"
                className="w-full mt-2 h-11 font-semibold cursor-pointer"
                disabled={isLoading || success}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-between pt-2">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
