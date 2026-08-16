import prisma from "@/lib/db";
import { formatETB, formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Eye, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  let listings: any[] = [];
  try {
    listings = await prisma.property.findMany({
      include: {
        city: true,
        owner: { select: { name: true, email: true } },
        images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // fallback
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Catalog Quality
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">
          Listing Moderation
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review verified amenities, generator/water assurances, and host listings.
        </p>
      </div>

      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-4 px-6">Property</th>
                <th className="py-4 px-6">Host / Owner</th>
                <th className="py-4 px-6">City</th>
                <th className="py-4 px-6">Price / Night</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs">
              {listings.length > 0 ? (
                listings.map((prop) => {
                  const cover =
                    prop.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80";

                  return (
                    <tr key={prop.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-10 rounded-xl overflow-hidden shrink-0 bg-muted">
                            <Image src={cover} alt={prop.title} fill className="object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-foreground line-clamp-1">{prop.title}</div>
                            <div className="text-[11px] text-muted-foreground uppercase font-semibold">
                              {prop.propertyType.replace("_", " ")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-foreground">{prop.owner.name}</div>
                        <div className="text-muted-foreground text-[11px]">{prop.owner.email}</div>
                      </td>
                      <td className="py-4 px-6 font-medium text-foreground">{prop.city.name}</td>
                      <td className="py-4 px-6 font-bold text-foreground">{formatETB(prop.pricePerNight)}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {prop.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link href={`/property/${prop.slug}`} target="_blank">
                          <Button variant="ghost" size="sm" className="text-xs">
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No listings found.
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
