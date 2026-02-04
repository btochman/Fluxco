"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, MarketplaceListing, SupplierBid } from "@/lib/supabase";

export function useMarketplace() {
  return useQuery<{ active: MarketplaceListing[]; completed: MarketplaceListing[] }, Error>({
    queryKey: ["marketplace-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .select("*")
        .in("status", ["listed", "completed"])
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const listings = data as MarketplaceListing[];
      return {
        active: listings.filter(l => l.status === "listed"),
        completed: listings.filter(l => l.status === "completed"),
      };
    },
  });
}

export function useSupplierBids(supplierId: string | undefined) {
  return useQuery<SupplierBid[], Error>({
    queryKey: ["supplier-bids", supplierId],
    queryFn: async () => {
      if (!supplierId) return [];

      const { data, error } = await supabase
        .from("supplier_bids")
        .select("*")
        .eq("supplier_id", supplierId);

      if (error) {
        throw error;
      }

      return data as SupplierBid[];
    },
    enabled: !!supplierId,
  });
}

export function useSubmitBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bid: {
      listing_id: string;
      supplier_id: string;
      bid_price: number;
      lead_time_weeks: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("supplier_bids")
        .upsert({
          ...bid,
          status: "submitted",
          interest_expressed_at: new Date().toISOString(),
        }, {
          onConflict: "listing_id,supplier_id",
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-bids"] });
    },
  });
}
