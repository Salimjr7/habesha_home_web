import Link from "next/link";
import { CheckCircle2, ArrowRight, Home, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";
import { formatETB, formatDateRange } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<{ tx_ref?: string; bookingId?: string }>;
}

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const { tx_ref, bookingId } = await searchParams;

  let booking: any = null;
  if (bookingId) {
    try {
      booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          property: {
            include: { city: true },
          },
        },
      });
    } catch {
      // fallback
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-8 sm:p-10 shadow-2xl text-center space-y-6">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Payment Confirmed
          </span>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            You&apos;re Going to Ethiopia!
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Your reservation has been confirmed and the host has been notified.
          </p>
        </div>

        {booking && (
          <div className="p-5 rounded-2xl bg-secondary/50 text-left text-xs space-y-2.5 border border-border/60">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Property</span>
              <span className="font-bold text-foreground line-clamp-1">{booking.property.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Dates</span>
              <span className="font-semibold text-foreground">
                {formatDateRange(booking.checkIn, booking.checkOut)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="font-extrabold text-foreground text-sm">
                {formatETB(booking.totalPrice)}
              </span>
            </div>
            {tx_ref && (
              <div className="flex justify-between items-center pt-2 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
                <span>Reference:</span>
                <span>{tx_ref}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/account/bookings" className="flex-1">
            <Button className="w-full font-bold bg-primary text-primary-foreground">
              <Calendar className="w-4 h-4 mr-2" /> View My Bookings
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" /> Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
