import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { formatETB, formatDateRange } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import {
  Calendar,
  Heart,
  MessageSquare,
  Shield,
  Home,
  ArrowRight,
  PlusCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AccountDashboardPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/login?redirect=/account");
  }

  const userId = session.user.id;
  const isOwner = session.user.role === "OWNER" || session.user.role === "ADMIN";

  let upcomingBookings: any[] = [];
  let favoritesCount = 0;

  try {
    [upcomingBookings, favoritesCount] = await Promise.all([
      prisma.booking.findMany({
        where: { renterId: userId },
        include: {
          property: {
            include: {
              city: true,
              images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1 },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.favorite.count({ where: { userId } }),
    ]);
  } catch {
    // fallback
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Profile Header */}
      <div className="p-8 rounded-3xl border border-border/80 bg-card flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-5">
          <Avatar src={session.user.image} name={session.user.name} size="xl" className="ring-4 ring-primary/20" />
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl font-black text-foreground">{session.user.name}</h1>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <span>{session.user.role || "RENTER"} Member</span>
            </div>
          </div>
        </div>

        {isOwner ? (
          <Link href="/owner">
            <Button className="font-bold bg-primary text-primary-foreground">
              <Home className="w-4 h-4 mr-2" /> Host Hub &amp; Wallet
            </Button>
          </Link>
        ) : (
          <Link href="/owner/listings/new">
            <Button variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400">
              <PlusCircle className="w-4 h-4 mr-2" /> Become a Property Host
            </Button>
          </Link>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          href="/account/bookings"
          className="p-6 rounded-3xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-lg transition-all space-y-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-foreground">My Bookings</h3>
          <p className="text-xs text-muted-foreground">View upcoming trips, stay history, and check-in details</p>
        </Link>

        <Link
          href="/account/favorites"
          className="p-6 rounded-3xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-lg transition-all space-y-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-foreground">Saved Homes ({favoritesCount})</h3>
          <p className="text-xs text-muted-foreground">Browse all favorited properties across Ethiopian cities</p>
        </Link>

        <Link
          href="/account/messages"
          className="p-6 rounded-3xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-lg transition-all space-y-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-foreground">Messages</h3>
          <p className="text-xs text-muted-foreground">Communicate directly with your property hosts</p>
        </Link>
      </div>

      {/* Recent Trips Section */}
      <div className="p-8 rounded-3xl border border-border/70 bg-card space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Recent &amp; Upcoming Trips</h2>
          <Link href="/account/bookings" className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingBookings.length > 0 ? (
          <div className="space-y-4">
            {upcomingBookings.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl border border-border/60 bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      b.status === "CONFIRMED"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {b.status}
                  </span>
                  <h4 className="font-bold text-sm text-foreground">{b.property.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {formatDateRange(b.checkIn, b.checkOut)} • {b.guests} guest(s)
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-foreground block">
                    {formatETB(b.totalPrice)}
                  </span>
                  <Link href={`/account/bookings`} className="text-xs text-primary hover:underline font-medium">
                    Trip Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm space-y-3">
            <p>No trips booked yet.</p>
            <Link href="/search">
              <Button size="sm" variant="outline" className="mt-1">
                Explore Ethiopian Stays
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
