"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "@/lib/auth/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface RealtimeMessage {
  conversationId: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  senderImage?: string | null;
  content: string;
  createdAt: string;
  messageId: string;
}

export interface RealtimeNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  createdAt: string;
  read?: boolean;
}

interface RealtimeContextType {
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
  notifications: RealtimeNotification[];
  refreshCounts: () => Promise<void>;
  markNotificationRead: (id?: string, markAll?: boolean) => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextType>({
  unreadMessagesCount: 0,
  unreadNotificationsCount: 0,
  notifications: [],
  refreshCounts: async () => {},
  markNotificationRead: async () => {},
});

// Subtle, clean Web Audio chime synthesized in-browser (no audio asset loading needed)
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // A5

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch {
    // Audio autoplay restrictions ignored safely
  }
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const lastProcessedMessageId = useRef<string | null>(null);

  const refreshCounts = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const [msgRes, notifRes] = await Promise.all([
        fetch("/api/messages", { cache: "no-store" }),
        fetch("/api/notifications", { cache: "no-store" }),
      ]);

      if (msgRes.ok) {
        const msgData = await msgRes.json();
        if (msgData.success && Array.isArray(msgData.conversations)) {
          const unread = msgData.conversations.filter((c: any) => c.unread).length;
          setUnreadMessagesCount(unread);
        }
      }

      if (notifRes.ok) {
        const notifData = await notifRes.json();
        if (notifData.success) {
          setUnreadNotificationsCount(notifData.unreadCount || 0);
          setNotifications(notifData.notifications || []);
        }
      }
    } catch {
      // Ignore network errors in background
    }
  }, [session?.user?.id]);

  const markNotificationRead = useCallback(async (id?: string, markAll: boolean = false) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id, markAll }),
      });

      if (markAll) {
        setUnreadNotificationsCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } else if (id) {
        setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      }
    } catch {
      // Best-effort update
    }
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initial load
    refreshCounts();

    // 1. Establish SSE live stream
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    function connectSSE() {
      try {
        eventSource = new EventSource("/api/realtime/stream");

        eventSource.addEventListener("new_message", (e) => {
          try {
            const data: RealtimeMessage = JSON.parse(e.data);
            if (data.messageId && data.messageId === lastProcessedMessageId.current) return;
            lastProcessedMessageId.current = data.messageId;

            // Only notify if message is from another account
            if (data.senderId !== session?.user?.id) {
              playNotificationChime();
              setUnreadMessagesCount((prev) => prev + 1);

              toast(`💬 ${data.senderName}`, {
                description: data.content.length > 50 ? `${data.content.slice(0, 47)}...` : data.content,
                action: {
                  label: "Reply",
                  onClick: () => router.push(`/account/messages?conversationId=${data.conversationId}`),
                },
                duration: 6000,
              });

              // Dispatch window event for live chat views
              window.dispatchEvent(new CustomEvent("ethiohome:new-message", { detail: data }));
            }
          } catch (err) {
            console.error("Failed to parse SSE new_message:", err);
          }
        });

        eventSource.addEventListener("new_notification", (e) => {
          try {
            const data: RealtimeNotification = JSON.parse(e.data);
            playNotificationChime();
            setUnreadNotificationsCount((prev) => prev + 1);
            setNotifications((prev) => [data, ...prev]);

            toast(`🔔 ${data.title}`, {
              description: data.message,
              action: data.link
                ? {
                    label: "View",
                    onClick: () => router.push(data.link!),
                  }
                : undefined,
              duration: 6000,
            });

            window.dispatchEvent(new CustomEvent("ethiohome:new-notification", { detail: data }));
          } catch (err) {
            console.error("Failed to parse SSE new_notification:", err);
          }
        });

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Reconnect after 4s
          reconnectTimeout = setTimeout(connectSSE, 4000);
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connectSSE, 4000);
      }
    }

    connectSSE();

    // 2. Fallback polling every 4 seconds to guarantee zero-lag sync across tabs & accounts
    const pollInterval = setInterval(() => {
      refreshCounts();
    }, 4000);

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      clearInterval(pollInterval);
    };
  }, [session?.user?.id, refreshCounts, router]);

  return (
    <RealtimeContext.Provider
      value={{
        unreadMessagesCount,
        unreadNotificationsCount,
        notifications,
        refreshCounts,
        markNotificationRead,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
