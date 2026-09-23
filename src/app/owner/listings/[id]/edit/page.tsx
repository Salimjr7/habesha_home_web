import prisma from "@/lib/db";
import { getServerSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import EditListingForm from "./edit-form";

export const dynamic = "force-dynamic";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/login?redirect=/owner/listings");
  }

  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
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
    },
  });

  if (!property) {
    notFound();
  }

  if (property.ownerId !== session.user.id && (session.user as any).role !== "ADMIN") {
    redirect("/owner/listings");
  }

  return (
    <EditListingForm
      property={{
        id: property.id,
        title: property.title,
        description: property.description,
        propertyType: property.propertyType,
        listingType: property.listingType,
        cityId: property.city.slug || property.cityId,
        address: property.address,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        beds: property.beds,
        maxGuests: property.maxGuests,
        pricePerNight: Math.round(property.pricePerNight / 100),
        pricePerMonth: property.pricePerMonth ? Math.round(property.pricePerMonth / 100) : 0,
        cleaningFee: Math.round(property.cleaningFee / 100),
        weeklyDiscount: property.weeklyDiscount,
        monthlyDiscount: property.monthlyDiscount,
        amenityIds: property.amenities.map((a) => a.amenity.slug || a.amenityId),
        images: property.images.map((img) => ({
          url: img.url,
          isCover: img.isCover,
          order: img.order,
        })),
      }}
    />
  );
}
