import { getAllNews } from "@/lib/news-service";
import MansetlerClient from "./MansetlerClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manşet Sıralayıcı (1-10) | Gündem360 CMS",
};

export default async function MansetlerPage() {
  const news = await getAllNews();
  return <MansetlerClient initialNews={news} />;
}
