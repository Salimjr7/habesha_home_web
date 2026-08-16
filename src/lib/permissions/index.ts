// ============================================================================
// Habesha Home — CASL Authorization System
// ============================================================================

import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
  type MongoQuery,
  type SubjectType,
} from "@casl/ability";

// Subject types matching our Prisma models
export type Subjects =
  | "Property"
  | "Booking"
  | "Payment"
  | "Review"
  | "Favorite"
  | "Message"
  | "Conversation"
  | "Wallet"
  | "Withdrawal"
  | "Notification"
  | "User"
  | "AuditLog"
  | "all"
  | Record<string, any>;

// Actions
export type Actions = "create" | "read" | "update" | "delete" | "manage";

export type AppAbility = MongoAbility<[Actions, Subjects], MongoQuery>;

interface UserContext {
  id: string;
  role: "GUEST" | "RENTER" | "OWNER" | "ADMIN";
}

/**
 * Define abilities for a user based on their role.
 * This is the single source of truth for authorization.
 * Used on both server and client.
 */
export function defineAbilitiesFor(user?: UserContext | null): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (!user) {
    // ==============================
    // GUEST (unauthenticated)
    // ==============================
    can("read", "Property");
    can("read", "Review");

    return build();
  }

  // All authenticated users can:
  can("read", "Property");
  can("read", "Review");
  can("read", "Notification", { userId: user.id } as any);
  can("update", "Notification", { userId: user.id } as any);

  switch (user.role) {
    case "RENTER":
      // Bookings
      can("create", "Booking");
      can("read", "Booking", { renterId: user.id } as any);
      can("update", "Booking", { renterId: user.id } as any); // cancel

      // Favorites
      can("create", "Favorite");
      can("read", "Favorite", { userId: user.id } as any);
      can("delete", "Favorite", { userId: user.id } as any);

      // Reviews (must have completed booking — enforced in service layer)
      can("create", "Review");
      can("read", "Review", { authorId: user.id } as any);

      // Messages
      can("create", "Message");
      can("read", "Message", { senderId: user.id } as any);
      can("read", "Conversation");

      // Payments
      can("create", "Payment");
      can("read", "Payment", { "booking.renterId": user.id } as any);

      // Profile
      can("read", "User", { id: user.id } as any);
      can("update", "User", { id: user.id } as any);
      break;

    case "OWNER":
      // Everything a RENTER can do
      can("create", "Booking");
      can("read", "Booking", { renterId: user.id } as any);
      can("update", "Booking", { renterId: user.id } as any);
      can("create", "Favorite");
      can("read", "Favorite", { userId: user.id } as any);
      can("delete", "Favorite", { userId: user.id } as any);
      can("create", "Review");
      can("read", "Review", { authorId: user.id } as any);
      can("create", "Payment");

      // Property management
      can("create", "Property");
      can("read", "Property", { ownerId: user.id } as any);
      can("update", "Property", { ownerId: user.id } as any);
      can("delete", "Property", { ownerId: user.id } as any);

      // Booking management (as host)
      can("read", "Booking", { "property.ownerId": user.id } as any);
      can("update", "Booking", { "property.ownerId": user.id } as any); // confirm/reject

      // Messages
      can("create", "Message");
      can("read", "Message");
      can("read", "Conversation");

      // Wallet
      can("read", "Wallet", { userId: user.id } as any);

      // Withdrawals
      can("create", "Withdrawal");
      can("read", "Withdrawal", { userId: user.id } as any);

      // Profile
      can("read", "User", { id: user.id } as any);
      can("update", "User", { id: user.id } as any);
      break;

    case "ADMIN":
      // Full access
      can("manage", "all");
      // But cannot delete themselves
      cannot("delete", "User", { id: user.id } as any);
      break;
  }

  return build();
}

/**
 * Check if user can perform an action on a subject
 * Throws AuthorizationError if not allowed
 */
export function checkAbility(
  ability: AppAbility,
  action: Actions,
  subject: Subjects,
  field?: string
) {
  if (!ability.can(action, subject, field)) {
    const { AuthorizationError } = require("@/lib/errors");
    throw new AuthorizationError();
  }
}

/**
 * Create ability for server-side checks
 */
export function createAbilityForUser(user?: { id: string; role: string } | null): AppAbility {
  return defineAbilitiesFor(
    user ? { id: user.id, role: user.role as UserContext["role"] } : null
  );
}
