import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  getFreddyProjectSpec,
  findMatchingOEMs,
  buildOutreachEmail,
} from "@/lib/freddy";

export async function POST(request: NextRequest) {
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

  try {
    const { projectId, dryRun, countryFilter, testEmail, testLimit } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    // 1. Fetch project spec from Notion
    const spec = await getFreddyProjectSpec(projectId);

    // 2. Find matching OEMs
    const oems = await findMatchingOEMs(spec, countryFilter);

    if (oems.length === 0) {
      return NextResponse.json({
        message: "No matching OEMs found",
        spec: {
          mvaSize: spec.mvaSize,
          location: spec.location,
          productDescription: spec.productDescription,
        },
      });
    }

    // 3. Dry run — return what would be sent
    if (dryRun) {
      const preview = oems.map((oem) => {
        const email = buildOutreachEmail(spec, oem);
        return {
          oem: oem.companyName,
          contactName: oem.contactName,
          emails: oem.emails,
          country: oem.country,
          subject: email.subject,
        };
      });

      // Also include a sample email body from the first OEM
      const sampleEmail = buildOutreachEmail(spec, oems[0]);

      return NextResponse.json({
        dryRun: true,
        projectId,
        spec: {
          mvaSize: spec.mvaSize,
          productDescription: spec.productDescription,
          location: spec.location,
          deliveryDate: spec.deliveryDate,
          customerName: spec.customerName,
        },
        matchingOEMs: preview.length,
        oems: preview,
        sampleEmailHtml: sampleEmail.html,
      });
    }

    // 4. Send emails
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const results: {
      oem: string;
      email: string;
      status: string;
      messageId?: string;
      error?: string;
    }[] = [];

    // In test mode, limit how many OEMs we send to
    const oemsToSend = testLimit ? oems.slice(0, testLimit) : oems;

    for (const oem of oemsToSend) {
      // In test mode, send to testEmail instead of real OEM emails
      const emailsToSend = testEmail ? [testEmail] : oem.emails;

      for (const emailAddr of emailsToSend) {
        // Check for existing outreach (prevent duplicates)
        const { data: existing } = await supabase
          .from("freddy_outreach")
          .select("id")
          .eq("notion_project_id", projectId)
          .eq("notion_oem_id", oem.id)
          .eq("email_to", emailAddr)
          .maybeSingle();

        if (existing) {
          results.push({
            oem: oem.companyName,
            email: emailAddr,
            status: "skipped_duplicate",
          });
          continue;
        }

        // Build and send email
        const { subject, html } = buildOutreachEmail(spec, oem);

        try {
          const sendResult = await resend.emails.send({
            from: "Freddy Wilson <freddy@fluxco.com>",
            to: emailAddr,
            subject,
            html,
            replyTo: "freddy@fluxco.com",
          });

          const messageId =
            sendResult.data?.id || null;

          // Record in database
          await supabase.from("freddy_outreach").insert({
            notion_project_id: projectId,
            notion_oem_id: oem.id,
            oem_name: oem.companyName,
            contact_name: oem.contactName || null,
            email_to: emailAddr,
            project_summary: {
              mvaSize: spec.mvaSize,
              productDescription: spec.productDescription,
              location: spec.location,
              zipCode: spec.zipCode,
              deliveryDate: spec.deliveryDate,
              customerName: spec.customerName,
            },
            resend_message_id: messageId,
            status: "sent",
          });

          results.push({
            oem: oem.companyName,
            email: emailAddr,
            status: "sent",
            messageId: messageId || undefined,
          });
        } catch (err: any) {
          // Record failed attempt
          await supabase.from("freddy_outreach").insert({
            notion_project_id: projectId,
            notion_oem_id: oem.id,
            oem_name: oem.companyName,
            contact_name: oem.contactName || null,
            email_to: emailAddr,
            project_summary: {
              mvaSize: spec.mvaSize,
              productDescription: spec.productDescription,
              location: spec.location,
              zipCode: spec.zipCode,
              deliveryDate: spec.deliveryDate,
              customerName: spec.customerName,
            },
            status: "failed",
          });

          results.push({
            oem: oem.companyName,
            email: emailAddr,
            status: "failed",
            error: err.message || "Unknown error",
          });
        }

        // Rate limit: 500ms between sends
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    const sent = results.filter((r) => r.status === "sent").length;
    const skipped = results.filter((r) => r.status === "skipped_duplicate").length;
    const failed = results.filter((r) => r.status === "failed").length;

    return NextResponse.json({
      success: true,
      summary: { sent, skipped, failed, total: results.length },
      results,
    });
  } catch (error: any) {
    console.error("Freddy outreach error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
