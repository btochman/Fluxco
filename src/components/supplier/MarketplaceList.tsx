"use client";

import { useMarketplace } from "@/hooks/useMarketplace";
import { TransformerCard } from "./TransformerCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, PackageSearch } from "lucide-react";

export function MarketplaceList() {
  const { data: listings, isLoading, error } = useMarketplace();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load marketplace listings. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <PackageSearch className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No listings available</h3>
        <p className="text-muted-foreground max-w-md">
          There are currently no transformers listed in the marketplace. Check
          back soon for new listings.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <TransformerCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
