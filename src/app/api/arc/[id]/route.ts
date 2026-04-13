// This route serves as a data endpoint for the OG image generator.
// It fetches a single arc by its NanoID and returns the arc data
// as JSON. The OG route at /api/og/[id] calls this internally
// to get the data it needs to render the Arc Card image.

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const arc = await prisma.arc.findUnique({
      where: { id },
    });

    // If no arc exists with this ID, return 404.
    // The OG route handles this gracefully and returns
    // a plain text "Arc not found" response to the crawler.
    if (!arc) {
      return NextResponse.json(
        {
          error: "Arc not found",
        },
        { status: 404 },
      );
    }

    // We return only arc_data — the generated arc content.
    // We deliberately exclude ip_address, fingerprint, and
    // other internal fields because this endpoint is
    // publicly accessible by design (social crawlers need
    // it), and there's no reason to expose internal metadata.
    return NextResponse.json(arc.arcData, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[api/arc/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch arc" },
      { status: 500 },
    );
  }
}
