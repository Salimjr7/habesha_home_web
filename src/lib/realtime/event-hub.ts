import { EventEmitter } from "events";

export interface RealtimeMessagePayload {
  conversationId: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  senderImage?: string | null;
  content: string;
  createdAt: string;
  propertyTitle?: string | null;
  messageId: string;
}

export interface RealtimeNotificationPayload {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  createdAt: string;
}

class RealtimeHub extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(300);
  }

  emitMessage(recipientId: string, payload: RealtimeMessagePayload) {
    this.emit(`user:${recipientId}`, {
      type: "NEW_MESSAGE",
      data: payload,
    });
    this.emit(`conversation:${payload.conversationId}`, {
      type: "NEW_MESSAGE",
      data: payload,
    });
  }

  emitNotification(userId: string, payload: RealtimeNotificationPayload) {
    this.emit(`user:${userId}`, {
      type: "NEW_NOTIFICATION",
      data: payload,
    });
  }
}

// Preserve singleton across Next.js dev server hot-reloads
const globalForEvents = globalThis as unknown as {
  ethioRealtimeHub?: RealtimeHub;
};

export const realtimeHub = globalForEvents.ethioRealtimeHub ?? new RealtimeHub();

if (process.env.NODE_ENV !== "production") {
  globalForEvents.ethioRealtimeHub = realtimeHub;
}
