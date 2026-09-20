import { getSiteSettings, getAllCategories } from "@/lib/news-service";
import AyarlarClient from "./AyarlarClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Site ve Yayın Ayarları | Gündem360 CMS",
};

export default async function AyarlarPage() {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getAllCategories(),
  ]);
  return <AyarlarClient initialSettings={settings} initialCategories={categories} />;
}
