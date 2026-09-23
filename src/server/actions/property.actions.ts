"use server";

import prisma from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth/session";
import { createPropertySchema, CreatePropertyInput, searchSchema, SearchInput } from "@/lib/validations";
import { PropertyService } from "@/server/services/property.service";
import { createErrorResponse, createSuccessResponse, ActionResponse } from "@/lib/errors";
import { slugify } from "@/lib/utils";
import { PropertyStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function searchPropertiesAction(params: SearchInput) {
  try {
    const validated = searchSchema.parse(params);
    const result = await PropertyService.searchProperties(validated);
    return createSuccessResponse(result);
  } catch (err) {
    return createErrorResponse(err);
  }
}

import { WalletService } from "@/server/services/wallet.service";
import { NotFoundError } from "@/lib/errors";

export async function createPropertyAction(input: CreatePropertyInput): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    const validated = createPropertySchema.parse(input);

    // If user is currently a RENTER, upgrade them to OWNER as they publish their first listing
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (dbUser?.role === "RENTER") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "OWNER" },
      });
    }

    // Ensure host has a wallet initialized for payouts
    await WalletService.getOrCreateWallet(user.id);

    // Resolve city by id or slug (the client form passes the city slug e.g. "addis-ababa")
    const city = await prisma.city.findFirst({
      where: {
        OR: [{ id: validated.cityId }, { slug: validated.cityId }],
      },
    });

    if (!city) {
      throw new NotFoundError("Selected Ethiopian city not found");
    }

    // Resolve amenities by id or slug
    const resolvedAmenities = await prisma.amenity.findMany({
      where: {
        OR: [
          { id: { in: validated.amenityIds } },
          { slug: { in: validated.amenityIds } },
        ],
      },
    });

    const title = validated.title?.trim() || `Modern ${validated.propertyType} in ${city.name}`;
    const address = validated.address?.trim() || `${city.name}, Ethiopia`;
    const description =
      validated.description && validated.description.trim().length >= 10
        ? validated.description.trim()
        : `Modern ${validated.propertyType.toLowerCase()} located in ${city.name}. Fully furnished with high-speed Wi-Fi, reliable standby power, water reserve, and prime access to Ethiopian dining and culture.`;

    const baseSlug = slugify(title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const property = await prisma.property.create({
      data: {
        title,
        slug: uniqueSlug,
        description,
        propertyType: validated.propertyType,
        listingType: validated.listingType,
        status: PropertyStatus.PUBLISHED,
        cityId: city.id,
        address,
        bedrooms: validated.bedrooms,
        bathrooms: validated.bathrooms,
        beds: validated.beds,
        maxGuests: validated.maxGuests,
        pricePerNight: validated.pricePerNight * 100, // store in cents
        pricePerMonth: validated.pricePerMonth ? validated.pricePerMonth * 100 : null,
        cleaningFee: validated.cleaningFee * 100,
        weeklyDiscount: validated.weeklyDiscount,
        monthlyDiscount: validated.monthlyDiscount,
        ownerId: user.id,
        amenities: {
          create: resolvedAmenities.map((a) => ({
            amenityId: a.id,
          })),
        },
        images:
          validated.images && validated.images.length > 0
            ? {
                create: validated.images.map((img, idx) => ({
                  url: img.url,
                  alt: img.alt || `${title} photo ${idx + 1}`,
                  isCover: img.isCover ?? idx === 0,
                  order: img.order ?? idx,
                })),
              }
            : undefined,
      },
      include: {
        city: true,
        images: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/owner");
    revalidatePath("/owner/listings");
    revalidatePath("/account");

    return createSuccessResponse(property);
  } catch (err) {
    return createErrorResponse(err);
  }
}

export async function togglePropertyStatusAction(propertyId: string, status: PropertyStatus): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      const { NotFoundError } = await import("@/lib/errors");
      throw new NotFoundError("Property");
    }

    if (property.ownerId !== user.id && (user as unknown as { role?: string }).role !== "ADMIN") {
      const { AuthorizationError } = await import("@/lib/errors");
      throw new AuthorizationError("You do not own this property");
    }

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: { status },
    });

    revalidatePath("/owner/listings");
    revalidatePath(`/property/${property.slug}`);

    return createSuccessResponse(updated);
  } catch (err) {
    return createErrorResponse(err);
  }
}

export async function updatePropertyAction(
  propertyId: string,
  input: CreatePropertyInput
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    const validated = createPropertySchema.parse(input);

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      const { NotFoundError } = await import("@/lib/errors");
      throw new NotFoundError("Property");
    }

    if (property.ownerId !== user.id && (user as unknown as { role?: string }).role !== "ADMIN") {
      const { AuthorizationError } = await import("@/lib/errors");
      throw new AuthorizationError("You do not own this property");
    }

    // Resolve city by id or slug
    const city = await prisma.city.findFirst({
      where: {
        OR: [{ id: validated.cityId }, { slug: validated.cityId }],
      },
    });

    if (!city) {
      const { NotFoundError } = await import("@/lib/errors");
      throw new NotFoundError("Selected Ethiopian city not found");
    }

    // Resolve amenities by id or slug
    const resolvedAmenities = await prisma.amenity.findMany({
      where: {
        OR: [
          { id: { in: validated.amenityIds } },
          { slug: { in: validated.amenityIds } },
        ],
      },
    });

    const title = validated.title?.trim() || property.title;
    const address = validated.address?.trim() || property.address;
    const description =
      validated.description && validated.description.trim().length >= 10
        ? validated.description.trim()
        : property.description;

    // Replace amenities
    await prisma.propertyAmenity.deleteMany({
      where: { propertyId },
    });

    // Replace images if provided
    if (validated.images !== undefined) {
      await prisma.propertyImage.deleteMany({
        where: { propertyId },
      });
      if (validated.images.length > 0) {
        await prisma.propertyImage.createMany({
          data: validated.images.map((img, idx) => ({
            propertyId,
            url: img.url,
            alt: img.alt || `${title} photo ${idx + 1}`,
            isCover: img.isCover ?? idx === 0,
            order: img.order ?? idx,
          })),
        });
      }
    }

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: {
        title,
        description,
        propertyType: validated.propertyType,
        listingType: validated.listingType,
        cityId: city.id,
        address,
        bedrooms: validated.bedrooms,
        bathrooms: validated.bathrooms,
        beds: validated.beds,
        maxGuests: validated.maxGuests,
        pricePerNight: validated.pricePerNight * 100, // store in cents
        pricePerMonth: validated.pricePerMonth ? validated.pricePerMonth * 100 : null,
        cleaningFee: validated.cleaningFee * 100,
        weeklyDiscount: validated.weeklyDiscount,
        monthlyDiscount: validated.monthlyDiscount,
        amenities: {
          create: resolvedAmenities.map((a) => ({
            amenityId: a.id,
          })),
        },
      },
      include: {
        city: true,
        images: true,
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/owner");
    revalidatePath("/owner/listings");
    revalidatePath(`/property/${property.slug}`);
    revalidatePath(`/owner/listings/${propertyId}/edit`);

    return createSuccessResponse(updated);
  } catch (err) {
    return createErrorResponse(err);
  }
}

