import { getPhotoGalleries, getGalleryCategories } from "@/lib/news-service";
import GalerilerClient from "./GalerilerClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Foto Galeri Yönetimi | Gündem360 CMS",
};

export default async function AdminGalerilerPage() {
  const [galleries, galleryCategories] = await Promise.all([
    getPhotoGalleries(),
    getGalleryCategories(),
  ]);

  return <GalerilerClient initialGalleries={galleries} initialCategories={galleryCategories} />;
}

