import Link from "next/link";
import { getServerSession, requireRole } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import {
  Shield,
  Users,
  Home,
  Calendar,
  CreditCard,
  ArrowUpRight,
  ArrowLeft,
} from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?redirect=/admin");
  }

  const navItems = [
    { label: "Overview", href: "/admin", icon: Shield },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "Listing Moderation", href: "/admin/listings", icon: Home },
    { label: "Bookings", href: "/admin/bookings", icon: Calendar },
    { label: "Host Withdrawals", href: "/admin/withdrawals", icon: ArrowUpRight },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r border-border/60 bg-card/50 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="space-y-1">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Main App
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                <Shield className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-black text-foreground">Admin Ops</h2>
            </div>
            <p className="text-xs text-muted-foreground">Platform Administration</p>
          </div>

          <nav className="space-y-1.5 pt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors"
                >
                  <Icon className="w-4 h-4 text-emerald-500" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-border/60 text-xs text-muted-foreground">
          <span>Habesha Home Platform Control</span>
        </div>
      </aside>

      <main className="flex-1 p-6 sm:p-10 max-w-6xl">{children}</main>
    </div>
  );
}
