import { getVideoItems, getVideoCategories } from "@/lib/news-service";
import VideoGaleriClient from "./VideoGaleriClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Video Galeri | Özel Röportajlar, Analizler ve Canlı Yayınlar - Gündem360",
  description:
    "Türkiye ve dünyadan sıcak gelişmeler, özel röportajlar, belgeseller, spor özetleri ve teknoloji incelemeleri ile zengin video arşivi.",
  openGraph: {
    title: "Video Galeri | Gündem360",
    description: "Türkiye ve dünyadan en güncel video yayınları ve analizler.",
  },
};

export default async function VideoGaleriPage() {
  const [videos, videoCategories] = await Promise.all([
    getVideoItems(),
    getVideoCategories(),
  ]);

  return <VideoGaleriClient initialVideos={videos} categories={videoCategories} />;
}
