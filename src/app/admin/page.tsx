import {
  getAllNews,
  getAllComments,
  getAllCategories,
  getSiteSettings,
  getPhotoGalleries,
  getVideoItems,
  getPolls,
} from "@/lib/news-service";
import DashboardClient from "./DashboardClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gösterge Paneli & Kontrol Merkezi | Gündem360 CMS",
  description: "Haber yönetim, site metrikleri ve CMS kontrol merkezi.",
};

export default async function AdminPage() {
  const [
    news,
    comments,
    categories,
    siteSettings,
    photoGalleries,
    videos,
    polls,
  ] = await Promise.all([
    getAllNews(),
    getAllComments(),
    getAllCategories(),
    getSiteSettings(),
    getPhotoGalleries(),
    getVideoItems(),
    getPolls(),
  ]);

  return (
    <DashboardClient
      news={news}
      comments={comments}
      categories={categories}
      siteSettings={siteSettings}
      galleriesCount={photoGalleries.length}
      videosCount={videos.length}
      pollsCount={polls.length}
    />
  );
}
