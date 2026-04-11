import { timingSafeEqual } from "crypto";
import {
  appendOwnerArc,
  OWNER_SESSION_COOKIE,
  OWNER_SESSION_MAX_AGE_SECONDS,
} from "@/lib/ownerSession";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DEV_TOKEN_HEADER = "x-arcforge-dev-token";
const DEV_TOKEN_QUERY_PARAM = "token";

function readDevRevealToken(): string | null {
  const token = process.env.ARC_DEV_REVEAL_TOKEN?.trim();

  return token && token.length > 0 ? token : null;
}

function isDevRevealRouteEnabled(
  expectedToken: string | null,
): boolean {
  if (!expectedToken) {
    return false;
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env.ARC_DEV_REVEAL_ALLOW_IN_PRODUCTION !== "true"
  ) {
    return false;
  }

  return true;
}

function readProvidedToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization")?.trim();

  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const bearerToken = authHeader.slice(7).trim();
    if (bearerToken) {
      return bearerToken;
    }
  }

  const headerToken = req.headers.get(DEV_TOKEN_HEADER)?.trim();
  if (headerToken) {
    return headerToken;
  }

  const queryToken = req.nextUrl.searchParams
    .get(DEV_TOKEN_QUERY_PARAM)
    ?.trim();

  return queryToken && queryToken.length > 0 ? queryToken : null;
}

function tokensMatch(expected: string, provided: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const expectedToken = readDevRevealToken();

    if (!expectedToken || !isDevRevealRouteEnabled(expectedToken)) {
      return NextResponse.json(
        {
          error: "Development reveal access is not enabled.",
        },
        { status: 404 },
      );
    }

    const providedToken = readProvidedToken(req);

    if (
      !providedToken ||
      !tokensMatch(expectedToken, providedToken)
    ) {
      return NextResponse.json(
        {
          error: "Development reveal access denied.",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!id || id.length > 64) {
      return NextResponse.json(
        {
          error: "Arc id is invalid.",
        },
        { status: 400 },
      );
    }

    const arc = await prisma.arc.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!arc) {
      return NextResponse.json(
        {
          error: "Arc not found.",
        },
        { status: 404 },
      );
    }

    const ownerSessionValue = appendOwnerArc(
      req.cookies.get(OWNER_SESSION_COOKIE)?.value,
      arc.id,
    );

    const revealUrl = new URL(`/arc/${arc.id}`, req.url);
    const response = NextResponse.redirect(revealUrl, {
      status: 302,
    });

    response.cookies.set({
      name: OWNER_SESSION_COOKIE,
      value: ownerSessionValue,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: OWNER_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("[api/arc/dev/reveal/[id]] Error:", error);

    return NextResponse.json(
      {
        error: "Unable to grant development reveal access right now.",
      },
      { status: 500 },
    );
  }
}
