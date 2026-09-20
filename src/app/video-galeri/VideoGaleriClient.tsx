"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Eye,
  Calendar,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Play,
  Clock,
  ArrowRight,
  Film,
  Tag,
  X,
  Share2,
  Check,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { YoutubeIcon } from "@/components/icons/YoutubeIcon";
import { VideoItem, VideoCategory } from "@/types/news";

interface Props {
  initialVideos: VideoItem[];
  categories: VideoCategory[];
}

export default function VideoGaleriClient({ initialVideos, categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Lightbox Modal State
  const [activeLightboxVideo, setActiveLightboxVideo] = useState<VideoItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // ESC tuşu ve scroll engelleme
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveLightboxVideo(null);
      }
    };
    if (activeLightboxVideo) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeLightboxVideo]);

  const filtered = initialVideos.filter((v) => {
    const matchesCat = selectedCategory === "all" || v.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      v.title.toLowerCase().includes(query) ||
      (v.description && v.description.toLowerCase().includes(query)) ||
      (v.youtubeId && v.youtubeId.toLowerCase().includes(query)) ||
      (v.tags && v.tags.some((t) => t.toLowerCase().includes(query)));
    return matchesCat && matchesQuery;
  });

  const featuredVideo = filtered.length > 0 ? (filtered.find((v) => v.isFeatured) || filtered[0]) : null;
  const gridVideos = featuredVideo
    ? filtered.filter((v) => v.id !== featuredVideo.id)
    : filtered;

  const handlePrevVideo = () => {
    if (!activeLightboxVideo || filtered.length <= 1) return;
    const currentIndex = filtered.findIndex((v) => v.id === activeLightboxVideo.id);
    if (currentIndex > 0) {
      setActiveLightboxVideo(filtered[currentIndex - 1]);
    } else {
      setActiveLightboxVideo(filtered[filtered.length - 1]);
    }
  };

  const handleNextVideo = () => {
    if (!activeLightboxVideo || filtered.length <= 1) return;
    const currentIndex = filtered.findIndex((v) => v.id === activeLightboxVideo.id);
    if (currentIndex < filtered.length - 1) {
      setActiveLightboxVideo(filtered[currentIndex + 1]);
    } else {
      setActiveLightboxVideo(filtered[0]);
    }
  };

  const handleCopyShareLink = (slug: string) => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/video-galeri/${slug}` : "";
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. HERO BAŞLIK VE FİLTRE ALANI */}
      <div className="relative rounded-3xl overflow-hidden bg-zinc-950 text-white p-6 sm:p-10 border border-zinc-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/20 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-rose-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold mb-4">
            <YoutubeIcon className="w-4 h-4 text-red-500" />
            <span>VİDEO HABER ARŞİVİ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Gündemin Nabzı <span className="text-red-500">Videolarla</span> Parmaklarınızın Ucunda
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-3 leading-relaxed">
            Türkiye ve dünyada öne çıkan sıcak gelişmeler, özel röportajlar, teknoloji analizleri, belgeseller ve spor zaferlerinin kamera arkası görüntüleri.
          </p>
        </div>

        {/* ARAMA VE KATEGORİ SEKMELERİ */}
        <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          {/* Arama Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Video veya etiket ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700/80 text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-zinc-500"
            />
          </div>

          {/* Kategori Butonları */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              Tümü ({initialVideos.length})
            </button>
            {categories.map((cat) => {
              const count = initialVideos.filter((v) => v.category === cat.slug).length;
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cat.color || "bg-red-600"}`} />
                  <span>{cat.name}</span>
                  <span className="opacity-60 text-[10px]">({count})</span>
                </button>
              );
            })}
            {initialVideos.some((v) => v.category === "kategorisiz") && (
              <button
                onClick={() => setSelectedCategory("kategorisiz")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === "kategorisiz"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                <span>Kategorisiz</span>
                <span className="opacity-60 text-[10px]">
                  ({initialVideos.filter((v) => v.category === "kategorisiz").length})
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. BOŞ DURUM */}
      {filtered.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <YoutubeIcon className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            Aradığınız kriterde video bulunamadı
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Farklı bir arama terimi deneyebilir ya da kategori filtresini sıfırlayabilirsiniz.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold transition cursor-pointer"
          >
            Filtreleri Sıfırla
          </button>
        </div>
      )}

      {/* 3. ÖNE ÇIKAN BÜYÜK VİDEO KARTI */}
      {featuredVideo && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Thumbnail + Play Butonu */}
            <div className="lg:col-span-7 relative aspect-video lg:aspect-auto lg:h-[420px] w-full overflow-hidden bg-black">
              <Image
                src={featuredVideo.thumbnailUrl || `https://img.youtube.com/vi/${featuredVideo.youtubeId}/maxresdefault.jpg`}
                alt={featuredVideo.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Play Butonu */}
              <button
                type="button"
                onClick={() => setActiveLightboxVideo(featuredVideo)}
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
              >
                <div className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-9 h-9 fill-white ml-1.5" />
                </div>
              </button>

              {/* Kategori Rozeti */}
              <div
                className={`absolute top-4 left-4 text-white text-[11px] font-extrabold px-3 py-1 rounded-md uppercase tracking-wider shadow-md ${
                  featuredVideo.categoryBadgeColor || "bg-red-600"
                }`}
              >
                {featuredVideo.categoryTitle || featuredVideo.category}
              </div>

              {/* Süre Rozeti */}
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/20">
                <Clock className="w-4 h-4 text-red-500" />
                <span>{featuredVideo.duration || "03:45"}</span>
              </div>

              {/* İzlenme */}
              <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/20">
                <Eye className="w-4 h-4 text-zinc-300" />
                <span>{featuredVideo.viewCount?.toLocaleString("tr-TR")} izlenme</span>
              </div>
            </div>

            {/* Metin & Aksiyon */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-3 text-xs text-zinc-400 mb-2.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{featuredVideo.publishedAt}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
                    {featuredVideo.author?.name || "Video Masası"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveLightboxVideo(featuredVideo)}
                  className="text-left cursor-pointer group/title"
                >
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 group-hover/title:text-red-600 dark:group-hover/title:text-red-400 transition leading-snug">
                    {featuredVideo.title}
                  </h2>
                </button>

                {featuredVideo.description && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-3 leading-relaxed line-clamp-3">
                    {featuredVideo.description}
                  </p>
                )}

                {/* Etiketler */}
                {featuredVideo.tags && featuredVideo.tags.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-1.5">
                    {featuredVideo.tags.slice(0, 5).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2.5 py-1 rounded-lg font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-mono">
                  YouTube: {featuredVideo.youtubeId}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/video-galeri/${featuredVideo.slug}`}
                    className="p-2.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                    title="Ayrıntılı Sayfa"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setActiveLightboxVideo(featuredVideo)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md shadow-red-600/20 group-hover:translate-x-1 duration-200 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Videoyu İzle</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TÜM VİDEOLAR GRID LİSTESİ */}
      {gridVideos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-red-600 pb-2">
            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight flex items-center gap-2">
              <Film className="w-4 h-4 text-red-600" />
              <span>Diğer Videolar</span>
            </h3>
            <span className="text-xs font-medium text-zinc-500">
              {gridVideos.length} video listeleniyor
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridVideos.map((video) => {
              const catObj = categories.find((c) => c.slug === video.category);
              const badgeColor = catObj?.color || video.categoryBadgeColor || "bg-red-600";
              const catTitle = catObj?.name || video.categoryTitle || video.category;

              return (
                <div
                  key={video.id}
                  onClick={() => setActiveLightboxVideo(video)}
                  className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Thumbnail + Play Butonu */}
                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                      <Image
                        src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />

                      {/* Play Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>

                      {/* Kategori */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-md ${badgeColor}`}
                        >
                          {catTitle}
                        </span>
                      </div>

                      {/* Süre */}
                      <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
                        <Clock className="w-3 h-3 text-red-500" />
                        <span>{video.duration || "03:45"}</span>
                      </div>
                    </div>

                    {/* Metin Detayı */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <span>{video.publishedAt}</span>
                        <span>•</span>
                        <span>{video.author?.name || "Video Masası"}</span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-2 leading-snug">
                        {video.title}
                      </h4>

                      {video.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Alt Bilgi */}
                  <div className="p-4 pt-0">
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{video.viewCount?.toLocaleString("tr-TR")} izlenme</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/video-galeri/${video.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                          title="Ayrıntılı Sayfa"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <span className="text-red-600 dark:text-red-400 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                          İzle <Play className="w-3 h-3 fill-current ml-0.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. SİNEMATİK LIGHTBOX / POPUP VİDEO MODALI (AUTOPLAY=1) */}
      {activeLightboxVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveLightboxVideo(null);
          }}
        >
          <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/60">
              <div className="flex items-center gap-2.5 min-w-0 pr-4">
                <span
                  className={`text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                    activeLightboxVideo.categoryBadgeColor || "bg-red-600"
                  }`}
                >
                  {activeLightboxVideo.categoryTitle || activeLightboxVideo.category}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                  {activeLightboxVideo.title}
                </h3>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Previous Video */}
                <button
                  type="button"
                  onClick={handlePrevVideo}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                  title="Önceki Video"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {/* Next Video */}
                <button
                  type="button"
                  onClick={handleNextVideo}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                  title="Sonraki Video"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setActiveLightboxVideo(null)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-red-600/80 rounded-lg transition-colors ml-2 cursor-pointer"
                  title="Kapat (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 16:9 Responsive YouTube Iframe with autoplay=1 */}
            <div className="relative aspect-video w-full bg-black shrink-0">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeLightboxVideo.youtubeId}?autoplay=1&rel=0`}
                title={activeLightboxVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Video Bilgileri & Aksiyonlar */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-zinc-950 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-base sm:text-xl font-black text-white">
                    {activeLightboxVideo.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {activeLightboxVideo.publishedAt}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-zinc-300">
                      {activeLightboxVideo.author?.name || "Video Masası"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-red-500" />
                      {activeLightboxVideo.duration || "03:45"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-zinc-400" />
                      {activeLightboxVideo.viewCount?.toLocaleString("tr-TR")} izlenme
                    </span>
                  </div>
                </div>

                {/* Sosyal Paylaşım Butonları & Detay Sayfası */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      activeLightboxVideo.title + " " + (typeof window !== "undefined" ? window.location.origin : "") + "/video-galeri/" + activeLightboxVideo.slug
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 transition-colors"
                    title="WhatsApp'ta Paylaş"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  {/* Twitter / X */}
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      activeLightboxVideo.title
                    )}&url=${encodeURIComponent(
                      (typeof window !== "undefined" ? window.location.origin : "") + "/video-galeri/" + activeLightboxVideo.slug
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
                    title="X (Twitter)'da Paylaş"
                  >
                    <Share2 className="w-4 h-4" />
                  </a>

                  {/* Link Kopyala */}
                  <button
                    type="button"
                    onClick={() => handleCopyShareLink(activeLightboxVideo.slug)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    <span>{copiedLink ? "Kopyalandı!" : "Linki Kopyala"}</span>
                  </button>

                  {/* Detay Sayfasına Git */}
                  <Link
                    href={`/video-galeri/${activeLightboxVideo.slug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-colors"
                  >
                    <span>Detay Sayfası</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Açıklama Metni */}
              {activeLightboxVideo.description && (
                <div className="pt-3 border-t border-zinc-800/80 text-sm text-zinc-300 leading-relaxed space-y-2">
                  {activeLightboxVideo.description.includes("<") ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: activeLightboxVideo.description }}
                      className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-red-400"
                    />
                  ) : (
                    <p>{activeLightboxVideo.description}</p>
                  )}
                </div>
              )}

              {/* Etiketler */}
              {activeLightboxVideo.tags && activeLightboxVideo.tags.length > 0 && (
                <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-zinc-500 font-medium mr-1">Etiketler:</span>
                  {activeLightboxVideo.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-lg"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
