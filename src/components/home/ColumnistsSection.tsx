import Link from "next/link";
import Image from "next/image";
import { Columnist } from "@/types/news";
import { Feather, ChevronRight } from "lucide-react";

interface ColumnistsSectionProps {
  columnists: Columnist[];
}

export default function ColumnistsSection({ columnists }: ColumnistsSectionProps) {
  if (!columnists || columnists.length === 0) return null;

  return (
    <section id="yazarlar" className="my-10 bg-zinc-50 dark:bg-zinc-900/60 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-600 text-white rounded-md">
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              Köşe Yazarları
            </h2>
            <p className="text-xs text-zinc-500">Günün değerlendirmeleri ve analizler</p>
          </div>
        </div>

        <Link
          href="#yazarlar"
          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5"
        >
          Tüm Yazarlar <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columnists.map((col) => (
          <Link
            key={col.id}
            href={`/yazarlar/${col.articleSlug}`}
            className="group bg-white dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-red-500/50 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* Author header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-red-500 shrink-0">
                  <Image
                    src={col.avatar}
                    alt={col.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition truncate">
                    {col.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {col.title}
                  </p>
                </div>
              </div>

              {/* Article info */}
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-snug line-clamp-2 mb-2">
                "{col.articleTitle}"
              </h3>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 italic">
                {col.excerpt}
              </p>
            </div>

            <div className="mt-4 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
              <span>{col.articleDate}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 font-semibold bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                  {col.articles?.length || 1} Yazı
                </span>
                <span className="text-red-600 font-semibold group-hover:underline">Oku →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
