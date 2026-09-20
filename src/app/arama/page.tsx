import Link from "next/link";
import { Metadata } from "next";
import {
  searchNews,
  getAllNews,
  getSidebarWidgets,
  getActiveFeaturedPoll,
} from "@/lib/news-service";
import NewsCard from "@/components/common/NewsCard";
import DynamicSidebar from "@/components/sidebar/DynamicSidebar";
import {
  Search,
  SearchX,
  Flame,
  ArrowRight,
  TrendingUp,
  Tag,
  Home,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (q || "").trim();

  return {
    title: query
      ? `"${query}" Arama Sonuçları | Gündem360`
      : "Haber Ara | Gündem360",
    description: query
      ? `"${query}" araması ile ilgili son dakika gelişmeleri, en güncel haberler ve detaylar Gündem360'ta.`
      : "Gündem360 dijital haber portalı canlı arama motoru.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q || "").trim();

  const [results, allNews, sidebarWidgets, featuredPoll] = await Promise.all([
    query ? searchNews(query) : Promise.resolve([]),
    getAllNews(),
    getSidebarWidgets(),
    getActiveFeaturedPoll(),
  ]);

  // En çok okunan haberler (Görüntülenmeye göre sıralı)
  const popularNews = [...allNews]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const popularKeywords = [
    "Ekonomi",
    "Altın",
    "Borsa",
    "Milli Takım",
    "Yapay Zekâ",
    "Gündem",
    "Teknoloji",
    "Faiz",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. BREADCRUMB */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 py-1 font-medium">
        <Link
          href="/"
          className="hover:text-red-600 transition flex items-center gap-1"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Ana Sayfa</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-900 dark:text-zinc-100 font-bold">
          Arama Sonuçları
        </span>
        {query && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-red-600 truncate max-w-xs font-bold">
              "{query}"
            </span>
          </>
        )}
      </nav>

      {/* 2. ARAMA BAŞLIK VE HIZLI ARAMA ALANI */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <Search className="w-4 h-4" />
            <span>Haber ve İçerik Arama Motoru</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            {query ? (
              <>
                <span className="text-red-600">"{query}"</span> için Arama Sonuçları
              </>
            ) : (
              "Haberlerde veya Konularda Arama Yapın"
            )}
          </h1>

          {/* Sayfa İçi Canlı Arama Formu */}
          <form
            action="/arama"
            method="GET"
            className="relative flex items-center pt-2"
          >
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Anahtar kelime, kişi, kurum veya konu yazın..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm sm:text-base px-4 py-3 sm:py-3.5 pr-28 rounded-2xl border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-2 sm:right-2.5 px-4 sm:px-5 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Ara</span>
            </button>
          </form>

          {/* Popüler Arama Terimleri */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-red-500" />
              Popüler:
            </span>
            {popularKeywords.map((tag) => (
              <Link
                key={tag}
                href={`/arama?q=${encodeURIComponent(tag)}`}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-zinc-700 transition"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 3. ANA İÇERİK & SAĞ BLOK IZGARASI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SOL: ARAMA SONUÇLARI (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {query ? (
            results.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                      Toplam <strong className="text-zinc-900 dark:text-white font-black">{results.length}</strong> haber bulundu
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400">En güncelden eskiye</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {results.map((news) => (
                    <NewsCard key={news.id} news={news} variant="vertical" />
                  ))}
                </div>
              </div>
            ) : (
              // SONUÇ BULUNAMADI UYARISI
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 sm:p-12 border border-zinc-200 dark:border-zinc-800 text-center space-y-5 shadow-xs">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <SearchX className="w-8 h-8" />
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">
                    Aradığınız kritere uygun haber bulunamadı
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    <strong className="text-zinc-700 dark:text-zinc-200 font-bold">"{query}"</strong> ifadesiyle eşleşen içerik tespit edilemedi. Lütfen kelimenin yazımını kontrol edin veya daha genel bir ifade kullanın.
                  </p>
                </div>

                {/* Alternatif Kategori Yönlendirmeleri */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 max-w-lg mx-auto">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-3">
                    Kategorileri Keşfedin
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {[
                      { name: "Gündem", href: "/kategori/gundem" },
                      { name: "Ekonomi", href: "/kategori/ekonomi" },
                      { name: "Spor", href: "/kategori/spor" },
                      { name: "Teknoloji", href: "/kategori/teknoloji" },
                      { name: "Foto Galeri", href: "/foto-galeri" },
                      { name: "Video Galeri", href: "/video-galeri" },
                    ].map((c) => (
                      <Link
                        key={c.name}
                        href={c.href}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-red-600 hover:text-white transition"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Öne Çıkan Alternatif Haberler */}
                <div className="pt-6 text-left space-y-4">
                  <div className="flex items-center gap-2 border-b-2 border-red-600 pb-1.5">
                    <Flame className="w-4 h-4 text-red-600" />
                    <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white">
                      Bunları Kaçırmış Olabilirsiniz
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {popularNews.slice(0, 4).map((news) => (
                      <NewsCard key={news.id} news={news} variant="horizontal" />
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : (
            // ARAMA YAPILMAMIŞ DURUM
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 sm:p-12 border border-zinc-200 dark:border-zinc-800 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center">
                <Search className="w-8 h-8 text-zinc-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">
                Bir Arama Terimi Giriniz
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
                Yukarıdaki arama kutusunu kullanarak Gündem360 arşivindeki binlerce haber, köşe yazısı ve analize anında ulaşabilirsiniz.
              </p>
            </div>
          )}
        </div>

        {/* SAĞ: DİNAMİK SİDEBAR (4 COLS) */}
        <aside className="lg:col-span-4">
          <div className="sticky top-20">
            <DynamicSidebar
              widgets={sidebarWidgets}
              popularNews={popularNews}
              poll={featuredPoll}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
