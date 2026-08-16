import { describe, it, expect } from "vitest";
import {
  createBookingSchema,
  createPropertySchema,
  createWithdrawalSchema,
} from "../src/lib/validations";

describe("Habesha Home Zod Validation Schemas", () => {
  it("validates a valid booking request successfully", () => {
    const validBooking = {
      propertyId: "prop_12345",
      checkIn: "2026-09-01T14:00:00.000Z",
      checkOut: "2026-09-05T11:00:00.000Z",
      guests: 2,
    };

    const parsed = createBookingSchema.safeParse(validBooking);
    expect(parsed.success).toBe(true);
  });

  it("fails booking validation if check-in or guests is invalid", () => {
    const invalidBooking = {
      propertyId: "",
      checkIn: "invalid-date",
      checkOut: "invalid-date",
      guests: 0,
    };

    const parsed = createBookingSchema.safeParse(invalidBooking);
    expect(parsed.success).toBe(false);
  });

  it("validates withdrawal amount in cents with minimum ETB threshold", () => {
    const validWithdrawal = {
      amount: 500000, // ETB 5,000
      payoutAccountId: "payout_cbe_1",
    };

    const parsed = createWithdrawalSchema.safeParse(validWithdrawal);
    expect(parsed.success).toBe(true);
  });
});
