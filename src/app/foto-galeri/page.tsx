import { getPhotoGalleries, getGalleryCategories } from "@/lib/news-service";
import FotoGaleriClient from "./FotoGaleriClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Foto Galeri | Son Dakika ve Günün En Çarpıcı Fotoğrafları - Gündem360",
  description:
    "Gündem, yaşam, spor, teknoloji ve kültür sanat dünyasından yüksek çözünürlüklü özel fotoğraf serileri ve görsel haberler.",
  openGraph: {
    title: "Foto Galeri | Gündem360",
    description: "Görsel dünyanın en çarpıcı anları ve fotoğraf serileri.",
  },
};

export default async function FotoGaleriPage() {
  const [galleries, galleryCategories] = await Promise.all([
    getPhotoGalleries(),
    getGalleryCategories(),
  ]);

  return <FotoGaleriClient initialGalleries={galleries} categories={galleryCategories} />;
}

