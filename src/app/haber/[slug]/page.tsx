import { notFound } from "next/navigation";
import {
  getNewsBySlug,
  getComments,
  getNewsByCategory,
  getAllNews,
  getActiveFeaturedPoll,
  getSidebarWidgets,
} from "@/lib/news-service";
import NewsDetailClient from "@/components/news/NewsDetailClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface NewsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) {
    return {
      title: "Haber Bulunamadı | Gündem360",
    };
  }

  const metaTitle = news.seo?.metaTitle || `${news.title} | Gündem360`;
  const metaDesc = news.seo?.metaDescription || news.summary;

  return {
    title: metaTitle,
    description: metaDesc,
    alternates: news.seo?.canonicalUrl ? { canonical: news.seo.canonicalUrl } : undefined,
    robots: news.seo?.noIndex ? { index: false, follow: false } : undefined,
    keywords: news.seo?.tags?.length ? news.seo.tags : news.tags,
    openGraph: {
      title: news.seo?.ogTitle || metaTitle,
      description: news.seo?.ogDescription || metaDesc,
      images: [{ url: news.imageUrl }],
      type: "article",
    },
  };
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) {
    notFound();
  }

  const [initialComments, categoryNews, allNews, sidebarWidgets, featuredPoll] =
    await Promise.all([
      getComments(news.id),
      getNewsByCategory(news.category),
      getAllNews(),
      getSidebarWidgets(),
      getActiveFeaturedPoll(),
    ]);

  const relatedNews = categoryNews.filter((n) => n.id !== news.id);
  const popularNews = [...allNews]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Schema.org NewsArticle JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: news.summary,
    image: [news.imageUrl],
    datePublished: news.publishedAt,
    dateModified: news.updatedAt || news.publishedAt,
    author: [
      {
        "@type": "Person",
        name: news.author.name,
      },
    ],
    publisher: {
      "@type": "NewsMediaOrganization",
      name: "Gündem360",
      url: "https://gundem360.com",
    },
    keywords: (news.seo?.tags || news.tags || []).join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NewsDetailClient
        news={news}
        initialComments={initialComments}
        relatedNews={relatedNews}
        popularNews={popularNews}
        sidebarWidgets={sidebarWidgets}
        poll={featuredPoll}
      />
    </>
  );
}

