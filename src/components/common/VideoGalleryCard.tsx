"use client";

import React from "react";
import Link from "next/link";
import { Play, Clock, Eye } from "lucide-react";
import { VideoItem } from "@/types/news";
import SafeImage from "./SafeImage";

interface VideoGalleryCardProps {
  video: VideoItem;
  className?: string;
  onClick?: () => void;
}

export default function VideoGalleryCard({
  video,
  className = "",
  onClick,
}: VideoGalleryCardProps) {
  const thumbnail =
    video.thumbnailUrl ||
    (video.youtubeId
      ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
      : "/uploads/default-news.jpg");

  const Content = (
    <div
      className={`group flex flex-col bg-zinc-900/90 hover:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800/80 hover:border-red-500/50 transition-all duration-300 shadow-md hover:-translate-y-1 ${className}`}
      onClick={onClick}
    >
      {/* YouTube Video Thumbnail + Play Butonu */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <SafeImage
          src={thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {/* Kararma / Gradyan Katmanı */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent group-hover:from-black/90 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Ortadaki Parlayan Play Butonu */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-red-600/85 group-hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/40 group-hover:scale-115 group-hover:shadow-red-600/70 transition-all duration-300">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Sol Üst: Kategori Rozeti */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow ${
              video.categoryBadgeColor || "bg-red-600"
            } uppercase tracking-wider`}
          >
            {video.categoryTitle || video.category}
          </span>
        </div>

        {/* Sağ Üst: Görüntülenme */}
        <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
          <Eye className="w-3 h-3 text-zinc-400" />
          <span>{video.viewCount?.toLocaleString("tr-TR") || 0}</span>
        </div>

        {/* Sağ Alt Köşe: Video Süresi */}
        {video.duration && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-xs text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
            <Clock className="w-3 h-3 text-red-400" />
            <span>{video.duration}</span>
          </div>
        )}
      </div>

      {/* Başlık & Açıklama */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return <div className="cursor-pointer">{Content}</div>;
  }

  return <Link href={`/video-galeri/${video.slug}`}>{Content}</Link>;
}
