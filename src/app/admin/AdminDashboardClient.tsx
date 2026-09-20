"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NewsItem } from "@/types/news";
import {
  PlusCircle,
  Trash2,
  Eye,
  FileText,
  TrendingUp,
  Layers,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

interface AdminDashboardClientProps {
  initialNews: NewsItem[];
}

export default function AdminDashboardClient({
  initialNews,
}: AdminDashboardClientProps) {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const totalViews = news.reduce((acc, item) => acc + item.views, 0);
  const mainHeadlinesCount = news.filter((n) => n.headlineType === "main").length;

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" başlıklı haberi silmek istediğinize emin misiniz?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setNews((prev) => prev.filter((n) => n.id !== id));
        setMessage("Haber başarıyla silindi.");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Silme hatası:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            İçerik Yönetim Paneli (CMS)
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Haberleri yayınlayın, manşetleri düzenleyin ve içerik performansını izleyin.
          </p>
        </div>

        <Link
          href="/admin/yeni-haber"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition shadow-xs w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Yeni Haber Ekle</span>
        </Link>
      </div>

      {message && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-lg">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium">Toplam Haber</span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
              {news.length}
            </div>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium">Toplam Okunma</span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
              {totalViews.toLocaleString("tr-TR")}
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium">Ana Manşetler</span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
              {mainHeadlinesCount}
            </div>
          </div>
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium">Kategoriler</span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
              7
            </div>
          </div>
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Haberler Tablosu */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-tight">
            Yayınlanan Haberler ({news.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Haber</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Manşet Durumu</th>
                <th className="p-3.5">Tarih</th>
                <th className="p-3.5">Okunma</th>
                <th className="p-3.5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition">
                  <td className="p-3.5 flex items-center gap-3">
                    <div className="relative w-12 h-9 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="max-w-md">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {item.author.name}
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      {item.categoryTitle}
                    </span>
                  </td>

                  <td className="p-3.5">
                    {item.headlineType === "main" && (
                      <span className="bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold px-2 py-0.5 rounded text-[10px]">
                        Ana Manşet #{item.headlineOrder || 1}
                      </span>
                    )}
                    {item.headlineType === "sub" && (
                      <span className="bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded text-[10px]">
                        Sürmanşet
                      </span>
                    )}
                    {item.headlineType === "normal" && (
                      <span className="text-zinc-400 text-[10px]">Normal</span>
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

                  <td className="p-3.5 font-mono text-zinc-700 dark:text-zinc-300">
                    {item.views.toLocaleString("tr-TR")}
                  </td>

                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/haber/${item.slug}`}
                        target="_blank"
                        className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                        title="Haberi Görüntüle"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        disabled={deletingId === item.id}
                        className="p-1 text-rose-500 hover:text-rose-700 transition disabled:opacity-50"
                        title="Haberi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
