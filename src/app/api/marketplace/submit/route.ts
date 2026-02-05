import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const listing = await request.json();

    // Insert the listing
    const { data, error } = await supabase
      .from("marketplace_listings")
      .insert(listing)
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
      body: JSON.stringify({ listing }),
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
