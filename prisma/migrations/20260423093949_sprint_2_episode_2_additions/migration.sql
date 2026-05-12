-- AlterTable
ALTER TABLE "arc_series" ADD COLUMN     "critic_notes" JSONB;

-- AlterTable
ALTER TABLE "arcs" ADD COLUMN     "episode_title" TEXT;
