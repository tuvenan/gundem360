import { Metadata } from "next";
import { getHomepageLayout } from "@/lib/services/layout-service";
import SayfaDuzeniClient from "./SayfaDuzeniClient";

export const metadata: Metadata = {
  title: "Modüler Sayfa Düzeni | Gündem360 Yönetim Merkezi",
  description: "Ana sayfa bloklarının sırasını ve görünürlüğünü yapılandırın.",
};

export const dynamic = "force-dynamic";

export default async function AdminSayfaDuzeniPage() {
  const layout = await getHomepageLayout();

  return <SayfaDuzeniClient initialLayout={layout} />;
}
