"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { NewsItem, Comment, Poll } from "@/types/news";
import { SidebarWidget } from "@/lib/types/sidebar";
import NewsToolbar from "./NewsToolbar";
import CommentSection from "./CommentSection";
import DynamicSidebar from "@/components/sidebar/DynamicSidebar";
import NewsImageBadge from "@/components/common/NewsImageBadge";
import { Clock, Eye, Tag, ChevronRight, Share2 } from "lucide-react";

interface NewsDetailClientProps {
  news: NewsItem;
  initialComments: Comment[];
  relatedNews: NewsItem[];
  popularNews?: NewsItem[];
  sidebarWidgets?: SidebarWidget[];
  poll?: Poll | null;
}

export default function NewsDetailClient({
  news,
  initialComments,
  relatedNews,
  popularNews = [],
  sidebarWidgets,
  poll,
}: NewsDetailClientProps) {
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");

  const fontClasses = {
    sm: "text-sm leading-relaxed",
    md: "text-base sm:text-lg leading-relaxed",
    lg: "text-lg sm:text-xl leading-relaxed",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sol / Ana Gövde (8 cols) */}
      <article className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-6 lg:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4 overflow-x-auto">
          <Link href="/" className="hover:text-red-600 transition">Ana Sayfa</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/kategori/${news.category}`} className="text-red-600 font-semibold hover:underline">
            {news.categoryTitle}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="truncate max-w-[200px] sm:max-w-md">{news.title}</span>
        </nav>

        {/* Başlık & Spot */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-900 dark:text-white leading-tight tracking-tight mb-4">
          {news.title}
        </h1>

        <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed mb-6 border-l-4 border-red-600 pl-4 py-1 bg-zinc-50 dark:bg-zinc-800/40 rounded-r-md">
          {news.summary}
        </p>

        {/* Meta Bilgileri (Yayın Saati, Okunma, Süre) */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 border-y border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
              <Clock className="w-4 h-4 text-red-600" />
              <span>Yayın Tarihi: {news.publishedAt}</span>
            </span>
            {news.updatedAt && (
              <span className="hidden sm:inline text-zinc-400">
                • Son Güncelleme: {news.updatedAt}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-zinc-400" />
              <span>{news.views.toLocaleString("tr-TR")} Okunma</span>
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span>{news.readTimeMinutes} dk okuma</span>
          </div>
        </div>


        {/* Toolbar: Dinle, Yazı Boyutu, Paylaş */}
        <NewsToolbar
          title={news.title}
          textToRead={`${news.summary}. ${news.content.replace(/<[^>]*>/g, " ")}`}
          onFontSizeChange={setFontSize}
        />

        {/* Ana Görsel */}
        <div className="relative aspect-16/10 w-full rounded-xl overflow-hidden my-6 bg-zinc-100 dark:bg-zinc-800 shadow-xs">
          <Image
            src={news.imageUrl}
            alt={news.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 65vw"
            className="object-cover"
          />
          {news.imageBadgeText && (
            <NewsImageBadge
              text={news.imageBadgeText}
              color={news.imageBadgeColor}
              size="md"
              position="top-left"
            />
          )}
        </div>

        {/* Detay İçeriği */}
        <div className={`space-y-4 text-zinc-800 dark:text-zinc-200 ${fontClasses[fontSize]}`}>
          {news.content.includes("<p>") ||
          news.content.includes("<div>") ||
          news.content.includes("<h3>") ||
          news.content.includes("<h2>") ||
          news.content.includes("<br>") ||
          news.content.includes("<blockquote") ||
          news.content.includes("<ul>") ||
          news.content.includes("<ol>") ? (
            <div
              className="prose dark:prose-invert max-w-none text-inherit leading-relaxed [&_h2]:text-2xl [&_h2]:font-black [&_h2]:my-5 [&_h2]:text-zinc-900 [&_h2]:dark:text-white [&_h3]:text-xl [&_h3]:font-bold [&_h3]:my-4 [&_h3]:text-zinc-900 [&_h3]:dark:text-white [&_p]:my-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-red-600 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-5 [&_blockquote]:italic [&_blockquote]:bg-zinc-50 [&_blockquote]:dark:bg-zinc-800/50 [&_blockquote]:rounded-r-lg [&_a]:text-blue-600 [&_a]:underline [&_img]:rounded-xl [&_img]:shadow-md"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          ) : (
            news.content.split("\n\n").map((paragraph, index) => {
              if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                return (
                  <h3
                    key={index}
                    className="text-xl font-bold text-zinc-900 dark:text-white pt-3"
                  >
                    {paragraph.replace(/\*\*/g, "")}
                  </h3>
                );
              }
              return (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              );
            })
          )}
        </div>

        {/* Etiketler */}
        {news.tags && news.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <Tag className="w-3.5 h-3.5 text-zinc-400 mr-1" />
            {news.tags.map((tag) => (
              <span
                key={tag}
                className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs px-2.5 py-1 rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Yorumlar Bölümü */}
        <CommentSection newsId={news.id} initialComments={initialComments} />
      </article>

      {/* Sağ Sidebar: Modüler ve Dinamik Sağ Bloklar (4 cols) */}
      <DynamicSidebar
        className="lg:col-span-4 space-y-6"
        widgets={sidebarWidgets}
        relatedNews={relatedNews}
        popularNews={popularNews}
        poll={poll}
      />
    </div>
  );
}
