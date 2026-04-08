import { createHmac, timingSafeEqual } from "crypto";

export const OWNER_SESSION_COOKIE = "arcforge_owner_session";
export const OWNER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const OWNER_SESSION_VERSION = 1;
const OWNER_SESSION_MAX_IDS = 20;

type OwnerSessionPayload = {
  v: number;
  arcIds: string[];
};

function getOwnerSessionSecret(): string {
  const envSecret =
    process.env.ARC_OWNER_SESSION_SECRET ??
    process.env.NEXTAUTH_SECRET;

  if (envSecret && envSecret.length >= 16) {
    return envSecret;
  }

  // Deterministic fallback keeps local development usable
  // even when no explicit secret is configured.
  if (process.env.NODE_ENV !== "production") {
    return "arcforge-dev-owner-session-secret";
  }

  return "arcforge-production-owner-session-fallback";
}

function sanitizeArcIds(arcIds: string[]): string[] {
  const uniqueIds = new Set<string>();

  for (const arcId of arcIds) {
    if (typeof arcId !== "string") {
      continue;
    }

    const normalized = arcId.trim();

    if (!normalized || normalized.length > 64) {
      continue;
    }

    uniqueIds.add(normalized);

    if (uniqueIds.size >= OWNER_SESSION_MAX_IDS) {
      break;
    }
  }

  return Array.from(uniqueIds);
}

function signPayload(payloadBase64: string): string {
  return createHmac("sha256", getOwnerSessionSecret())
    .update(payloadBase64)
    .digest("base64url");
}

function buildSessionValue(arcIds: string[]): string {
  const payload: OwnerSessionPayload = {
    v: OWNER_SESSION_VERSION,
    arcIds: sanitizeArcIds(arcIds),
  };

  const payloadBase64 = Buffer.from(
    JSON.stringify(payload),
    "utf8",
  ).toString("base64url");

  const signature = signPayload(payloadBase64);

  return `${payloadBase64}.${signature}`;
}

export function readOwnerArcIds(
  cookieValue?: string | null,
): string[] {
  if (!cookieValue) {
    return [];
  }

  const [payloadBase64, signature] = cookieValue.split(".");

  if (!payloadBase64 || !signature) {
    return [];
  }

  const expectedSignature = signPayload(payloadBase64);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return [];
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return [];
  }

  try {
    const payloadJson = Buffer.from(
      payloadBase64,
      "base64url",
    ).toString("utf8");

    const payload = JSON.parse(payloadJson) as OwnerSessionPayload;

    if (
      payload.v !== OWNER_SESSION_VERSION ||
      !Array.isArray(payload.arcIds)
    ) {
      return [];
    }

    return sanitizeArcIds(payload.arcIds);
  } catch {
    return [];
  }
}

export function appendOwnerArc(
  cookieValue: string | null | undefined,
  arcId: string,
): string {
  const existingArcIds = readOwnerArcIds(cookieValue);
  const updatedArcIds = [
    arcId,
    ...existingArcIds.filter((id) => id !== arcId),
  ];

  return buildSessionValue(updatedArcIds);
}

export function hasOwnerAccess(
  cookieValue: string | null | undefined,
  arcId: string,
): boolean {
  return readOwnerArcIds(cookieValue).includes(arcId);
}
