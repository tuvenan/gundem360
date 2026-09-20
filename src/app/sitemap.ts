import { MetadataRoute } from "next";
import { getAllNews, getAllCategories, getSiteSettings } from "@/lib/news-service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, categories, newsList] = await Promise.all([
    getSiteSettings(),
    getAllCategories(),
    getAllNews(),
  ]);

  const baseUrl = settings.seo?.canonicalUrl || "https://gundem360.com";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/kunye`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/iletisim`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/kategori/${cat.key}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  const newsPages: MetadataRoute.Sitemap = newsList.map((item) => ({
    url: `${baseUrl}/haber/${item.slug}`,
    lastModified: item.updatedAt ? new Date() : new Date(item.publishedAt || Date.now()),
    changeFrequency: "daily",
    priority: item.headlineType === "main" ? 0.9 : 0.7,
  }));

  return [...staticPages, ...categoryPages, ...newsPages];
}
