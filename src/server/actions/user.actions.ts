"use server";

import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { createSuccessResponse, createErrorResponse, ActionResponse } from "@/lib/errors";

export async function deleteAccountAction(): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    const userId = user.id;

    // Run cascade cleanup inside transaction
    await prisma.$transaction(async (tx) => {
      // 1. Clean up properties owned by user
      const ownedProperties = await tx.property.findMany({
        where: { ownerId: userId },
        select: { id: true },
      });

      const propertyIds = ownedProperties.map((p) => p.id);

      if (propertyIds.length > 0) {
        // Delete property images
        await tx.propertyImage.deleteMany({
          where: { propertyId: { in: propertyIds } },
        });

        // Delete property amenities
        await tx.propertyAmenity.deleteMany({
          where: { propertyId: { in: propertyIds } },
        });

        // Delete property reviews
        await tx.review.deleteMany({
          where: { propertyId: { in: propertyIds } },
        });

        // Delete bookings for these properties
        await tx.booking.deleteMany({
          where: { propertyId: { in: propertyIds } },
        });

        // Delete properties
        await tx.property.deleteMany({
          where: { id: { in: propertyIds } },
        });
      }

      // 2. Delete user's favorites
      await tx.favorite.deleteMany({
        where: { userId },
      });

      // 3. Delete user's own bookings as renter
      await tx.booking.deleteMany({
        where: { renterId: userId },
      });

      // 4. Delete user's reviews given
      await tx.review.deleteMany({
        where: { authorId: userId },
      });

      // 5. Delete sent messages
      await tx.message.deleteMany({
        where: { senderId: userId },
      });

      // 6. Delete conversation participations
      await tx.conversationParticipant.deleteMany({
        where: { userId },
      });

      // 7. Delete notifications
      await tx.notification.deleteMany({
        where: { userId },
      });

      // 8. Delete withdrawals & payout accounts
      await tx.withdrawal.deleteMany({
        where: { userId },
      });

      await tx.payoutAccount.deleteMany({
        where: { userId },
      });

      // 9. Delete wallet
      await tx.wallet.deleteMany({
        where: { userId },
      });

      // 10. Delete profile
      await tx.profile.deleteMany({
        where: { userId },
      });

      // 11. Delete sessions & accounts
      await tx.session.deleteMany({
        where: { userId },
      });

      await tx.account.deleteMany({
        where: { userId },
      });

      // 12. Delete user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/owner");
    revalidatePath("/account");

    return createSuccessResponse({ deleted: true });
  } catch (err) {
    console.error("Delete account error:", err);
    return createErrorResponse(err);
  }
}
