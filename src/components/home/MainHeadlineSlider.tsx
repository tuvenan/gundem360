"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { NewsItem } from "@/types/news";
import { ChevronLeft, ChevronRight, Eye, Clock, Zap } from "lucide-react";
import NewsImageBadge from "@/components/common/NewsImageBadge";

interface MainHeadlineSliderProps {
  headlines: NewsItem[];
}

export default function MainHeadlineSlider({ headlines }: MainHeadlineSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  // 1-10 arası haberleri filtrele veya mevcut haberleri 10'a tamamla
  const validHeadlines = (headlines && headlines.length > 0 ? headlines : []).slice(0, 10);

  useEffect(() => {
    if (validHeadlines.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % validHeadlines.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [validHeadlines.length, isPaused]);

  if (validHeadlines.length === 0) return null;

  const current = validHeadlines[activeIndex] || validHeadlines[0];

  return (
    <div
      className="relative bg-zinc-950 rounded-xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. ANA MANŞET GÖRSELİ VE BAŞLIK ALANI */}
      <div className="relative w-full aspect-16/10 sm:aspect-16/9 lg:aspect-16/9 min-h-[360px] max-h-[500px] bg-zinc-900 overflow-hidden">
        {/* Görsel veya Fallback Zemin */}
        {!imgError[current.id] ? (
          <Image
            src={current.imageUrl}
            alt={current.title}
            fill
            priority
            unoptimized
            onError={() => setImgError((prev) => ({ ...prev, [current.id]: true }))}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-102"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-red-950 to-zinc-950 flex items-center justify-center p-8">
            <div className="text-center space-y-3 max-w-lg">
              <span className="bg-red-600 text-white font-black text-xs uppercase px-3 py-1 rounded">
                {current.categoryTitle}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {current.title}
              </h2>
            </div>
          </div>
        )}

        {/* Klasik Gazete Degradesi (Alt kısımda zengin okunabilirlik) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />

        {/* Üst Rozetler (Kategori, Özel Rozet ve Flaş) */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
          <span className="bg-red-600 text-white font-black text-xs uppercase px-3 py-1 rounded-sm shadow-md tracking-wider">
            {current.categoryTitle}
          </span>
          {current.imageBadgeText && (
            <NewsImageBadge
              text={current.imageBadgeText}
              color={current.imageBadgeColor}
              size="sm"
              position="relative"
            />
          )}
          {current.isBreaking && !current.imageBadgeText?.toUpperCase().includes("FLAŞ") && (
            <span className="bg-amber-500 text-black font-black text-xs uppercase px-2.5 py-1 rounded-sm shadow-md flex items-center gap-1 animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>FLAŞ HABER</span>
            </span>
          )}
        </div>

        {/* Klasik Manşet Başlık Bandı */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-7 space-y-2 z-10">
          <Link href={`/haber/${current.slug}`} className="block group/link">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-md group-hover/link:text-red-400 transition">
              {current.title}
            </h1>
          </Link>

          <p className="text-xs sm:text-sm text-zinc-200 line-clamp-2 max-w-3xl leading-relaxed drop-shadow-sm font-medium">
            {current.summary}
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-300 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              {current.publishedAt}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              {current.views.toLocaleString("tr-TR")} okunma
            </span>
          </div>
        </div>

        {/* Sol & Sağ Navigasyon Okları */}
        <button
          onClick={() => setActiveIndex((prev) => (prev - 1 + validHeadlines.length) % validHeadlines.length)}
          aria-label="Önceki manşet"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-red-600 text-white flex items-center justify-center backdrop-blur-xs transition opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setActiveIndex((prev) => (prev + 1) % validHeadlines.length)}
          aria-label="Sonraki manşet"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-red-600 text-white flex items-center justify-center backdrop-blur-xs transition opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* 2. KLASİK NUMARALI MANŞET ŞERİDİ (1'DEN 10'A) */}
      <div className="bg-zinc-950 border-t border-zinc-800 p-1">
        <div className="grid grid-flow-col auto-cols-fr gap-1 text-center">
          {validHeadlines.map((item, idx) => {
            const isActive = idx === activeIndex;

            return (
              <button
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                onMouseEnter={() => setActiveIndex(idx)}
                aria-label={`Manşet ${idx + 1}`}
                className={`relative py-2 px-1 rounded-sm transition flex flex-col items-center justify-center text-xs font-black select-none ${
                  isActive
                    ? "bg-red-600 text-white shadow-md z-10"
                    : "bg-zinc-900/90 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {/* Aktif olduğunda görselin içine uzanan klasik kırmızı işaretçi üçgen (▲) */}
                {isActive && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-red-600 pointer-events-none" />
                )}

                <span className="text-base sm:text-lg font-black font-mono leading-none">
                  {idx + 1}
                </span>

                <span className="hidden xl:inline-block text-[9px] uppercase font-bold truncate max-w-[85px] mt-0.5 opacity-90">
                  {item.categoryTitle}
                </span>

                {/* Otomatik geçiş için ince ilerleme çizgisi */}
                {isActive && !isPaused && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/70 animate-[pulse_5.5s_linear]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
