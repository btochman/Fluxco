import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Client } from "@notionhq/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, customerId, notionCustomerId } = body;

    // Validate admin password
    if (password !== "fluxco2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "Missing customer ID" },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Build the update payload
    const updateData: Record<string, string | null> = {
      notion_customer_id: notionCustomerId || null,
    };

    // If linking to a Notion customer, fetch their name and sync company_name
    if (notionCustomerId && process.env.NOTION_API_KEY) {
      try {
        const notion = new Client({ auth: process.env.NOTION_API_KEY });
        const page = await notion.pages.retrieve({ page_id: notionCustomerId });
        const titleProp = (page as any).properties?.Customer?.title;
        const notionName = titleProp?.map((t: any) => t.plain_text).join("") || "";
        if (notionName) {
          updateData.company_name = notionName;
        }
      } catch (err) {
        console.error("Failed to fetch Notion customer name:", err);
        // Continue without updating company_name — linking still works
      }
    }

    const { error } = await supabase
      .from("customers")
      .update(updateData)
      .eq("id", customerId);

    if (error) {
      console.error("Link customer error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      companyName: updateData.company_name || null,
      message: notionCustomerId
        ? `Customer linked to Notion ID: ${notionCustomerId}`
        : "Customer unlinked from Notion",
    });
  } catch (error: any) {
    console.error("Link customer error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
