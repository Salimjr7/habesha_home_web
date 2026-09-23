"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Heart, User, PlusCircle, Compass, Menu, X, Shield, Wallet, LogOut, MessageSquare, Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useSession, signOut } from "@/lib/auth/client";
import { useState, useRef, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRealtime } from "@/components/shared/realtime-provider";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const {
    unreadMessagesCount,
    unreadNotificationsCount,
    notifications,
    markNotificationRead,
  } = useRealtime();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              {/* Real-time Messages Icon */}
              <Link href="/account/messages" className="relative">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground" title="Messages">
                  <MessageSquare className="w-5 h-5" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-green-500 px-1 text-[10px] font-black text-white shadow-xs animate-pulse">
                      {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Real-time Notifications Bell with Dropdown */}
              <div className="relative" ref={notifRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative text-muted-foreground hover:text-foreground"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-xs animate-pulse">
                      {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                    </span>
                  )}
                </Button>

                {/* Notifications Popover Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl border border-border/80 bg-card shadow-2xl p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">Notifications</span>
                        {unreadNotificationsCount > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-bold">
                            {unreadNotificationsCount} new
                          </span>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={() => markNotificationRead(undefined, true)}
                          className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 8).map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markNotificationRead(notif.id);
                              if (notif.link) {
                                setNotifDropdownOpen(false);
                                window.location.href = notif.link;
                              }
                            }}
                            className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                              !notif.read
                                ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                                : "bg-secondary/40 border-transparent hover:bg-secondary/70"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-xs text-foreground truncate">{notif.title}</h4>
                              <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-xs text-muted-foreground">
                          No notifications yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

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
                className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg hover:bg-secondary"
              >
                <span>Messages</span>
                {unreadMessagesCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500 text-white font-bold">
                    {unreadMessagesCount} new
                  </span>
                )}
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
