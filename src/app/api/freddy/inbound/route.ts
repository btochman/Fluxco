import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await request.json();

    // Resend inbound webhook payload
    const fromEmail = body.from?.toLowerCase().trim() || "";
    const fromName = body.fromName || "";
    const subject = body.subject || "";
    const textBody = body.text || "";
    const htmlBody = body.html || "";

    if (!fromEmail) {
      return NextResponse.json(
        { error: "No from email" },
        { status: 400 }
      );
    }

    // Find matching outreach record
    const { data: outreach } = await supabase
      .from("freddy_outreach")
      .select("id, notion_project_id, oem_name, project_summary")
      .eq("email_to", fromEmail)
      .order("sent_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Store the reply
    await supabase.from("freddy_replies").insert({
      outreach_id: outreach?.id || null,
      from_email: fromEmail,
      from_name: fromName,
      subject,
      body_text: textBody,
      body_html: htmlBody,
      needs_review: true,
    });

    // Update outreach status to replied
    if (outreach) {
      await supabase
        .from("freddy_outreach")
        .update({ status: "replied" })
        .eq("id", outreach.id);
    }

    // Notify Brian
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const oemName = outreach?.oem_name || fromEmail;
      const projectSummary = outreach?.project_summary as any;
      const mva = projectSummary?.mvaSize
        ? `${projectSummary.mvaSize} MVA`
        : "Unknown";

      try {
        await resend.emails.send({
          from: "Freddy Wilson <freddy@fluxco.com>",
          to: "brian@fluxco.com",
          subject: `OEM Reply: ${oemName} - ${mva} project`,
          html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; color: #333;">
  <h3 style="color: #2d8cff;">New OEM Reply Received</h3>
  <p><strong>From:</strong> ${oemName} (${fromEmail})</p>
  <p><strong>Project:</strong> ${mva} - ${projectSummary?.location || "N/A"}</p>
  <p><strong>Subject:</strong> ${subject}</p>
  <hr style="border: none; border-top: 1px solid #eee;" />
  <div style="background: #f8f9fa; padding: 16px; border-radius: 4px; white-space: pre-wrap;">
${textBody || "(HTML only — check Supabase for full content)"}
  </div>
  <p style="color: #999; font-size: 12px; margin-top: 24px;">
    Reply directly to the OEM at: ${fromEmail}
  </p>
</div>
          `,
        });
      } catch (notifyErr) {
        console.error("Failed to notify Brian of reply:", notifyErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Freddy inbound error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
