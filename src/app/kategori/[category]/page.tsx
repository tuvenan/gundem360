import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getNewsByCategory, getAllNews, getAllCategories } from "@/lib/news-service";
import { Clock, ChevronRight, Eye } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categories = await getAllCategories();
  const catObj = categories.find((c) => c.key === category);
  const title = catObj ? catObj.name : category.toUpperCase();

  return {
    title: `${title} Haberleri | Gündem360`,
    description: `En güncel ${title} haberleri, analizler ve son dakika gelişmeleri.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categories = await getAllCategories();
  const catObj = categories.find((c) => c.key === category);
  const categoryName = catObj ? catObj.name : category.toUpperCase();

  const newsList = await getNewsByCategory(category);

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
            <Link href="/" className="hover:text-red-600 transition">Ana Sayfa</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-red-600 font-bold">{categoryName}</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
            {categoryName} Haberleri
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Toplam {newsList.length} haber listeleniyor.
          </p>
        </div>

        {/* Kategori Değiştirici Haplar */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {categories.map((c) => (
            <Link
              key={c.key}
              href={c.href}
              className={`px-3 py-1.5 rounded-full font-semibold transition ${
                c.key === category
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* News Grid */}
      {newsList.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 p-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
          <p className="text-sm">Bu kategoride henüz yayınlanmış haber bulunmuyor.</p>
          <Link href="/" className="mt-3 inline-block text-xs font-bold text-red-600 hover:underline">
            Ana Sayfaya Dön →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((item) => (
            <Link
              key={item.id}
              href={`/haber/${item.slug}`}
              className="group bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded-xs">
                    {item.categoryTitle}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/60 mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-red-500" />
                  {item.publishedAt}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-zinc-400" />
                  {item.views.toLocaleString("tr-TR")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
