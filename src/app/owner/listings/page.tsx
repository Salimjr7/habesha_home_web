import prisma from "@/lib/db";
import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OwnerListingsGrid } from "@/components/dashboard/owner-listings-grid";

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

  // Serialize to plain JSON to prevent any hydration mismatch with Date objects
  const serializedListings = JSON.parse(JSON.stringify(listings));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
            Properties
          </span>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">
            My Ethiopian Listings
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your rental spaces, adjust pricing, and toggle listing visibility.
          </p>
        </div>

        <Link href="/owner/listings/new" prefetch={true}>
          <Button className="font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <PlusCircle className="w-4 h-4 mr-2" /> Add New Property
          </Button>
        </Link>
      </div>

      <OwnerListingsGrid initialListings={serializedListings} />
    </div>
  );
}
