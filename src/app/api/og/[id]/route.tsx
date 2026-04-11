// This route runs on Node.js runtime because we read font files
// from disk with fs/promises before rendering the image.
// @vercel/og can run in multiple runtimes, but this implementation
// intentionally uses Node APIs for font loading.

import { ImageResponse } from "@vercel/og";
import { GeneratedArc } from "@/types/arc";
import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

// We target roughly 120 characters which gives us a clean
// 2-line display at our 16px font size and 900px max-width.
// The exact character count where text wraps depends on the
// specific characters in the string, so we add a small buffer
// and let the natural line breaking handle the rest.
function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  // We cut at the last word boundary before maxChars rather
  // than cutting mid-word, which would look unpolished.
  const truncated = text.slice(0, maxChars);
  const lastSpace = truncated.lastIndexOf(" ");
  return truncated.slice(0, lastSpace) + "...";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Resolve the base URL from the incoming request so OG rendering
    // works in local dev, preview deployments, and production domains
    // without relying on NEXT_PUBLIC_APP_URL configuration.
    const arcApiUrl = new URL(
      `/api/arc/${id}`,
      req.nextUrl.origin,
    );

    const arcResponse = await fetch(arcApiUrl, {
      cache: "no-store",
    });

    if (!arcResponse.ok) {
      return new Response("Arc not found", { status: 404 });
    }

    const arcData = (await arcResponse.json()) as GeneratedArc;

    const fontsDir = join(process.cwd(), "src", "fonts");

    const [interRegular, interItalic] = await Promise.all([
      readFile(join(fontsDir, "Inter-Regular.ttf")),
      readFile(join(fontsDir, "Inter-Italic.ttf")),
    ]);

    // ImageResponse takes a JSX element and it as a PNG.
    // The JSX here looks like React but it runs in a completely
    // different environment — there's no DOM, no CSS cascade,
    // no external stylesheets. Only inline styles with a subset
    // of flexbox properties are supported. This is why ArcCard
    // was written with inline styles from the beginning.
    return new ImageResponse(
      <div
        style={{
          width: "1200px",
          height: "630px",
          background:
            "linear-gradient(135deg, #26215C 0%, #3C3489 50%, #534AB7 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          fontFamily: "Inter, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}>
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.06)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.04)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0px",
          }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              marginBottom: "24px",
            }}>
            {/* Branding row */}
            <p
              style={{
                fontSize: "14px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#D8B4FE",
                margin: "0 0 32px 0",
                fontFamily: "Inter, sans-serif",
              }}>
              ArcForge · Episode 01 · arcforge.me/arc/{id}
            </p>

            {/* Character name */}
            <h1
              style={{
                fontSize: "52px",
                fontWeight: 500,
                color: "#EEEDFE",
                margin: "0 0 20px 0",
                lineHeight: 1.1,
                maxWidth: "800px",
                fontFamily: "Inter, sans-serif",
              }}>
              {arcData.character_name}
            </h1>

            {/* Archetype pill */}
            <div style={{ display: "flex", marginBottom: "28px" }}>
              <div
                style={{
                  background: "rgba(175,169,236,0.15)",
                  border: "1px solid rgba(175,169,236,0.3)",
                  borderRadius: "20px",
                  padding: "6px 18px",
                  display: "flex",
                }}>
                <span
                  style={{
                    fontSize: "15px",
                    color: "#CCC8F8",
                    fontFamily: "Inter, sans-serif",
                  }}>
                  {arcData.archetype}
                </span>
              </div>
            </div>
          </div>

          {/* Opening quote — now actually italic because we loaded the italic font */}
          <p
            style={{
              fontSize: "19px",
              color: "#CCC8F8",
              fontStyle: "italic",
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.6,
              margin: "0 0 0 0",
              maxWidth: "900px",
            }}>
            &quot;{arcData.opening_episode_quote}&quot;
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}>
          {/* Divider — visually separates the quote from the bottom section,
              eliminating the dead space problem by giving the layout a clear
              structural anchor rather than relying on marginTop: auto which
              Satori handles inconsistently */}
          {/* <div
            style={{
              width: "100%",
              height: "1px",
              background: "rgba(175,169,236,0.2)",
              margin: "28px 0",
            }}
          /> */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginBottom: "24px",
            }}>
            <span
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#7F77DD",
                fontFamily: "Inter, sans-serif",
              }}>
              The wound
            </span>
            <p
              style={{
                fontSize: "16px",
                color: "#CCC8F8",
                lineHeight: 1.5,
                margin: 0,
                fontFamily: "Inter, sans-serif",
                // We limit to roughly 2 lines by constraining the width
                maxWidth: "900px",
              }}>
              {truncate(arcData.character_arc.the_wound, 180)}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}>
          {/* Bottom row — signature move left, final form right */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxWidth: "650px",
              }}>
              <span
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#7F77DD",
                  fontFamily: "Inter, sans-serif",
                }}>
                Signature move
              </span>
              <span
                style={{
                  fontSize: "15px",
                  color: "#CCC8F8",
                  lineHeight: 1.5,
                  fontFamily: "Inter, sans-serif",
                }}>
                {arcData.signature_move}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "8px",
              }}>
              <span
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#7F77DD",
                  fontFamily: "Inter, sans-serif",
                }}>
                Final form
              </span>
              <div
                style={{
                  display: "flex",
                  gap: "3px",
                  marginTop: "4px",
                }}>
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "14px",
                      height: "14px",
                      background: "#534AB7",
                      borderRadius: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        // 1200x630 is the universal Open Graph image standard.
        // Every major platform — Twitter, Discord, LinkedIn,
        // iMessage, Slack — uses this exact ratio for link previews.
        // Deviating from it causes cropping or pillarboxing on
        // some platforms, which makes the card look broken.
        fonts: [
          {
            name: "Inter",
            data: interRegular,
            style: "normal",
            weight: 400,
          },
          {
            name: "Inter",
            data: interItalic,
            style: "italic",
            weight: 400,
          },
        ],
      },
    );
  } catch (error) {
    console.error("[api/og] Error generating image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
