import { getAllCategories } from "@/lib/news-service";
import { getSiteSettings } from "@/lib/services/settings-service";
import AiHaberStudyoClient from "./AiHaberStudyoClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yapay Zeka Haber Stüdyosu | Gündem360 CMS",
  description: "Yapay zeka destekli profesyonel haber üretim ve yönetim stüdyosu.",
};

export default async function AiHaberStudyoPage() {
  const [categories, settings] = await Promise.all([
    getAllCategories(),
    getSiteSettings(),
  ]);

  return (
    <AiHaberStudyoClient
      categories={categories}
      providers={settings.aiProviders}
      activeProviderId={settings.activeAiProviderId}
    />
  );
}
