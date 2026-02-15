import { Resend } from "resend";
import { NextResponse } from "next/server";
import { supabase } from "@/integrations/supabase/client";

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not configured");
    return NextResponse.json(
      { error: "Email service not configured" },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);
  try {
    const body = await request.json();
    const { name, company, email, phone, productInterest, projectDetails, interestedInLeasing } = body;

    if (!name || !company || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const leasingLine = interestedInLeasing
      ? `<p><strong>🔔 Interested in Leasing:</strong> Yes</p>`
      : "";

    const { data, error } = await resend.emails.send({
      from: "FluxCo <noreply@fluxco.com>",
      to: "brian@fluxco.com",
      replyTo: email,
      subject: `New Contact: ${name} from ${company}${interestedInLeasing ? " [LEASING]" : ""}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Product Interest:</strong> ${productInterest || "Not specified"}</p>
        ${leasingLine}
        <h3>Message:</h3>
        <p>${projectDetails || "No message provided"}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Save lead to Supabase
    const notes = [
      productInterest ? `Product: ${productInterest}` : "",
      interestedInLeasing ? "INTERESTED IN LEASING" : "",
      projectDetails || "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await supabase.from("leads").insert({
        name,
        company,
        email,
        phone: phone || null,
        source: "website",
        notes: notes || null,
        status: "new",
      });
    } catch (dbError) {
      // Don't fail the request if DB insert fails — email was already sent
      console.error("Failed to save lead to DB:", dbError);
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
