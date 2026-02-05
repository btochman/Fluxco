import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { supplierId, notifyNewListings } = await request.json();

    if (!supplierId) {
      return NextResponse.json(
        { error: "Supplier ID required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("suppliers")
      .update({ notify_new_listings: notifyNewListings })
      .eq("id", supplierId);

    if (error) {
      console.error("Error updating notifications:", error);
      return NextResponse.json(
        { error: "Failed to update notification preference" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notify_new_listings: notifyNewListings,
    });
  } catch (error) {
    console.error("Error in update-notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
