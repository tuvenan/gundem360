"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Eye,
  Calendar,
  Clock,
  Share2,
  Check,
  ExternalLink,
  Play,
  ArrowLeft,
  Film,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { YoutubeIcon } from "@/components/icons/YoutubeIcon";
import { VideoItem } from "@/types/news";

interface Props {
  video: VideoItem;
  relatedVideos: VideoItem[];
}

export default function VideoPlayerClient({ video, relatedVideos }: Props) {
  const [copied, setCopied] = useState(false);
  const [viewCount, setViewCount] = useState(video.viewCount);

  // Sayfa açıldığında izlenme sayısını 1 artır
  useEffect(() => {
    fetch(`/api/videos?slug=${video.slug}&increment=true`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.viewCount === "number") {
          setViewCount(data.viewCount);
        }
      })
      .catch(() => {});
  }, [video.slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = encodeURIComponent(video.title);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 overflow-x-auto py-1">
        <Link href="/" className="hover:text-red-600 transition">
          Ana Sayfa
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <Link href="/video-galeri" className="hover:text-red-600 transition">
          Video Galeri
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
          {video.categoryTitle || video.category}
        </span>
      </nav>

      {/* 2. ANA OYNATICI VE DETAYLAR BÖLÜMÜ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SOL: Sinematik 16:9 Oynatıcı & Video Açıklaması (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* 16:9 YouTube İframe Oynatıcı */}
          <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-zinc-800/80">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>

          {/* Video Üst Başlık & Metadata */}
          <div className="space-y-3 bg-white dark:bg-zinc-900 p-5 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-white text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider ${
                    video.categoryBadgeColor || "bg-red-600"
                  }`}
                >
                  {video.categoryTitle || video.category}
                </span>

                {video.isFeatured && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                    <Sparkles className="w-3 h-3" />
                    Öne Çıkan Video
                  </span>
                )}
              </div>

              {/* Sosyal Paylaşım & Kopyalama */}
              <div className="flex items-center gap-1.5">
                <a
                  href={`https://wa.me/?text=${shareTitle}%20${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition"
                  title="WhatsApp ile Paylaş"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition"
                  title="Twitter / X ile Paylaş"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Bağlantıyı Kopyala</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 dark:text-white leading-tight">
              {video.title}
            </h1>

            {/* Yazar, Tarih, Süre, İzlenme Bilgileri */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">
              <div className="flex items-center gap-3">
                {video.author?.avatar && (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-200 shrink-0">
                    <Image
                      src={video.author.avatar}
                      alt={video.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="font-bold text-zinc-800 dark:text-zinc-200">
                    {video.author?.name || "Gündem360 Video Masası"}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {video.publishedAt}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-red-500" />
                      {video.duration || "03:45"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                  <Eye className="w-4 h-4 text-zinc-400" />
                  <span>{viewCount.toLocaleString("tr-TR")} Görüntülenme</span>
                </div>

                <a
                  href={video.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 font-bold"
                >
                  <YoutubeIcon className="w-4 h-4" />
                  <span>YouTube&apos;da İzle</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Video Açıklaması */}
            {video.description && (
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Video Detayı
                </h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {video.description}
                </p>
              </div>
            )}

            {/* Etiketler */}
            {video.tags && video.tags.length > 0 && (
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-1.5">
                {video.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SAĞ: İlgili & Sıradaki Videolar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-red-600 pb-2">
            <h2 className="text-base font-black uppercase text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <Film className="w-4 h-4 text-red-600" />
              <span>Sıradaki Videolar</span>
            </h2>
            <Link
              href="/video-galeri"
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-0.5"
            >
              <span>Tümü</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {relatedVideos.map((item) => (
              <Link
                key={item.id}
                href={`/video-galeri/${item.slug}`}
                className="group flex gap-3 p-2.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs transition-all"
              >
                {/* Thumbnail */}
                <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                  <Image
                    src={item.thumbnailUrl || `https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md">
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 px-1 py-0.2 text-[9px] font-bold bg-black/80 text-white rounded">
                    {item.duration || "03:45"}
                  </span>
                </div>

                {/* Metin */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider text-white px-1.5 py-0.5 rounded ${
                        item.categoryBadgeColor || "bg-red-600"
                      }`}
                    >
                      {item.categoryTitle || item.category}
                    </span>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-2 mt-1 leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1">
                    <span>{item.publishedAt}</span>
                    <div className="flex items-center gap-1">
                      <Eye className="w-2.5 h-2.5" />
                      <span>{item.viewCount?.toLocaleString("tr-TR")}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Video Galerisine Dön Butonu */}
          <Link
            href="/video-galeri"
            className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tüm Video Galerisini Keşfet</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
