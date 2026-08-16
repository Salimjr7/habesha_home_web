// ============================================================================
// Habesha Home — Pricing Engine
// ============================================================================

import { calculateNights } from "@/lib/utils";

interface PricingProperty {
  pricePerNight: number; // in minor units (cents)
  pricePerMonth?: number | null;
  cleaningFee: number;
  serviceFee: number;
  weeklyDiscount: number; // percentage
  monthlyDiscount: number; // percentage
}

interface PricingInput {
  property: PricingProperty;
  checkIn: Date;
  checkOut: Date;
  guestCount: number;
}

interface PricingBreakdown {
  nights: number;
  pricePerNight: number;
  basePrice: number;
  cleaningFee: number;
  serviceFee: number;
  tax: number;
  discount: number;
  discountPercentage: number;
  total: number;
  currency: string;
}

// Platform service fee percentage
const PLATFORM_SERVICE_FEE_PERCENT = 5;
// Tax percentage
const TAX_PERCENT = 15; // Ethiopian VAT

/**
 * Calculate complete booking price breakdown
 * This is deterministic and testable — same inputs always produce same outputs
 * 
 * IMPORTANT: This must be called on the server for the final price.
 * Client can use it for preview, but the server recalculates before charging.
 */
export function calculateBookingPrice(input: PricingInput): PricingBreakdown {
  const { property, checkIn, checkOut } = input;
  const nights = calculateNights(checkIn, checkOut);

  if (nights <= 0) {
    throw new Error("Invalid date range: check-out must be after check-in");
  }

  // Base price
  const basePrice = property.pricePerNight * nights;

  // Apply discount based on stay length
  let discountPercentage = 0;
  if (nights >= 28 && property.monthlyDiscount > 0) {
    discountPercentage = property.monthlyDiscount;
  } else if (nights >= 7 && property.weeklyDiscount > 0) {
    discountPercentage = property.weeklyDiscount;
  }
  const discount = Math.round((basePrice * discountPercentage) / 100);

  // Cleaning fee (flat)
  const cleaningFee = property.cleaningFee;

  // Service fee (percentage of base price after discount)
  const serviceFee = Math.round(
    ((basePrice - discount) * PLATFORM_SERVICE_FEE_PERCENT) / 100
  );

  // Tax (on subtotal)
  const subtotal = basePrice - discount + cleaningFee + serviceFee;
  const tax = Math.round((subtotal * TAX_PERCENT) / 100);

  // Total
  const total = subtotal + tax;

  return {
    nights,
    pricePerNight: property.pricePerNight,
    basePrice,
    cleaningFee,
    serviceFee,
    tax,
    discount,
    discountPercentage,
    total,
    currency: "ETB",
  };
}

/**
 * Calculate platform fee from a booking total
 */
export function calculatePlatformFee(totalPrice: number): number {
  return Math.round((totalPrice * PLATFORM_SERVICE_FEE_PERCENT) / 100);
}

/**
 * Calculate owner payout from a booking
 */
export function calculateOwnerPayout(totalPrice: number): number {
  return totalPrice - calculatePlatformFee(totalPrice);
}
