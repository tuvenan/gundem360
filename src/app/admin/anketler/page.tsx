import { getPolls } from "@/lib/news-service";
import AnketlerClient from "./AnketlerClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Anket & Kamuoyu Yönetimi | Gündem360 Admin",
  description: "Okuyucu anketleri oluşturma, düzenleme ve canlı sonuç analitiği.",
};

export default async function AdminAnketlerPage() {
  const initialPolls = await getPolls();
  return <AnketlerClient initialPolls={initialPolls} />;
}
