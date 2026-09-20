import Link from "next/link";
import SafeImage from "@/components/common/SafeImage";
import { NewsItem } from "@/types/news";
import { Clock } from "lucide-react";
import NewsImageBadge from "@/components/common/NewsImageBadge";

interface SubHeadlinesGridProps {
  news: NewsItem[];
}

export default function SubHeadlinesGrid({ news }: SubHeadlinesGridProps) {
  if (!news || news.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {news.slice(0, 4).map((item) => (
        <Link
          key={item.id}
          href={`/haber/${item.slug}`}
          className="group flex flex-col bg-white dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition"
        >
          {/* Image */}
          <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <SafeImage
              src={item.imageUrl}
              alt={item.title}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute top-2 left-2 z-10 flex flex-wrap items-center gap-1">
              <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-xs tracking-wider">
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
          </div>

          {/* Content */}
          <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition leading-snug line-clamp-2">
              {item.title}
            </h3>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {item.summary}
            </p>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-red-500" />
                {item.publishedAt.split(" ")[1] || item.publishedAt}
              </span>
              <span className="font-semibold text-red-600 hover:underline">
                Devamı →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
