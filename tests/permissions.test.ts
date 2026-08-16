import { describe, it, expect } from "vitest";
import { defineAbilitiesFor } from "../src/lib/permissions";

describe("Habesha Home CASL Authorization Rules", () => {
  it("allows GUESTS to only read properties and reviews", () => {
    const guestAbility = defineAbilitiesFor(null);

    expect(guestAbility.can("read", "Property")).toBe(true);
    expect(guestAbility.can("read", "Review")).toBe(true);
    expect(guestAbility.can("create", "Booking")).toBe(false);
    expect(guestAbility.can("create", "Property")).toBe(false);
    expect(guestAbility.can("create", "Withdrawal")).toBe(false);
  });

  it("allows RENTERS to create bookings, favorites, reviews and messages", () => {
    const renter = { id: "user-renter-1", role: "RENTER" as const };
    const ability = defineAbilitiesFor(renter);

    expect(ability.can("create", "Booking")).toBe(true);
    expect(ability.can("create", "Favorite")).toBe(true);
    expect(ability.can("create", "Review")).toBe(true);
    expect(ability.can("create", "Message")).toBe(true);
    // Renters cannot manage other people's properties
    expect(ability.can("create", "Property")).toBe(false);
    expect(ability.can("create", "Withdrawal")).toBe(false);
  });

  it("allows OWNERS to create properties, view host hub, and request withdrawals", () => {
    const owner = { id: "user-owner-1", role: "OWNER" as const };
    const ability = defineAbilitiesFor(owner);

    expect(ability.can("create", "Property")).toBe(true);
    expect(ability.can("create", "Withdrawal")).toBe(true);
    expect(ability.can("create", "Booking")).toBe(true);
  });

  it("grants ADMINS full management access across all entities", () => {
    const admin = { id: "user-admin-1", role: "ADMIN" as const };
    const ability = defineAbilitiesFor(admin);

    expect(ability.can("manage", "all")).toBe(true);
    expect(ability.can("update", "Property")).toBe(true);
  });
});
