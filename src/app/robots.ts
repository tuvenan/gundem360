import { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/news-service";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const canonical = settings.seo?.canonicalUrl || "https://gundem360.com";
  const shouldIndex = settings.seo?.robotsIndex?.includes("index") ?? true;

  return {
    rules: {
      userAgent: "*",
      allow: shouldIndex ? "/" : undefined,
      disallow: shouldIndex ? ["/admin/", "/api/"] : "/",
    },
    sitemap: [
      `${canonical}/sitemap.xml`,
      `${canonical}/news-sitemap.xml`,
    ],
  };
}
