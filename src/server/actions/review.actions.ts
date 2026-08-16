"use server";

import { requireAuth } from "@/lib/auth/session";
import { createReviewSchema, CreateReviewInput } from "@/lib/validations";
import { ReviewService } from "@/server/services/review.service";
import { createErrorResponse, createSuccessResponse, ActionResponse } from "@/lib/errors";
import { revalidatePath } from "next/cache";

export async function createReviewAction(input: CreateReviewInput): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    const validated = createReviewSchema.parse(input);

    const review = await ReviewService.createReview(user.id, validated);

    revalidatePath(`/account/bookings/${validated.bookingId}`);
    revalidatePath("/account/reviews");

    return createSuccessResponse(review);
  } catch (err) {
    return createErrorResponse(err);
  }
}
