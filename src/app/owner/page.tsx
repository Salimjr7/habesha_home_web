import prisma from "@/lib/db";
import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { formatETB, formatDateRange } from "@/lib/utils";
import {
  Wallet,
  Home,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { MessageService } from "@/server/services/message.service";

export const dynamic = "force-dynamic";

export default async function OwnerDashboardPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/login?redirect=/owner");
  }

  const userId = session.user.id;

  // Retrieve host metrics
  let hostWallet: any = null;
  let propertiesCount = 0;
  let activeBookings: any[] = [];
  let totalReservations = 0;
  let recentConversations: any[] = [];

  try {
    const [wallet, propsCount, bookings, bookingsCount, convs] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId } }),
      prisma.property.count({ where: { ownerId: userId } }),
      prisma.booking.findMany({
        where: { property: { ownerId: userId } },
        include: {
          property: true,
          renter: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.booking.count({
        where: { property: { ownerId: userId } },
      }),
      MessageService.getUserConversations(userId),
    ]);

    hostWallet = wallet;
    propertiesCount = propsCount;
    activeBookings = bookings;
    totalReservations = bookingsCount;
    recentConversations = convs;
  } catch (error) {
    console.error("Error loading owner dashboard metrics:", error);
  }

  const availableBalance = hostWallet?.availableBalance ?? 0;
  const totalEarnings = hostWallet?.totalEarnings ?? 0;

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
            Host Overview
          </span>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">
            Welcome back, {session.user.name.split(" ")[0]}!
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here is your Ethiopian property performance and recent guest activity.
          </p>
        </div>

        <Link href="/owner/listings/new">
          <Button className="font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <PlusCircle className="w-4 h-4 mr-2" /> Add New Property
          </Button>
        </Link>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Available Balance */}
        <div className="p-6 rounded-3xl border border-border/70 bg-card shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Available Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground">{formatETB(availableBalance)}</div>
          <Link href="/owner/wallet" className="text-xs text-green-600 dark:text-green-400 font-semibold hover:underline inline-flex items-center gap-1">
            Withdraw to bank or telebirr <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Total Earnings */}
        <div className="p-6 rounded-3xl border border-border/70 bg-card shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Earnings
            </span>
            <div className="w-8 h-8 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground">{formatETB(totalEarnings)}</div>
          <span className="text-xs text-muted-foreground font-medium">All-time net host payout</span>
        </div>

        {/* Published Properties */}
        <div className="p-6 rounded-3xl border border-border/70 bg-card shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Properties
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground">{propertiesCount}</div>
          <Link href="/owner/listings" className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1">
            Manage listings <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Total Bookings */}
        <div className="p-6 rounded-3xl border border-border/70 bg-card shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Reservations
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground">{totalReservations}</div>
          <span className="text-xs text-muted-foreground font-medium">Confirmed &amp; pending</span>
        </div>
      </div>

      {/* Recent Guest Inquiries & Messages */}
      <div className="p-8 rounded-3xl border border-border/70 bg-card space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Guest Inquiries &amp; Messages</h2>
              <p className="text-xs text-muted-foreground">Direct real-time conversations with prospective and booked guests</p>
            </div>
          </div>
          <Link href="/account/messages" className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1">
            Open Messenger <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentConversations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentConversations.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                href={`/account/messages?conversationId=${c.id}`}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  c.unread
                    ? "bg-primary/10 border-primary/30 hover:bg-primary/15"
                    : "bg-secondary/30 border-border/60 hover:bg-secondary/60"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <Avatar src={c.otherUser?.image} name={c.otherUser?.name || "Guest User"} size="md" />
                    {c.unread && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-foreground truncate">{c.otherUser?.name || "Guest User"}</h4>
                    <p className="text-xs text-muted-foreground truncate">{c.lastMessage || "Direct inquiry"}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-muted-foreground block">
                    {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                  <span className="text-[11px] font-semibold text-primary inline-flex items-center gap-0.5 mt-0.5">
                    Reply &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm space-y-1 rounded-2xl border border-dashed border-border/70 p-6">
            <p className="font-medium text-foreground text-xs">No guest messages yet</p>
            <p className="text-[11px] text-muted-foreground">When renters inquire about your homes or send messages, they will appear here in real time.</p>
          </div>
        )}
      </div>

      {/* Recent Guest Reservations Table */}
      <div className="p-8 rounded-3xl border border-border/70 bg-card space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Recent Guest Reservations</h2>
          <Link href="/owner/bookings" className="text-xs text-primary font-semibold hover:underline">
            View all
          </Link>
        </div>

        {activeBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3">Guest</th>
                  <th className="pb-3">Property</th>
                  <th className="pb-3">Dates</th>
                  <th className="pb-3">Payout</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {activeBookings.map((b) => (
                  <tr key={b.id} className="text-xs">
                    <td className="py-4 font-semibold text-foreground">{b.renter?.name || "Guest User"}</td>
                    <td className="py-4 font-medium text-foreground line-clamp-1">{b.property.title}</td>
                    <td className="py-4 text-muted-foreground">{formatDateRange(b.checkIn, b.checkOut)}</td>
                    <td className="py-4 font-bold text-foreground">{formatETB(b.totalPrice)}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-green-500/15 text-green-600 dark:text-green-400"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground text-sm space-y-2">
            <p>No guest bookings yet.</p>
            <p className="text-xs">When renters book your homes, their trips will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
