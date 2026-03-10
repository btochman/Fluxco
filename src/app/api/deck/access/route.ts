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
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Send notification to Brian
    const { error: emailError } = await resend.emails.send({
      from: "FluxCo <noreply@fluxco.com>",
      to: "brian@fluxco.com",
      subject: `Deck Viewer: ${email}`,
      html: `
        <h2>Someone is viewing the investor deck</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })}</p>
      `,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      // Don't block access if email fails — still set the cookie
    }

    // Save to leads table
    try {
      await supabase.from("leads").insert({
        email,
        source: "deck",
        status: "new",
        notes: "Accessed investor deck",
      });
    } catch (dbError) {
      console.error("Failed to save deck viewer to DB:", dbError);
    }

    // Set access cookie (30 days)
    const response = NextResponse.json({ success: true });
    response.cookies.set("deck_access", "granted", {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/deck",
    });

    return response;
  } catch (error: any) {
    console.error("Deck access error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
