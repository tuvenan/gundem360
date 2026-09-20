import { Metadata } from "next";
import { getSiteSettings } from "@/lib/services/settings-service";
import IletisimClient from "./IletisimClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İletişim & Haber İhbar Merkezi | Gündem360",
  description:
    "Gündem360 haber portalı merkez ofis adresi, telefon, kurumsal e-posta ve 7/24 haber ihbar formu.",
};

export default async function IletisimPage() {
  const settings = await getSiteSettings();
  return <IletisimClient settings={settings} />;
}
