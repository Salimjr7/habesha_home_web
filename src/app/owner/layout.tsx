import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Home,
  Calendar,
  Wallet,
  MessageSquare,
  PlusCircle,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { label: "Dashboard", href: "/owner", icon: LayoutDashboard },
    { label: "My Listings", href: "/owner/listings", icon: Home },
    { label: "Reservations", href: "/owner/bookings", icon: Calendar },
    { label: "Wallet & Payouts", href: "/owner/wallet", icon: Wallet },
    { label: "Messages", href: "/account/messages", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border/60 bg-card/40 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
            </Link>
            <div>
              <Image
                src="/ethiohome-logo.png"
                alt="EthioHome Logo"
                width={140}
                height={35}
                className="h-8 w-auto object-contain mb-2 dark:hidden"
                priority
              />
              <div className="hidden dark:inline-flex items-center bg-white/95 px-2.5 py-1 rounded-xl shadow-xs mb-2">
                <Image
                  src="/ethiohome-logo.png"
                  alt="EthioHome Logo"
                  width={130}
                  height={32}
                  className="h-6 w-auto object-contain"
                  priority
                />
              </div>
              <h2 className="text-lg font-black text-foreground">Host Hub</h2>
              <p className="text-xs text-muted-foreground">Manage your Ethiopian properties</p>
            </div>
          </div>

          <Link href="/owner/listings/new" className="block">
            <Button className="w-full font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/20">
              <PlusCircle className="w-4 h-4 mr-2" /> Add New Listing
            </Button>
          </Link>

          <nav className="space-y-1.5 pt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors"
                >
                  <Icon className="w-4 h-4 text-green-500" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-border/60 text-xs text-muted-foreground">
          <span>EthioHome Host Network</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 max-w-6xl">{children}</main>
    </div>
  );
}
