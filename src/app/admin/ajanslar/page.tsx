import { getAllAgencies } from "@/lib/services/rss-service";
import { getAllCategories } from "@/lib/news-service";
import AjanslarClient from "./AjanslarClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ajans ve RSS Yönetim Merkezi | Gündem360 CMS",
  description: "Harici RSS akışlarından otomatik haber çekme ve ajans yönetimi.",
};

export default async function AjanslarPage() {
  const [agencies, categories] = await Promise.all([
    getAllAgencies(),
    getAllCategories(),
  ]);

  return <AjanslarClient initialAgencies={agencies} categories={categories} />;
}
