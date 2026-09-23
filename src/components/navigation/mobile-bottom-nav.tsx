"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Heart,
  MessageSquare,
  User,
  CalendarDays,
  Building,
} from "lucide-react";
import { useSession } from "@/lib/auth/client";
import { useRealtime } from "@/components/shared/realtime-provider";
import { useCapacitor } from "@/components/shared/capacitor-provider";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { unreadMessagesCount } = useRealtime();
  const { hapticFeedback } = useCapacitor();

  const user = session?.user as { role?: string } | undefined;
  const isOwner = user?.role === "OWNER" || user?.role === "ADMIN";

  // Hide bottom nav on specific fullscreen mobile flows like checkout or active chat room
  const isDirectMessageChat = pathname.startsWith("/account/messages/") && pathname !== "/account/messages";
  const isCheckoutModal = pathname.includes("/book") || pathname.includes("/payment");

  if (isDirectMessageChat || isCheckoutModal) {
    return null;
  }

  const navItems = [
    {
      label: "Explore",
      href: "/search",
      icon: Compass,
      isActive: pathname === "/" || pathname === "/search" || pathname.startsWith("/property"),
    },
    {
      label: "Saved",
      href: session ? "/account/favorites" : "/login?redirect=/account/favorites",
      icon: Heart,
      isActive: pathname === "/account/favorites",
    },
    {
      label: "Trips",
      href: session ? "/account/bookings" : "/login?redirect=/account/bookings",
      icon: CalendarDays,
      isActive: pathname.startsWith("/account/bookings"),
    },
    {
      label: "Inbox",
      href: session ? "/account/messages" : "/login?redirect=/account/messages",
      icon: MessageSquare,
      badge: unreadMessagesCount,
      isActive: pathname === "/account/messages",
    },
    isOwner
      ? {
          label: "Host",
          href: "/owner",
          icon: Building,
          isActive: pathname.startsWith("/owner"),
        }
      : {
          label: session ? "Profile" : "Log In",
          href: session ? "/account" : "/login",
          icon: User,
          isActive: pathname === "/account" || pathname === "/login" || pathname === "/register",
        },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border/50 pb-[env(safe-area-inset-bottom,0px)] shadow-lg transition-all"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => hapticFeedback("light")}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-colors select-none ${
                active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    active ? "scale-110 stroke-[2.25px]" : "stroke-[1.75px]"
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-background animate-pulse">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
