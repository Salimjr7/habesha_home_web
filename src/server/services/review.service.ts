import prisma from "@/lib/db";
import { CreateReviewInput } from "@/lib/validations";
import { NotFoundError, AppError } from "@/lib/errors";
import { BookingStatus, NotificationType } from "@prisma/client";

export class ReviewService {
  /**
   * Submit a review for a completed stay
   */
  static async createReview(authorId: string, input: CreateReviewInput) {
    const { bookingId, rating, comment, cleanliness, location, communication, accuracy, value } = input;

    // Verify booking eligibility
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
        review: true,
      },
    });

    if (!booking) {
      throw new NotFoundError("Booking");
    }

    if (booking.renterId !== authorId) {
      throw new AppError("You can only review stays you booked", 403, "UNAUTHORIZED_REVIEW");
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new AppError("Reviews can only be submitted for completed stays", 400, "INELIGIBLE_BOOKING");
    }

    if (booking.review) {
      throw new AppError("You have already reviewed this booking", 400, "DUPLICATE_REVIEW");
    }

    const review = await prisma.$transaction(async (tx) => {
      // 1. Create review
      const newReview = await tx.review.create({
        data: {
          propertyId: booking.propertyId,
          bookingId,
          authorId,
          rating,
          comment,
          cleanliness,
          location,
          communication,
          accuracy,
          value,
        },
      });

      // 2. Re-calculate aggregate rating for the property
      const allReviews = await tx.review.findMany({
        where: { propertyId: booking.propertyId },
        select: { rating: true },
      });

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = Number((totalRating / allReviews.length).toFixed(2));

      await tx.property.update({
        where: { id: booking.propertyId },
        data: {
          avgRating,
          reviewCount: allReviews.length,
        },
      });

      // 3. Notify the property host
      await tx.notification.create({
        data: {
          userId: booking.property.ownerId,
          type: NotificationType.NEW_REVIEW,
          title: "New Review Received",
          message: `A guest left a ${rating}-star review for "${booking.property.title}".`,
          link: `/property/${booking.property.slug}#reviews`,
          data: { reviewId: newReview.id },
        },
      });

      return newReview;
    });

    return review;
  }

  /**
   * Get property reviews
   */
  static async getPropertyReviews(propertyId: string, limit: number = 10, page: number = 1) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { propertyId },
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { propertyId } }),
    ]);

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
