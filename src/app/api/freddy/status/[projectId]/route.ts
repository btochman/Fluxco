import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  // Auth check
  const authHeader = request.headers.get("authorization");
  const secret = process.env.FREDDY_API_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: outreach, error } = await supabase
    .from("freddy_outreach")
    .select("*")
    .eq("notion_project_id", projectId)
    .order("sent_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get replies for these outreach records
  const outreachIds = (outreach || []).map((o) => o.id);
  let replies: any[] = [];
  if (outreachIds.length > 0) {
    const { data: replyData } = await supabase
      .from("freddy_replies")
      .select("*")
      .in("outreach_id", outreachIds)
      .order("received_at", { ascending: false });
    replies = replyData || [];
  }

  const sent = outreach?.filter((o) => o.status === "sent").length || 0;
  const replied = outreach?.filter((o) => o.status === "replied").length || 0;
  const failed = outreach?.filter((o) => o.status === "failed").length || 0;
  const bounced = outreach?.filter((o) => o.status === "bounced").length || 0;

  return NextResponse.json({
    projectId,
    summary: {
      totalSent: outreach?.length || 0,
      sent,
      replied,
      failed,
      bounced,
    },
    outreach: outreach || [],
    replies,
  });
}
