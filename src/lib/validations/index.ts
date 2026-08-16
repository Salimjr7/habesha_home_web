import { z } from "zod";

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z
      .string()
      .regex(/^\+?[0-9]{9,15}$/, "Please enter a valid phone number")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    role: z.enum(["RENTER", "OWNER"]).default("RENTER"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  phone: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  city: z.string().optional(),
  language: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// ============================================================================
// PROPERTY SCHEMAS
// ============================================================================

export const propertyBasicSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be less than 5000 characters"),
  propertyType: z.enum([
    "APARTMENT",
    "HOUSE",
    "VILLA",
    "CONDO",
    "STUDIO",
    "PENTHOUSE",
    "TOWNHOUSE",
    "COTTAGE",
  ]),
  listingType: z.enum(["SHORT_TERM", "LONG_TERM", "BOTH"]).default("SHORT_TERM"),
  cityId: z.string().min(1, "Please select a city"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

export const propertyDetailsSchema = z.object({
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(1).max(20),
  beds: z.number().int().min(1).max(40),
  maxGuests: z.number().int().min(1).max(50),
});

export const propertyPricingSchema = z.object({
  pricePerNight: z.number().int().min(100, "Minimum price is ETB 1"),
  pricePerMonth: z.number().int().min(0).optional(),
  cleaningFee: z.number().int().min(0).default(0),
  weeklyDiscount: z.number().int().min(0).max(100).default(0),
  monthlyDiscount: z.number().int().min(0).max(100).default(0),
});

export const propertyAmenitiesSchema = z.object({
  amenityIds: z.array(z.string()).min(1, "Select at least one amenity"),
});

export const createPropertySchema = propertyBasicSchema
  .merge(propertyDetailsSchema)
  .merge(propertyPricingSchema)
  .merge(propertyAmenitiesSchema);

export type PropertyBasicInput = z.infer<typeof propertyBasicSchema>;
export type PropertyDetailsInput = z.infer<typeof propertyDetailsSchema>;
export type PropertyPricingInput = z.infer<typeof propertyPricingSchema>;
export type PropertyAmenitiesInput = z.infer<typeof propertyAmenitiesSchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

// ============================================================================
// BOOKING SCHEMAS
// ============================================================================

export const createBookingSchema = z
  .object({
    propertyId: z.string().min(1),
    checkIn: z.coerce.date().refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: "Check-in must be today or later",
    }),
    checkOut: z.coerce.date(),
    guests: z.number().int().min(1, "At least 1 guest required"),
    guestMessage: z.string().max(1000).optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// ============================================================================
// PAYMENT SCHEMAS
// ============================================================================

export const initializePaymentSchema = z.object({
  bookingId: z.string().min(1),
  provider: z.enum(["CHAPA", "TELEBIRR"]),
  returnUrl: z.string().url().optional(),
});

export type InitializePaymentInput = z.infer<typeof initializePaymentSchema>;

// ============================================================================
// REVIEW SCHEMAS
// ============================================================================

export const createReviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters").max(2000).optional(),
  cleanliness: z.number().int().min(1).max(5).optional(),
  location: z.number().int().min(1).max(5).optional(),
  communication: z.number().int().min(1).max(5).optional(),
  accuracy: z.number().int().min(1).max(5).optional(),
  value: z.number().int().min(1).max(5).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ============================================================================
// MESSAGE SCHEMAS
// ============================================================================

export const sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  recipientId: z.string().optional(),
  propertyId: z.string().optional(),
  content: z.string().min(1, "Message cannot be empty").max(5000),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// ============================================================================
// SEARCH SCHEMAS
// ============================================================================

export const searchSchema = z.object({
  location: z.string().optional(),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  guests: z.coerce.number().int().min(1).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().optional(),
  propertyType: z.string().optional(),
  bedrooms: z.coerce.number().int().optional(),
  bathrooms: z.coerce.number().int().optional(),
  amenities: z.string().optional(), // comma-separated
  rating: z.coerce.number().min(0).max(5).optional(),
  instantBooking: z.coerce.boolean().optional(),
  sort: z
    .enum(["recommended", "price_asc", "price_desc", "rating", "newest"])
    .default("recommended"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type SearchInput = z.infer<typeof searchSchema>;

// ============================================================================
// WITHDRAWAL SCHEMAS
// ============================================================================

export const createWithdrawalSchema = z.object({
  amount: z.number().int().min(10000, "Minimum withdrawal is ETB 100"),
  payoutAccountId: z.string().min(1, "Select a payout account"),
});

export type CreateWithdrawalInput = z.infer<typeof createWithdrawalSchema>;

export const createPayoutAccountSchema = z.object({
  provider: z.enum(["bank", "chapa", "telebirr"]),
  accountName: z.string().min(2, "Account name is required"),
  accountNumber: z.string().min(5, "Account number is required"),
  bankName: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type CreatePayoutAccountInput = z.infer<typeof createPayoutAccountSchema>;
