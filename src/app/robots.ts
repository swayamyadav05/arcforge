// src/app/robots.ts
// Next.js serves this at /robots.txt automatically.
// This configuration allows Google to index the marketing pages
// while blocking the API routes (which return JSON, not useful
// content for search results) and optionally the arc pages
// if you decide user-generated content shouldn't be indexed.
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Block the API routes — these return JSON responses
      // that would appear as gibberish in search results.
      disallow: ["/api/"],
    },
    sitemap: "https://arcforge.me/sitemap.xml",
  };
}
