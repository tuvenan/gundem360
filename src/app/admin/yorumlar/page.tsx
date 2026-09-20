import { getAllComments } from "@/lib/news-service";
import YorumlarClient from "./YorumlarClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yorum Moderasyonu | Gündem360 CMS",
};

export default async function YorumlarPage() {
  const comments = await getAllComments();
  return <YorumlarClient initialComments={comments} />;
}
