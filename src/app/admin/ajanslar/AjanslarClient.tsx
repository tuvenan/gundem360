"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { NewsAgency, RssParsedItem, RssFetchResult } from "@/lib/types/agency";
import { CategoryItem } from "@/types/news";
import RssPreviewModal from "@/components/admin/RssPreviewModal";
import {
  Rss,
  Radio,
  Plus,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Sparkles,
  Zap,
  Globe,
  FileText,
  X,
  Send,
  Sliders,
  Check,
} from "lucide-react";

interface AjanslarClientProps {
  initialAgencies: NewsAgency[];
  categories: CategoryItem[];
}

export default function AjanslarClient({
  initialAgencies,
  categories,
}: AjanslarClientProps) {
  const router = useRouter();

  const [agencies, setAgencies] = useState<NewsAgency[]>(initialAgencies);
  const [loadingAgencyId, setLoadingAgencyId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // RSS Önizleme Modal State'i
  const [previewData, setPreviewData] = useState<RssFetchResult | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Ajans Ekleme / Düzenleme Modal State'i
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<NewsAgency | null>(null);
  const [agencyForm, setAgencyForm] = useState({
    name: "",
    websiteUrl: "",
    rssUrl: "",
    logoUrl: "",
    defaultCategory: "gundem",
    autoPublish: false,
    status: "active" as "active" | "inactive",
  });

  const totalAgencies = agencies.length;
  const activeAgencies = agencies.filter((a) => a.status === "active").length;
  const totalFetched = agencies.reduce((acc, a) => acc + (a.fetchedCount || 0), 0);

  // Bildirim Göster
  const notify = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // 1. RSS Akışını Tara ve Önizle
  const handleFetchPreview = async (agency: NewsAgency) => {
    setLoadingAgencyId(agency.id);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/rss-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId: agency.id,
          previewOnly: true,
          limit: 25,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setPreviewData(data.data);
        setIsPreviewOpen(true);
        notify("success", `${agency.name} akışı başarıyla tarandı.`);
      } else {
        notify("error", data.error || "RSS akışı taranamadı.");
      }
    } catch (err: any) {
      console.error(err);
      notify("error", "RSS kaynağına bağlanırken sunucu hatası oluştu.");
    } finally {
      setLoadingAgencyId(null);
    }
  };

  // 2. Hızlı Doğrudan İçe Aktar (Yeni haberleri anında kaydet)
  const handleQuickImport = async (agency: NewsAgency) => {
    setLoadingAgencyId(agency.id);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/rss-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId: agency.id,
          previewOnly: false,
          limit: 20,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        notify("success", data.message || "Haberler başarıyla sisteme aktarıldı!");
        // Ajans listesini güncelle
        setAgencies((prev) =>
          prev.map((a) => (a.id === agency.id ? data.data.agency : a))
        );
        router.refresh();
      } else {
        notify("error", data.error || "Haberler içe aktarılamadı.");
      }
    } catch (err: any) {
      console.error(err);
      notify("error", "İçe aktarma sırasında sunucu hatası oluştu.");
    } finally {
      setLoadingAgencyId(null);
    }
  };

  // 3. Önizleme Modalından Seçilen Haberleri İçe Aktar
  const handleImportFromPreview = async (
    selectedGuids: string[],
    category?: string,
    itemCategories?: Record<string, string>
  ) => {
    if (!previewData?.agency) return;

    setIsImporting(true);
    try {
      const res = await fetch("/api/admin/rss-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId: previewData.agency.id,
          previewOnly: false,
          limit: 25,
          targetCategory: category || "gundem",
          itemCategories,
          selectedGuids,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        notify("success", `Tebrikler! ${data.data.importedCount} adet seçilen haber başarıyla sisteme aktarıldı ve yayına alındı!`);
        setIsPreviewOpen(false);
        setAgencies((prev) =>
          prev.map((a) => (a.id === previewData.agency.id ? data.data.agency : a))
        );
        router.refresh();
      } else {
        notify("error", data.error || "İçe aktarma başarısız.");
      }
    } catch (err) {
      console.error(err);
      notify("error", "Bağlantı hatası oluştu.");
    } finally {
      setIsImporting(false);
    }
  };

  // 4. Ajans Kaydet / Güncelle
  const handleSaveAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyForm.name.trim() || !agencyForm.rssUrl.trim()) {
      notify("error", "Lütfen ajans adı ve RSS URL adresini doldurun.");
      return;
    }

    try {
      if (editingAgency) {
        // Güncelle
        const res = await fetch("/api/admin/agencies", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingAgency.id,
            ...agencyForm,
          }),
        });
        const updated = await res.json();
        if (res.ok) {
          setAgencies((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
          notify("success", "Ajans bilgileri güncellendi.");
          setIsAgencyModalOpen(false);
        } else {
          notify("error", updated.error || "Güncelleme başarısız.");
        }
      } else {
        // Yeni Ekle
        const res = await fetch("/api/admin/agencies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(agencyForm),
        });
        const created = await res.json();
        if (res.ok) {
          setAgencies((prev) => [created, ...prev]);
          notify("success", "Yeni ajans başarıyla eklendi.");
          setIsAgencyModalOpen(false);
        } else {
          notify("error", created.error || "Ajans eklenemedi.");
        }
      }
    } catch (err) {
      console.error(err);
      notify("error", "Sunucu bağlantı hatası.");
    }
  };

  // 5. Ajans Sil
  const handleDeleteAgency = async (id: string, name: string) => {
    if (!confirm(`"${name}" ajansını silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/admin/agencies?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAgencies((prev) => prev.filter((a) => a.id !== id));
        notify("success", `"${name}" ajansı silindi.`);
      } else {
        notify("error", "Ajans silinemedi.");
      }
    } catch (err) {
      console.error(err);
      notify("error", "Silme işleminde sunucu hatası oluştu.");
    }
  };

  const openNewAgencyModal = () => {
    setEditingAgency(null);
    setAgencyForm({
      name: "",
      websiteUrl: "https://",
      rssUrl: "",
      logoUrl: "",
      defaultCategory: "gundem",
      autoPublish: false,
      status: "active",
    });
    setIsAgencyModalOpen(true);
  };

  const openEditAgencyModal = (agency: NewsAgency) => {
    setEditingAgency(agency);
    setAgencyForm({
      name: agency.name,
      websiteUrl: agency.websiteUrl,
      rssUrl: agency.rssUrl,
      logoUrl: agency.logoUrl || "",
      defaultCategory: agency.defaultCategory || "gundem",
      autoPublish: agency.autoPublish,
      status: agency.status,
    });
    setIsAgencyModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* 1. ÜST BAŞLIK VE KONTROL BARI */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950 p-6 sm:p-8 rounded-3xl border border-zinc-800 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>RSS & Ajans Entegrasyonu v1.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-2.5">
            <Rss className="w-8 h-8 text-amber-500" />
            <span>Ajans & RSS Akış Yönetim Merkezi</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            Harici haber ajanslarının RSS/XML akışlarını tarayın, yeni haberleri tespit edin ve tek tıkla sitenize aktararak
            okurlarınıza anlık gündem akışı sunun.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewAgencyModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-amber-500/20 cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Ajans Ekle</span>
        </button>
      </div>

      {/* BİLDİRİM BANNERI */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold animate-in fade-in ${
            notification.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 2. ÖZET İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Kayıtlı Ajans</span>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">{totalAgencies}</div>
          <span className="text-[10px] text-zinc-500">Kaynak besleme</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Aktif Akışlar</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeAgencies}</div>
          <span className="text-[10px] text-zinc-500">Taramaya hazır</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Çekilen Haberler</span>
          <div className="text-2xl font-black text-amber-500">{totalFetched}</div>
          <span className="text-[10px] text-zinc-500">Sisteme aktarıldı</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Otomasyon</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">Aktif</div>
          <span className="text-[10px] text-zinc-500">Akıllı duplicate filtresi</span>
        </div>
      </div>

      {/* 3. AJANS LİSTESİ */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>Tanımlı Ajanslar ve Akışlar ({agencies.length})</span>
          </h2>
          <span className="text-xs text-zinc-400">Her akışı önizleyebilir veya tek tıkla içeri aktarabilirsiniz</span>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {agencies.map((agency) => {
            const isLoading = loadingAgencyId === agency.id;

            return (
              <div
                key={agency.id}
                className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition"
              >
                {/* Sol: Ajans Kimlik Bilgileri */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 flex items-center justify-center">
                    {agency.logoUrl ? (
                      <Image src={agency.logoUrl} alt={agency.name} fill className="object-cover" />
                    ) : (
                      <Rss className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white truncate">
                        {agency.name}
                      </h3>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          agency.status === "active"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {agency.status === "active" ? "Aktif" : "Pasif"}
                      </span>
                      {agency.autoPublish && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          Oto-Yayın
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-mono text-[11px] truncate max-w-xs text-zinc-400">
                        {agency.rssUrl}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400 text-[10px] bg-amber-500/10 px-2 py-0.5 rounded">
                        Kategori: Dinamik Seçim (Önizlemede)
                      </span>
                      {agency.lastFetchedAt && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                            <Clock className="w-3 h-3" /> Son tarama: {agency.lastFetchedAt}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sağ: Aksiyon Butonları */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Önizle Butonu */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleFetchPreview(agency)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    <span>Önizle</span>
                  </button>

                  {/* Hızlı İçe Aktar Butonu */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleQuickImport(agency)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-black uppercase tracking-wider transition shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>İçe Aktar</span>
                  </button>

                  {/* Düzenle */}
                  <button
                    type="button"
                    onClick={() => openEditAgencyModal(agency)}
                    className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-lg transition"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Sil */}
                  <button
                    type="button"
                    onClick={() => handleDeleteAgency(agency.id, agency.name)}
                    className="p-2 text-zinc-400 hover:text-red-600 rounded-lg transition"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. RSS AKIŞI SEÇMELİ ÖNİZLEME MODALI                       */}
      {/* ========================================================= */}
      <RssPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        previewData={previewData}
        categories={categories}
        onImportSelected={handleImportFromPreview}
        isImporting={isImporting}
      />


      {/* ========================================================= */}
      {/* 5. AJANS EKLE / DÜZENLE MODALI                            */}
      {/* ========================================================= */}
      {isAgencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Rss className="w-5 h-5 text-amber-500" />
                <span>{editingAgency ? "Ajans Bilgilerini Düzenle" : "Yeni Ajans / RSS Kaynağı Ekle"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAgencyModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAgency} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                  Ajans Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Anadolu Ajansı (AA)"
                  value={agencyForm.name}
                  onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-3 text-xs font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                  RSS / XML Akış Adresi *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.aa.com.tr/tr/rss/default?cat=guncel"
                  value={agencyForm.rssUrl}
                  onChange={(e) => setAgencyForm({ ...agencyForm, rssUrl: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-3 text-xs font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                    Web Sitesi URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={agencyForm.websiteUrl}
                    onChange={(e) => setAgencyForm({ ...agencyForm, websiteUrl: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <span className="font-bold shrink-0">💡 Dinamik Kategori:</span>
                  <span>Ajans eklerken sabit kategori zorunluluğu kaldırılmıştır. RSS akışındaki haberlerin kategorisi, aktarım anında önizleme ekranından tek tek veya toplu olarak seçilir.</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                  Ajans Logo Görsel URL (İsteğe Bağlı)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={agencyForm.logoUrl}
                  onChange={(e) => setAgencyForm({ ...agencyForm, logoUrl: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Tercihler */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <input
                    type="checkbox"
                    id="autoPublishCheck"
                    checked={agencyForm.autoPublish}
                    onChange={(e) => setAgencyForm({ ...agencyForm, autoPublish: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="autoPublishCheck" className="text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                    Çekilen haberleri doğrudan ana manşet vitrininde yayınla (Oto-Yayın)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAgencyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-black uppercase tracking-wider transition shadow-md cursor-pointer"
                >
                  {editingAgency ? "Değişiklikleri Kaydet" : "Ajansı Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
