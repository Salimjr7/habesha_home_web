"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Heart, MapPin, ShieldCheck, Zap } from "lucide-react";
import { formatETB } from "@/lib/utils";
import { useState } from "react";
import { toggleFavoriteAction } from "@/server/actions/favorite.actions";

interface PropertyCardProps {
  property: {
    id: string;
    slug: string;
    title: string;
    propertyType: string;
    address: string;
    pricePerNight: number;
    avgRating: number;
    reviewCount: number;
    verified?: boolean;
    instantBooking?: boolean;
    city?: { name: string; slug: string };
    images?: Array<{ url: string; alt?: string | null; isCover?: boolean }>;
  };
  initialFavorite?: boolean;
}

export function PropertyCard({ property, initialFavorite = false }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isFavLoading, setIsFavLoading] = useState(false);

  const coverImage =
    property.images?.find((img) => img.isCover)?.url ||
    property.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80";

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    setIsFavLoading(true);

    try {
      const res = await toggleFavoriteAction(property.id);
      if (res.success && res.data) {
        setIsFavorite((res.data as { isFavorite: boolean }).isFavorite);
      }
    } catch {
      setIsFavorite(isFavorite); // revert on failure
    } finally {
      setIsFavLoading(false);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
      {/* Image Container with aspect ratio */}
      <Link href={`/property/${property.slug}`} className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={coverImage}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {property.verified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-600/90 text-white backdrop-blur-md shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified
            </span>
          )}
          {property.instantBooking && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-500/90 text-white backdrop-blur-md shadow-xs">
              <Zap className="w-3 h-3" />
              Instant
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          disabled={isFavLoading}
          aria-label="Save to favorites"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-90"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? "fill-red-500 text-red-500" : "text-white"
            }`}
          />
        </button>

        {/* City tag on bottom corner of image */}
        {property.city && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 text-xs font-medium text-white/95 drop-shadow-md">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{property.city.name}</span>
          </div>
        )}
      </Link>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {property.propertyType.replace("_", " ")}
          </span>
          <div className="flex items-center gap-1 text-xs font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{property.avgRating > 0 ? property.avgRating.toFixed(2) : "New"}</span>
            {property.reviewCount > 0 && (
              <span className="text-muted-foreground font-normal">({property.reviewCount})</span>
            )}
          </div>
        </div>

        <Link href={`/property/${property.slug}`} className="group-hover:text-primary transition-colors">
          <h3 className="font-bold text-base line-clamp-1 leading-snug text-foreground">
            {property.title}
          </h3>
        </Link>

        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
          {property.address}
        </p>

        {/* Price & Booking Footer */}
        <div className="mt-4 pt-3 border-t border-border/40 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-lg text-foreground">
              {formatETB(property.pricePerNight)}
            </span>
            <span className="text-xs text-muted-foreground">/ night</span>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            All taxes incl.
          </span>
        </div>
      </div>
    </div>
  );
}
