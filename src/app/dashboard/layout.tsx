"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/vendors/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, signOut, isMock } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Auth Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-mono">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <span className="mt-4 text-sm text-muted-foreground animate-pulse">
          Loading secure session...
        </span>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
      name: "Library",
      href: "/dashboard/library",
      icon: BookOpen,
      disabled: true,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      disabled: true,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      disabled: true,
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex flex-col border-r border-border/40 bg-card transition-all duration-300 shrink-0 z-20
          ${isSidebarOpen ? "w-64" : "w-20"}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b border-border/40 flex items-center px-6 justify-between gap-2 overflow-hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-linear-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-xs">
              TF
            </span>
            {isSidebarOpen && (
              <span className="text-xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-indigo-500 to-purple-600 tracking-tighter animate-fade-in">
                TYPEFLOW
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <div key={item.name} className="relative group">
                {item.disabled ? (
                  <div className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold opacity-40 cursor-not-allowed select-none">
                    <Icon className="h-5 w-5 shrink-0" />
                    {isSidebarOpen && (
                      <span className="flex-1 text-left truncate">
                        {item.name}
                      </span>
                    )}
                    {isSidebarOpen && (
                      <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-muted border border-border/10 text-muted-foreground scale-90">
                        Soon
                      </span>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`
                      w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {isSidebarOpen && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Profile Card */}
        <div className="p-4 border-t border-border/40 space-y-2">
          {isSidebarOpen && isMock && (
            <div className="p-2.5 bg-yellow-500/5 dark:bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex gap-2 items-start text-xs text-yellow-600 dark:text-yellow-400 font-medium">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Running in Sandbox Mock Auth mode</span>
            </div>
          )}

          <div className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-secondary/40 transition-colors">
            <img
              src={
                user.user_metadata?.avatar_url ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`
              }
              alt="Avatar"
              className="h-10 w-10 rounded-xl bg-secondary shrink-0 border border-border/40"
            />
            {isSidebarOpen && (
              <div className="min-w-0 flex-1 animate-fade-in">
                <p className="text-sm font-bold truncate">
                  {user.user_metadata?.username || user.email.split("@")[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            )}
            {isSidebarOpen && (
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>

          {!isSidebarOpen && (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center p-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-background/80 backdrop-blur-md animate-fade-in">
          <div className="w-64 h-full bg-card border-r border-border/40 p-6 flex flex-col justify-between">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-lg bg-linear-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    TF
                  </span>
                  <span className="text-xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-indigo-500 to-purple-600 tracking-tighter">
                    TYPEFLOW
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg bg-secondary text-muted-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <div key={item.name}>
                      {item.disabled ? (
                        <div className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold opacity-40">
                          <Icon className="h-5 w-5 shrink-0" />
                          <span>{item.name} (Soon)</span>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`
                            flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all
                            ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}
                          `}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span>{item.name}</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-2 rounded-xl">
                <img
                  src={
                    user.user_metadata?.avatar_url ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`
                  }
                  alt="Avatar"
                  className="h-10 w-10 rounded-xl bg-secondary border border-border/40"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate">
                    {user.user_metadata?.username || user.email.split("@")[0]}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSignOut}
                variant="destructive"
                size="sm"
                className="w-full flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar Header */}
        <header className="h-16 border-b border-border/40 flex items-center px-6 justify-between bg-card/40 backdrop-blur-xs sticky top-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg bg-secondary text-muted-foreground md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:p-2 md:-ml-2 md:rounded-lg md:text-muted-foreground md:hover:bg-secondary md:flex cursor-pointer"
              title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb path */}
            <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <span>Home</span>
              <ChevronRight className="h-4 w-4 text-border" />
              <span className="text-foreground capitalize">
                {pathname.split("/").pop() || "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
