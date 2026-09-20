"use client";

import { useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/common/SafeImage";
import { NewsItem } from "@/types/news";
import { Flame, TrendingUp, Clock, Eye } from "lucide-react";
import NewsImageBadge from "@/components/common/NewsImageBadge";

interface HeroSideHeadlinesProps {
  sideNews: NewsItem[];
  popularNews: NewsItem[];
}

export default function HeroSideHeadlines({
  sideNews,
  popularNews,
}: HeroSideHeadlinesProps) {
  const [tab, setTab] = useState<"side" | "popular">("side");

  const cards = sideNews.slice(0, 2);

  return (
    <div className="flex flex-col h-full justify-between gap-3">
      {/* Sekme Başlıkları */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800 text-xs font-bold shadow-xs">
        <button
          onClick={() => setTab("side")}
          className={`flex-1 py-1.5 px-3 rounded-md transition flex items-center justify-center gap-1.5 ${
            tab === "side"
              ? "bg-red-600 text-white shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Günün Yan Manşetleri</span>
        </button>

        <button
          onClick={() => setTab("popular")}
          className={`flex-1 py-1.5 px-3 rounded-md transition flex items-center justify-center gap-1.5 ${
            tab === "popular"
              ? "bg-red-600 text-white shadow-xs"
              : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          }`}
        >
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>Çok Okunanlar</span>
        </button>
      </div>

      {tab === "side" ? (
        /* 1. KLASİK 2'Lİ YAN MANŞET KARTLARI */
        <div className="flex-1 flex flex-col justify-between gap-3 min-h-[380px]">
          {cards.map((item) => (
            <Link
              key={item.id}
              href={`/haber/${item.slug}`}
              className="group relative flex-1 min-h-[180px] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 shadow-md flex flex-col justify-end"
            >
              {/* Görsel */}
              <div className="absolute inset-0 bg-zinc-900">
                <SafeImage
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 35vw"
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              </div>

              {/* Kategori ve Özel Rozet */}
              <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5">
                <span className="bg-red-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-xs tracking-wider shadow-md">
                  {item.categoryTitle}
                </span>
                {item.imageBadgeText && (
                  <NewsImageBadge
                    text={item.imageBadgeText}
                    color={item.imageBadgeColor}
                    size="xs"
                    position="relative"
                  />
                )}
              </div>

              {/* Başlık Bandı */}
              <div className="relative z-10 p-4 space-y-1">
                <h3 className="text-sm sm:text-base font-black text-white leading-snug group-hover:text-red-400 transition line-clamp-2 drop-shadow-md">
                  {item.title}
                </h3>
                <div className="flex items-center gap-3 text-[10px] text-zinc-300 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-red-500" />
                    {item.publishedAt.split(" ")[1] || item.publishedAt}
                  </span>
                  <span>{item.author.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* 2. ÇOK OKUNANLAR LİSTESİ */
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {popularNews.slice(0, 5).map((item, index) => (
              <Link
                key={item.id}
                href={`/haber/${item.slug}`}
                className="py-2.5 flex items-center gap-3 group transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40 px-1 rounded-lg"
              >
                {/* Numara */}
                <span className="text-xl sm:text-2xl font-black text-red-600/40 group-hover:text-red-600 transition font-mono w-5 text-center shrink-0">
                  {index + 1}
                </span>

                {/* Küçük Haber Görseli */}
                <div className="relative w-16 h-12 aspect-4/3 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                  <SafeImage
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    unoptimized
                    sizes="64px"
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>

                {/* Başlık ve Bilgiler */}
                <div className="flex-1 overflow-hidden min-w-0">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1">
                    <span className="text-red-600 font-semibold uppercase">
                      {item.categoryTitle}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3 text-zinc-400" />
                      {item.views.toLocaleString("tr-TR")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
