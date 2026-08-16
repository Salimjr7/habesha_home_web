import prisma from "@/lib/db";
import { NotFoundError, AuthorizationError } from "@/lib/errors";
import { SendMessageInput } from "@/lib/validations";
import { NotificationType } from "@prisma/client";

export class MessageService {
  /**
   * Get user conversations with unread counters and property details
   */
  static async getUserConversations(userId: string) {
    const participants = await prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: { id: true, name: true, image: true, phone: true },
                },
              },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: "desc" } },
    });

    return participants.map((p) => {
      const otherParticipant = p.conversation.participants.find(
        (part) => part.userId !== userId
      );
      const lastMessage = p.conversation.messages[0] || null;

      return {
        id: p.conversation.id,
        propertyId: p.conversation.propertyId,
        otherUser: otherParticipant?.user || null,
        lastMessage: lastMessage?.content || p.conversation.lastMessage || "",
        lastMessageAt: lastMessage?.createdAt || p.conversation.updatedAt,
        unread: lastMessage ? !lastMessage.read && lastMessage.senderId !== userId : false,
      };
    });
  }

  /**
   * Get full message thread for a conversation
   */
  static async getConversationMessages(conversationId: string, userId: string) {
    // Verify participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant) {
      throw new AuthorizationError("You do not have access to this conversation");
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });

    // Update participant lastReadAt
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data: { lastReadAt: new Date() },
    });

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
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

    if (!conversation) {
      throw new NotFoundError("Conversation");
    }

    return conversation;
  }

  /**
   * Send a message (creates conversation if not existing)
   */
  static async sendMessage(senderId: string, input: SendMessageInput) {
    const { conversationId, recipientId, propertyId, content } = input;

    let convId = conversationId;
    let targetRecipientId = recipientId;

    if (!convId) {
      if (!targetRecipientId) {
        throw new NotFoundError("Recipient");
      }

      // Check if conversation already exists between these 2 users
      const existing = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: senderId } } },
            { participants: { some: { userId: targetRecipientId } } },
          ],
        },
      });

      if (existing) {
        convId = existing.id;
      } else {
        // Create new conversation
        const created = await prisma.conversation.create({
          data: {
            propertyId,
            lastMessage: content,
            lastMessageAt: new Date(),
            participants: {
              create: [
                { userId: senderId },
                { userId: targetRecipientId },
              ],
            },
          },
        });
        convId = created.id;
      }
    } else {
      // Find recipient from existing conversation
      const participants = await prisma.conversationParticipant.findMany({
        where: { conversationId: convId },
      });
      const other = participants.find((p) => p.userId !== senderId);
      if (other) {
        targetRecipientId = other.userId;
      }
    }

    // Create message record
    const message = await prisma.message.create({
      data: {
        conversationId: convId,
        senderId,
        content,
        read: false,
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: convId },
      data: {
        lastMessage: content,
        lastMessageAt: new Date(),
      },
    });

    // Dispatch notification to recipient
    if (targetRecipientId) {
      await prisma.notification.create({
        data: {
          userId: targetRecipientId,
          type: NotificationType.NEW_MESSAGE,
          title: `New message from ${message.sender.name}`,
          message: content.length > 60 ? content.slice(0, 57) + "..." : content,
          link: `/account/messages/${convId}`,
          data: { conversationId: convId, messageId: message.id },
        },
      });
    }

    return message;
  }
}
