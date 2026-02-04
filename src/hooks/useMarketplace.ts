"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase, MarketplaceListing } from "@/lib/supabase";

export function useMarketplace() {
  return useQuery<MarketplaceListing[], Error>({
    queryKey: ["marketplace-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .select("*")
        .eq("status", "listed")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data as MarketplaceListing[];
    },
  });
}
