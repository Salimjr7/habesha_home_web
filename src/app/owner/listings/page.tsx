import prisma from "@/lib/db";
import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { formatETB } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { PlusCircle, Star, MapPin, Eye, Edit, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function OwnerListingsPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/login?redirect=/owner/listings");
  }

  const userId = session.user.id;

  let listings: any[] = [];
  try {
    listings = await prisma.property.findMany({
      where: { ownerId: userId },
      include: {
        city: true,
        images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // fallback
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Properties
          </span>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">
            My Ethiopian Listings
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your rental spaces, adjust pricing, and toggle listing visibility.
          </p>
        </div>

        <Link href="/owner/listings/new">
          <Button className="font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <PlusCircle className="w-4 h-4 mr-2" /> Add New Property
          </Button>
        </Link>
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((prop) => {
            const cover =
              prop.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80";

            return (
              <div
                key={prop.id}
                className="rounded-3xl border border-border/70 bg-card overflow-hidden flex flex-col justify-between shadow-xs transition-all hover:shadow-lg"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full bg-muted">
                    <Image src={cover} alt={prop.title} fill className="object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                        {prop.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold text-amber-600 dark:text-amber-400 uppercase">
                        {prop.propertyType.replace("_", " ")}
                      </span>
                      <div className="flex items-center gap-1 font-semibold text-foreground">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{prop.avgRating > 0 ? prop.avgRating.toFixed(2) : "New"}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-foreground line-clamp-1">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{prop.address}</p>

                    <div className="pt-2 text-sm font-extrabold text-foreground">
                      {formatETB(prop.pricePerNight)}{" "}
                      <span className="text-xs text-muted-foreground font-normal">/ night</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center gap-2 border-t border-border/40">
                  <Link href={`/property/${prop.slug}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <Eye className="w-3.5 h-3.5 mr-1.5" /> View Listing
                    </Button>
                  </Link>
                  <Link href={`/owner/listings/new`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full text-xs font-semibold">
                      <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border border-border/80 bg-card space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <PlusCircle className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold">You haven&apos;t created any listings yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            List your Ethiopian home, villa, or apartment and start earning monthly income with guaranteed Chapa and telebirr payouts.
          </p>
          <Link href="/owner/listings/new">
            <Button className="mt-2 font-bold bg-primary text-primary-foreground">
              Create Your First Listing
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
