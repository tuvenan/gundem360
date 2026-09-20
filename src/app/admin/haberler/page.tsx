import { getAllCategories, getPaginatedNews } from "@/lib/news-service";
import HaberlerClient from "./HaberlerClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Haber Yönetimi | Gündem360 CMS",
  description: "20'li sayfalama mimarisi ile haber yönetimi ve içerik listeleme paneli.",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    headline?: string;
  }>;
}

export default async function HaberlerPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params?.page || "1", 10) || 1);
  const search = params?.search || "";
  const category = params?.category || "all";
  const headline = params?.headline || "all";

  const [paginatedData, categories] = await Promise.all([
    getPaginatedNews(page, 20, search, category, headline),
    getAllCategories(),
  ]);

  return (
    <HaberlerClient
      initialNews={paginatedData.news}
      categories={categories}
      pagination={{
        total: paginatedData.total,
        totalPages: paginatedData.totalPages,
        currentPage: paginatedData.currentPage,
        limit: paginatedData.limit,
      }}
      initialSearch={search}
      initialCategory={category}
      initialHeadline={headline}
    />
  );
}
