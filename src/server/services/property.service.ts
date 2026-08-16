import prisma from "@/lib/db";
import { SearchInput } from "@/lib/validations";
import { PropertyStatus, Prisma } from "@prisma/client";
import { NotFoundError } from "@/lib/errors";

export class PropertyService {
  /**
   * Search and filter properties with pagination and sorting
   */
  static async searchProperties(input: SearchInput) {
    const {
      location,
      checkIn,
      checkOut,
      guests,
      minPrice,
      maxPrice,
      propertyType,
      bedrooms,
      bathrooms,
      amenities,
      rating,
      instantBooking,
      sort,
      page = 1,
      limit = 12,
    } = input;

    const skip = (page - 1) * limit;

    // Build Prisma where clause
    const where: Prisma.PropertyWhereInput = {
      status: PropertyStatus.PUBLISHED,
    };

    // Location / City filter (supports city slug, name, or address substring)
    if (location && location.trim() !== "") {
      const loc = location.trim();
      where.OR = [
        { city: { slug: { contains: loc.toLowerCase(), mode: "insensitive" } } },
        { city: { name: { contains: loc, mode: "insensitive" } } },
        { address: { contains: loc, mode: "insensitive" } },
        { title: { contains: loc, mode: "insensitive" } },
      ];
    }

    // Guest capacity
    if (guests && guests > 0) {
      where.maxGuests = { gte: guests };
    }

    // Price range (in minor units / cents)
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerNight = {};
      if (minPrice !== undefined) {
        where.pricePerNight.gte = minPrice * 100;
      }
      if (maxPrice !== undefined) {
        where.pricePerNight.lte = maxPrice * 100;
      }
    }

    // Property Type
    if (propertyType && propertyType !== "ALL") {
      where.propertyType = propertyType as Prisma.EnumPropertyTypeFilter["equals"];
    }

    // Bedrooms / Bathrooms
    if (bedrooms && bedrooms > 0) {
      where.bedrooms = { gte: bedrooms };
    }
    if (bathrooms && bathrooms > 0) {
      where.bathrooms = { gte: bathrooms };
    }

    // Instant booking
    if (instantBooking) {
      where.instantBooking = true;
    }

    // Minimum rating
    if (rating && rating > 0) {
      where.avgRating = { gte: rating };
    }

    // Amenities filtering
    if (amenities) {
      const amenityList = amenities.split(",").map((s) => s.trim()).filter(Boolean);
      if (amenityList.length > 0) {
        where.amenities = {
          some: {
            amenity: {
              slug: { in: amenityList },
            },
          },
        };
      }
    }

    // Date availability filtering: ensure no conflicting CONFIRMED booking overlaps
    if (checkIn && checkOut) {
      where.bookings = {
        none: {
          status: "CONFIRMED",
          AND: [
            { checkIn: { lt: checkOut } },
            { checkOut: { gt: checkIn } },
          ],
        },
      };
    }

    // Sorting
    let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: "desc" };
    switch (sort) {
      case "price_asc":
        orderBy = { pricePerNight: "asc" };
        break;
      case "price_desc":
        orderBy = { pricePerNight: "desc" };
        break;
      case "rating":
        orderBy = { avgRating: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "recommended":
      default:
        orderBy = { featured: "desc" };
        break;
    }

    // Execute query and total count in parallel
    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          city: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: [{ isCover: "desc" }, { order: "asc" }],
            take: 5,
          },
          owner: {
            select: { id: true, name: true, image: true },
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    return {
      properties,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  /**
   * Get single property details by ID or Slug
   */
  static async getPropertyByIdOrSlug(idOrSlug: string) {
    const property = await prisma.property.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        city: true,
        images: {
          orderBy: [{ isCover: "desc" }, { order: "asc" }],
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            phone: true,
            createdAt: true,
            profile: true,
          },
        },
        reviews: {
          include: {
            author: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!property) {
      throw new NotFoundError("Property");
    }

    return property;
  }

  /**
   * Get featured properties for homepage
   */
  static async getFeaturedProperties(limit: number = 6) {
    return prisma.property.findMany({
      where: {
        status: PropertyStatus.PUBLISHED,
        featured: true,
      },
      take: limit,
      include: {
        city: true,
        images: {
          orderBy: [{ isCover: "desc" }, { order: "asc" }],
          take: 4,
        },
      },
      orderBy: { avgRating: "desc" },
    });
  }

  /**
   * Get all popular Ethiopian cities
   */
  static async getFeaturedCities() {
    return prisma.city.findMany({
      where: { featured: true },
      include: {
        _count: {
          select: {
            properties: {
              where: { status: PropertyStatus.PUBLISHED },
            },
          },
        },
      },
    });
  }
}
