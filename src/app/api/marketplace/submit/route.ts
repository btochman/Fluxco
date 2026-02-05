import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const listing = await request.json();

    // Helper to safely round and cap numeric values
    const safeDecimal = (val: any, maxDigits: number, decimalPlaces: number) => {
      if (val == null) return null;
      const num = Number(val);
      if (isNaN(num)) return null;
      const maxVal = Math.pow(10, maxDigits - decimalPlaces) - Math.pow(10, -decimalPlaces);
      const capped = Math.min(num, maxVal);
      return Math.round(capped * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
    };

    // Sanitize numeric fields to fit database constraints
    const sanitizedListing = {
      ...listing,
      impedance_percent: safeDecimal(listing.impedance_percent, 5, 2),      // DECIMAL(5,2) max 999.99
      efficiency_percent: safeDecimal(listing.efficiency_percent, 5, 2),    // DECIMAL(5,2) max 999.99
      no_load_loss_w: safeDecimal(listing.no_load_loss_w, 10, 2),           // DECIMAL(10,2)
      load_loss_w: safeDecimal(listing.load_loss_w, 10, 2),                 // DECIMAL(10,2)
      total_weight_kg: safeDecimal(listing.total_weight_kg, 10, 2),         // DECIMAL(10,2)
      estimated_cost: safeDecimal(listing.estimated_cost, 12, 2),           // DECIMAL(12,2)
    };

    console.log("Sanitized listing values:", {
      impedance_percent: sanitizedListing.impedance_percent,
      efficiency_percent: sanitizedListing.efficiency_percent,
      no_load_loss_w: sanitizedListing.no_load_loss_w,
      load_loss_w: sanitizedListing.load_loss_w,
      total_weight_kg: sanitizedListing.total_weight_kg,
      estimated_cost: sanitizedListing.estimated_cost,
    });

    // Insert the listing
    const { data, error } = await supabase
      .from("marketplace_listings")
      .insert(sanitizedListing)
      .select()
      .single();

    if (error) {
      console.error("Error inserting listing:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Notify suppliers (fire and forget)
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://fluxco.com'}/api/supplier/notify-new-listing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing: sanitizedListing }),
    }).catch(console.error);

    return NextResponse.json({ success: true, listing: data });
  } catch (error) {
    console.error("Error in marketplace submit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
