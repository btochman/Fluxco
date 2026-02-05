import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { listing } = await request.json();

    if (!listing) {
      return NextResponse.json(
        { error: "Listing data required" },
        { status: 400 }
      );
    }

    // Get all suppliers who want notifications
    const { data: suppliers, error: suppliersError } = await supabase
      .from("suppliers")
      .select("email, company_name, contact_name")
      .eq("notify_new_listings", true);

    if (suppliersError) {
      console.error("Error fetching suppliers:", suppliersError);
      return NextResponse.json(
        { error: "Failed to fetch suppliers" },
        { status: 500 }
      );
    }

    if (!suppliers || suppliers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No suppliers to notify",
        notified: 0,
      });
    }

    // Set up Resend
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    // Format voltage for display
    const formatVoltage = (v: number) => (v >= 1000 ? `${v / 1000} kV` : `${v} V`);

    // Send emails to all opted-in suppliers
    const emailPromises = suppliers.map((supplier) =>
      resend.emails.send({
        from: "FluxCo <noreply@fluxco.com>",
        to: supplier.email,
        subject: `New Opportunity: ${listing.rated_power_kva} kVA Transformer`,
        html: `
          <h2>New Transformer Opportunity</h2>
          <p>Hi ${supplier.contact_name || supplier.company_name},</p>
          <p>A new transformer request has been posted to the FluxCo marketplace.</p>

          <h3>Specifications</h3>
          <ul>
            <li><strong>Power Rating:</strong> ${listing.rated_power_kva.toLocaleString()} kVA</li>
            <li><strong>Primary Voltage:</strong> ${formatVoltage(listing.primary_voltage)}</li>
            <li><strong>Secondary Voltage:</strong> ${formatVoltage(listing.secondary_voltage)}</li>
            <li><strong>Phase:</strong> ${listing.phases}-Phase</li>
            ${listing.vector_group ? `<li><strong>Vector Group:</strong> ${listing.vector_group}</li>` : ""}
            ${listing.cooling_class ? `<li><strong>Cooling:</strong> ${listing.cooling_class}</li>` : ""}
            ${listing.zipcode ? `<li><strong>Location:</strong> ${listing.zipcode}</li>` : ""}
          </ul>

          <p><a href="https://fluxco.com/portal" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">View & Submit Bid</a></p>

          <p style="color: #666; font-size: 12px; margin-top: 24px;">
            You're receiving this because you opted in to new listing notifications.
            <a href="https://fluxco.com/portal">Manage your preferences</a> in the supplier portal.
          </p>
        `,
      }).catch((err) => {
        console.error(`Failed to email ${supplier.email}:`, err);
        return null;
      })
    );

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r !== null).length;

    return NextResponse.json({
      success: true,
      message: `Notified ${successCount} supplier(s)`,
      notified: successCount,
    });
  } catch (error) {
    console.error("Error in notify-new-listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
