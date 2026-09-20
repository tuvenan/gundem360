import { getColumnists } from "@/lib/news-service";
import YazarlarClient from "./YazarlarClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Köşe Yazarları | Gündem360 CMS",
};

export default async function YazarlarPage() {
  const columnists = await getColumnists();
  return <YazarlarClient initialColumnists={columnists} />;
}
