"use server";

import { requireAuth } from "@/lib/auth/session";
import { createBookingSchema, CreateBookingInput } from "@/lib/validations";
import { BookingService } from "@/server/services/booking.service";
import { createErrorResponse, createSuccessResponse, ActionResponse } from "@/lib/errors";
import { revalidatePath } from "next/cache";

export async function createBookingAction(input: CreateBookingInput): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    const validated = createBookingSchema.parse(input);

    const booking = await BookingService.createBooking(user.id, validated);

    revalidatePath("/account/bookings");
    revalidatePath("/owner/bookings");

    return createSuccessResponse(booking);
  } catch (err) {
    return createErrorResponse(err);
  }
}

export async function cancelBookingAction(bookingId: string, reason?: string): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    const result = await BookingService.cancelBooking(bookingId, user.id, reason);

    revalidatePath("/account/bookings");
    revalidatePath(`/account/bookings/${bookingId}`);

    return createSuccessResponse(result);
  } catch (err) {
    return createErrorResponse(err);
  }
}
