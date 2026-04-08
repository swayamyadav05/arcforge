import prisma from "./prisma";

const WINDOW_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_LIMIT = process.env.NODE_ENV === "production" ? 1 : 1;

type RateLimitStatus = {
  canForge: boolean;
  retryAfterSeconds: number;
  windowResetAt: string | null;
};

function getDailyLimit(): number {
  const rawLimit = process.env.ARC_DAILY_LIMIT;

  if (!rawLimit) {
    return DEFAULT_LIMIT;
  }

  const parsedLimit = Number(rawLimit);

  if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
    return DEFAULT_LIMIT;
  }

  return parsedLimit;
}

const LIMIT = getDailyLimit(); // Free tier: 1 arc per day in production

function buildRateLimitWhere(ip: string, fingerprint: string | null) {
  return {
    OR: [
      { ipAddress: ip },
      ...(fingerprint ? [{ fingerprint }] : []),
    ],
  };
}

async function findRateLimitRecord(
  ip: string,
  fingerprint: string | null,
) {
  return prisma.rateLimit.findFirst({
    where: buildRateLimitWhere(ip, fingerprint),
  });
}

function getWindowAgeMs(windowStart: Date, now: Date): number {
  return now.getTime() - windowStart.getTime();
}

function getRetryAfterSeconds(windowStart: Date, now: Date): number {
  const elapsedMs = getWindowAgeMs(windowStart, now);
  const remainingMs = Math.max(0, WINDOW_DURATION_MS - elapsedMs);

  return Math.ceil(remainingMs / 1000);
}

export async function getRateLimitStatus(
  ip: string,
  fingerprint: string | null,
): Promise<RateLimitStatus> {
  const record = await findRateLimitRecord(ip, fingerprint);
  const now = new Date();

  if (!record) {
    return {
      canForge: true,
      retryAfterSeconds: 0,
      windowResetAt: null,
    };
  }

  const windowAge = getWindowAgeMs(record.windowStart, now);

  if (windowAge > WINDOW_DURATION_MS) {
    return {
      canForge: true,
      retryAfterSeconds: 0,
      windowResetAt: null,
    };
  }

  if (record.arcCount < LIMIT) {
    return {
      canForge: true,
      retryAfterSeconds: 0,
      windowResetAt: null,
    };
  }

  return {
    canForge: false,
    retryAfterSeconds: getRetryAfterSeconds(record.windowStart, now),
    windowResetAt: new Date(
      record.windowStart.getTime() + WINDOW_DURATION_MS,
    ).toISOString(),
  };
}

export async function checkRateLimit(
  ip: string,
  fingerprint: string | null,
): Promise<boolean> {
  // We check both IP and fingerprint separately because
  // either one matching is enough to identity the session.
  // And OR condition here means bypassing one indentifier
  // (switching networks) doesn't helpl if the other matches.
  const record = await findRateLimitRecord(ip, fingerprint);

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

  const windowAge = getWindowAgeMs(record.windowStart, now);

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
