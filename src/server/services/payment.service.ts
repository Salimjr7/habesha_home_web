import prisma from "@/lib/db";
import { PaymentProviderFactory, SupportedPaymentProvider } from "@/lib/payments/provider-factory";
import { PaymentError, NotFoundError } from "@/lib/errors";
import { PaymentStatus, BookingStatus, NotificationType, WalletTransactionType, WalletTransactionStatus } from "@prisma/client";
import { generateTxRef, generateIdempotencyKey } from "@/lib/utils";
import { calculateOwnerPayout } from "@/lib/pricing";

export class PaymentService {
  /**
   * Initialize a payment for a booking
   */
  static async initializePayment(
    bookingId: string,
    providerType: SupportedPaymentProvider,
    returnUrl?: string
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
        renter: true,
      },
    });

    if (!booking) {
      throw new NotFoundError("Booking");
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new PaymentError("Cannot pay for a cancelled booking");
    }

    // Check if payment already exists
    let payment = await prisma.payment.findUnique({
      where: { bookingId },
    });

    const txRef = payment?.txRef || generateTxRef("HH-PAY");
    const idempotencyKey = payment?.idempotencyKey || generateIdempotencyKey();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const provider = PaymentProviderFactory.getProvider(providerType);

    const nameParts = booking.renter.name.split(" ");
    const firstName = nameParts[0] || "Guest";
    const lastName = nameParts.slice(1).join(" ") || "User";

    // Call payment provider
    const initResult = await provider.initializePayment({
      amount: booking.totalPrice,
      currency: booking.currency,
      txRef,
      email: booking.renter.email,
      firstName,
      lastName,
      phone: booking.renter.phone || undefined,
      callbackUrl: `${appUrl}/api/payments/webhook`,
      returnUrl: returnUrl || `${appUrl}/payment/success?tx_ref=${txRef}&bookingId=${booking.id}`,
      title: `Habesha Home: ${booking.property.title}`,
      description: `Reservation for ${booking.guests} guest(s)`,
      metadata: {
        bookingId: booking.id,
        propertyId: booking.propertyId,
        renterId: booking.renterId,
      },
    });

    if (!initResult.success) {
      throw new PaymentError(initResult.error || "Failed to initialize payment gateway");
    }

    // Save or update payment in DB
    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalPrice,
          currency: booking.currency,
          status: PaymentStatus.PENDING,
          provider: providerType as "CHAPA" | "TELEBIRR",
          providerRef: initResult.providerRef,
          providerData: (initResult.providerData as object) || {},
          txRef,
          idempotencyKey,
          checkoutUrl: initResult.checkoutUrl,
          returnUrl,
        },
      });
    } else {
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          provider: providerType as "CHAPA" | "TELEBIRR",
          providerRef: initResult.providerRef,
          checkoutUrl: initResult.checkoutUrl,
        },
      });
    }

    return {
      paymentId: payment.id,
      checkoutUrl: initResult.checkoutUrl,
      txRef,
    };
  }

  /**
   * Verify and confirm payment (Server-side authoritative check)
   */
  static async verifyAndConfirmPayment(txRef: string) {
    const payment = await prisma.payment.findUnique({
      where: { txRef },
      include: {
        booking: {
          include: {
            property: {
              include: {
                owner: {
                  include: { wallet: true },
                },
              },
            },
            renter: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundError("Payment transaction");
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return { success: true, bookingId: payment.bookingId, alreadyConfirmed: true };
    }

    const provider = PaymentProviderFactory.getProvider(payment.provider);
    const verifyResult = await provider.verifyPayment(txRef);

    if (!verifyResult.success || verifyResult.status !== "SUCCESS") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      throw new PaymentError(verifyResult.error || "Payment verification failed");
    }

    // Update payment, booking, wallet, and audit log atomically in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Mark payment as SUCCESS
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
          providerRef: verifyResult.providerRef || payment.providerRef,
        },
      });

      // 2. Mark booking as CONFIRMED
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: BookingStatus.CONFIRMED },
      });

      // 3. Credit Host Wallet (Ledger system)
      const hostWallet = payment.booking.property.owner.wallet;
      if (hostWallet) {
        const ownerPayout = calculateOwnerPayout(payment.amount);

        // Add ledger entry
        await tx.walletTransaction.create({
          data: {
            walletId: hostWallet.id,
            type: WalletTransactionType.BOOKING_PAYMENT,
            status: WalletTransactionStatus.COMPLETED,
            amount: ownerPayout,
            balance: hostWallet.availableBalance + ownerPayout,
            currency: payment.currency,
            description: `Payment for booking #${payment.bookingId.slice(0, 8)} (${payment.booking.property.title})`,
            reference: payment.txRef,
          },
        });

        // Update cached wallet balance
        await tx.wallet.update({
          where: { id: hostWallet.id },
          data: {
            availableBalance: { increment: ownerPayout },
            totalEarnings: { increment: ownerPayout },
          },
        });
      }

      // 4. Send Notifications
      await tx.notification.create({
        data: {
          userId: payment.booking.renterId,
          type: NotificationType.BOOKING_CONFIRMED,
          title: "Payment Received & Booking Confirmed!",
          message: `Your booking for "${payment.booking.property.title}" is confirmed.`,
          link: `/account/bookings/${payment.bookingId}`,
        },
      });

      await tx.notification.create({
        data: {
          userId: payment.booking.property.ownerId,
          type: NotificationType.PAYMENT_RECEIVED,
          title: "Payment Received for Booking",
          message: `You received ETB ${(payment.amount / 100).toLocaleString()} for booking "${payment.booking.property.title}".`,
          link: `/owner/wallet`,
        },
      });
    });

    return { success: true, bookingId: payment.bookingId };
  }
}
