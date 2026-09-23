"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlusCircle, Star, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteListingButton } from "@/components/dashboard/delete-listing-button";
import { formatETB } from "@/lib/utils";

interface OwnerListingItem {
  id: string;
  slug: string;
  title: string;
  address: string;
  status: string;
  propertyType: string;
  avgRating: number;
  pricePerNight: number;
  images?: Array<{ url: string }>;
  [key: string]: any;
}

interface OwnerListingsGridProps {
  initialListings: OwnerListingItem[];
}

export function OwnerListingsGrid({ initialListings }: OwnerListingsGridProps) {
  const [listings, setListings] = useState<OwnerListingItem[]>(initialListings);
  const [animatingOutIds, setAnimatingOutIds] = useState<Set<string>>(new Set());

  // Keep state synced with server data when revalidated
  useEffect(() => {
    setListings(initialListings);
  }, [initialListings]);

  const handleOptimisticDelete = (propertyId: string) => {
    // 1. Immediately trigger exit animation on the card
    setAnimatingOutIds((prev) => new Set(prev).add(propertyId));

    // 2. Remove from active list after smooth animation
    setTimeout(() => {
      setListings((prev) => prev.filter((item) => item.id !== propertyId));
      setAnimatingOutIds((prev) => {
        const next = new Set(prev);
        next.delete(propertyId);
        return next;
      });
    }, 200);
  };

  const handleRollback = (propertyId: string) => {
    // Find the original item from initialListings and restore it
    const original = initialListings.find((item) => item.id === propertyId);
    if (original) {
      setListings((prev) => {
        if (prev.some((p) => p.id === propertyId)) return prev;
        return [original, ...prev];
      });
    }
  };

  if (listings.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl border border-border/80 bg-card space-y-4 animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mx-auto">
          <PlusCircle className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold">You haven&apos;t created any listings yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          List your Ethiopian home, villa, or apartment and start earning monthly income with guaranteed Chapa and telebirr payouts.
        </p>
        <Link href="/owner/listings/new" prefetch={true}>
          <Button className="mt-2 font-bold bg-primary text-primary-foreground">
            Create Your First Listing
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((prop) => {
        const cover =
          prop.images?.[0]?.url ||
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80";

        const isExiting = animatingOutIds.has(prop.id);

        return (
          <div
            key={prop.id}
            className={`rounded-3xl border border-border/70 bg-card overflow-hidden flex flex-col justify-between shadow-xs transition-all duration-200 ${
              isExiting
                ? "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                : "hover:shadow-lg opacity-100 scale-100"
            }`}
          >
            <div>
              <div className="relative aspect-[16/10] w-full bg-muted">
                <Image
                  src={cover}
                  alt={prop.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                    {prop.status}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-green-600 dark:text-green-400 uppercase">
                    {prop.propertyType.replace("_", " ")}
                  </span>
                  <div className="flex items-center gap-1 font-semibold text-foreground">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{prop.avgRating > 0 ? prop.avgRating.toFixed(2) : "New"}</span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-foreground line-clamp-1">
                  {prop.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{prop.address}</p>

                <div className="pt-2 text-sm font-extrabold text-foreground">
                  {formatETB(prop.pricePerNight)}{" "}
                  <span className="text-xs text-muted-foreground font-normal">/ night</span>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center gap-2 border-t border-border/40">
              <Link href={`/property/${prop.slug}`} prefetch={true} className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Eye className="w-3.5 h-3.5 mr-1.5" /> View Listing
                </Button>
              </Link>
              <Link href={`/owner/listings/${prop.id}/edit`} prefetch={true} className="flex-1">
                <Button variant="secondary" size="sm" className="w-full text-xs font-semibold">
                  <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                </Button>
              </Link>
              <div className="flex-1">
                <DeleteListingButton
                  propertyId={prop.id}
                  propertyTitle={prop.title}
                  onOptimisticDelete={handleOptimisticDelete}
                  onDeleteRollback={handleRollback}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
