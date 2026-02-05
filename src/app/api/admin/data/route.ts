import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "fluxco2026";

    if (!password || password !== ADMIN_PASSWORD) {
      console.log("Auth failed. Received:", password, "Expected:", ADMIN_PASSWORD);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all data using service role (bypasses RLS)
    const [bidsResult, listingsResult, suppliersResult] = await Promise.all([
      supabase
        .from("supplier_bids")
        .select(`
          *,
          listing:marketplace_listings(serial_number, rated_power_kva, primary_voltage, secondary_voltage),
          supplier:suppliers(company_name, contact_name, email)
        `)
        .order("created_at", { ascending: false }),

      supabase
        .from("marketplace_listings")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("suppliers")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    return NextResponse.json({
      bids: bidsResult.data || [],
      listings: listingsResult.data || [],
      suppliers: suppliersResult.data || [],
    });
  } catch (error) {
    console.error("Admin API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
