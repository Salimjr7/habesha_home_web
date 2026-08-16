import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { formatETB, formatDateRange } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, CheckCircle2, MessageSquare, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/login?redirect=/account/bookings");
  }

  const userId = session.user.id;

  let bookings: any[] = [];
  try {
    bookings = await prisma.booking.findMany({
      where: { renterId: userId },
      include: {
        property: {
          include: {
            city: true,
            images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1 },
            owner: { select: { name: true, phone: true, image: true } },
          },
        },
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // fallback
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Travel History
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">
          My Ethiopian Stays
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View all your confirmed reservations, completed stays, and host details.
        </p>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((b) => {
            const cover =
              b.property.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80";

            return (
              <div
                key={b.id}
                className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between"
              >
                <div className="flex gap-4 items-center">
                  <div className="relative w-28 h-24 rounded-2xl overflow-hidden shrink-0 bg-muted">
                    <Image src={cover} alt={b.property.title} fill className="object-cover" />
                  </div>
                  <div className="space-y-1">
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
                      <span className="text-xs text-muted-foreground">#{b.id.slice(0, 8)}</span>
                    </div>

                    <Link href={`/property/${b.property.slug}`}>
                      <h3 className="font-bold text-base text-foreground hover:text-primary transition-colors line-clamp-1">
                        {b.property.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDateRange(b.checkIn, b.checkOut)}</span>
                      <span>•</span>
                      <span>{b.guests} guest(s)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <div className="sm:text-right">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                      Total Paid
                    </span>
                    <span className="text-lg font-extrabold text-foreground">
                      {formatETB(b.totalPrice)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/account/messages`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Message Host
                      </Button>
                    </Link>
                    <Link href={`/property/${b.property.slug}`}>
                      <Button variant="secondary" size="sm" className="text-xs">
                        View Home
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border border-border/80 bg-card space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold">No stays booked yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Explore our verified collection of Ethiopian apartments and crater lake villas.
          </p>
          <Link href="/search">
            <Button className="mt-2 font-bold bg-primary text-primary-foreground">
              Discover Stays
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
