import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { GeneratedArc } from "@/types/arc";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?callbackURL=/dashboard");
  }

  const user = session.user;

  const arcs = await prisma.arc.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const serializedArcs = arcs.map((arc) => ({
    id: arc.id,
    createdAt: arc.createdAt.toISOString(),
    arcData: arc.arcData as unknown as GeneratedArc,
  }));

  const latestArc = serializedArcs[serializedArcs.length - 1];
  const heroName = latestArc?.arcData.character_name ?? "Protagonist";

  return (
    <DashboardClient
      user={{
        id: user.id,
        name: user.name ?? null,
        email: user.email ?? null,
      }}
      arcs={serializedArcs}
      heroName={heroName}
    />
  );
}
