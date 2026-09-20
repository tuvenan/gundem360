import { Metadata } from "next";
import { getSidebarWidgets } from "@/lib/services/sidebar-service";
import SagBlokClient from "./SagBlokClient";

export const metadata: Metadata = {
  title: "Sağ Blok Yönetimi (Sidebar Builder) | Gündem360 CMS",
  description: "Haber detay ve içerik sayfalarındaki sağ blok bileşenlerinin sıralamasını ve içeriklerini yönetin.",
};

export const dynamic = "force-dynamic";

export default async function AdminSagBlokPage() {
  const widgets = await getSidebarWidgets();

  return <SagBlokClient initialWidgets={widgets} />;
}
