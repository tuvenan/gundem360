import React from "react";
import Link from "next/link";
import SafeImage from "@/components/common/SafeImage";
import { NewsItem } from "@/types/news";
import { CategoryLayoutVariant } from "@/lib/types/category";
import { Clock, ChevronRight, Eye, User, Sparkles, Flame, TrendingUp } from "lucide-react";
import NewsImageBadge from "@/components/common/NewsImageBadge";

interface CategoryBlockRendererProps {
  title: string;
  categoryKey: string;
  news: NewsItem[];
  badgeColor?: string;
  layoutVariant?: CategoryLayoutVariant;
}

export default function CategoryBlockRenderer({
  title,
  categoryKey,
  news,
  badgeColor = "bg-red-600",
  layoutVariant = "classic-split",
}: CategoryBlockRendererProps) {
  if (!news || news.length === 0) return null;

  // Başlık Şeridi (Tüm şablonlarda ortak ve tutarlı)
  const renderHeader = () => (
    <div className="flex items-center justify-between border-b-2 border-zinc-200 dark:border-zinc-800 pb-2.5 mb-5">
      <div className="flex items-center gap-2.5">
        <span className={`w-3.5 h-6 ${badgeColor} rounded-xs inline-block shadow-xs`} />
        <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
          {title}
        </h2>
      </div>
      <Link
        href={`/kategori/${categoryKey}`}
        className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-0.5 group transition"
      >
        <span>Tüm {title} Haberleri</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );

  // 1. ŞABLON: KLASİK BÖLÜNMÜŞ (7 + 5 KOLON)
  const renderClassicSplit = () => {
    const featured = news[0];
    const sideNews = news.slice(1, 5);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Sol: Büyük Öne Çıkan Kart (7 cols) */}
        {featured && (
          <Link
            href={`/haber/${featured.slug}`}
            className="group lg:col-span-7 flex flex-col bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition justify-between"
          >
            <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <SafeImage
                src={featured.imageUrl}
                alt={featured.title}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover group-hover:scale-105 transition duration-500"
              />
              <span
                className={`absolute top-3 left-3 ${badgeColor} text-white text-xs font-black uppercase px-2.5 py-1 rounded-md shadow-md`}
              >
                {featured.categoryTitle}
              </span>
              {featured.imageBadgeText && (
                <NewsImageBadge
                  text={featured.imageBadgeText}
                  color={featured.imageBadgeColor}
                  size="sm"
                  position="top-right"
                />
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white group-hover:text-red-600 transition line-clamp-2 leading-tight">
                  {featured.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                  {featured.summary}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5" />
                  {featured.author.name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featured.publishedAt.split(" ")[0]}
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Sağ: 4 Adet Dikey Liste Kartı (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          {sideNews.map((item) => (
            <Link
              key={item.id}
              href={`/haber/${item.slug}`}
              className="group flex gap-3.5 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition items-center"
            >
              <div className="relative w-28 aspect-4/3 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                <SafeImage
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  unoptimized
                  sizes="120px"
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
                {item.imageBadgeText && (
                  <NewsImageBadge
                    text={item.imageBadgeText}
                    color={item.imageBadgeColor}
                    size="xs"
                    position="top-left"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block mb-1">
                  {item.categoryTitle}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.publishedAt.split(" ")[1] || item.publishedAt}
                  </span>
                  <span>•</span>
                  <span>{item.views.toLocaleString("tr-TR")} okuma</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  // 2. ŞABLON: 4'LÜ EŞİT KART IZGARASI (GRID-4)
  const renderGrid4 = () => {
    const items = news.slice(0, 4);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/haber/${item.slug}`}
            className="group flex flex-col bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition justify-between"
          >
            <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <SafeImage
                src={item.imageUrl}
                alt={item.title}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition duration-500"
              />
              <span
                className={`absolute top-2.5 left-2.5 ${badgeColor} text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-md`}
              >
                {item.categoryTitle}
              </span>
              {item.imageBadgeText && (
                <NewsImageBadge
                  text={item.imageBadgeText}
                  color={item.imageBadgeColor}
                  size="xs"
                  position="top-right"
                />
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-red-600 transition line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800">
                <span className="truncate max-w-[110px]">{item.author.name}</span>
                <span className="flex items-center gap-1 font-mono">
                  <Eye className="w-3 h-3" />
                  {item.views.toLocaleString("tr-TR")}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  // 3. ŞABLON: DİKEY LİSTE GÖRÜNÜMÜ (LIST-VERTICAL)
  const renderListVertical = () => {
    const items = news.slice(0, 5);

    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden shadow-xs">
        {items.map((item, idx) => (
          <Link
            key={item.id}
            href={`/haber/${item.slug}`}
            className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
          >
            {/* Sıralama İndeksi */}
            <span className="hidden sm:flex w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 items-center justify-center font-black text-xs shrink-0">
              #{idx + 1}
            </span>

            {/* Görsel */}
            <div className="relative w-full sm:w-44 aspect-16/10 sm:aspect-16/10 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-100 dark:border-zinc-800">
              <SafeImage
                src={item.imageUrl}
                alt={item.title}
                fill
                unoptimized
                sizes="180px"
                className="object-cover group-hover:scale-105 transition duration-300"
              />
              <span
                className={`sm:hidden absolute top-2 left-2 ${badgeColor} text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow`}
              >
                {item.categoryTitle}
              </span>
              {item.imageBadgeText && (
                <NewsImageBadge
                  text={item.imageBadgeText}
                  color={item.imageBadgeColor}
                  size="xs"
                  position="top-right"
                />
              )}
            </div>

            {/* Metin & Detaylar */}
            <div className="flex-1 min-w-0">
              <div className="hidden sm:flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                  {item.categoryTitle}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="text-[11px] text-zinc-400">{item.publishedAt}</span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white group-hover:text-red-600 transition line-clamp-2 leading-snug">
                {item.title}
              </h3>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 sm:line-clamp-1 leading-relaxed">
                {item.summary}
              </p>

              <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-2">
                <span>Yazar: <strong className="text-zinc-700 dark:text-zinc-300">{item.author.name}</strong></span>
                <span>•</span>
                <span>{item.readTimeMinutes || 3} dk okuma</span>
                <span>•</span>
                <span>{item.views.toLocaleString("tr-TR")} görüntülenme</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  // 4. ŞABLON: GENİŞ HERO BANNER + 3'LÜ SERİ (FEATURED-HERO-BANNER)
  const renderFeaturedHeroBanner = () => {
    const featured = news[0];
    const subItems = news.slice(1, 4);

    return (
      <div className="space-y-4">
        {/* Üst Geniş Manşet Banner */}
        {featured && (
          <Link
            href={`/haber/${featured.slug}`}
            className="group relative aspect-21/9 min-h-[260px] sm:min-h-[340px] w-full rounded-2xl overflow-hidden block shadow-md border border-zinc-200 dark:border-zinc-800"
          >
            <SafeImage
              src={featured.imageUrl}
              alt={featured.title}
              fill
              unoptimized
              sizes="100vw"
              className="object-cover group-hover:scale-105 transition duration-700"
            />
            {featured.imageBadgeText && (
              <NewsImageBadge
                text={featured.imageBadgeText}
                color={featured.imageBadgeColor}
                size="md"
                position="top-right"
              />
            )}
            {/* Karartma Gradyanı */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 sm:p-8">
              <div className="space-y-2 max-w-3xl">
                <span
                  className={`inline-block ${badgeColor} text-white text-[11px] font-black uppercase px-3 py-1 rounded-md shadow-md`}
                >
                  {featured.categoryTitle} • ÖNE ÇIKAN
                </span>

                <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-white group-hover:text-red-400 transition leading-tight">
                  {featured.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-200 line-clamp-2 leading-relaxed hidden sm:block">
                  {featured.summary}
                </p>

                <div className="flex items-center gap-4 text-xs text-zinc-300 pt-1">
                  <span>{featured.author.name}</span>
                  <span>•</span>
                  <span>{featured.publishedAt}</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Alt 3'lü Seri */}
        {subItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {subItems.map((item) => (
              <Link
                key={item.id}
                href={`/haber/${item.slug}`}
                className="group flex flex-col bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition p-3 gap-3"
              >
                <div className="relative aspect-16/10 w-full rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                  <SafeImage
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                  {item.imageBadgeText && (
                    <NewsImageBadge
                      text={item.imageBadgeText}
                      color={item.imageBadgeColor}
                      size="xs"
                      position="top-left"
                    />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white group-hover:text-red-600 transition line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span>{item.publishedAt.split(" ")[0]}</span>
                    <span>{item.views.toLocaleString("tr-TR")} okuma</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Switch-Case Motoru
  const renderLayout = () => {
    switch (layoutVariant) {
      case "grid-4":
        return renderGrid4();
      case "list-vertical":
        return renderListVertical();
      case "featured-hero-banner":
        return renderFeaturedHeroBanner();
      case "classic-split":
      default:
        return renderClassicSplit();
    }
  };

  return (
    <section className="my-8">
      {renderHeader()}
      {renderLayout()}
    </section>
  );
}
