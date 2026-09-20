"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NewsItem } from "@/types/news";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";

interface BreakingNewsTickerProps {
  news: NewsItem[];
}

export default function BreakingNewsTicker({ news }: BreakingNewsTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!news || news.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [news, isPaused]);

  if (!news || news.length === 0) return null;

  const currentItem = news[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  return (
    <div
      className="bg-zinc-900 text-white border-y border-zinc-800 shadow-sm"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center h-10 gap-3">
        {/* Flash Badge */}
        <div className="flex items-center gap-1 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-sm shrink-0 tracking-wider animate-pulse">
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>SON DAKİKA</span>
        </div>

        {/* Headline text */}
        <div className="flex-1 overflow-hidden">
          <Link
            href={`/haber/${currentItem.slug}`}
            className="text-xs sm:text-sm font-medium hover:text-red-400 transition truncate block tracking-tight"
          >
            <span className="text-red-500 font-bold mr-2">[{currentItem.categoryTitle}]:</span>
            {currentItem.title}
          </Link>
        </div>

        {/* Counter & Controls */}
        <div className="flex items-center gap-2 shrink-0 text-zinc-400 text-xs">
          <span className="hidden sm:inline-block font-mono text-[11px]">
            {currentIndex + 1} / {news.length}
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrev}
              aria-label="Önceki haber"
              className="p-1 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Sonraki haber"
              className="p-1 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
