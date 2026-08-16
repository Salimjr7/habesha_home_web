import prisma from "@/lib/db";
import { calculateBookingPrice } from "@/lib/pricing";
import { CreateBookingInput } from "@/lib/validations";
import { BookingError, NotFoundError } from "@/lib/errors";
import { BookingStatus, NotificationType } from "@prisma/client";

export class BookingService {
  /**
   * Check if a property is available for the given date range
   */
  static async checkAvailability(propertyId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
    const overlapping = await prisma.booking.findFirst({
      where: {
        propertyId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        AND: [
          { checkIn: { lt: checkOut } },
          { checkOut: { gt: checkIn } },
        ],
      },
    });

    return !overlapping;
  }

  /**
   * Create a booking with ATOMIC concurrency check in a transaction
   */
  static async createBooking(renterId: string, input: CreateBookingInput) {
    const { propertyId, checkIn, checkOut, guests, guestMessage } = input;

    // Fetch property details
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { owner: true },
    });

    if (!property) {
      throw new NotFoundError("Property");
    }

    if (guests > property.maxGuests) {
      throw new BookingError(`Maximum guest limit exceeded (Max: ${property.maxGuests})`);
    }

    // Server-side deterministic price calculation (NEVER trust client price)
    const pricing = calculateBookingPrice({
      property,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guestCount: guests,
    });

    // Execute atomic creation inside Prisma transaction
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Re-verify availability inside the transaction to avoid race conditions
      const conflict = await tx.booking.findFirst({
        where: {
          propertyId,
          status: { in: [BookingStatus.CONFIRMED] },
          AND: [
            { checkIn: { lt: new Date(checkOut) } },
            { checkOut: { gt: new Date(checkIn) } },
          ],
        },
      });

      if (conflict) {
        throw new BookingError("This property has just been booked for the selected dates. Please choose different dates.");
      }

      // 2. Create the booking record
      const newBooking = await tx.booking.create({
        data: {
          propertyId,
          renterId,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          guests,
          status: property.instantBooking ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
          basePrice: pricing.basePrice,
          cleaningFee: pricing.cleaningFee,
          serviceFee: pricing.serviceFee,
          tax: pricing.tax,
          discount: pricing.discount,
          totalPrice: pricing.total,
          currency: "ETB",
          guestMessage,
        },
        include: {
          property: {
            include: {
              images: { take: 1 },
              city: true,
            },
          },
          renter: {
            select: { name: true, email: true },
          },
        },
      });

      // 3. Notify the property owner
      await tx.notification.create({
        data: {
          userId: property.ownerId,
          type: NotificationType.BOOKING_REQUEST,
          title: "New Booking Request",
          message: `${newBooking.renter.name} requested to book "${property.title}" for ${pricing.nights} night(s).`,
          link: `/owner/bookings`,
          data: { bookingId: newBooking.id },
        },
      });

      return newBooking;
    });

    return booking;
  }

  /**
   * Get booking by ID with access verification
   */
  static async getBookingById(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          include: {
            images: true,
            city: true,
            owner: {
              select: { id: true, name: true, phone: true, image: true, email: true },
            },
          },
        },
        renter: {
          select: { id: true, name: true, phone: true, image: true, email: true },
        },
        payment: true,
        review: true,
      },
    });

    if (!booking) {
      throw new NotFoundError("Booking");
    }

    // Ensure only renter, host, or admin can view
    const isOwner = booking.property.ownerId === userId;
    const isRenter = booking.renterId === userId;

    if (!isOwner && !isRenter) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== "ADMIN") {
        const { AuthorizationError } = await import("@/lib/errors");
        throw new AuthorizationError("You do not have access to view this booking");
      }
    }

    return booking;
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(bookingId: string, userId: string, reason?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: true },
    });

    if (!booking) {
      throw new NotFoundError("Booking");
    }

    if (booking.renterId !== userId && booking.property.ownerId !== userId) {
      const { AuthorizationError } = await import("@/lib/errors");
      throw new AuthorizationError("You are not authorized to cancel this booking");
    }

    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      throw new BookingError(`Cannot cancel a ${booking.status.toLowerCase()} booking`);
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancelReason: reason || "Cancelled by user",
      },
    });

    // Notify the other party
    const notifyRecipientId = booking.renterId === userId ? booking.property.ownerId : booking.renterId;
    await prisma.notification.create({
      data: {
        userId: notifyRecipientId,
        type: NotificationType.BOOKING_CANCELLED,
        title: "Booking Cancelled",
        message: `Booking for "${booking.property.title}" has been cancelled.`,
        link: `/account/bookings/${bookingId}`,
      },
    });

    return updated;
  }
}
