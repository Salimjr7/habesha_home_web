"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";

interface CapacitorContextType {
  isNative: boolean;
  platform: string;
  isOnline: boolean;
  hapticFeedback: (style?: "light" | "medium" | "heavy") => Promise<void>;
  shareListing: (data: { title: string; text?: string; url: string }) => Promise<void>;
}

const CapacitorContext = createContext<CapacitorContextType>({
  isNative: false,
  platform: "web",
  isOnline: true,
  hapticFeedback: async () => {},
  shareListing: async () => {},
});

export function useCapacitor() {
  return useContext(CapacitorContext);
}

export function CapacitorProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState("web");
  const [isOnline, setIsOnline] = useState(true);

  // Initialize native platform features
  useEffect(() => {
    let unmounted = false;

    async function initCapacitor() {
      try {
        const { Capacitor } = await import("@capacitor/core");
        const native = Capacitor.isNativePlatform();
        if (unmounted) return;

        setIsNative(native);
        setPlatform(Capacitor.getPlatform());

        if (native) {
          // 1. Hide splash screen smoothly after hydration
          try {
            const { SplashScreen } = await import("@capacitor/splash-screen");
            await SplashScreen.hide({ fadeOutDuration: 300 });
          } catch {
            // Ignore if splash screen plugin isn't active
          }

          // 2. Hardware back button handling
          try {
            const { App } = await import("@capacitor/app");
            App.addListener("backButton", ({ canGoBack }) => {
              if (pathname === "/" || pathname === "/search") {
                // If on main entry screen, exit or minimize
                App.exitApp();
              } else if (canGoBack || window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            });
          } catch {
            // Ignore back button registration failure
          }

          // 3. Network status listener
          try {
            const { Network } = await import("@capacitor/network");
            const status = await Network.getStatus();
            setIsOnline(status.connected);

            Network.addListener("networkStatusChange", (netStatus) => {
              setIsOnline(netStatus.connected);
              if (!netStatus.connected) {
                toast.error("Offline: Check your internet connection", {
                  id: "network-offline",
                  duration: 5000,
                });
              } else {
                toast.success("Online: Connection restored", {
                  id: "network-online",
                  duration: 3000,
                });
              }
            });
          } catch {
            // Ignore network plugin errors
          }
        }
      } catch {
        // Fallback for purely browser environments without Capacitor runtime
        setIsNative(false);
      }
    }

    initCapacitor();

    return () => {
      unmounted = true;
    };
  }, [pathname, router]);

  // Synchronize Status Bar with theme
  useEffect(() => {
    if (!isNative) return;

    async function syncStatusBar() {
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        const isDark = resolvedTheme === "dark";

        await StatusBar.setStyle({
          style: isDark ? Style.Dark : Style.Light,
        });

        await StatusBar.setBackgroundColor({
          color: isDark ? "#0B132B" : "#FFFFFF",
        });
      } catch {
        // Ignore status bar update failure on unsupported platforms
      }
    }

    syncStatusBar();
  }, [isNative, resolvedTheme]);

  // Provide tactile haptic feedback
  const hapticFeedback = async (style: "light" | "medium" | "heavy" = "light") => {
    try {
      if (isNative) {
        const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
        const map = {
          light: ImpactStyle.Light,
          medium: ImpactStyle.Medium,
          heavy: ImpactStyle.Heavy,
        };
        await Haptics.impact({ style: map[style] });
      } else if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(style === "light" ? 10 : style === "medium" ? 25 : 50);
      }
    } catch {
      // Haptics unsupported or disabled
    }
  };

  // Provide native or web share
  const shareListing = async ({
    title,
    text,
    url,
  }: {
    title: string;
    text?: string;
    url: string;
  }) => {
    try {
      if (isNative) {
        const { Share } = await import("@capacitor/share");
        await Share.share({
          title,
          text: text || title,
          url,
          dialogTitle: "Share Property",
        });
      } else if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text, url });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      // User cancelled share or unsupported
    }
  };

  return (
    <CapacitorContext.Provider
      value={{
        isNative,
        platform,
        isOnline,
        hapticFeedback,
        shareListing,
      }}
    >
      {children}
    </CapacitorContext.Provider>
  );
}
