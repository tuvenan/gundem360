import { notFound } from "next/navigation";
import { getPhotoGalleryBySlug, getPhotoGalleries } from "@/lib/news-service";
import PhotoGalleryViewer from "./PhotoGalleryViewer";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await getPhotoGalleryBySlug(slug);

  if (!gallery) {
    return {
      title: "Galeri Bulunamadı | Gündem360",
    };
  }

  const title = `${gallery.title} (${gallery.slides?.length || 0} Fotoğraf) | Gündem360`;
  const description = gallery.spot || `${gallery.title} fotoğraf galerisi ve detayları Gündem360'ta.`;

  return {
    title,
    description,
    keywords: gallery.tags,
    openGraph: {
      title,
      description,
      images: [{ url: gallery.coverImage }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [gallery.coverImage],
    },
  };
}

export default async function SingleGalleryPage({ params }: Props) {
  const { slug } = await params;
  const gallery = await getPhotoGalleryBySlug(slug);

  if (!gallery) {
    notFound();
  }

  const allGalleries = await getPhotoGalleries();
  const relatedGalleries = allGalleries
    .filter((g) => g.id !== gallery.id)
    .slice(0, 3);

  // Schema.org ImageGallery JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: gallery.title,
    description: gallery.spot,
    image: gallery.coverImage,
    datePublished: gallery.publishedAt,
    author: {
      "@type": "Person",
      name: gallery.author?.name || "Gündem360 Görsel Servisi",
    },
    associatedMedia: (gallery.slides || []).map((slide, idx) => ({
      "@type": "ImageObject",
      name: slide.title || `${gallery.title} - Fotoğraf ${idx + 1}`,
      description: slide.caption,
      contentUrl: slide.imageUrl,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PhotoGalleryViewer gallery={gallery} relatedGalleries={relatedGalleries} />
    </>
  );
}
