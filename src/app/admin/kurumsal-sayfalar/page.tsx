import { getLegalPages, getContactMessages } from "@/lib/services/legal-service";
import KurumsalSayfalarClient from "./KurumsalSayfalarClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kurumsal ve Yasal Sayfa Stüdyosu | Gündem360 CMS",
  description: "Künye, KVKK metinleri, yasal politikalar ve iletişim mesajları yönetimi.",
};

export default async function KurumsalSayfalarPage() {
  const [pages, messages] = await Promise.all([
    getLegalPages(),
    getContactMessages(),
  ]);

  return <KurumsalSayfalarClient initialPages={pages} initialMessages={messages} />;
}
