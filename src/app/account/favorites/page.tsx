import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { FavoriteService } from "@/server/services/favorite.service";
import { PropertyCard } from "@/components/property/property-card";
import { Heart, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/login?redirect=/account/favorites");
  }

  let favorites: any[] = [];
  try {
    favorites = await FavoriteService.getUserFavorites(session.user.id);
  } catch {
    // fallback
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          Saved Properties
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">
          My Favorite Ethiopian Homes
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Properties you have saved for upcoming trips across Addis Ababa, Bishoftu, and more.
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((prop) => (
            <PropertyCard key={prop.id} property={prop} initialFavorite={true} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border border-border/80 bg-card space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold">No saved homes yet</h3>
          <p className="text-sm text-muted-foreground">
            As you explore properties, click the heart icon to save your favorites and compare them here.
          </p>
          <Link href="/search">
            <Button className="mt-2 font-bold bg-primary text-primary-foreground">
              <Search className="w-4 h-4 mr-2" /> Start Exploring
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
