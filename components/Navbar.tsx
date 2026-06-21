"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./providers/AuthProvider";
import { useTheme } from "./providers/ThemeProvider";
import { logoutUser } from "@/lib/firebase/authService";
import { Leaf, Sun, Moon, LogOut, User as UserIcon, Menu, X, BarChart3, MessageSquare, Upload, Trophy, BookOpen } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3, authRequired: true },
    { name: "Carbon Coach", href: "/coach", icon: MessageSquare, authRequired: true },
    { name: "Bill Scanner", href: "/bills", icon: Upload, authRequired: true },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy, authRequired: false },
    { name: "Awareness", href: "/awareness", icon: BookOpen, authRequired: false },
  ];

  const visibleLinks = navLinks.filter(link => !link.authRequired || !!user);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary">
              <Leaf className="h-6 w-6 stroke-[2.5]" />
              <span>EcoTrace</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:space-x-1 lg:space-x-2">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm font-medium">
                  <UserIcon className="h-4 w-4 text-primary" />
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 px-3 py-2 rounded-md transition-colors font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/signin"
                  className="text-sm font-medium hover:text-primary px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 pt-2 pb-4 space-y-1">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          
          <div className="border-t border-border pt-4 mt-2">
            {user ? (
              <div className="space-y-2">
                <div className="px-4 py-2 text-sm text-muted-foreground truncate bg-muted rounded-md">
                  Logged in as: <span className="font-semibold text-foreground">{user.email}</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-md transition-colors font-medium"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-2 pt-2">
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center items-center py-2.5 rounded-md border border-border text-center text-sm font-medium hover:bg-muted transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center items-center py-2.5 rounded-full bg-primary text-primary-foreground text-center text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
