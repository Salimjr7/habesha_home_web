import { describe, it, expect } from "vitest";
import { calculateBookingPrice, calculatePlatformFee, calculateOwnerPayout } from "../src/lib/pricing";

describe("Habesha Home Pricing Engine", () => {
  const sampleProperty = {
    pricePerNight: 500000, // ETB 5,000 in cents
    cleaningFee: 50000,    // ETB 500 in cents
    serviceFee: 25000,     // ETB 250 in cents
    weeklyDiscount: 10,    // 10% discount for 7+ days
    monthlyDiscount: 25,   // 25% discount for 28+ days
  };

  it("calculates 1-night stay without discounts correctly with Ethiopian VAT", () => {
    const checkIn = new Date("2026-09-01");
    const checkOut = new Date("2026-09-02");

    const result = calculateBookingPrice({
      property: sampleProperty,
      checkIn,
      checkOut,
      guestCount: 2,
    });

    expect(result.nights).toBe(1);
    expect(result.basePrice).toBe(500000); // ETB 5,000
    expect(result.discount).toBe(0);
    expect(result.cleaningFee).toBe(50000);
    expect(result.serviceFee).toBe(25000); // 5% of base price
    // Subtotal: 500000 + 50000 + 25000 = 575000
    // Tax (15% VAT): 86250
    expect(result.tax).toBe(86250);
    expect(result.total).toBe(661250); // ETB 6,612.50
    expect(result.currency).toBe("ETB");
  });

  it("applies 10% weekly discount for stays 7 nights or longer", () => {
    const checkIn = new Date("2026-09-01");
    const checkOut = new Date("2026-09-08"); // 7 nights

    const result = calculateBookingPrice({
      property: sampleProperty,
      checkIn,
      checkOut,
      guestCount: 2,
    });

    expect(result.nights).toBe(7);
    expect(result.basePrice).toBe(3500000); // 7 * 5000 = ETB 35,000
    expect(result.discountPercentage).toBe(10);
    expect(result.discount).toBe(350000);  // 10% of 35,000 = ETB 3,500
  });

  it("calculates platform fees and net owner payouts accurately", () => {
    const totalCharge = 1000000; // ETB 10,000
    const platformFee = calculatePlatformFee(totalCharge);
    const ownerPayout = calculateOwnerPayout(totalCharge);

    expect(platformFee).toBe(50000); // 5% = ETB 500
    expect(ownerPayout).toBe(950000); // 95% = ETB 9,500
    expect(platformFee + ownerPayout).toBe(totalCharge);
  });
});
