import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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

    // Format voltage for display
    const formatVoltage = (v: number) => (v >= 1000 ? `${(v / 1000).toLocaleString()} kV` : `${v} V`);

    // Sanitize numeric fields to fit database constraints
    const sanitizedListing = {
      ...listing,
      spec_mode: listing.spec_mode || 'lite',
      impedance_percent: safeDecimal(listing.impedance_percent, 5, 2),
      efficiency_percent: safeDecimal(listing.efficiency_percent, 5, 2),
      no_load_loss_w: safeDecimal(listing.no_load_loss_w, 10, 2),
      load_loss_w: safeDecimal(listing.load_loss_w, 10, 2),
      total_weight_kg: safeDecimal(listing.total_weight_kg, 10, 2),
      estimated_cost: safeDecimal(listing.estimated_cost, 12, 2),
    };

    // Insert the listing
    const { data, error } = await supabase
      .from("marketplace_listings")
      .insert(sanitizedListing)
      .select()
      .single();

    if (error) {
      console.error("Error inserting listing:", error);
      return NextResponse.json(
        { error: `${error.message} - Values: ${JSON.stringify({
          rated_power_kva: sanitizedListing.rated_power_kva,
          primary_voltage: sanitizedListing.primary_voltage,
          secondary_voltage: sanitizedListing.secondary_voltage,
          impedance_percent: sanitizedListing.impedance_percent,
          efficiency_percent: sanitizedListing.efficiency_percent,
          no_load_loss_w: sanitizedListing.no_load_loss_w,
          load_loss_w: sanitizedListing.load_loss_w,
          total_weight_kg: sanitizedListing.total_weight_kg,
          estimated_cost: sanitizedListing.estimated_cost,
        })}` },
        { status: 500 }
      );
    }

    // Send confirmation email to submitter + notify suppliers
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && sanitizedListing.contact_email) {
      const resend = new Resend(apiKey);

      // Confirmation email to the person who submitted
      try {
        await resend.emails.send({
          from: "FluxCo <noreply@fluxco.com>",
          to: sanitizedListing.contact_email,
          subject: `Your ${sanitizedListing.rated_power_kva.toLocaleString()} kVA Transformer is Listed`,
          html: `
            <h2>Your Spec Has Been Listed</h2>
            <p>Hi ${sanitizedListing.contact_name},</p>
            <p>Your transformer specification has been successfully posted to the FluxCo marketplace. Suppliers will be notified and can submit bids.</p>

            <h3>Listing Summary</h3>
            <ul>
              <li><strong>Power Rating:</strong> ${sanitizedListing.rated_power_kva.toLocaleString()} kVA</li>
              <li><strong>Primary Voltage:</strong> ${formatVoltage(sanitizedListing.primary_voltage)}</li>
              <li><strong>Secondary Voltage:</strong> ${formatVoltage(sanitizedListing.secondary_voltage)}</li>
              <li><strong>Phase:</strong> ${sanitizedListing.phases}-Phase</li>
              ${sanitizedListing.vector_group ? `<li><strong>Vector Group:</strong> ${sanitizedListing.vector_group}</li>` : ""}
              ${sanitizedListing.cooling_class ? `<li><strong>Cooling:</strong> ${sanitizedListing.cooling_class}</li>` : ""}
              ${sanitizedListing.estimated_cost ? `<li><strong>Estimated Cost:</strong> $${sanitizedListing.estimated_cost.toLocaleString()}</li>` : ""}
              ${sanitizedListing.efficiency_percent ? `<li><strong>Efficiency:</strong> ${sanitizedListing.efficiency_percent}%</li>` : ""}
            </ul>

            <p>We'll notify you when suppliers express interest or submit bids.</p>

            <p style="color: #666; font-size: 12px; margin-top: 24px;">
              Listing ID: ${data.serial_number || data.id}
            </p>
          `,
        });
        console.log(`Confirmation email sent to ${sanitizedListing.contact_email}`);
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
      }
    }

    // Notify suppliers (awaited so it doesn't get killed on serverless)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://fluxco.com'}/api/supplier/notify-new-listing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing: sanitizedListing }),
      });
    } catch (notifyErr) {
      console.error("Failed to notify suppliers:", notifyErr);
    }

    return NextResponse.json({ success: true, listing: data });
  } catch (error) {
    console.error("Error in marketplace submit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
