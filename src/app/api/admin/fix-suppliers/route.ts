import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  // Create client inside function to avoid build-time env var issues
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const body = await request.json();
    const { password } = body;

    // Same admin password
    if (password !== "fluxco2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all auth users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Get existing suppliers
    const { data: existingSuppliers } = await supabase
      .from("suppliers")
      .select("user_id");

    const existingUserIds = new Set(existingSuppliers?.map(s => s.user_id) || []);

    // Create supplier profiles for users that don't have one
    const usersWithoutProfile = authData.users.filter(u => !existingUserIds.has(u.id));
    const created = [];
    const errors = [];

    for (const user of usersWithoutProfile) {
      const { error } = await supabase.from("suppliers").insert({
        user_id: user.id,
        email: user.email || "",
        company_name: user.email?.split("@")[0] || "Unknown Company",
        contact_name: user.email?.split("@")[0] || "Unknown",
        phone: null,
        notify_new_listings: true,
        country: "USA",
        certifications: [],
        specialties: [],
        is_verified: false,
      });

      if (error) {
        errors.push({ email: user.email, error: error.message });
      } else {
        created.push(user.email);
      }
    }

    return NextResponse.json({
      message: "Fix complete",
      totalAuthUsers: authData.users.length,
      existingSuppliers: existingSuppliers?.length || 0,
      usersWithoutProfile: usersWithoutProfile.length,
      created,
      errors,
    });
  } catch (error: any) {
    console.error("Fix suppliers error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
