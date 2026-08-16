import { ShieldCheck, HelpCircle, Zap, Droplets, Key, PhoneCall } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
  const faqs = [
    {
      q: "How does the Habesha Home Infrastructure Guarantee work?",
      a: "Every verified property on Habesha Home is inspected to ensure standby generator operation, continuous water reservoir tank capacity, and high-speed Wi-Fi. In the rare event of utility disruption, our 24/7 guest support coordinates immediate remediation or relocation.",
    },
    {
      q: "Which payment methods are supported in Ethiopia?",
      a: "We natively support telebirr, CBEBirr, Awash Bank, Dashen Bank, and international Visa/MasterCard through Chapa. All local payments are processed in Ethiopian Birr (ETB).",
    },
    {
      q: "How and when do hosts get paid?",
      a: "Guest payments are held securely in escrow and released to the host's wallet 24 hours after successful guest check-in. Hosts can request instant withdrawals to their telebirr or Ethiopian bank accounts at any time.",
    },
    {
      q: "What is the cancellation policy?",
      a: "Guests can cancel for a 100% full refund up to 48 hours before check-in. Cancellations within 48 hours are subject to the first night's fee to protect our hosts.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Support &amp; FAQ
        </span>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
          How Habesha Home Works
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Everything you need to know about booking verified Ethiopian stays, local payments, and host guarantees.
        </p>
      </div>

      {/* Assurance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl border border-border/70 bg-card space-y-2">
          <Zap className="w-6 h-6 text-amber-500" />
          <h3 className="font-bold text-sm text-foreground">24/7 Standby Power</h3>
          <p className="text-xs text-muted-foreground">Automatic backup generators installed in verified listings.</p>
        </div>
        <div className="p-6 rounded-3xl border border-border/70 bg-card space-y-2">
          <Droplets className="w-6 h-6 text-blue-500" />
          <h3 className="font-bold text-sm text-foreground">Continuous Water Reserve</h3>
          <p className="text-xs text-muted-foreground">Multi-thousand liter reservoir water tanks on site.</p>
        </div>
        <div className="p-6 rounded-3xl border border-border/70 bg-card space-y-2">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          <h3 className="font-bold text-sm text-foreground">Secure Compound Living</h3>
          <p className="text-xs text-muted-foreground">Gated compound security with verified host hospitality.</p>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="p-8 sm:p-10 rounded-3xl border border-border/80 bg-card space-y-6">
        <h2 className="text-xl font-bold text-foreground">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-secondary/40 border border-border/40 space-y-2">
              <h4 className="font-bold text-sm text-foreground">{faq.q}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-600/10 via-yellow-500/10 to-amber-600/10 border border-amber-500/30 text-center space-y-4">
        <h3 className="font-bold text-lg text-foreground">Still have questions?</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Our Addis Ababa customer operations team is available 24/7 on phone, telebirr, and live chat.
        </p>
        <Link href="/contact">
          <Button className="font-bold bg-primary text-primary-foreground">
            <PhoneCall className="w-4 h-4 mr-2" /> Contact Customer Support
          </Button>
        </Link>
      </div>
    </div>
  );
}
