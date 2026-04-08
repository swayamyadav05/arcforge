import prisma from "./prisma";

const WINDOW_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
// Todo: Change LIMIT to 1 when deploying
const LIMIT = 1; // Free tier: 1 arc per day

export async function checkRateLimit(
  ip: string,
  fingerprint: string | null,
): Promise<boolean> {
  // We check both IP and fingerprint separately because
  // either one matching is enough to identity the session.
  // And OR condition here means bypassing one indentifier
  // (switching networks) doesn't helpl if the other matches.
  const record = await prisma.rateLimit.findFirst({
    where: {
      OR: [
        { ipAddress: ip },
        // We only include fingerprint in the OR if it exists.
        // If fingerprint is null, we don't want to match all
        // rows that also have null fingerprints — that would
        // accidentally block everyone.
        ...(fingerprint ? [{ fingerprint }] : []),
      ],
    },
  });

  const now = new Date();

  // Situation 1 - brand new visitor, no record at all.
  if (!record) {
    await prisma.rateLimit.create({
      data: {
        ipAddress: ip,
        fingerprint: fingerprint,
        arcCount: 1,
        windowStart: now,
      },
    });
    return true; // allowed
  }

  const windowAge = now.getTime() - record.windowStart.getTime();

  // Situation 2 - record exists but window has expired.
  // We reset the window rather than creating a new record -
  // this keeps the table from accumulating duplicate rows
  // for the same IP across multiple days.
  if (windowAge > WINDOW_DURATION_MS) {
    await prisma.rateLimit.update({
      where: { id: record.id },
      data: {
        arcCount: 1,
        windowStart: now,
        // Also update fingerprint is case it changed
        // (e.g. user cleared localStorage between visits)
        fingerprint: fingerprint,
      },
    });
    return true; // allowed
  }

  // Situation 3 - active window, check the count.
  if (record.arcCount < LIMIT) {
    await prisma.rateLimit.update({
      where: { id: record.id },
      data: { arcCount: { increment: 1 } },
      // increament is Prisma's atomic update syntax.
      // This is equivalent to: SET arc_count = arc_count + 1
      // It happens in a single DB operation rather than
      // read-then-write, which significantly reduces the race condition window we discussed earlier.
    });
    return true; // allowed
  }

  // Situation 3b - active window, limit already reached.
  return false; // blocked
}
