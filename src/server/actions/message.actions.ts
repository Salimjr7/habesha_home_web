"use server";

import { requireAuth } from "@/lib/auth/session";
import { sendMessageSchema, SendMessageInput } from "@/lib/validations";
import { MessageService } from "@/server/services/message.service";
import { createErrorResponse, createSuccessResponse, ActionResponse } from "@/lib/errors";
import { revalidatePath } from "next/cache";

export async function sendMessageAction(input: SendMessageInput): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    const validated = sendMessageSchema.parse(input);

    const message = await MessageService.sendMessage(user.id, validated);

    if (validated.conversationId) {
      revalidatePath(`/account/messages/${validated.conversationId}`);
    }
    revalidatePath("/account/messages");

    return createSuccessResponse(message);
  } catch (err) {
    return createErrorResponse(err);
  }
}
