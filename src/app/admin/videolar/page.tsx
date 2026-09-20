import { getVideoItems, getVideoCategories } from "@/lib/news-service";
import VideolarClient from "./VideolarClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Video Galeri Yönetimi | Gündem360 CMS",
};

export default async function AdminVideolarPage() {
  const [videos, videoCategories] = await Promise.all([
    getVideoItems(),
    getVideoCategories(),
  ]);

  return <VideolarClient initialVideos={videos} initialCategories={videoCategories} />;
}
