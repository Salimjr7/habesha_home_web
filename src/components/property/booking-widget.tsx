"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatETB, calculateNights } from "@/lib/utils";
import { calculateBookingPrice } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, Calendar as CalendarIcon, Users } from "lucide-react";
import { createBookingAction } from "@/server/actions/booking.actions";
import { toast } from "sonner";

interface BookingWidgetProps {
  property: {
    id: string;
    slug: string;
    title: string;
    pricePerNight: number;
    pricePerMonth?: number | null;
    cleaningFee: number;
    serviceFee: number;
    weeklyDiscount: number;
    monthlyDiscount: number;
    maxGuests: number;
    instantBooking: boolean;
    avgRating: number;
    reviewCount: number;
  };
}

export function BookingWidget({ property }: BookingWidgetProps) {
  const router = useRouter();

  // Tomorrow & 4 days from now as default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultCheckIn = tomorrow.toISOString().split("T")[0];

  const fourDays = new Date();
  fourDays.setDate(fourDays.getDate() + 5);
  const defaultCheckOut = fourDays.toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute live price breakdown preview
  let pricing: ReturnType<typeof calculateBookingPrice> | null = null;
  let nights = 0;

  try {
    const cIn = new Date(checkIn);
    const cOut = new Date(checkOut);
    nights = calculateNights(cIn, cOut);

    if (nights > 0) {
      pricing = calculateBookingPrice({
        property,
        checkIn: cIn,
        checkOut: cOut,
        guestCount: guests,
      });
    }
  } catch {
    pricing = null;
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricing || nights <= 0) {
      toast.error("Please select a valid check-in and check-out date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createBookingAction({
        propertyId: property.id,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests,
      });

      if (!res.success) {
        toast.error(res.error.message || "Failed to create booking.");
        return;
      }

      const booking = res.data as { id: string };
      toast.success("Booking created! Proceeding to payment...");
      router.push(`/property/${property.slug}/book?bookingId=${booking.id}`);
    } catch {
      toast.error("An unexpected error occurred. Please sign in first.");
      router.push(`/login?redirect=/property/${property.slug}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sticky top-28 rounded-3xl border border-border/80 bg-card p-6 shadow-2xl shadow-primary/5 space-y-6">
      {/* Price Header */}
      <div className="flex items-baseline justify-between border-b border-border/60 pb-5">
        <div>
          <span className="text-2xl font-extrabold text-foreground">
            {formatETB(property.pricePerNight)}
          </span>
          <span className="text-xs text-muted-foreground ml-1">/ night</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold">
          <span>★ {property.avgRating > 0 ? property.avgRating.toFixed(2) : "New"}</span>
          <span className="text-muted-foreground font-normal">({property.reviewCount} reviews)</span>
        </div>
      </div>

      <form onSubmit={handleBooking} className="space-y-4">
        {/* Date Selector Box */}
        <div className="rounded-2xl border border-border/80 overflow-hidden divide-y divide-border/60 bg-background/60">
          <div className="grid grid-cols-2 divide-x divide-border/60">
            <div className="p-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
                className="w-full bg-transparent text-xs font-semibold text-foreground focus:outline-none"
              />
            </div>
            <div className="p-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split("T")[0]}
                required
                className="w-full bg-transparent text-xs font-semibold text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
              Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value, 10))}
              className="w-full bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "guest" : "guests"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || nights <= 0}
          className="w-full h-12 text-base font-bold bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white shadow-md shadow-amber-500/25 hover:opacity-95"
        >
          {isSubmitting ? (
            "Reserving..."
          ) : property.instantBooking ? (
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 fill-white" /> Instant Reserve
            </span>
          ) : (
            "Request to Book"
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        You won&apos;t be charged until the host confirms or you proceed to Chapa/Telebirr checkout.
      </p>

      {/* Live Itemized Price Breakdown */}
      {pricing && (
        <div className="space-y-3 pt-4 border-t border-border/60 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>
              {formatETB(pricing.pricePerNight)} x {pricing.nights} nights
            </span>
            <span className="text-foreground font-medium">{formatETB(pricing.basePrice)}</span>
          </div>

          {pricing.discount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
              <span>Length of stay discount ({pricing.discountPercentage}%)</span>
              <span>-{formatETB(pricing.discount)}</span>
            </div>
          )}

          {pricing.cleaningFee > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Cleaning fee</span>
              <span className="text-foreground font-medium">{formatETB(pricing.cleaningFee)}</span>
            </div>
          )}

          <div className="flex justify-between text-muted-foreground">
            <span>Service fee (5%)</span>
            <span className="text-foreground font-medium">{formatETB(pricing.serviceFee)}</span>
          </div>

          <div className="flex justify-between text-muted-foreground">
            <span>Ethiopian VAT (15%)</span>
            <span className="text-foreground font-medium">{formatETB(pricing.tax)}</span>
          </div>

          <div className="flex justify-between text-sm font-extrabold pt-3 border-t border-border/60 text-foreground">
            <span>Total (ETB)</span>
            <span>{formatETB(pricing.total)}</span>
          </div>
        </div>
      )}

      {/* Trust guarantees */}
      <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
        <ShieldCheck className="w-4 h-4" /> Habesha Home Host Guarantee Included
      </div>
    </div>
  );
}
