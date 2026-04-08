// src/app/sitemap.ts
// Next.js automatically serves this at /sitemap.xml
// Google reads it to understand the structure of your site.
// The changeFrequency and priority fields are hints to Google —
// it doesn't guarantee anything, but it communicates your intent.
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://arcforge.me";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      // The landing page changes rarely once launched —
      // monthly is an honest frequency for static marketing content.
      changeFrequency: "monthly",
      // Priority 1.0 signals this is the most important page.
      // Google treats this as a relative hint within your own site.
      priority: 1,
    },
    {
      url: `${baseUrl}/awakening`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      // Slightly lower priority than the homepage —
      // the quiz is important but it's a flow page, not a
      // discovery page that people would search for directly.
      priority: 0.8,
    },
  ];
}
