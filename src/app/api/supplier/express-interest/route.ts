import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// This would integrate with your email service
// For now, we'll log and store the interest
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, supplierId, supplierEmail, supplierCompany, bidPrice, leadTimeWeeks, notes } = body;

    // Get listing details
    const { data: listing, error: listingError } = await supabase
      .from("marketplace_listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Store the bid
    const { error: bidError } = await supabase
      .from("supplier_bids")
      .upsert({
        listing_id: listingId,
        supplier_id: supplierId,
        bid_price: bidPrice,
        lead_time_weeks: leadTimeWeeks,
        notes: notes || null,
        status: "submitted",
        interest_expressed_at: new Date().toISOString(),
      }, {
        onConflict: "listing_id,supplier_id",
      });

    if (bidError) {
      console.error("Error storing bid:", bidError);
      return NextResponse.json(
        { error: "Failed to store bid" },
        { status: 500 }
      );
    }

    // Log the interest for email notification
    // In production, this would send via your email service
    console.log("=== NEW BID INTEREST ===");
    console.log(`To: brian@fluxco.com`);
    console.log(`From: ${supplierEmail} (${supplierCompany})`);
    console.log(`Listing: ${listing.rated_power_kva} kVA - ${listing.primary_voltage}V/${listing.secondary_voltage}V`);
    console.log(`Bid Price: $${bidPrice.toLocaleString()}`);
    console.log(`Lead Time: ${leadTimeWeeks} weeks`);
    console.log(`Notes: ${notes || "None"}`);
    console.log("========================");

    return NextResponse.json({
      success: true,
      message: "Bid submitted successfully. FluxCo has been notified."
    });
  } catch (error) {
    console.error("Error in express-interest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
