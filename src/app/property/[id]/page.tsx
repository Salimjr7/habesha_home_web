import { PropertyService } from "@/server/services/property.service";
import { PropertyGallery } from "@/components/property/property-gallery";
import { BookingWidget } from "@/components/property/booking-widget";
import { Avatar } from "@/components/ui/avatar";
import { notFound } from "next/navigation";
import {
  MapPin,
  Star,
  ShieldCheck,
  Zap,
  Droplets,
  Wifi,
  Coffee,
  Users,
  Bed,
  Bath,
  DoorOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyActionButtons } from "@/components/property/property-action-buttons";
import { PropertyReviewSection } from "@/components/property/property-review-section";
import { HostChatModal } from "@/components/property/host-chat-modal";
import { getServerSession } from "@/lib/auth/session";
import { FavoriteService } from "@/server/services/favorite.service";

export const dynamic = "force-dynamic";

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;

  let property: any = null;

  try {
    property = await PropertyService.getPropertyByIdOrSlug(id);
  } catch {
    // If not found in DB, check fallback demo property
    if (id === "bole-atlas-executive-penthouse" || id === "1") {
      property = {
        id: "1",
        slug: "bole-atlas-executive-penthouse",
        title: "Bole Atlas Executive Penthouse with Panoramic City Views",
        description:
          "Experience modern luxury in the heart of Bole Atlas. This 3-bedroom penthouse offers floor-to-ceiling windows with breathtaking sunset vistas of Addis Ababa. Features 24/7 backup power generator, dual water reserve tanks, fiber-optic internet, and a dedicated security team. Walking distance to world-class restaurants, cafes, and Bole International Airport.",
        propertyType: "PENTHOUSE",
        listingType: "SHORT_TERM",
        address: "Bole Atlas, behind Edna Mall, Addis Ababa",
        bedrooms: 3,
        bathrooms: 3,
        beds: 3,
        maxGuests: 6,
        pricePerNight: 850000,
        cleaningFee: 100000,
        serviceFee: 42500,
        weeklyDiscount: 10,
        monthlyDiscount: 25,
        instantBooking: true,
        verified: true,
        avgRating: 4.95,
        reviewCount: 28,
        city: { name: "Addis Ababa", slug: "addis-ababa" },
        owner: {
          id: "owner-1",
          name: "Dawit Haile",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
          profile: { bio: "Superhost with 5+ years of hosting experience in Addis Ababa. Dedicated to five-star Ethiopian hospitality." },
        },
        images: [
          { id: "img-1", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80", isCover: true, alt: "Living room" },
          { id: "img-2", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", isCover: false, alt: "Master bedroom" },
          { id: "img-3", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80", isCover: false, alt: "Gourmet kitchen" },
          { id: "img-4", url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", isCover: false, alt: "Modern bathroom" },
        ],
        amenities: [
          { amenity: { name: "24/7 Backup Generator", icon: "Zap" } },
          { amenity: { name: "Continuous Water Tank", icon: "Droplets" } },
          { amenity: { name: "High-Speed Wi-Fi (Fiber)", icon: "Wifi" } },
          { amenity: { name: "24/7 Gated Security", icon: "ShieldCheck" } },
          { amenity: { name: "Dedicated Free Parking", icon: "Car" } },
          { amenity: { name: "Traditional Coffee Ceremony Set", icon: "Coffee" } },
          { amenity: { name: "Smart TV with DSTV", icon: "Tv" } },
          { amenity: { name: "Modern Elevator / Lift", icon: "ArrowUpDown" } },
        ],
        reviews: [
          {
            id: "rev-1",
            rating: 5,
            comment: "Betam arif bota new! The backup generator and water reservoir worked flawlessly. The host was incredibly welcoming with traditional coffee. Highly recommended for anyone visiting Addis Ababa.",
            createdAt: new Date(),
            author: {
              id: "u-1",
              name: "Abebe Kebede",
              image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
            },
          },
        ],
      };
    } else {
      notFound();
    }
  }

  const session = await getServerSession();
  const userFavoriteIds = await FavoriteService.getUserFavoriteIds(session?.user?.id);
  const isFavorite = userFavoriteIds.includes(property.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Action Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {property.verified && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/15 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> 100% In-Person Verified
            </span>
          )}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400">
            {property.propertyType.replace("_", " ")}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            {property.title}
          </h1>

          <PropertyActionButtons
            propertyId={property.id}
            title={property.title}
            slug={property.slug}
            initialIsFavorite={isFavorite}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-1">
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{property.avgRating > 0 ? property.avgRating.toFixed(2) : "New"}</span>
            <span className="text-muted-foreground font-normal">({property.reviewCount} reviews)</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-4 h-4 text-green-500" />
            <span>{property.address}</span>
          </div>
        </div>
      </div>

      {/* Photo Gallery Grid with Lightbox */}
      <PropertyGallery images={property.images} title={property.title} />

      {/* Main Content & Sticky Booking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-6">
        {/* Left 2 Columns: Details, Amenities, Host, Reviews */}
        <div className="lg:col-span-2 space-y-10">
          {/* Quick Stats Banner */}
          <div className="flex items-center justify-between p-6 rounded-3xl border border-border/70 bg-card">
            <div className="flex items-center gap-6 divide-x divide-border/60">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-sm">{property.maxGuests} Guests</span>
              </div>
              <div className="pl-6 flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-sm">{property.bedrooms} Bedrooms</span>
              </div>
              <div className="pl-6 flex items-center gap-2">
                <Bed className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-sm">{property.beds} Beds</span>
              </div>
              <div className="pl-6 flex items-center gap-2">
                <Bath className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-sm">{property.bathrooms} Baths</span>
              </div>
            </div>
          </div>

          {/* Host Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-border/70 bg-card">
            <div className="flex items-center gap-4">
              <Avatar src={property.owner.image} name={property.owner.name} size="lg" />
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  Hosted by {property.owner.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {property.owner.profile?.bio || "Verified EthioHome Superhost"}
                </p>
              </div>
            </div>

            <HostChatModal
              propertyId={property.id}
              propertyTitle={property.title}
              propertySlug={property.slug}
              hostId={property.owner.id}
              hostName={property.owner.name}
              hostImage={property.owner.image}
              buttonVariant="default"
              buttonText="Chat with Host"
              className="font-bold bg-primary text-primary-foreground shadow-xs shrink-0"
            />
          </div>

          {/* Infrastructure Assurances Highlight */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Ethiopian Living Assurances</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-border/60 bg-secondary/40 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">24/7 Power Backup</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Automatic standby generator kicks in within 10 seconds of any grid interruption.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border/60 bg-secondary/40 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Continuous Water Tank</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dedicated reserve storage and high-pressure electric water booster pump.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4 border-t border-border/60 pt-8">
            <h2 className="text-xl font-bold text-foreground">About this space</h2>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="space-y-5 border-t border-border/60 pt-8">
            <h2 className="text-xl font-bold text-foreground">What this place offers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {property.amenities.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 text-sm font-medium text-foreground/90">
                  <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>{item.amenity.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <PropertyReviewSection
            propertyId={property.id}
            slug={property.slug}
            avgRating={property.avgRating}
            reviewCount={property.reviewCount}
            reviews={property.reviews || []}
          />
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:col-span-1">
          <BookingWidget property={property} />
        </div>
      </div>
    </div>
  );
}
