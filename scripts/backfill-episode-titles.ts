import { config as loadDotenv } from "dotenv";

if (!process.env.DATABASE_URL) {
  loadDotenv({ path: ".env.local" });
  loadDotenv({ path: ".env" });
}

async function main() {
  const { default: prisma } = await import("@/lib/prisma");

  const result = await prisma.arc.updateMany({
    where: {
      episodeNumber: 1,
      episodeTitle: null,
    },
    data: {
      episodeTitle: "The Awakening",
    },
  });

  console.log(
    `Updated ${result.count} Episode 1 arc(s) — episodeTitle set to "The Awakening".`,
  );

  await prisma.$disconnect();
}

main().catch(console.error);
