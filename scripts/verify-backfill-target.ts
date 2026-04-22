// scripts/verify-backfill-target.ts
// READ ONLY — verifies what the backfill will process against
// the current database. Does not modify anything.
// Safe to run against production.

import prisma from "@/lib/prisma";

async function main() {
  const totalArcs = await prisma.arc.count();
  const arcsWithUser = await prisma.arc.count({
    where: { userId: { not: null } },
  });
  const arcsWithSeries = await prisma.arc.count({
    where: { seriesId: { not: null } },
  });
  const backfillCandidates = await prisma.arc.count({
    where: {
      seriesId: null,
      userId: { not: null },
    },
  });
  const anonymousArcs = await prisma.arc.count({
    where: {
      seriesId: null,
      userId: null,
    },
  });
  const existingSeries = await prisma.arcSeries.count();

  console.log("=== Database State ===\n");
  console.log(`Total arcs: ${totalArcs}`);
  console.log(`Arcs with userId: ${arcsWithUser}`);
  console.log(`Arcs already in a series: ${arcsWithSeries}`);
  console.log(`Existing ArcSeries records: ${existingSeries}`);
  console.log(`\n=== Backfill Plan ===\n`);
  console.log(`Will backfill: ${backfillCandidates} arcs`);
  console.log(
    `Will skip (no userId — anonymous): ${anonymousArcs} arcs`,
  );

  if (backfillCandidates > 0) {
    const sampleArcs = await prisma.arc.findMany({
      where: {
        seriesId: null,
        userId: { not: null },
      },
      select: {
        id: true,
        userId: true,
        createdAt: true,
        arcData: true,
      },
      take: 5,
    });

    console.log(`\n=== Sample of arcs to backfill (first 5) ===`);
    for (const arc of sampleArcs) {
      const data = arc.arcData as { character_name?: string };
      console.log(
        `  ${arc.id}  |  ${data.character_name ?? "(no name)"}  |  ${arc.createdAt.toISOString().split("T")[0]}`,
      );
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
