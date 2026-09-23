import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { realtimeHub } from "@/lib/realtime/event-hub";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection event
        const connectMsg = `event: connected\ndata: ${JSON.stringify({ userId, timestamp: new Date().toISOString() })}\n\n`;
        controller.enqueue(encoder.encode(connectMsg));

        // Handler for realtime events targeted at this user
        const handleUserEvent = (payload: any) => {
          try {
            const dataStr = `event: ${payload.type.toLowerCase()}\ndata: ${JSON.stringify(payload.data)}\n\n`;
            controller.enqueue(encoder.encode(dataStr));
          } catch (err) {
            console.error("Failed to enqueue event:", err);
          }
        };

        const channel = `user:${userId}`;
        realtimeHub.on(channel, handleUserEvent);

        // Keepalive heartbeat every 15 seconds
        const heartbeatInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(": heartbeat\n\n"));
          } catch {
            clearInterval(heartbeatInterval);
          }
        }, 15000);

        // Cleanup on abort
        req.signal.addEventListener("abort", () => {
          clearInterval(heartbeatInterval);
          realtimeHub.off(channel, handleUserEvent);
          try {
            controller.close();
          } catch {
            // Already closed
          }
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("SSE stream connection error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
