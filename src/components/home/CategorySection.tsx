import Link from "next/link";
import SafeImage from "@/components/common/SafeImage";
import { NewsItem } from "@/types/news";
import { Clock, ChevronRight } from "lucide-react";

interface CategorySectionProps {
  title: string;
  categoryKey: string;
  news: NewsItem[];
  badgeColor?: string;
}

export default function CategorySection({
  title,
  categoryKey,
  news,
  badgeColor = "bg-red-600",
}: CategorySectionProps) {
  if (!news || news.length === 0) return null;

  const featured = news[0];
  // Sağ tarafa 4 adet haber yerleştir
  const sideNews = news.slice(1, 5);

  return (
    <section className="my-8">
      {/* Category header */}
      <div className="flex items-center justify-between border-b-2 border-zinc-200 dark:border-zinc-800 pb-2 mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-6 ${badgeColor} rounded-xs inline-block`} />
          <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            {title}
          </h2>
        </div>
        <Link
          href={`/kategori/${categoryKey}`}
          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5"
        >
          Tüm {title} Haberleri <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Featured Large Card (7 cols) */}
        {featured && (
          <Link
            href={`/haber/${featured.slug}`}
            className="group lg:col-span-7 flex flex-col bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition justify-between"
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
              <span className={`absolute top-3 left-3 ${badgeColor} text-white text-xs font-black uppercase px-2.5 py-1 rounded-xs shadow-md`}>
                {featured.categoryTitle}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-2.5">
              <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition leading-snug">
                {featured.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                {featured.summary}
              </p>
              <div className="flex items-center gap-3 text-xs text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  {featured.publishedAt}
                </span>
                <span>•</span>
                <span>{featured.author.name}</span>
              </div>
            </div>
          </Link>
        )}

        {/* Right: Side List Cards (5 cols) - Sağ tarafı tam dolduran 4 haber */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          {sideNews.map((item) => (
            <Link
              key={item.id}
              href={`/haber/${item.slug}`}
              className="group flex gap-3.5 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition flex-1 items-center"
            >
              <div className="relative w-28 sm:w-32 aspect-4/3 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <SafeImage
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  unoptimized
                  sizes="120px"
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-red-500" />
                    {item.publishedAt.split(" ")[1] || item.publishedAt}
                  </span>
                  <span>•</span>
                  <span>{item.readTimeMinutes} dk okuma</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
