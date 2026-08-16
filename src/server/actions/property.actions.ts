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

export async function createPropertyAction(input: CreatePropertyInput): Promise<ActionResponse> {
  try {
    const user = await requireRole(["OWNER", "ADMIN"]);
    const validated = createPropertySchema.parse(input);

    const baseSlug = slugify(validated.title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const property = await prisma.property.create({
      data: {
        title: validated.title,
        slug: uniqueSlug,
        description: validated.description,
        propertyType: validated.propertyType,
        listingType: validated.listingType,
        status: PropertyStatus.PUBLISHED,
        cityId: validated.cityId,
        address: validated.address,
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
          create: validated.amenityIds.map((id) => ({
            amenityId: id,
          })),
        },
      },
      include: {
        city: true,
      },
    });

    revalidatePath("/search");
    revalidatePath("/owner/listings");

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
