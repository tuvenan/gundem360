import Link from "next/link";
import Image from "next/image";
import {
  getAllNews,
  getMainHeadlines,
  getSubHeadlines,
  getBreakingNews,
  getColumnists,
  getNewsByCategory,
  getPhotoGalleries,
  getVideoItems,
  getActiveFeaturedPoll,
  getSiteSettings,
  getHomepageLayout,
  getAllCategories,
  getSidebarWidgets,
  getFinanceRates,
} from "@/lib/news-service";
import BreakingNewsTicker from "@/components/home/BreakingNewsTicker";
import FinanceBar from "@/components/home/FinanceBar";
import MainHeadlineSlider from "@/components/home/MainHeadlineSlider";
import HeroSideHeadlines from "@/components/home/HeroSideHeadlines";
import SubHeadlinesGrid from "@/components/home/SubHeadlinesGrid";
import CategoryBlockRenderer from "@/components/widgets/CategoryBlockRenderer";
import ColumnistsSection from "@/components/home/ColumnistsSection";
import PhotoGallerySection from "@/components/home/PhotoGallerySection";
import VideoGallerySection from "@/components/home/VideoGallerySection";
import PollWidget from "@/components/home/PollWidget";
import DynamicSidebar from "@/components/sidebar/DynamicSidebar";
import { DEFAULT_HOMEPAGE_LAYOUT } from "@/lib/types/layout";
import { TrendingUp, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const [
    allNews,
    mainHeadlines,
    subHeadlines,
    breakingNews,
    columnists,
    gundemNews,
    ekonomiNews,
    sporNews,
    teknolojiNews,
    photoGalleries,
    videos,
    featuredPoll,
    siteSettings,
    rawHomepageLayout,
    categories,
    sidebarWidgets,
    financeRates,
  ] = await Promise.all([
    getAllNews(),
    getMainHeadlines(),
    getSubHeadlines(),
    getBreakingNews(),
    getColumnists(),
    getNewsByCategory("gundem"),
    getNewsByCategory("ekonomi"),
    getNewsByCategory("spor"),
    getNewsByCategory("teknoloji"),
    getPhotoGalleries(),
    getVideoItems(),
    getActiveFeaturedPoll(),
    getSiteSettings(),
    getHomepageLayout(),
    getAllCategories(),
    getSidebarWidgets(),
    getFinanceRates(),
  ]);

  // En çok okunan haberler (Görüntülenmeye göre sıralı)
  const popularNews = [...allNews]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Yan manşetler (Sürmanşetler veya ana manşet dışı öne çıkanlar)
  const sideHeadlines = subHeadlines.length >= 2 ? subHeadlines : allNews.slice(5, 9);

  // Bakım Modu Aktifse Bilgilendirme Ekranı Göster
  if (siteSettings.maintenanceMode) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm my-10 max-w-2xl mx-auto space-y-5 animate-in fade-in">
        <div className="p-4 bg-amber-500/10 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
          Sistemimiz Bakımdadır
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg">
          {siteSettings.maintenanceMessage ||
            "Değerli okurlarımız; sistemlerimizde gerçekleştirilen kapsamlı altyapı güncellemeleri nedeniyle sitemiz kısa süreliğine bakım modundadır."}
        </p>
        <div className="text-[11px] text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          {siteSettings.siteName} Medya Grubu • Sabrınız için teşekkür ederiz.
        </div>
      </div>
    );
  }

  // Düzen listesini hazırla
  const layout =
    Array.isArray(rawHomepageLayout) && rawHomepageLayout.length > 0
      ? rawHomepageLayout
      : DEFAULT_HOMEPAGE_LAYOUT;

  const activeBlocks = layout
    .filter((block) => block.isVisible)
    .sort((a, b) => a.order - b.order);

  // Kategori eşleştirici yardımcı fonksiyon
  const getCategoryNews = (key: string) => {
    switch (key) {
      case "gundem":
        return gundemNews.length > 0 ? gundemNews : allNews.filter((n) => n.category === "gundem");
      case "ekonomi":
        return ekonomiNews.length > 0 ? ekonomiNews : allNews.filter((n) => n.category === "ekonomi");
      case "spor":
        return sporNews.length > 0 ? sporNews : allNews.filter((n) => n.category === "spor");
      case "teknoloji":
        return teknolojiNews.length > 0 ? teknolojiNews : allNews.filter((n) => n.category === "teknoloji");
      default:
        return allNews.filter((n) => n.category === key);
    }
  };

  // ──────────────────────────────────────────────────────────────────────
  // Blokları iki gruba ayır:
  //   • fullWidthBlocks: breaking-ticker, finance-bar, classic-hero, surmanset-grid
  //   • sidebarBlocks   : geri kalan her şey (iki kolonlu yapının sol tarafı)
  // ──────────────────────────────────────────────────────────────────────
  const FULL_WIDTH_TYPES = new Set([
    "breaking-ticker",
    "finance-bar",
    "classic-hero",
    "surmanset-grid",
  ]);

  const fullWidthBlocks = activeBlocks.filter((b) => FULL_WIDTH_TYPES.has(b.type));
  const mainContentBlocks = activeBlocks.filter((b) => !FULL_WIDTH_TYPES.has(b.type));

  // Tek bir blok render yardımcısı
  const renderBlock = (block: (typeof activeBlocks)[number]) => {
    switch (block.type) {
      case "breaking-ticker": {
        if (siteSettings.showBreakingTicker === false) return null;
        return (
          <BreakingNewsTicker
            key={block.id}
            news={breakingNews.length > 0 ? breakingNews : allNews.slice(0, 5)}
          />
        );
      }

      case "finance-bar": {
        if (siteSettings.showFinanceBar === false) return null;
        return <FinanceBar key={block.id} rates={financeRates} />;
      }

      case "classic-hero": {
        return (
          <section key={block.id} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Sol: 1-10 Numaralı Klasik Ana Manşet Slider */}
            <div className="lg:col-span-8 flex flex-col">
              <MainHeadlineSlider
                headlines={mainHeadlines.length > 0 ? mainHeadlines : allNews.slice(0, 10)}
              />
            </div>

            {/* Sağ: Klasik Yan Manşetler & Çok Okunanlar */}
            <div className="lg:col-span-4 flex flex-col">
              <HeroSideHeadlines
                sideNews={sideHeadlines}
                popularNews={popularNews}
              />
            </div>
          </section>
        );
      }

      case "surmanset-grid": {
        return (
          <section key={block.id} className="pt-2">
            <div className="flex items-center justify-between mb-3 border-b-2 border-red-600 pb-1.5">
              <h2 className="text-base font-black uppercase text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-red-600" />
                {block.title || "Öne Çıkan Gelişmeler"}
              </h2>
              <span className="text-xs text-zinc-500 font-medium">Günün Manşetleri</span>
            </div>
            <SubHeadlinesGrid news={allNews.slice(4, 8)} />
          </section>
        );
      }

      case "category-block": {
        const catKey = block.config?.categoryKey || "gundem";
        const newsForCat = getCategoryNews(catKey);
        const foundCat = categories.find((c) => c.key === catKey);
        const variant = foundCat?.layoutVariant || "classic-split";
        const badgeColor = block.config?.badgeColor || foundCat?.badgeColor || "bg-red-600";
        return (
          <CategoryBlockRenderer
            key={block.id}
            title={block.title || foundCat?.name || "Kategori Haberleri"}
            categoryKey={catKey}
            news={newsForCat}
            badgeColor={badgeColor}
            layoutVariant={variant}
          />
        );
      }

      case "columnists-section": {
        if (siteSettings.showColumnistsSection === false) return null;
        return <ColumnistsSection key={block.id} columnists={columnists} />;
      }

      case "photo-gallery-grid": {
        if (siteSettings.showPhotoGallerySection === false) return null;
        return <PhotoGallerySection key={block.id} galleries={photoGalleries} />;
      }

      case "video-gallery-grid": {
        if (siteSettings.showVideoGallerySection === false) return null;
        return <VideoGallerySection key={block.id} videos={videos} />;
      }

      case "poll-widget": {
        if (siteSettings.showPollWidget === false) return null;
        return <PollWidget key={block.id} initialPoll={featuredPoll} />;
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── TAM GENİŞLİK BÖLÜMÜ ─────────────────────────────────────────── */}
      {/* breaking-ticker, finance-bar, classic-hero, surmanset-grid */}
      {fullWidthBlocks.map(renderBlock)}

      {/* ── İKİ KOLONLU BÖLÜM (Sürmanşet altından itibaren) ─────────────── */}
      {mainContentBlocks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* SOL KOLON — Ana İçerik (8/12) */}
          <div className="lg:col-span-8 space-y-8">
            {mainContentBlocks.map(renderBlock)}
          </div>

          {/* SAĞ KOLON — Dinamik Sidebar (4/12) */}
          <aside className="lg:col-span-4">
            {/* sticky: header yüksekliği (~64px) + üst boşluk */}
            <div className="sticky top-20">
              <DynamicSidebar
                widgets={sidebarWidgets}
                popularNews={popularNews}
                poll={featuredPoll}
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
