import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db";
import { MessageService } from "@/server/services/message.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    const recipientId = searchParams.get("recipientId");

    // 1. If conversationId is specified, return that conversation's full thread
    if (conversationId) {
      const conversation = await MessageService.getConversationMessages(
        conversationId,
        session.user.id
      );
      return NextResponse.json({
        success: true,
        conversation,
        messages: conversation.messages,
      });
    }

    // 2. If recipientId is specified, find or return existing conversation thread
    if (recipientId) {
      const conversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: session.user.id } } },
            { participants: { some: { userId: recipientId } } },
          ],
        },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, name: true, image: true, phone: true },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              sender: {
                select: { id: true, name: true, image: true },
              },
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        messages: conversation?.messages || [],
        conversationId: conversation?.id || null,
        conversation: conversation || null,
      });
    }

    // 3. Otherwise, return all user conversations for the dashboard/inbox
    const conversations = await MessageService.getUserConversations(session.user.id);
    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load messages";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId, recipientId, propertyId, content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: "Message content cannot be empty" }, { status: 400 });
    }

    if (!conversationId && !recipientId) {
      return NextResponse.json(
        { success: false, error: "Either conversationId or recipientId must be provided" },
        { status: 400 }
      );
    }

    const message = await MessageService.sendMessage(session.user.id, {
      conversationId,
      recipientId,
      propertyId,
      content: content.trim(),
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to send message";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
