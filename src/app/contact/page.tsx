import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Support
        </span>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Contact Habesha Home</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Our customer support and host advisory team in Addis Ababa is here to assist you 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl border border-border/70 bg-card text-center space-y-2">
          <Phone className="w-6 h-6 text-amber-500 mx-auto" />
          <h3 className="font-bold text-sm text-foreground">Phone &amp; telebirr</h3>
          <p className="text-xs text-muted-foreground">+251 91 122 3344</p>
        </div>

        <div className="p-6 rounded-3xl border border-border/70 bg-card text-center space-y-2">
          <Mail className="w-6 h-6 text-amber-500 mx-auto" />
          <h3 className="font-bold text-sm text-foreground">Email Support</h3>
          <p className="text-xs text-muted-foreground">support@habeshahome.et</p>
        </div>

        <div className="p-6 rounded-3xl border border-border/70 bg-card text-center space-y-2">
          <MapPin className="w-6 h-6 text-amber-500 mx-auto" />
          <h3 className="font-bold text-sm text-foreground">Addis Ababa HQ</h3>
          <p className="text-xs text-muted-foreground">Bole Atlas, Addis Ababa, Ethiopia</p>
        </div>
      </div>
    </div>
  );
}
