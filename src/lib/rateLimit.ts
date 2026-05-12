import prisma from "./prisma";

const WINDOW_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_LIMIT = process.env.NODE_ENV === "production" ? 1 : 10;

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

// NOTE: Read-then-write pattern has a small race window under
// concurrent requests. Acceptable at current scale. If concurrency
// increases, replace with a single upsert + atomic increment.
export async function consumeRateLimit(
  ip: string,
  fingerprint: string | null,
): Promise<void> {
  const record = await findRateLimitRecord(ip, fingerprint);
  const now = new Date();

  if (!record) {
    await prisma.rateLimit.create({
      data: {
        ipAddress: ip,
        fingerprint: fingerprint,
        arcCount: 1,
        windowStart: now,
      },
    });
    return;
  }

  const windowAge = getWindowAgeMs(record.windowStart, now);

  if (windowAge > WINDOW_DURATION_MS) {
    await prisma.rateLimit.update({
      where: { id: record.id },
      data: {
        arcCount: 1,
        windowStart: now,
        fingerprint: fingerprint,
      },
    });
    return;
  }

  await prisma.rateLimit.update({
    where: { id: record.id },
    data: { arcCount: { increment: 1 } },
  });
}

// NOTE: Read-then-write pattern has a small race window under
// concurrent requests. Acceptable at current scale. If concurrency
// increases, replace with a single upsert + atomic increment.
