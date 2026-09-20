import { getAllCategories } from "@/lib/news-service";
import KategorilerClient from "./KategorilerClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kategori Yönetimi | Gündem360 CMS",
};

export default async function KategorilerPage() {
  const categories = await getAllCategories();
  return <KategorilerClient initialCategories={categories} />;
}
