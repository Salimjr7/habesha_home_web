import prisma from "@/lib/db";
import { formatETB, formatDateRange, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Calendar, User, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  let bookings: any[] = [];
  try {
    bookings = await prisma.booking.findMany({
      include: {
        property: { include: { city: true } },
        renter: { select: { name: true, email: true } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch {
    // fallback
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Reservations
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">
          Platform Bookings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Monitor stay dates, payment status, and guest bookings across Ethiopia.
        </p>
      </div>

      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-4 px-6">Booking ID</th>
                <th className="py-4 px-6">Property</th>
                <th className="py-4 px-6">Guest</th>
                <th className="py-4 px-6">Dates</th>
                <th className="py-4 px-6">Total (ETB)</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs">
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-foreground">
                      #{b.id.slice(0, 8)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-foreground line-clamp-1">{b.property.title}</div>
                      <div className="text-[11px] text-muted-foreground">{b.property.city.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-foreground">{b.renter?.name || "Guest"}</div>
                      <div className="text-muted-foreground text-[11px]">{b.renter?.email}</div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground font-medium">
                      {formatDateRange(b.checkIn, b.checkOut)}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-foreground">
                      {formatETB(b.totalPrice)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
