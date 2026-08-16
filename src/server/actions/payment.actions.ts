"use server";

import { requireAuth } from "@/lib/auth/session";
import { initializePaymentSchema, InitializePaymentInput } from "@/lib/validations";
import { PaymentService } from "@/server/services/payment.service";
import { createErrorResponse, createSuccessResponse, ActionResponse } from "@/lib/errors";
import { revalidatePath } from "next/cache";

export async function initializePaymentAction(input: InitializePaymentInput): Promise<ActionResponse> {
  try {
    await requireAuth();
    const validated = initializePaymentSchema.parse(input);

    const result = await PaymentService.initializePayment(
      validated.bookingId,
      validated.provider,
      validated.returnUrl
    );

    return createSuccessResponse(result);
  } catch (err) {
    return createErrorResponse(err);
  }
}

export async function verifyPaymentAction(txRef: string): Promise<ActionResponse> {
  try {
    const result = await PaymentService.verifyAndConfirmPayment(txRef);

    revalidatePath("/account/bookings");
    revalidatePath(`/account/bookings/${result.bookingId}`);
    revalidatePath("/owner/wallet");

    return createSuccessResponse(result);
  } catch (err) {
    return createErrorResponse(err);
  }
}
