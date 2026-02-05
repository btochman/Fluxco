import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  // Create client inside function to avoid build-time env var issues
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {

    const [suppliers, bids, authUsers] = await Promise.all([
      supabase.from("suppliers").select("*"),
      supabase.from("supplier_bids").select("*"),
      supabase.auth.admin.listUsers(),
    ]);

    return NextResponse.json({
      suppliers: suppliers.data,
      suppliersError: suppliers.error?.message,
      bids: bids.data,
      bidsError: bids.error?.message,
      authUsers: authUsers.data?.users?.map(u => ({ id: u.id, email: u.email })),
      authError: authUsers.error?.message,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
