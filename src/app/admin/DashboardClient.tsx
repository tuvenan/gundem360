"use client";

import Link from "next/link";
import Image from "next/image";
import { NewsItem, Comment, CategoryItem, SiteSettings } from "@/types/news";
import {
  TrendingUp,
  Eye,
  FileText,
  MessageSquare,
  PlusCircle,
  Sliders,
  ExternalLink,
  Edit3,
  Trash2,
  Calendar,
  Flame,
  ArrowUpRight,
  AlertTriangle,
  Settings,
  Camera,
  Film,
  Vote,
  ShieldAlert,
  Search,
  CheckCircle2,
  Server,
  Layers,
  Sparkles,
} from "lucide-react";

interface DashboardClientProps {
  news: NewsItem[];
  comments: Comment[];
  categories: CategoryItem[];
  siteSettings: SiteSettings;
  galleriesCount: number;
  videosCount: number;
  pollsCount: number;
}

export default function DashboardClient({
  news,
  comments,
  categories,
  siteSettings,
  galleriesCount,
  videosCount,
  pollsCount,
}: DashboardClientProps) {
  const totalViews = news.reduce((acc, item) => acc + item.views, 0);
  const pendingComments = comments.filter((c) => (c.status || "approved") === "pending");
  const mainHeadlines = news.filter((n) => n.headlineType === "main");
  const headlineRatio = `${Math.min(mainHeadlines.length, 10)}/10`;
  const isHeadlineFull = mainHeadlines.length >= 10;
  const seoScore = siteSettings.seo?.seoScore || 96;

  // Son 7 günün mock ziyaretçi verisi
  const weeklyAnalytics = [
    { day: "Pzt", views: 28400, percent: 65 },
    { day: "Sal", views: 34100, percent: 78 },
    { day: "Çar", views: 39500, percent: 90 },
    { day: "Per", views: 32000, percent: 72 },
    { day: "Cum", views: 44000, percent: 100 },
    { day: "Cmt", views: 38200, percent: 86 },
    { day: "Paz", views: 41900, percent: 95 },
  ];

  return (
    <div className="space-y-8">
      {/* 1. BAKIM MODU UYARI BANNER'I */}
      {siteSettings.maintenanceMode && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 dark:bg-amber-950/40 dark:border-amber-600/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-black shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wide flex items-center gap-1.5">
                DİKKAT: SİTE ŞU ANDA BAKIM MODUNDA!
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                Normal ziyaretçilere erişim kısıtlanmıştır ve bakım mesajı gösterilmektedir. Yönetim paneli aktiftir.
              </p>
            </div>
          </div>
          <Link
            href="/admin/ayarlar"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition shadow-sm self-start sm:self-auto shrink-0"
          >
            Ayarlardan Kapat →
          </Link>
        </div>
      )}

      {/* 2. ÜST BAŞLIK VE HIZLI İŞLEM BUTONLARI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              Gösterge Paneli
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
              v2.5 Canlı
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Gündem360 yayın akışı, manşet doluluğu, içerik envanteri ve analitik metrikleri.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/mansetler"
            className="flex items-center gap-1.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-black text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition shadow-xs"
          >
            <Sliders className="w-4 h-4 text-red-500" />
            <span>Manşetleri Sırala</span>
          </Link>

          <Link
            href="/admin/yeni-haber"
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yeni Haber</span>
          </Link>
        </div>
      </div>

      {/* 3. DÖRTLÜ TEMEL KPI KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Manşet Doluluk Oranı (10/10) */}
        <Link
          href="/admin/mansetler"
          className="group bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-red-500/50 hover:shadow-md transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Manşet Doluluğu
            </span>
            <div className={`p-2 rounded-xl text-white ${isHeadlineFull ? "bg-emerald-600" : "bg-amber-500"}`}>
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                {headlineRatio}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isHeadlineFull
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                  : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
              }`}>
                {isHeadlineFull ? "Tam Dolu" : "Eksik Slot"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              1-10 vitrin pozisyonları sıralı
            </p>
          </div>
        </Link>

        {/* KPI 2: Onay Bekleyen Yorumlar */}
        <Link
          href="/admin/yorumlar"
          className="group bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-red-500/50 hover:shadow-md transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Okur Yorumları
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
              {comments.length}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
              {pendingComments.length > 0 ? (
                <span className="text-amber-600 dark:text-amber-400">
                  {pendingComments.length} onay bekleyen yorum →
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Tüm yorumlar onaylı
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* KPI 3: İçerik & Depo Envanteri */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              İçerik Envanteri
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
              {news.length + galleriesCount + videosCount + pollsCount}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 flex flex-wrap gap-1">
              <span>{news.length} Haber</span> • 
              <span>{galleriesCount} Galeri</span> • 
              <span>{videosCount} Video</span> • 
              <span>{pollsCount} Anket</span>
            </div>
          </div>
        </div>

        {/* KPI 4: SEO Sağlık Skoru */}
        <Link
          href="/admin/ayarlar"
          className="group bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-red-500/50 hover:shadow-md transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              SEO Sağlık Skoru
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
                %{seoScore}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Mükemmel
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              Meta, robots.txt & Schema.org tam
            </div>
          </div>
        </Link>
      </div>

      {/* 4. CMS STÜDYOLARI HIZLI ERİŞİM KARTLARI */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-600" />
            CMS Yayın Stüdyoları & Modüller
          </h2>
          <span className="text-xs text-zinc-500">Tek tıkla içerik yönetimi</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Haber Masası */}
          <Link
            href="/admin/haberler"
            className="group p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-red-500/50 transition flex items-center gap-3.5 shadow-2xs"
          >
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 group-hover:scale-105 transition shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition">
                Haber Yönetim Masası
              </h3>
              <p className="text-xs text-zinc-500 truncate mt-0.5">
                {news.length} aktif haber, kategori ve yazar filtreleri
              </p>
            </div>
          </Link>

          {/* 2. Manşet Sıralayıcı */}
          <Link
            href="/admin/mansetler"
            className="group p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-red-500/50 transition flex items-center gap-3.5 shadow-2xs"
          >
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 group-hover:scale-105 transition shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition">
                Manşet Sıralayıcı (1-10)
              </h3>
              <p className="text-xs text-zinc-500 truncate mt-0.5">
                Drag & Drop görsel slot sıralama stüdyosu
              </p>
            </div>
          </Link>

          {/* 3. Foto Galeri */}
          <Link
            href="/admin/galeriler"
            className="group p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-red-500/50 transition flex items-center gap-3.5 shadow-2xs"
          >
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 group-hover:scale-105 transition shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 transition">
                Foto Galeri Stüdyosu
              </h3>
              <p className="text-xs text-zinc-500 truncate mt-0.5">
                {galleriesCount} albüm, sürükle-bırak çoklu yükleme
              </p>
            </div>
          </Link>

          {/* 4. Video Galeri */}
          <Link
            href="/admin/videolar"
            className="group p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-red-500/50 transition flex items-center gap-3.5 shadow-2xs"
          >
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 group-hover:scale-105 transition shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition">
                Video Galeri Stüdyosu
              </h3>
              <p className="text-xs text-zinc-500 truncate mt-0.5">
                {videosCount} video, otomatik YouTube ID ayıklama
              </p>
            </div>
          </Link>

          {/* 5. Anket & Kamuoyu */}
          <Link
            href="/admin/anketler"
            className="group p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-red-500/50 transition flex items-center gap-3.5 shadow-2xs"
          >
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 group-hover:scale-105 transition shrink-0">
              <Vote className="w-5 h-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 transition">
                Anket & Kamuoyu
              </h3>
              <p className="text-xs text-zinc-500 truncate mt-0.5">
                {pollsCount} anket, canlı katılım yüzdeleri ve analitik
              </p>
            </div>
          </Link>

          {/* 6. Kontrol Merkezi & Ayarlar */}
          <Link
            href="/admin/ayarlar"
            className="group p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-red-500/50 transition flex items-center gap-3.5 shadow-2xs"
          >
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:scale-105 transition shrink-0">
              <Settings className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition">
                Kontrol Merkezi & Ayarlar
              </h3>
              <p className="text-xs text-zinc-500 truncate mt-0.5">
                Widget anahtarları, künye, SEO ve kod enjeksiyonları
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* 5. GRAFİK VE OKUNMA TRENDİ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol 8: Ziyaret Grafiği */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Haftalık Okunma Trendi
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">Son 7 günün tekil sayfa görüntülemeleri</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-md">
              +16.4% Artış
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-4">
            {weeklyAnalytics.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] text-zinc-400 hidden sm:block">
                  {(item.views / 1000).toFixed(1)}k
                </span>
                <div
                  className="w-full bg-red-600/80 hover:bg-red-600 rounded-t-md transition-all duration-300"
                  style={{ height: `${item.percent}%` }}
                  title={`${item.day}: ${item.views.toLocaleString()} okunma`}
                />
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ 4: En Çok Okunan Haberler */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-amber-500" />
              Günün Trend Haberleri
            </h3>

            <div className="space-y-3">
              {news.slice(0, 4).map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0">
                  <span className="text-base font-black text-red-600 shrink-0 w-4">
                    {index + 1}
                  </span>
                  <div className="overflow-hidden flex-1">
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate hover:text-red-600 transition">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                      <Eye className="w-3 h-3" />
                      {item.views.toLocaleString()} okuma
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs">
            <span className="text-zinc-400">Gerçek zamanlı analitik</span>
            <Link href="/admin/haberler" className="text-red-600 font-bold hover:underline">
              Tümünü Gör →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
