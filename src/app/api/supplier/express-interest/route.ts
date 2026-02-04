import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      listingId,
      serialNumber,
      supplierId,
      supplierEmail,
      supplierCompany,
      contactName,
      bidPrice,
      leadTimeWeeks,
      notes,
      type
    } = body;

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

    if (type === "info_request") {
      // Record info request
      const { error: bidError } = await supabase
        .from("supplier_bids")
        .upsert({
          listing_id: listingId,
          supplier_id: supplierId,
          bid_price: 0,
          lead_time_weeks: 0,
          status: "interested",
          notes: "Requested more information",
          interest_expressed_at: new Date().toISOString(),
        }, {
          onConflict: "listing_id,supplier_id",
        });

      if (bidError) {
        console.error("Error storing info request:", bidError);
        return NextResponse.json(
          { error: "Failed to record request" },
          { status: 500 }
        );
      }

      // Log for email notification to brian@fluxco.com
      console.log("=== INFO REQUEST ===");
      console.log(`To: brian@fluxco.com`);
      console.log(`Subject: Info Request for ${serialNumber || listing.serial_number}`);
      console.log(`---`);
      console.log(`Supplier: ${supplierCompany}`);
      console.log(`Contact: ${contactName}`);
      console.log(`Email: ${supplierEmail}`);
      console.log(`---`);
      console.log(`Project: ${serialNumber || listing.serial_number}`);
      console.log(`Specs: ${listing.rated_power_kva} kVA, ${listing.primary_voltage}V / ${listing.secondary_voltage}V`);
      console.log(`Location: ${listing.zipcode || "Not specified"}`);
      console.log("====================");

      return NextResponse.json({
        success: true,
        message: "Info request sent. FluxCo will contact you soon."
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

      // Log for email notification to brian@fluxco.com
      console.log("=== NEW BID SUBMITTED ===");
      console.log(`To: brian@fluxco.com`);
      console.log(`Subject: New Bid for ${serialNumber || listing.serial_number}`);
      console.log(`---`);
      console.log(`Supplier: ${supplierCompany}`);
      console.log(`Contact: ${contactName}`);
      console.log(`Email: ${supplierEmail}`);
      console.log(`---`);
      console.log(`Project: ${serialNumber || listing.serial_number}`);
      console.log(`Specs: ${listing.rated_power_kva} kVA, ${listing.primary_voltage}V / ${listing.secondary_voltage}V`);
      console.log(`---`);
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
