"use client";

import React from "react";
import Link from "next/link";
import { Camera, Eye } from "lucide-react";
import { PhotoGallery } from "@/types/news";
import SafeImage from "./SafeImage";

interface PhotoGalleryCardProps {
  gallery: PhotoGallery;
  className?: string;
}

export default function PhotoGalleryCard({
  gallery,
  className = "",
}: PhotoGalleryCardProps) {
  const coverImg =
    gallery.coverImage ||
    gallery.slides?.[0]?.imageUrl ||
    "/uploads/default-news.jpg";
  const photoCount = gallery.slides?.length || 0;

  return (
    <Link
      href={`/foto-galeri/${gallery.slug}`}
      className={`group flex flex-col bg-zinc-900/90 hover:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800/80 hover:border-red-500/50 transition-all duration-300 shadow-md hover:-translate-y-1 ${className}`}
    >
      {/* Albüm Kapak Görseli */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
        <SafeImage
          src={coverImg}
          alt={gallery.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {/* Kararma / Gradyan Katmanı */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent group-hover:from-black/90 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Sol Üst: Kategori Rozeti */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow ${
              gallery.categoryBadgeColor || "bg-red-600"
            } uppercase tracking-wider`}
          >
            {gallery.categoryTitle || gallery.category}
          </span>
        </div>

        {/* Sağ Üst: Görüntülenme */}
        <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
          <Eye className="w-3 h-3 text-zinc-400" />
          <span>{gallery.viewCount?.toLocaleString("tr-TR") || 0}</span>
        </div>

        {/* Sol Alt Köşe: "X Fotoğraf" Rozeti */}
        <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/15 shadow-md">
          <Camera className="w-3.5 h-3.5 text-red-400" />
          <span>{photoCount} Fotoğraf</span>
        </div>
      </div>

      {/* Başlık ve Detaylar */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
          {gallery.title}
        </h3>
        {gallery.spot && (
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5">
            {gallery.spot}
          </p>
        )}
      </div>
    </Link>
  );
}
