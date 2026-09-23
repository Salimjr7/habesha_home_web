"use server";

import prisma from "@/lib/db";
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

export interface SubmitPropertyReviewInput {
  propertyId: string;
  rating: number;
  comment?: string;
  cleanliness?: number;
  location?: number;
  communication?: number;
  accuracy?: number;
  value?: number;
}

export async function submitPropertyReviewAction(input: SubmitPropertyReviewInput): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    const { propertyId, rating, comment, cleanliness, location, communication, accuracy, value } = input;

    if (!propertyId) throw new Error("Property ID is required");
    if (!rating || rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5 stars");

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, slug: true, ownerId: true, title: true },
    });

    if (!property) throw new Error("Property not found");

    // Check if user already reviewed this property
    const existingReview = await prisma.review.findFirst({
      where: { propertyId, authorId: user.id },
    });

    let review;
    if (existingReview) {
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment: comment?.trim() || null,
          ...(cleanliness !== undefined ? { cleanliness } : {}),
          ...(location !== undefined ? { location } : {}),
          ...(communication !== undefined ? { communication } : {}),
          ...(accuracy !== undefined ? { accuracy } : {}),
          ...(value !== undefined ? { value } : {}),
        },
      });
    } else {
      review = await prisma.review.create({
        data: {
          rating,
          comment: comment?.trim() || null,
          property: {
            connect: { id: propertyId },
          },
          author: {
            connect: { id: user.id },
          },
          ...(cleanliness !== undefined ? { cleanliness } : {}),
          ...(location !== undefined ? { location } : {}),
          ...(communication !== undefined ? { communication } : {}),
          ...(accuracy !== undefined ? { accuracy } : {}),
          ...(value !== undefined ? { value } : {}),
        },
      });
    }

    // Notify the host if reviewer is not the owner
    if (property.ownerId && property.ownerId !== user.id) {
      try {
        await prisma.notification.create({
          data: {
            userId: property.ownerId,
            type: "NEW_REVIEW",
            title: "New Review Received",
            message: `A guest left a ${rating}-star review for "${property.title}".`,
            link: `/property/${property.slug}#reviews`,
            data: { reviewId: review.id },
          },
        });
      } catch (notifyErr) {
        console.error("Failed to notify host:", notifyErr);
      }
    }

    // Recalculate average rating & review count for the property
    const allReviews = await prisma.review.findMany({
      where: { propertyId },
      select: { rating: true },
    });

    const total = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((total / allReviews.length).toFixed(2));

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        avgRating,
        reviewCount: allReviews.length,
      },
    });

    revalidatePath(`/property/${property.slug}`);
    revalidatePath(`/property/${property.id}`);
    revalidatePath("/");
    revalidatePath("/search");

    return createSuccessResponse(review);
  } catch (err) {
    return createErrorResponse(err);
  }
}
