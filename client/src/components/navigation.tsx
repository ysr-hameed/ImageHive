"use client"

import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ImageIcon, Menu, X, Zap, Shield, Globe, Rocket } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

// Mocking auth state for demonstration purposes
// In a real app, you would use a context or hook to get this state
const isAuthenticated = true; // Change to false to test logged out state
const user = { firstName: "Alex" }; // Example user object

const handleLogout = () => {
  console.log("Logging out...");
  // Implement actual logout logic here
};

const navItems = [
  { name: "Features", href: "#features", icon: Zap },
  { name: "Security", href: "#security", icon: Shield },
  { name: "API", href: "#api", icon: Globe },
  { name: "Pricing", href: "#pricing", icon: Rocket },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200/20 dark:border-slate-700/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-blue-500/25">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ImageVault
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group"
                >
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">{item.name}</span>
                </a>
              );
            })}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Signed in as {user?.firstName || 'User'}</span>
                </div>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="font-medium">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <div className="flex flex-col h-full">
                  {/* Mobile Logo */}
                  <div className="flex items-center space-x-3 p-4 border-b border-gray-200/20 dark:border-slate-700/20">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      ImageVault
                    </span>
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="flex-1 py-6">
                    <div className="space-y-2">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <a
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 group"
                          >
                            <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium text-lg">{item.name}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Auth Buttons */}
                  <div className="p-4 space-y-3 border-t border-gray-200/20 dark:border-slate-700/20">
                    {isAuthenticated ? (
                      <>
                        <Link href="/dashboard">
                          <Button size="lg" asChild className="w-full justify-center font-medium">
                            Dashboard
                          </Button>
                        </Link>
                        <Button variant="outline" size="lg" onClick={handleLogout} className="w-full justify-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="lg" asChild className="w-full justify-center">
                          <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                            Sign In
                          </Link>
                        </Button>
                        <Button size="lg" asChild className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg">
                          <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                            Get Started Free
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}