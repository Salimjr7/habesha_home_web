import prisma from "@/lib/db";

export class FavoriteService {
  /**
   * Toggle property favorite for user
   */
  static async toggleFavorite(userId: string, propertyId: string) {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return { isFavorite: false };
    } else {
      await prisma.favorite.create({
        data: {
          userId,
          propertyId,
        },
      });
      return { isFavorite: true };
    }
  }

  /**
   * Check if properties are favorited by user
   */
  static async getUserFavoriteIds(userId?: string | null): Promise<string[]> {
    if (!userId) return [];
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: { propertyId: true },
    });
    return favorites.map((f) => f.propertyId);
  }

  /**
   * Get full list of user's favorited properties
   */
  static async getUserFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            city: true,
            images: {
              orderBy: [{ isCover: "desc" }, { order: "asc" }],
              take: 3,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return favorites.map((f) => f.property);
  }
}
