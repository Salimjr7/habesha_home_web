"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Heart, User, PlusCircle, Compass, Menu, X, Shield, Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useSession, signOut } from "@/lib/auth/client";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = session?.user as
    | { id: string; name: string; email: string; image?: string | null; role?: string }
    | undefined;
  const isOwner = user?.role === "OWNER" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-header backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Light Mode Logo */}
          <Image
            src="/ethiohome-logo.png"
            alt="EthioHome Logo"
            width={160}
            height={40}
            className="h-9 w-auto object-contain dark:hidden"
            priority
          />
          {/* Dark Mode Logo with clean pill container for contrast */}
          <div className="hidden dark:flex items-center bg-white/95 px-3 py-1.5 rounded-xl shadow-xs">
            <Image
              src="/ethiohome-logo.png"
              alt="EthioHome Logo"
              width={150}
              height={38}
              className="h-7 w-auto object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Quick Search Pill */}
        <div className="hidden md:flex items-center">
          <Link
            href="/search"
            className="flex items-center gap-4 px-5 py-2.5 rounded-full border border-border/80 bg-background/80 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all text-sm group"
          >
            <span className="font-semibold text-foreground">Anywhere in Ethiopia</span>
            <span className="h-4 w-px bg-border"></span>
            <span className="text-muted-foreground">Any week</span>
            <span className="h-4 w-px bg-border"></span>
            <span className="text-muted-foreground">Add guests</span>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform">
              <Search className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Right Navigation / User Menu */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/search">
            <Button variant="ghost" size="sm" className="font-medium">
              <Compass className="w-4 h-4 mr-2" />
              Explore
            </Button>
          </Link>

          {isOwner ? (
            <Link href="/owner">
              <Button variant="outline" size="sm" className="border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/5 hover:bg-green-500/10">
                <PlusCircle className="w-4 h-4 mr-2" />
                Host Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/owner/listings/new">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Become a Host
              </Button>
            </Link>
          )}

          {isAdmin && (
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400">
                <Shield className="w-4 h-4 mr-1.5" />
                Admin
              </Button>
            </Link>
          )}

          <ThemeToggle />

          {session?.user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-border/60">
              <Link href="/account/favorites">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500" title="Saved Homes">
                  <Heart className="w-5 h-5" />
                </Button>
              </Link>

              <Link href="/account" className="flex items-center gap-2 p-1 rounded-full hover:bg-secondary transition-colors" title="My Account">
                <Avatar
                  src={session.user.image}
                  name={session.user.name}
                  size="sm"
                  className="ring-2 ring-primary/20"
                />
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await signOut();
                  toast.success("Logged out successfully");
                  window.location.href = "/";
                }}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="default" size="sm" className="font-semibold shadow-xs">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border/60 bg-background/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <Link
            href="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/80 font-medium text-sm"
          >
            <Search className="w-5 h-5 text-primary" />
            <span>Search Ethiopian Homes</span>
          </Link>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border/60 text-sm font-medium"
            >
              <Compass className="w-4 h-4 text-green-500" />
              Explore All
            </Link>
            <Link
              href="/account/favorites"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border/60 text-sm font-medium"
            >
              <Heart className="w-4 h-4 text-red-500" />
              Saved Homes
            </Link>
          </div>

          {session?.user ? (
            <div className="pt-3 border-t border-border/60 space-y-2">
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar src={session.user.image} name={session.user.name} size="md" />
                <div>
                  <p className="font-semibold text-sm">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
              </div>

              <Link
                href="/account/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-secondary"
              >
                My Bookings
              </Link>
              <Link
                href="/account/messages"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-secondary"
              >
                Messages
              </Link>
              {isOwner && (
                <Link
                  href="/owner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium rounded-lg text-green-600 dark:text-green-400 hover:bg-green-500/10"
                >
                  Host Dashboard & Wallet
                </Link>
              )}
              <Button
                variant="destructive"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="pt-4 border-t border-border/60 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign in
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" className="w-full font-semibold">
                  Create Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
