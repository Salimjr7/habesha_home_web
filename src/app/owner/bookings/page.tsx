import prisma from "@/lib/db";
import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { formatETB, formatDateRange } from "@/lib/utils";
import { Calendar, User, Phone, Mail, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function OwnerBookingsPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/login?redirect=/owner/bookings");
  }

  const userId = session.user.id;

  let bookings: any[] = [];
  try {
    bookings = await prisma.booking.findMany({
      where: { property: { ownerId: userId } },
      include: {
        property: true,
        renter: {
          select: { name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // fallback
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Reservations
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">
          Guest Bookings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View all guest stays across your Ethiopian properties.
        </p>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-6 rounded-3xl border border-border/70 bg-card flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      b.status === "CONFIRMED"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {b.status}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Booking #{b.id.slice(0, 8)}
                  </span>
                </div>

                <h3 className="font-bold text-base text-foreground">{b.property.title}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <User className="w-3.5 h-3.5 text-primary" /> {b.renter?.name || "Guest"}
                  </span>
                  <span>•</span>
                  <span>{formatDateRange(b.checkIn, b.checkOut)}</span>
                  <span>•</span>
                  <span>{b.guests} guest(s)</span>
                </div>
              </div>

              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-border/40">
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Host Payout
                  </span>
                  <span className="text-lg font-extrabold text-foreground">
                    {formatETB(b.totalPrice)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Message Guest
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border border-border/80 bg-card space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold">No reservations yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            When guests discover and reserve your listings, all bookings and payments will be managed here.
          </p>
        </div>
      )}
    </div>
  );
}
