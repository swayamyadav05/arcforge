// src/app/api/arc/claim/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { GeneratedArc } from "@/types/arc";

export async function POST(req: NextRequest) {
  // Verify the user is authenticated before allowing any claim
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in to claim an arc." },
      { status: 401 },
    );
  }

  const { arcId } = await req.json();

  if (!arcId) {
    return NextResponse.json(
      { error: "No arc ID provided." },
      { status: 400 },
    );
  }

  // Find the arc in the database
  const arc = await prisma.arc.findUnique({
    where: { id: arcId },
  });

  if (!arc) {
    return NextResponse.json(
      { error: "Arc not found. Check the link and try again." },
      { status: 404 },
    );
  }

  // If the arc already belongs to a different user, reject the claim.
  // An arc can only belong to one account.
  if (arc.userId && arc.userId !== session.user.id) {
    return NextResponse.json(
      { error: "This arc is already connected to another account." },
      { status: 409 },
    );
  }

  // If it already belongs to this user, no work needed
  if (arc.userId === session.user.id) {
    const arcData = arc.arcData as unknown as GeneratedArc;
    return NextResponse.json({
      message: "Already claimed.",
      characterName: arcData.character_name,
    });
  }

  // Link the arc to the authenticated user
  const updated = await prisma.arc.update({
    where: { id: arcId },
    data: { userId: session.user.id },
  });

  const arcData = updated.arcData as unknown as GeneratedArc;

  return NextResponse.json({
    message: "Arc claimed successfully.",
    characterName: arcData.character_name,
  });
}
