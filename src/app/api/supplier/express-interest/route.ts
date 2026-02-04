import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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

    const projectId = serialNumber || listing.serial_number;

    // Only try to store in database if we have a valid supplier ID (UUID format)
    const isValidSupplierId = supplierId && supplierId !== "unknown" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(supplierId);

    // Set up Resend for email
    const apiKey = process.env.RESEND_API_KEY;
    const resend = apiKey ? new Resend(apiKey) : null;

    if (type === "info_request") {
      // Try to store if we have valid supplier ID
      if (isValidSupplierId) {
        await supabase
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
      }

      // Send email notification
      if (resend) {
        try {
          await resend.emails.send({
            from: "FluxCo <noreply@fluxco.com>",
            to: "brian@fluxco.com",
            replyTo: supplierEmail,
            subject: `Info Request: ${projectId} - ${listing.rated_power_kva} kVA`,
            html: `
              <h2>New Information Request</h2>
              <p>A supplier has requested more information about a transformer listing.</p>

              <h3>Supplier Details</h3>
              <ul>
                <li><strong>Company:</strong> ${supplierCompany}</li>
                <li><strong>Contact:</strong> ${contactName}</li>
                <li><strong>Email:</strong> ${supplierEmail}</li>
              </ul>

              <h3>Project Details</h3>
              <ul>
                <li><strong>Project ID:</strong> ${projectId}</li>
                <li><strong>Rating:</strong> ${listing.rated_power_kva} kVA</li>
                <li><strong>Voltage:</strong> ${listing.primary_voltage}V / ${listing.secondary_voltage}V</li>
                <li><strong>Phase:</strong> ${listing.phases}-Phase</li>
                <li><strong>Location:</strong> ${listing.zipcode || "Not specified"}</li>
              </ul>
            `,
          });
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Info request sent. FluxCo will contact you soon."
      });

    } else if (type === "bid") {
      // Try to store if we have valid supplier ID
      if (isValidSupplierId) {
        await supabase
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
      }

      // Send email notification
      if (resend) {
        try {
          await resend.emails.send({
            from: "FluxCo <noreply@fluxco.com>",
            to: "brian@fluxco.com",
            replyTo: supplierEmail,
            subject: `New Bid: ${projectId} - $${bidPrice?.toLocaleString()} / ${leadTimeWeeks} weeks`,
            html: `
              <h2>New Bid Received</h2>
              <p>A supplier has submitted a bid for a transformer listing.</p>

              <h3>Bid Details</h3>
              <ul>
                <li><strong>Bid Price:</strong> $${bidPrice?.toLocaleString()}</li>
                <li><strong>Lead Time:</strong> ${leadTimeWeeks} weeks</li>
                ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
              </ul>

              <h3>Supplier Details</h3>
              <ul>
                <li><strong>Company:</strong> ${supplierCompany}</li>
                <li><strong>Contact:</strong> ${contactName}</li>
                <li><strong>Email:</strong> ${supplierEmail}</li>
              </ul>

              <h3>Project Details</h3>
              <ul>
                <li><strong>Project ID:</strong> ${projectId}</li>
                <li><strong>Rating:</strong> ${listing.rated_power_kva} kVA</li>
                <li><strong>Voltage:</strong> ${listing.primary_voltage}V / ${listing.secondary_voltage}V</li>
                <li><strong>Phase:</strong> ${listing.phases}-Phase</li>
                <li><strong>Location:</strong> ${listing.zipcode || "Not specified"}</li>
              </ul>
            `,
          });
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }
      }

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
