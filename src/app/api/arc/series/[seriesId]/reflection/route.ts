import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function resolveSeriesForUser(seriesId: string, userId: string) {
  const series = await prisma.arcSeries.findUnique({
    where: { id: seriesId },
  });
  if (!series || series.userId !== userId) return null;
  return series;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { seriesId } = await params;
  const series = await resolveSeriesForUser(seriesId, session.user.id);
  if (!series) {
    return NextResponse.json({ error: "Series not found" }, { status: 404 });
  }

  const reflection = await prisma.reflection.findUnique({
    where: { seriesId },
  });

  const now = new Date();
  const daysSincePrev = Math.floor(
    (now.getTime() - series.lastEpisodeAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  const answers = reflection?.answers as { q1?: string; q2?: string } | null;

  return NextResponse.json({
    reflection: reflection
      ? {
          q1: answers?.q1 ?? "",
          q2: answers?.q2 ?? null,
          updatedAt: reflection.updatedAt.toISOString(),
        }
      : null,
    daysSincePrev,
    canGenerate: daysSincePrev >= 7,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { seriesId } = await params;
  const series = await resolveSeriesForUser(seriesId, session.user.id);
  if (!series) {
    return NextResponse.json({ error: "Series not found" }, { status: 404 });
  }

  const body = await req.json();
  const q1 = String(body.q1 ?? "").trim();
  const q2 = String(body.q2 ?? "").trim();

  if (!q1) {
    return NextResponse.json(
      { error: "Q1 answer is required." },
      { status: 400 },
    );
  }

  const reflection = await prisma.reflection.upsert({
    where: { seriesId },
    update: { answers: { q1, q2: q2 || null } },
    create: { seriesId, answers: { q1, q2: q2 || null } },
  });

  return NextResponse.json({
    success: true,
    updatedAt: reflection.updatedAt.toISOString(),
  });
}
