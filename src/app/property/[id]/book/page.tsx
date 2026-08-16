import { BookingService } from "@/server/services/booking.service";
import { formatETB, formatDateRange } from "@/lib/utils";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "@/lib/auth/session";
import { PaymentMethodSelector } from "@/components/booking/payment-method-selector";

export const dynamic = "force-dynamic";

interface BookPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bookingId?: string }>;
}

export default async function BookPage({ params, searchParams }: BookPageProps) {
  const { id } = await params;
  const { bookingId } = await searchParams;

  if (!bookingId) {
    redirect(`/property/${id}`);
  }

  const session = await getServerSession();
  if (!session?.user) {
    redirect(`/login?redirect=/property/${id}/book?bookingId=${bookingId}`);
  }

  let booking: any = null;
  try {
    booking = await BookingService.getBookingById(bookingId, session.user.id);
  } catch {
    notFound();
  }

  const coverImage =
    booking.property.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        href={`/property/${booking.property.slug}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to property
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Confirm and Pay
        </h1>
        <p className="text-sm text-muted-foreground">
          Review your reservation details and select your preferred Ethiopian payment method.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Payment Method Selection */}
        <div className="lg:col-span-7 space-y-8">
          <div className="p-6 rounded-3xl border border-border/70 bg-card space-y-6">
            <h2 className="text-lg font-bold text-foreground">Your Trip</h2>

            <div className="space-y-4 text-sm divide-y divide-border/60">
              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="font-semibold block">Dates</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateRange(booking.checkIn, booking.checkOut)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <div>
                  <span className="font-semibold block">Guests</span>
                  <span className="text-xs text-muted-foreground">{booking.guests} guest(s)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Payment Method Selector */}
          <PaymentMethodSelector bookingId={booking.id} />
        </div>

        {/* Right Column: Price Summary Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 rounded-3xl border border-border/80 bg-card p-6 shadow-xl space-y-6">
            <div className="flex gap-4 items-center pb-6 border-b border-border/60">
              <div className="relative w-24 h-20 rounded-2xl overflow-hidden shrink-0 bg-muted">
                <Image src={coverImage} alt={booking.property.title} fill className="object-cover" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {booking.property.city?.name}
                </span>
                <h3 className="font-bold text-sm line-clamp-2 text-foreground">
                  {booking.property.title}
                </h3>
              </div>
            </div>

            {/* Price Details */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-sm text-foreground">Price Details</h4>

              <div className="flex justify-between text-muted-foreground">
                <span>Base accommodation price</span>
                <span className="font-medium text-foreground">{formatETB(booking.basePrice)}</span>
              </div>

              {booking.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Special length discount</span>
                  <span>-{formatETB(booking.discount)}</span>
                </div>
              )}

              {booking.cleaningFee > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Cleaning fee</span>
                  <span className="font-medium text-foreground">{formatETB(booking.cleaningFee)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Service fee (5%)</span>
                <span className="font-medium text-foreground">{formatETB(booking.serviceFee)}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Ethiopian VAT (15%)</span>
                <span className="font-medium text-foreground">{formatETB(booking.tax)}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold pt-4 border-t border-border/60 text-foreground">
                <span>Total (ETB)</span>
                <span>{formatETB(booking.totalPrice)}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/50 flex items-center gap-3 text-xs text-muted-foreground">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Your funds are securely held by Habesha Home escrow until 24 hours after check-in.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
