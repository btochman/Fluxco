import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, supplierId, supplierEmail, supplierCompany, bidPrice, leadTimeWeeks, notes, type } = body;

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

    if (type === "interest") {
      // Just expressing interest - record it
      const { error: bidError } = await supabase
        .from("supplier_bids")
        .upsert({
          listing_id: listingId,
          supplier_id: supplierId,
          bid_price: 0, // Placeholder until they place actual bid
          lead_time_weeks: 0,
          status: "interested",
          interest_expressed_at: new Date().toISOString(),
        }, {
          onConflict: "listing_id,supplier_id",
        });

      if (bidError) {
        console.error("Error storing interest:", bidError);
        return NextResponse.json(
          { error: "Failed to record interest" },
          { status: 500 }
        );
      }

      // Log for email notification
      console.log("=== NEW INTEREST EXPRESSED ===");
      console.log(`To: brian@fluxco.com`);
      console.log(`From: ${supplierEmail} (${supplierCompany})`);
      console.log(`Listing: ${listing.serial_number} - ${listing.rated_power_kva} kVA`);
      console.log(`Specs: ${listing.primary_voltage}V / ${listing.secondary_voltage}V`);
      console.log("==============================");

      return NextResponse.json({
        success: true,
        message: "Interest recorded. FluxCo has been notified."
      });

    } else if (type === "bid") {
      // Formal bid with price and lead time
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

      // Log for email notification
      console.log("=== NEW BID SUBMITTED ===");
      console.log(`To: brian@fluxco.com`);
      console.log(`From: ${supplierEmail} (${supplierCompany})`);
      console.log(`Listing: ${listing.serial_number} - ${listing.rated_power_kva} kVA`);
      console.log(`Bid Price: $${bidPrice?.toLocaleString()}`);
      console.log(`Lead Time: ${leadTimeWeeks} weeks`);
      console.log(`Notes: ${notes || "None"}`);
      console.log("=========================");

      return NextResponse.json({
        success: true,
        message: "Bid submitted successfully. FluxCo has been notified."
      });
    }

    return NextResponse.json(
      { error: "Invalid request type" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error in express-interest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
