import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { GeneratedArc } from "@/types/arc";
import type { EpisodeNOutput } from "@/types/episode-n";
import DashboardClient from "@/components/dashboard/DashboardClient";
import type { DashboardSeries } from "@/components/dashboard/DashboardClient";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?callbackURL=/dashboard");

  const user = session.user;

  const rawSeries = await prisma.arcSeries.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      episodes: {
        orderBy: { episodeNumber: "asc" },
        select: {
          id: true,
          episodeNumber: true,
          arcData: true,
          createdAt: true,
        },
      },
      _count: { select: { reflections: true } },
    },
  });

  const now = Date.now();

  const dashboardSeries: DashboardSeries[] = rawSeries
    .filter((s) => s.episodes.length > 0)
    .map((s) => {
      const latest = s.episodes[s.episodes.length - 1];
      const daysSincePrev = Math.floor(
        (now - s.lastEpisodeAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      const latestData = latest.arcData as unknown as EpisodeNOutput & GeneratedArc;
      const missionPreview =
        latestData.next_mission?.description ??
        latestData.episode_one_mission?.description ??
        "";

      return {
        id: s.id,
        status: s.status as "active" | "archived",
        currentEpisode: s.currentEpisode,
        daysSincePrev,
        hasDraft: s._count.reflections > 0,
        missionPreview,
        episodes: s.episodes.map((ep) => ({
          id: ep.id,
          episodeNumber: ep.episodeNumber ?? 1,
          arcData: ep.arcData as Record<string, unknown>,
        })),
      };
    });

  const activeSeries = dashboardSeries.find((s) => s.status === "active");
  const heroName =
    (
      (activeSeries ?? dashboardSeries[0])?.episodes[0]
        ?.arcData as unknown as GeneratedArc | undefined
    )?.character_name ?? "Protagonist";

  return (
    <DashboardClient
      user={{ id: user.id, name: user.name ?? null, email: user.email ?? null }}
      series={dashboardSeries}
      heroName={heroName}
    />
  );
}
