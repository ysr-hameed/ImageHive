import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/theme-provider";
import { 
  Moon, 
  Sun, 
  Menu, 
  X,
  ImageIcon,
  Upload,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Bell,
  Crown,
  CreditCard
} from "lucide-react";

export default function Navigation() {
  const { isAuthenticated, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = isAuthenticated ? [
    { href: "/", label: "Dashboard", icon: BarChart3 },
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/docs", label: "API Docs", icon: undefined },
    ...(user?.isAdmin ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
  ] : [
    { href: "#features", label: "Features", icon: undefined },
    { href: "#pricing", label: "Pricing", icon: undefined },
    { href: "/docs", label: "API Docs", icon: undefined },
    { href: "#support", label: "Support", icon: undefined },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <div className="w-8 h-8 bg-gradient-to-r from-brand-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-semibold text-gray-900 dark:text-white">
              ImageVault
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400"
                  }`}
                  data-testid={`link-${link.label.toLowerCase()}`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* User section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* User dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    data-testid="user-menu-button"
                  >
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                        data-testid="user-avatar"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-sm font-medium" data-testid="user-avatar-fallback">
                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </div>
                    )}
                  </button>

                  {/* Dropdown menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                      <div className="flex items-center space-x-3">
                        {user?.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center text-white text-lg font-medium">
                            {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user?.firstName || user?.email?.split('@')[0]}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user?.email}
                          </div>
                          {user?.plan && (
                            <Badge className="mt-1 text-xs">
                              {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <a
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </a>
                      <a
                        href="/api-usage"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Usage & Billing</span>
                      </a>
                      <button
                        onClick={async () => {
                          try {
                            await fetch('/api/auth/logout', { method: 'POST' });
                            window.location.href = '/';
                          } catch (error) {
                            console.error('Logout failed:', error);
                          }
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                        data-testid="button-logout"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild data-testid="button-signin">
                  <a href="/auth/login">Sign In</a>
                </Button>
                <Button size="sm" asChild data-testid="button-get-started">
                  <a href="/auth/login">Get Started</a>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-slate-700 py-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`mobile-link-${link.label.toLowerCase()}`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {isAuthenticated && (
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  data-testid="mobile-button-logout"
                  onClick={async () => { 
                    await fetch('/api/auth/logout', { method: 'POST' }); 
                    window.location.href = '/'; 
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}