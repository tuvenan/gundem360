import { notFound } from "next/navigation";
import { getVideoBySlug, getVideoItems } from "@/lib/news-service";
import VideoPlayerClient from "./VideoPlayerClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);

  if (!video) {
    return {
      title: "Video Bulunamadı | Gündem360",
    };
  }

  const title = `${video.title} | Video İzle - Gündem360`;
  const description = video.description || `${video.title} videosu ve özel detayları Gündem360 Video Galeri'de.`;

  return {
    title,
    description,
    keywords: video.tags,
    openGraph: {
      title,
      description,
      images: [{ url: video.thumbnailUrl }],
      type: "video.other",
      videos: [
        {
          url: `https://www.youtube.com/embed/${video.youtubeId}`,
          width: 1280,
          height: 720,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [video.thumbnailUrl],
    },
  };
}

export default async function SingleVideoPage({ params }: Props) {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);

  if (!video) {
    notFound();
  }

  const allVideos = await getVideoItems();
  const relatedVideos = allVideos
    .filter((v) => v.id !== video.id)
    .slice(0, 4);

  // Schema.org VideoObject JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: [video.thumbnailUrl],
    uploadDate: video.publishedAt,
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.youtubeId}`,
    contentUrl: video.youtubeUrl,
    author: {
      "@type": "Person",
      name: video.author?.name || "Gündem360 Video Masası",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VideoPlayerClient video={video} relatedVideos={relatedVideos} />
    </>
  );
}
