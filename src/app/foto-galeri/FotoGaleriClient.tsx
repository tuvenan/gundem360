"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Search,
  Eye,
  Calendar,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Layers,
  ArrowRight,
  LayoutGrid,
  Maximize2,
  X,
  ExternalLink,
} from "lucide-react";
import { PhotoGallery, GalleryCategory } from "@/types/news";

interface Props {
  initialGalleries: PhotoGallery[];
  categories: GalleryCategory[];
}

export default function FotoGaleriClient({ initialGalleries, categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [layoutMode, setLayoutMode] = useState<"masonry" | "grid">("masonry");

  // Lightbox Modal State
  const [activeLightboxGallery, setActiveLightboxGallery] = useState<PhotoGallery | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const filtered = initialGalleries.filter((g) => {
    const matchesCat = selectedCategory === "all" || g.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      g.title.toLowerCase().includes(query) ||
      (g.spot && g.spot.toLowerCase().includes(query)) ||
      (g.tags && g.tags.some((t) => t.toLowerCase().includes(query)));
    return matchesCat && matchesQuery;
  });

  const featuredGallery = filtered.length > 0 ? filtered[0] : null;
  const gridGalleries = filtered.length > 0 ? filtered.slice(1) : [];

  // Klavye Yön Tuşları ile Lightbox Gezinmesi
  useEffect(() => {
    if (!activeLightboxGallery) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const slides = activeLightboxGallery.slides || [];
      if (slides.length === 0) return;

      if (e.key === "ArrowRight") {
        setActiveSlideIndex((prev) => (prev + 1 >= slides.length ? 0 : prev + 1));
      } else if (e.key === "ArrowLeft") {
        setActiveSlideIndex((prev) => (prev - 1 < 0 ? slides.length - 1 : prev - 1));
      } else if (e.key === "Escape") {
        setActiveLightboxGallery(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeLightboxGallery]);

  const openLightbox = (gallery: PhotoGallery, slideIdx = 0) => {
    setActiveLightboxGallery(gallery);
    setActiveSlideIndex(slideIdx);
  };

  const activeSlide =
    activeLightboxGallery?.slides && activeLightboxGallery.slides.length > 0
      ? activeLightboxGallery.slides[activeSlideIndex] || activeLightboxGallery.slides[0]
      : null;

  return (
    <div className="space-y-8">
      {/* 1. HERO BAŞLIK ALANI */}
      <div className="relative rounded-3xl overflow-hidden bg-zinc-950 text-white p-6 sm:p-10 border border-zinc-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold mb-4">
            <Camera className="w-3.5 h-3.5" />
            <span>FOTO GALERİ ARŞİVİ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Görsel Dünyanın <span className="text-red-500">En Çarpıcı</span> Kareleri
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-3 leading-relaxed">
            Türkiye ve dünyada öne çıkan son dakika olayları, kültür sanat sergileri, spor zaferleri ve doğanın büyüleyici anlarını yüksek çözünürlüklü fotoğraf serileriyle keşfedin.
          </p>
        </div>

        {/* ARAMA VE KATEGORİ SEKMELERİ */}
        <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          {/* Arama Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Galeri veya konu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700/80 text-white focus:outline-hidden focus:ring-2 focus:ring-red-500 placeholder-zinc-500"
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
              Tümü ({initialGalleries.length})
            </button>
            {categories.map((cat) => {
              const count = initialGalleries.filter((g) => g.category === cat.key).length;
              if (count === 0 && selectedCategory !== cat.key) return null;
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cat.badgeColor || "bg-red-600"}`} />
                  <span>{cat.name}</span>
                  <span className="opacity-60 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. EĞER GALERİ BULUNAMAZSA */}
      {filtered.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <Camera className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Aradığınız kriterde galeri bulunamadı</h3>
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

      {/* 3. ÖNE ÇIKAN BÜYÜK GALERİ KARTI */}
      {featuredGallery && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Görsel & Lightbox Aç Butonu */}
            <div
              onClick={() => openLightbox(featuredGallery, 0)}
              className="lg:col-span-7 relative aspect-16/10 lg:aspect-auto lg:h-[420px] w-full overflow-hidden bg-zinc-950 cursor-pointer"
            >
              <Image
                src={featuredGallery.coverImage}
                alt={featuredGallery.title}
                fill
                loading="lazy"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />

              {/* Hızlı Lightbox İpucu Rozeti */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="px-4 py-2 rounded-2xl bg-black/80 text-white text-xs font-black backdrop-blur-md flex items-center gap-2 border border-white/20 shadow-xl">
                  <Maximize2 className="w-4 h-4 text-red-400" />
                  <span>Tam Ekran Lightbox Aç</span>
                </span>
              </div>

              {/* Slayt Sayısı */}
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/20">
                <Camera className="w-4 h-4 text-red-500" />
                <span>{featuredGallery.slides?.length || 0} Fotoğraf</span>
              </div>

              {/* Kategori */}
              <div
                className={`absolute top-4 left-4 text-white text-[11px] font-extrabold px-3 py-1 rounded-md uppercase tracking-wider shadow-md ${
                  featuredGallery.categoryBadgeColor || "bg-red-600"
                }`}
              >
                {featuredGallery.categoryTitle || featuredGallery.category}
              </div>
            </div>

            {/* Metin & Aksiyon */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-3 text-xs text-zinc-400 mb-2.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{featuredGallery.publishedAt}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{featuredGallery.viewCount?.toLocaleString("tr-TR")} Görüntülenme</span>
                  </span>
                </div>

                <Link href={`/foto-galeri/${featuredGallery.slug}`}>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition leading-snug">
                    {featuredGallery.title}
                  </h2>
                </Link>

                {featuredGallery.spot && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-3 leading-relaxed line-clamp-3">
                    {featuredGallery.spot}
                  </p>
                )}

                {/* Slayt Küçük Görselleri (Tıklanınca Lightbox O Slaytta Açılır) */}
                {featuredGallery.slides && featuredGallery.slides.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 overflow-hidden">
                    {featuredGallery.slides.slice(0, 4).map((s, idx) => (
                      <div
                        key={s.id || idx}
                        onClick={() => openLightbox(featuredGallery, idx)}
                        className="relative w-14 h-10 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 cursor-pointer hover:scale-105 transition"
                        title={s.title || `Fotoğraf ${idx + 1}`}
                      >
                        <Image src={s.imageUrl} alt={s.title || ""} fill loading="lazy" className="object-cover" />
                      </div>
                    ))}
                    {featuredGallery.slides.length > 4 && (
                      <span
                        onClick={() => openLightbox(featuredGallery, 4)}
                        className="text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-2 rounded-lg cursor-pointer hover:bg-zinc-200"
                      >
                        +{featuredGallery.slides.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">
                  {featuredGallery.author?.name}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openLightbox(featuredGallery, 0)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Hızlı Lightbox</span>
                  </button>
                  <Link
                    href={`/foto-galeri/${featuredGallery.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md shadow-red-600/20 group-hover:translate-x-1 duration-200"
                  >
                    <span>Galeriyi İncele</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TÜM GALERİLER LİSTESİ & MASONRY / GRID DÜZENİ */}
      {gridGalleries.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-red-600 pb-2">
            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-600" />
              <span>Diğer Foto Galeriler</span>
            </h3>

            {/* Masonry vs Grid Görünüm Seçici */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 hidden sm:inline">
                {gridGalleries.length} galeri listeleniyor
              </span>
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <button
                  onClick={() => setLayoutMode("masonry")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    layoutMode === "masonry"
                      ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                  title="Masonry (Tuğla) Düzeni"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Masonry (Tuğla)</span>
                </button>
                <button
                  onClick={() => setLayoutMode("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    layoutMode === "grid"
                      ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                  title="Standart Grid Düzeni"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Kare Grid</span>
                </button>
              </div>
            </div>
          </div>

          {/* DÜZEN ALANI: MASONRY VEYA GRID */}
          <div
            className={
              layoutMode === "masonry"
                ? "columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            }
          >
            {gridGalleries.map((gallery) => {
              const slideCount = gallery.slides?.length || 0;
              return (
                <div
                  key={gallery.id}
                  className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between group ${
                    layoutMode === "masonry" ? "break-inside-avoid mb-6" : ""
                  }`}
                >
                  <div>
                    {/* Görsel & Rozetler & Lightbox Tetikleyici */}
                    <div
                      onClick={() => openLightbox(gallery, 0)}
                      className="relative aspect-16/10 w-full overflow-hidden bg-zinc-800 cursor-pointer"
                    >
                      <Image
                        src={gallery.coverImage || "/placeholder-news.jpg"}
                        alt={gallery.title}
                        fill
                        loading="lazy"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                      {/* Hover Lightbox Butonu */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3.5 py-1.5 rounded-xl bg-black/80 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5 border border-white/20 shadow-lg">
                          <Maximize2 className="w-3.5 h-3.5 text-red-400" />
                          <span>Lightbox İncele</span>
                        </span>
                      </div>

                      {/* Slayt Sayısı */}
                      <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
                        <Camera className="w-3.5 h-3.5 text-red-400" />
                        <span>{slideCount} Fotoğraf</span>
                      </div>

                      {/* Kategori */}
                      <div
                        className={`absolute top-3 left-3 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs ${
                          gallery.categoryBadgeColor || "bg-red-600"
                        }`}
                      >
                        {gallery.categoryTitle || gallery.category}
                      </div>

                      {/* Görüntülenme */}
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{gallery.viewCount?.toLocaleString("tr-TR") || 0}</span>
                      </div>
                    </div>

                    {/* Metin */}
                    <div className="p-5">
                      <p className="text-[11px] font-medium text-zinc-400 mb-1.5">
                        {gallery.publishedAt}
                      </p>
                      <Link href={`/foto-galeri/${gallery.slug}`}>
                        <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-2 leading-snug">
                          {gallery.title}
                        </h4>
                      </Link>
                      {gallery.spot && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                          {gallery.spot}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Alt Bilgi */}
                  <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                    <span>{gallery.author?.name || "Görsel Servisi"}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openLightbox(gallery, 0)}
                        className="text-xs font-semibold text-zinc-400 hover:text-red-600 transition flex items-center gap-1 cursor-pointer"
                        title="Tam Ekran Lightbox Aç"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/foto-galeri/${gallery.slug}`}
                        className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        Galeriyi Aç
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TAM EKRAN LIGHTBOX MODAL */}
      {activeLightboxGallery && activeSlide && (
        <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200">
          {/* Lightbox Üst Bar */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 text-white shrink-0 z-20">
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <span
                className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0 ${
                  activeLightboxGallery.categoryBadgeColor || "bg-red-600"
                }`}
              >
                {activeLightboxGallery.categoryTitle || activeLightboxGallery.category}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-200 truncate">
                {activeLightboxGallery.title}
              </h3>
              <span className="text-xs font-black text-red-400 bg-red-950/60 border border-red-900/60 px-2.5 py-0.5 rounded-full shrink-0">
                {activeSlideIndex + 1} / {activeLightboxGallery.slides?.length || 0}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/foto-galeri/${activeLightboxGallery.slug}`}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition"
              >
                <span>Galeri Sayfası</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setActiveLightboxGallery(null)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition cursor-pointer"
                title="Kapat (Escape)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Orta Görsel Alanı */}
          <div className="relative flex-1 w-full flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center max-w-6xl max-h-[75vh]">
              <Image
                src={activeSlide.imageUrl}
                alt={activeSlide.title || `${activeLightboxGallery.title} - Fotoğraf ${activeSlideIndex + 1}`}
                fill
                loading="lazy"
                className="object-contain"
              />
            </div>

            {/* Sol & Sağ Gezinme Butonları */}
            <button
              type="button"
              onClick={() =>
                setActiveSlideIndex((prev) =>
                  prev - 1 < 0 ? (activeLightboxGallery.slides?.length || 1) - 1 : prev - 1
                )
              }
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/70 hover:bg-black/95 text-white border border-white/20 backdrop-blur-md transition hover:scale-110 cursor-pointer shadow-2xl z-20"
              title="Önceki Fotoğraf (Sol Ok Tuşu)"
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSlideIndex((prev) =>
                  prev + 1 >= (activeLightboxGallery.slides?.length || 1) ? 0 : prev + 1
                )
              }
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/70 hover:bg-black/95 text-white border border-white/20 backdrop-blur-md transition hover:scale-110 cursor-pointer shadow-2xl z-20"
              title="Sonraki Fotoğraf (Sağ Ok Tuşu)"
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>

          {/* Lightbox Alt Bilgi Sayfası (Title, Caption & Filmstrip) */}
          <div className="border-t border-zinc-800/80 bg-zinc-950/90 text-white p-4 sm:p-5 shrink-0 z-20 space-y-3">
            <div className="max-w-4xl mx-auto space-y-1 text-center sm:text-left">
              {activeSlide.title && (
                <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                  {activeSlide.title}
                </h4>
              )}
              {activeSlide.caption && (
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal line-clamp-2">
                  {activeSlide.caption}
                </p>
              )}
            </div>

            {/* Filmstrip (Küçük Görsel Şeridi) */}
            <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-center">
              {activeLightboxGallery.slides?.map((s, idx) => (
                <button
                  key={s.id || idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`relative w-14 h-9 sm:w-16 sm:h-10 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                    idx === activeSlideIndex
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
