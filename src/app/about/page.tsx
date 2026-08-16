import Image from "next/image";
import { ShieldCheck, Heart, Sparkles, Home, Users, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Hero Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Our Story
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Redefining Home Rentals in Ethiopia
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Habesha Home was founded to bring world-class trust, verified infrastructure guarantees, and modern fintech payments to the Ethiopian housing and travel marketplace.
        </p>
      </div>

      {/* Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl border border-border/70 bg-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-foreground">Verified Standards</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every property listed on Habesha Home undergoes physical verification of standby generators, water reserve tanks, and compound security.
          </p>
        </div>

        <div className="p-8 rounded-3xl border border-border/70 bg-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-foreground">Fintech Infrastructure</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Seamless payments via Chapa and telebirr in Ethiopian Birr (ETB), with automated escrow protection for both guests and hosts.
          </p>
        </div>

        <div className="p-8 rounded-3xl border border-border/70 bg-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-foreground">Authentic Hospitality</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            From traditional Ethiopian coffee ceremonies to personalized host recommendations, we bring warmth and cultural pride to every stay.
          </p>
        </div>
      </div>
    </div>
  );
}
