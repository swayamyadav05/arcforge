import { config as loadDotenv } from "dotenv";
loadDotenv();

async function main() {
  const { default: prisma } = await import("@/lib/prisma");
  const result = await prisma.rateLimit.deleteMany({});
  console.log(`Deleted ${result.count} rate limit record(s).`);
  await prisma.$disconnect();
}

main().catch(console.error);
