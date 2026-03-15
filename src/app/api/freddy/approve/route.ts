import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { batchId, action, password } = await request.json();

    // Simple password check (reuse admin password, trim \n from Vercel env)
    if (password !== (process.env.ADMIN_PASSWORD || "").replace(/\\n$/, "").trim()) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }

    if (!batchId) {
      return NextResponse.json({ error: "batchId is required" }, { status: 400 });
    }

    if (action === "reject") {
      // Delete all pending rows for this batch
      const { error } = await supabase
        .from("freddy_outreach")
        .delete()
        .eq("batch_id", batchId)
        .eq("status", "pending");

      if (error) throw error;
      return NextResponse.json({ success: true, action: "rejected" });
    }

    // action === "approve" (default)
    // Fetch all pending emails in this batch
    const { data: pendingEmails, error: fetchError } = await supabase
      .from("freddy_outreach")
      .select("*")
      .eq("batch_id", batchId)
      .eq("status", "pending");

    if (fetchError) throw fetchError;
    if (!pendingEmails || pendingEmails.length === 0) {
      return NextResponse.json({ message: "No pending emails in this batch" });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    let sent = 0;
    let failed = 0;

    for (const row of pendingEmails) {
      try {
        const sendResult = await resend.emails.send({
          from: "Freddy Wilson <freddy@fluxco.com>",
          to: row.email_to,
          subject: row.email_subject,
          html: row.email_html,
          replyTo: "freddy@fluxco.com",
        });

        const messageId = sendResult.data?.id || null;

        await supabase
          .from("freddy_outreach")
          .update({
            status: "sent",
            resend_message_id: messageId,
            sent_at: new Date().toISOString(),
          })
          .eq("id", row.id);

        sent++;
      } catch (err: any) {
        await supabase
          .from("freddy_outreach")
          .update({ status: "failed" })
          .eq("id", row.id);
        failed++;
        console.error(`Failed to send to ${row.email_to}:`, err.message);
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 500));
    }

    return NextResponse.json({
      success: true,
      action: "approved",
      summary: { sent, failed, total: pendingEmails.length },
    });
  } catch (error: any) {
    console.error("Freddy approve error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: fetch pending batch details (for the approval UI)
export async function GET(request: NextRequest) {
  const batchId = request.nextUrl.searchParams.get("batchId");
  if (!batchId) {
    return NextResponse.json({ error: "batchId required" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("freddy_outreach")
    .select("id, oem_name, contact_name, email_to, project_summary, email_subject, status, created_at")
    .eq("batch_id", batchId)
    .order("oem_name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const pending = (data || []).filter((r) => r.status === "pending");
  const sent = (data || []).filter((r) => r.status === "sent");

  return NextResponse.json({
    batchId,
    total: data?.length || 0,
    pending: pending.length,
    alreadySent: sent.length,
    emails: data || [],
    projectSummary: data?.[0]?.project_summary || null,
  });
}
