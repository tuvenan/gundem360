"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Share2,
  Check,
  Eye,
  Calendar,
  Grid,
  List,
  Sliders,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  X,
  Layers,
} from "lucide-react";
import { PhotoGallery, GallerySlide } from "@/types/news";

interface Props {
  gallery: PhotoGallery;
  relatedGalleries: PhotoGallery[];
}

export default function PhotoGalleryViewer({ gallery, relatedGalleries }: Props) {
  const slides = gallery.slides || [];
  const totalSlides = slides.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"slider" | "masonry" | "list">("slider");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Görüntülenme sayısını artır (istemci tarafında bir kere çağrılır)
  useEffect(() => {
    fetch(`/api/galleries?slug=${gallery.slug}&increment=true`).catch(() => {});
  }, [gallery.slug]);

  // Sonraki / Önceki Slayt Fonksiyonları
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1 >= totalSlides ? 0 : prev + 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 < 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  // Klavye Ok Tuşları ile Geçiş
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === "slider" || isLightboxOpen || isFullscreen) {
        if (e.key === "ArrowRight") {
          nextSlide();
        } else if (e.key === "ArrowLeft") {
          prevSlide();
        } else if (e.key === "Escape") {
          setIsFullscreen(false);
          setIsLightboxOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, viewMode, isFullscreen, isLightboxOpen]);

  // Otomatik Oynatma (Autoplay / Slideshow)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && viewMode === "slider") {
      timer = setInterval(() => {
        nextSlide();
      }, 4000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, nextSlide, viewMode]);

  // Aktif thumbnail'ı görünür alana kaydır
  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.children[currentIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [currentIndex]);

  // Link Kopyalama
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // WhatsApp Paylaş
  const shareOnWhatsApp = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`${gallery.title}\n\n${gallery.spot || ""}\n`);
      window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, "_blank");
    }
  };

  // Twitter / X Paylaş
  const shareOnTwitter = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`${gallery.title} - Gündem360`);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    }
  };

  // Facebook Paylaş
  const shareOnFacebook = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    }
  };

  const currentSlide = slides[currentIndex] || slides[0];
  const progressPercent = totalSlides > 0 ? ((currentIndex + 1) / totalSlides) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* 1. ÜST EKMEK KIRINTISI (BREADCRUMB) & GERİ DÖNÜŞ */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-red-600 transition">
            Ana Sayfa
          </Link>
          <span>/</span>
          <Link href="/foto-galeri" className="hover:text-red-600 transition">
            Foto Galeri
          </Link>
          <span>/</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-semibold truncate max-w-xs sm:max-w-md">
            {gallery.categoryTitle || gallery.category}
          </span>
        </div>

        <Link
          href="/foto-galeri"
          className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tüm Galerilere Dön</span>
        </Link>
      </div>

      {/* 2. BAŞLIK VE META ALANI */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`text-white text-[11px] font-extrabold px-3 py-1 rounded-md uppercase tracking-wider shadow-sm ${
              gallery.categoryBadgeColor || "bg-red-600"
            }`}
          >
            {gallery.categoryTitle || gallery.category}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {gallery.publishedAt}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {gallery.viewCount?.toLocaleString("tr-TR")} Görüntülenme
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Camera className="w-3.5 h-3.5" />
            {totalSlides} Fotoğraf
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
          {gallery.title}
        </h1>

        {gallery.spot && (
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 mt-3.5 leading-relaxed font-normal">
            {gallery.spot}
          </p>
        )}

        {/* Yazar & Paylaşım & Mod Değiştirici Barı */}
        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Yazar */}
          <div className="flex items-center gap-3">
            {gallery.author?.avatar ? (
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
                <Image
                  src={gallery.author.avatar}
                  alt={gallery.author.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center font-bold text-xs">
                {gallery.author?.name?.charAt(0) || "G"}
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {gallery.author?.name || "Görsel Servisi"}
              </p>
              <p className="text-[11px] text-zinc-400">Foto Galeri & Görsel Masası</p>
            </div>
          </div>

          {/* Sağ: Görünüm Modu ve Paylaşım */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Görünüm Modu Değiştirici (Slayt vs Masonry vs Liste) */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => setViewMode("slider")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "slider"
                    ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Slayt</span>
              </button>
              <button
                onClick={() => setViewMode("masonry")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "masonry"
                    ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tuğla (Masonry)</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Liste</span>
              </button>
            </div>

            {/* Paylaşım Butonları */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={shareOnWhatsApp}
                className="w-8 h-8 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center transition shadow-xs cursor-pointer"
                title="WhatsApp'ta Paylaş"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
              </button>
              <button
                onClick={shareOnTwitter}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-black text-white flex items-center justify-center transition shadow-xs cursor-pointer"
                title="X / Twitter'da Paylaş"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                title="Linki Kopyala"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? "Kopyalandı" : "Paylaş"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. İÇERİK: SLIDER MODU VEYA LİSTE MODU */}
      {viewMode === "slider" ? (
        /* =================== SLIDER MODU =================== */
        <div
          className={`space-y-4 ${
            isFullscreen
              ? "fixed inset-0 z-50 bg-zinc-950 p-4 sm:p-8 flex flex-col justify-between overflow-y-auto"
              : ""
          }`}
        >
          {/* İlerleme Çubuğu & Üst Sayaç Barı */}
          <div className="bg-zinc-950 text-white rounded-2xl p-4 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-black tracking-wider">
                {currentIndex + 1} / {totalSlides}
              </span>
              <span className="text-xs text-zinc-300 font-medium hidden sm:inline">
                {currentSlide?.title || gallery.title}
              </span>
            </div>

            {/* Kontroller: Oynat/Duraklat, Tam Ekran, Kapat */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  isPlaying
                    ? "bg-amber-500 text-black shadow-xs"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                }`}
                title={isPlaying ? "Durdur" : "Otomatik Oynat"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? "Durdur" : "Slayt Gösterisi"}</span>
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* İlerleme Çizgisi (Progress Bar) */}
          <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Ana Slayt Görsel Alanı */}
          <div className="relative aspect-16/10 md:aspect-16/9 w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 group select-none">
            {currentSlide && (
              <Image
                src={currentSlide.imageUrl}
                alt={currentSlide.title || `${gallery.title} - ${currentIndex + 1}`}
                fill
                priority
                className="object-contain transition-opacity duration-300"
              />
            )}

            {/* Sol & Sağ Yönlendirme Butonları (Görsel Üzeri) */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all duration-200 opacity-90 group-hover:opacity-100 hover:scale-110 cursor-pointer shadow-xl"
              title="Önceki Fotoğraf (Sol Ok Tuşu)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all duration-200 opacity-90 group-hover:opacity-100 hover:scale-110 cursor-pointer shadow-xl"
              title="Sonraki Fotoğraf (Sağ Ok Tuşu)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Fotoğraf Başlığı ve Açıklaması (Altyazı Kartı) */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                <Camera className="w-4 h-4" />
                <span>Fotoğraf #{currentIndex + 1} / {totalSlides}</span>
              </div>

              {/* Alt Hızlı Butonlar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSlide}
                  className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Önceki</span>
                </button>
                <button
                  onClick={nextSlide}
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs shadow-red-600/20 cursor-pointer"
                >
                  <span>Sonraki</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {currentSlide?.title && (
              <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white leading-snug">
                {currentSlide.title}
              </h3>
            )}

            <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
              {currentSlide?.caption || gallery.spot}
            </p>
          </div>

          {/* Filmstrip (Küçük Görsel Şeridi - Thumbnails) */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
              Tüm Fotoğraflar ({totalSlides})
            </p>
            <div
              ref={thumbnailsRef}
              className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none select-none"
            >
              {slides.map((s, idx) => {
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={s.id || idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative w-20 sm:w-24 aspect-16/10 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 cursor-pointer ${
                      isCurrent
                        ? "border-red-600 scale-105 shadow-md shadow-red-600/30 ring-2 ring-red-600/40"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={s.imageUrl} alt={s.title || ""} fill className="object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white font-bold px-1.5 py-0.2 rounded-md">
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : viewMode === "masonry" ? (
        /* =================== MASONRY (TUĞLA) DÜZENİ =================== */
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-red-500 shrink-0" />
              <span>Tuğla (Masonry) dizilimindesiniz. Herhangi bir fotoğrafa tıklayarak <strong>Tam Ekran Lightbox</strong> modunda inceleyebilirsiniz.</span>
            </span>
            <span className="text-[11px] font-bold text-zinc-400 shrink-0">
              {totalSlides} Fotoğraf
            </span>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {slides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsLightboxOpen(true);
                }}
                className="break-inside-avoid mb-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-red-500/50 transition-all duration-300 cursor-pointer group"
              >
                <div className="relative aspect-16/10 w-full overflow-hidden bg-black">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title || `${gallery.title} - ${idx + 1}`}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3.5 py-1.5 rounded-xl bg-black/80 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5 border border-white/20 shadow-lg">
                      <Maximize2 className="w-3.5 h-3.5 text-red-400" />
                      <span>Tam Ekran İncele</span>
                    </span>
                  </div>
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md shadow-md">
                    #{idx + 1}
                  </div>
                </div>

                <div className="p-4 space-y-1.5">
                  {slide.title && (
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-1">
                      {slide.title}
                    </h4>
                  )}
                  {slide.caption && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {slide.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* =================== LİSTE MODU (GAZETE / DİKEY AKIŞ) =================== */
        <div className="space-y-8">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center justify-between">
            <span>
              Gazete dikey akış modundasınız. Tüm fotoğrafları ve detaylı açıklamaları aşağıya kaydırarak okuyabilirsiniz.
            </span>
            <button
              onClick={() => setViewMode("slider")}
              className="px-3 py-1 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition"
            >
              Slayt Moduna Geç
            </button>
          </div>

          <div className="space-y-8">
            {slides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                id={`slide-item-${idx + 1}`}
                className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300"
              >
                {/* Fotoğraf */}
                <div className="relative aspect-16/10 md:aspect-16/9 w-full bg-black overflow-hidden">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title || `${gallery.title} - ${idx + 1}`}
                    fill
                    className="object-contain"
                  />
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Fotoğraf {idx + 1} / {totalSlides}</span>
                  </div>
                </div>

                {/* Açıklama & Başlık */}
                <div className="p-6 sm:p-8 space-y-3">
                  {slide.title && (
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white leading-snug">
                      {slide.title}
                    </h3>
                  )}
                  <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {slide.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ETİKETLER */}
      {gallery.tags && gallery.tags.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-2">
            Etiketler:
          </span>
          {gallery.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded-xl"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 5. İLGİNİZİ ÇEKEBİLECEK DİĞER GALERİLER */}
      {relatedGalleries.length > 0 && (
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-red-600 pb-2">
            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight flex items-center gap-2">
              <Camera className="w-4 h-4 text-red-600" />
              <span>Diğer Foto Galeriler</span>
            </h3>
            <Link
              href="/foto-galeri"
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
            >
              Tümünü Gör
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedGalleries.map((rel) => (
              <Link
                key={rel.id}
                href={`/foto-galeri/${rel.slug}`}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-xl transition group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-800">
                    <Image
                      src={rel.coverImage}
                      alt={rel.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                      <Camera className="w-3 h-3 text-red-400" />
                      <span>{rel.slides?.length || 0} Fotoğraf</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-red-500 uppercase">
                      {rel.categoryTitle || rel.category}
                    </span>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-2 mt-1">
                      {rel.title}
                    </h4>
                  </div>
                </div>
                <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>{rel.publishedAt}</span>
                  <span className="font-bold text-red-500 flex items-center gap-0.5">
                    İncele <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAM EKRAN LIGHTBOX MODAL */}
      {isLightboxOpen && currentSlide && (
        <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200">
          {/* Üst Bar */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 text-white shrink-0 z-20">
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <span
                className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0 ${
                  gallery.categoryBadgeColor || "bg-red-600"
                }`}
              >
                {gallery.categoryTitle || gallery.category}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-200 truncate">
                {gallery.title}
              </h3>
              <span className="text-xs font-black text-red-400 bg-red-950/60 border border-red-900/60 px-2.5 py-0.5 rounded-full shrink-0">
                {currentIndex + 1} / {totalSlides}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition cursor-pointer"
              title="Kapat (Escape)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Orta Görsel Alanı */}
          <div className="relative flex-1 w-full flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center max-w-6xl max-h-[75vh]">
              <Image
                src={currentSlide.imageUrl}
                alt={currentSlide.title || `${gallery.title} - ${currentIndex + 1}`}
                fill
                loading="lazy"
                className="object-contain"
              />
            </div>

            {/* Sol & Sağ Gezinme Butonları */}
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/70 hover:bg-black/95 text-white border border-white/20 backdrop-blur-md transition hover:scale-110 cursor-pointer shadow-2xl z-20"
              title="Önceki Fotoğraf (Sol Ok Tuşu)"
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/70 hover:bg-black/95 text-white border border-white/20 backdrop-blur-md transition hover:scale-110 cursor-pointer shadow-2xl z-20"
              title="Sonraki Fotoğraf (Sağ Ok Tuşu)"
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>

          {/* Alt Bilgi & Filmstrip */}
          <div className="border-t border-zinc-800/80 bg-zinc-950/90 text-white p-4 sm:p-5 shrink-0 z-20 space-y-3">
            <div className="max-w-4xl mx-auto space-y-1 text-center sm:text-left">
              {currentSlide.title && (
                <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                  {currentSlide.title}
                </h4>
              )}
              {currentSlide.caption && (
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal line-clamp-2">
                  {currentSlide.caption}
                </p>
              )}
            </div>

            {/* Filmstrip */}
            <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-center">
              {slides.map((s, idx) => (
                <button
                  key={s.id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-14 h-9 sm:w-16 sm:h-10 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                    idx === currentIndex
                      ? "border-red-500 scale-105 shadow-md shadow-red-600/40"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <Image src={s.imageUrl} alt={s.title || ""} fill loading="lazy" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
