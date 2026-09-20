"use client";

import React from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { NewsItem } from "@/types/news";
import SafeImage from "./SafeImage";

interface NewsCardProps {
  news: NewsItem;
  variant?: "vertical" | "horizontal" | "compact";
  className?: string;
  badgeColor?: string;
}

export default function NewsCard({
  news,
  variant = "vertical",
  className = "",
  badgeColor = "bg-red-600",
}: NewsCardProps) {
  if (variant === "horizontal") {
    return (
      <Link
        href={`/haber/${news.slug}`}
        className={`group flex gap-3.5 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition flex-1 items-center ${className}`}
      >
        <div className="relative w-28 sm:w-32 aspect-4/3 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <SafeImage
            src={news.imageUrl}
            alt={news.title}
            fill
            sizes="120px"
            className="object-cover group-hover:scale-105 transition duration-300"
          />
        </div>

        <div className="flex-1 flex flex-col justify-between min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition line-clamp-2 leading-snug">
            {news.title}
          </h4>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-red-500" />
              {news.publishedAt ? (news.publishedAt.split(" ")[1] || news.publishedAt) : "Yeni"}
            </span>
            {news.categoryTitle && (
              <>
                <span>•</span>
                <span className="text-red-500 font-medium">{news.categoryTitle}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/haber/${news.slug}`}
        className={`group flex items-start gap-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800/80 last:border-0 ${className}`}
      >
        <div className="relative w-20 h-14 shrink-0 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <SafeImage
            src={news.imageUrl}
            alt={news.title}
            fill
            sizes="80px"
            className="object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-red-600 transition line-clamp-2 leading-tight">
            {news.title}
          </h5>
          <span className="text-[10px] text-zinc-400 mt-1 block">
            {news.publishedAt}
          </span>
        </div>
      </Link>
    );
  }

  // Varsayılan: Dikey Kart (Vertical)
  return (
    <Link
      href={`/haber/${news.slug}`}
      className={`group flex flex-col bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition ${className}`}
    >
      <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <SafeImage
          src={news.imageUrl}
          alt={news.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition duration-500"
        />
        {news.categoryTitle && (
          <span
            className={`absolute top-3 left-3 ${badgeColor} text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-md`}
          >
            {news.categoryTitle}
          </span>
        )}
        {news.imageBadgeText && (
          <span
            className={`absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded shadow text-white ${
              news.imageBadgeColor || "bg-zinc-900/90"
            }`}
          >
            {news.imageBadgeText}
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition line-clamp-2 leading-snug">
            {news.title}
          </h3>
          {news.summary && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
              {news.summary}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <Clock className="w-3.5 h-3.5 text-red-500" />
          <span>{news.publishedAt || "Güncel"}</span>
          {news.author?.name && (
            <>
              <span>•</span>
              <span className="truncate">{news.author.name}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
