"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { NewsItem, CategoryItem } from "@/types/news";
import {
  Search,
  PlusCircle,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  FileText,
  RotateCcw,
} from "lucide-react";

interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

interface HaberlerClientProps {
  initialNews: NewsItem[];
  categories: CategoryItem[];
  pagination: PaginationInfo;
  initialSearch?: string;
  initialCategory?: string;
  initialHeadline?: string;
}

export default function HaberlerClient({
  initialNews,
  categories,
  pagination,
  initialSearch = "",
  initialCategory = "all",
  initialHeadline = "all",
}: HaberlerClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [search, setSearch] = useState<string>(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedHeadline, setSelectedHeadline] = useState<string>(initialHeadline);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Server'dan yeni props geldiğinde state'i güncelle
  useEffect(() => {
    setNews(initialNews);
  }, [initialNews]);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setSelectedHeadline(initialHeadline);
  }, [initialHeadline]);

  // URL Güncelleme Yardımcısı
  const applyFilters = (newParams: {
    page?: number;
    search?: string;
    category?: string;
    headline?: string;
  }) => {
    const params = new URLSearchParams();

    const targetPage = newParams.page !== undefined ? newParams.page : 1;
    const targetSearch = newParams.search !== undefined ? newParams.search : search;
    const targetCategory = newParams.category !== undefined ? newParams.category : selectedCategory;
    const targetHeadline = newParams.headline !== undefined ? newParams.headline : selectedHeadline;

    if (targetPage > 1) params.set("page", targetPage.toString());
    if (targetSearch.trim()) params.set("search", targetSearch.trim());
    if (targetCategory && targetCategory !== "all") params.set("category", targetCategory);
    if (targetHeadline && targetHeadline !== "all") params.set("headline", targetHeadline);

    const qs = params.toString();
    const targetUrl = qs ? `${pathname}?${qs}` : pathname;

    startTransition(() => {
      router.push(targetUrl);
    });
  };

  // Sayfa Değiştirme
  const goToPage = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > pagination.totalPages || pageNumber === pagination.currentPage) {
      return;
    }
    applyFilters({ page: pageNumber });
  };

  // Arama Formu Gönderme (Enter veya Buton)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ page: 1, search });
  };

  // Filtreleri Sıfırla
  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedHeadline("all");
    applyFilters({ page: 1, search: "", category: "all", headline: "all" });
  };

  // Haber Silme İşlemi
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" başlıklı haberi kalıcı olarak silmek istiyor musunuz?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setNews((prev) => prev.filter((n) => n.id !== id));
        setNotification("Haber başarıyla silindi.");
        setTimeout(() => setNotification(null), 3500);
        router.refresh();
      } else {
        alert("Haber silinirken bir hata oluştu.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Haber silinirken bağlantı hatası oluştu.");
    } finally {
      setDeletingId(null);
    }
  };

  // Sayfalama Numaralandırma Algoritması (Akıllı Pencereleme)
  const getPaginationRange = () => {
    const total = pagination.totalPages;
    const current = pagination.currentPage;
    const delta = 1; // Aktif sayfanın sağında ve solunda kaç numara gösterilsin

    const range: (number | string)[] = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      range.unshift("...");
    }
    if (current + delta < total - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (total > 1) {
      range.push(total);
    }

    return range;
  };

  // Kayıt aralık hesaplaması
  const startItem = pagination.total === 0 ? 0 : (pagination.currentPage - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.total, pagination.currentPage * pagination.limit);

  return (
    <div className="space-y-6">
      {/* 1. Başlık, İstatistik ve Ekleme Butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              Haber Yönetimi
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50">
              20'li Sayfalama
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Toplam <strong>{pagination.total}</strong> haber kayıtlı. Sayfa başına maksimum 20 haber gösterilir.
          </p>
        </div>

        <Link
          href="/admin/yeni-haber"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Yeni Haber Ekle</span>
        </Link>
      </div>

      {notification && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. Filtre, Arama & Sayfalama Seçici Çubuğu */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Arama Formu */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md flex items-center gap-1.5">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Başlık, özet veya yazar ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl pl-9 pr-8 py-2 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  applyFilters({ page: 1, search: "" });
                }}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold rounded-xl hover:opacity-90 transition shrink-0"
          >
            Ara
          </button>
        </form>

        {/* Filtre Açılır Kutuları */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Kategori Filtresi */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedCategory(val);
              applyFilters({ page: 1, category: val });
            }}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Manşet Tipi Filtresi */}
          <select
            value={selectedHeadline}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedHeadline(val);
              applyFilters({ page: 1, headline: val });
            }}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="all">Tüm Yayın Tipleri</option>
            <option value="main">Ana Manşetler (1-10)</option>
            <option value="sub">Sürmanşetler</option>
            <option value="breaking">Flaş / Son Dakika</option>
            <option value="normal">Standart Haberler</option>
          </select>

          {(search || selectedCategory !== "all" || selectedHeadline !== "all") && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="p-2 text-xs text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition flex items-center gap-1"
              title="Filtreleri Temizle"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Temizle</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Haberler Tablosu (20'li Liste) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden relative">
        {isPending && (
          <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xs z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800">
              <span className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              Yükleniyor...
            </div>
          </div>
        )}

        {news.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
              Kriterlere Uygun Haber Bulunamadı
            </div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Arama ifadenizi veya kategori filtrenizi değiştirip tekrar deneyebilir veya tüm filtreleri sıfırlayabilirsiniz.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-xs font-bold rounded-xl transition inline-block mt-2"
            >
              Filtreleri Sıfırla
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5 pl-5">#</th>
                  <th className="p-3.5">Haber Başlığı</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5">Yayın Konumu</th>
                  <th className="p-3.5">Tarih</th>
                  <th className="p-3.5">Okunma</th>
                  <th className="p-3.5 pr-5 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {news.map((item, index) => {
                  const globalIndex = (pagination.currentPage - 1) * pagination.limit + index + 1;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition"
                    >
                      <td className="p-3.5 pl-5 font-mono text-zinc-400 font-bold text-[11px]">
                        {globalIndex}
                      </td>

                      <td className="p-3.5 flex items-center gap-3">
                        <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/50 dark:border-zinc-700/50">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="max-w-md">
                          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                            {item.title}
                          </h4>
                          <div className="text-[10px] text-zinc-400 mt-0.5">
                            Yazar: <span className="text-zinc-600 dark:text-zinc-300 font-medium">{item.author.name}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">
                          {item.categoryTitle}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {item.headlineType === "main" && (
                          <span className="bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            Ana Manşet #{item.headlineOrder || 1}
                          </span>
                        )}
                        {item.headlineType === "sub" && (
                          <span className="bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            Sürmanşet
                          </span>
                        )}
                        {item.headlineType === "normal" && (
                          <span className="text-zinc-400 text-[10px]">Normal Haber</span>
                        )}
                        {item.isBreaking && (
                          <span className="ml-1 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded text-[9px]">
                            Flaş
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-zinc-500 whitespace-nowrap">
                        {item.publishedAt}
                      </td>

                      <td className="p-3.5 font-mono text-zinc-700 dark:text-zinc-300 font-semibold">
                        {item.views.toLocaleString("tr-TR")}
                      </td>

                      <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/haber/${item.slug}`}
                            target="_blank"
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                            title="Önizle"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/haber-duzenle/${item.id}`}
                            className="p-1.5 text-blue-600 hover:text-blue-700 transition"
                            title="Düzenle"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            disabled={deletingId === item.id}
                            className="p-1.5 text-rose-500 hover:text-rose-700 transition disabled:opacity-50"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. MODERN 20'Lİ SAYFALAMA KONTROLLERİ (PAGINATION BAR) */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Sol: Bilgi & Aralık */}
          <div className="text-zinc-500 dark:text-zinc-400">
            {pagination.total > 0 ? (
              <span>
                Toplam <strong>{pagination.total}</strong> haber içerisinden{" "}
                <strong className="text-zinc-800 dark:text-zinc-200">{startItem}-{endItem}</strong> arası listeleniyor (Sayfa {pagination.currentPage} / {pagination.totalPages})
              </span>
            ) : (
              <span>Kayıt bulunamadı.</span>
            )}
          </div>

          {/* Sağ: Sayfa Butonları */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              {/* İlk Sayfa */}
              <button
                type="button"
                onClick={() => goToPage(1)}
                disabled={pagination.currentPage <= 1 || isPending}
                title="İlk Sayfa"
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-white transition"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Önceki Sayfa */}
              <button
                type="button"
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1 || isPending}
                title="Önceki Sayfa"
                className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-white transition flex items-center gap-1 font-bold text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Önceki</span>
              </button>

              {/* Sayfa Numaraları */}
              <div className="flex items-center gap-1 px-1">
                {getPaginationRange().map((p, idx) => {
                  if (p === "...") {
                    return (
                      <span key={`dots-${idx}`} className="px-1.5 text-zinc-400 font-bold">
                        ...
                      </span>
                    );
                  }

                  const pageNum = Number(p);
                  const isCurrent = pageNum === pagination.currentPage;

                  return (
                    <button
                      key={`page-${pageNum}`}
                      type="button"
                      onClick={() => goToPage(pageNum)}
                      disabled={isPending}
                      className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition ${
                        isCurrent
                          ? "bg-red-600 text-white shadow-xs"
                          : "border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Sonraki Sayfa */}
              <button
                type="button"
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages || isPending}
                title="Sonraki Sayfa"
                className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-white transition flex items-center gap-1 font-bold text-xs"
              >
                <span className="hidden sm:inline">Sonraki</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Son Sayfa */}
              <button
                type="button"
                onClick={() => goToPage(pagination.totalPages)}
                disabled={pagination.currentPage >= pagination.totalPages || isPending}
                title="Son Sayfa"
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-white transition"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
