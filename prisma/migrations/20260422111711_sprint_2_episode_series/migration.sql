/*
  Warnings:

  - A unique constraint covering the columns `[series_id,episode_number]` on the table `arcs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "arc_series_status" AS ENUM ('active', 'archived');

-- AlterTable
ALTER TABLE "arcs" ADD COLUMN     "days_since_prev" INTEGER,
ADD COLUMN     "episode_number" INTEGER,
ADD COLUMN     "series_id" TEXT;

-- CreateTable
CREATE TABLE "arc_series" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "current_episode" INTEGER NOT NULL DEFAULT 1,
    "last_episode_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "arc_series_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arc_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reflections" (
    "id" TEXT NOT NULL,
    "series_id" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reflections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_bibles" (
    "id" TEXT NOT NULL,
    "series_id" TEXT NOT NULL,
    "bible" JSONB NOT NULL,
    "token_count" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "story_bibles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_events" (
    "id" TEXT NOT NULL,
    "series_id" TEXT NOT NULL,
    "episode_number" INTEGER NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "arc_series_user_id_idx" ON "arc_series"("user_id");

-- CreateIndex
CREATE INDEX "arc_series_user_id_status_idx" ON "arc_series"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "reflections_series_id_key" ON "reflections"("series_id");

-- CreateIndex
CREATE UNIQUE INDEX "story_bibles_series_id_key" ON "story_bibles"("series_id");

-- CreateIndex
CREATE INDEX "story_events_series_id_idx" ON "story_events"("series_id");

-- CreateIndex
CREATE INDEX "story_events_series_id_episode_number_idx" ON "story_events"("series_id", "episode_number");

-- CreateIndex
CREATE INDEX "arcs_series_id_idx" ON "arcs"("series_id");

-- CreateIndex
CREATE INDEX "arcs_user_id_idx" ON "arcs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "arcs_series_id_episode_number_key" ON "arcs"("series_id", "episode_number");

-- AddForeignKey
ALTER TABLE "arc_series" ADD CONSTRAINT "arc_series_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arcs" ADD CONSTRAINT "arcs_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "arc_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reflections" ADD CONSTRAINT "reflections_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "arc_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_bibles" ADD CONSTRAINT "story_bibles_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "arc_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_events" ADD CONSTRAINT "story_events_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "arc_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
