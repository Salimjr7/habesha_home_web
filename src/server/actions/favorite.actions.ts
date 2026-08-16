"use server";

import { requireAuth } from "@/lib/auth/session";
import { FavoriteService } from "@/server/services/favorite.service";
import { createErrorResponse, createSuccessResponse, ActionResponse } from "@/lib/errors";
import { revalidatePath } from "next/cache";

export async function toggleFavoriteAction(propertyId: string): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    const result = await FavoriteService.toggleFavorite(user.id, propertyId);

    revalidatePath("/account/favorites");

    return createSuccessResponse(result);
  } catch (err) {
    return createErrorResponse(err);
  }
}
