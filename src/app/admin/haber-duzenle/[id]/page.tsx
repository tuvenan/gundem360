import { notFound } from "next/navigation";
import { getNewsById, getAllCategories } from "@/lib/news-service";
import HaberDuzenleClient from "./HaberDuzenleClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Haberi Düzenle | Gündem360 CMS",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HaberDuzenlePage({ params }: PageProps) {
  const { id } = await params;
  const [newsItem, categories] = await Promise.all([
    getNewsById(id),
    getAllCategories(),
  ]);

  if (!newsItem) {
    notFound();
  }

  return (
    <HaberDuzenleClient
      newsItem={newsItem}
      categories={categories}
    />
  );
}
