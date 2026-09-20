"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Rss,
  X,
  Clock,
  ExternalLink,
  Download,
  Check,
  CheckSquare,
  Square,
  Filter,
  Sparkles,
  Layers,
  AlertCircle,
  Loader2,
  Tag,
} from "lucide-react";
import { RssFetchResult, RssParsedItem } from "@/lib/types/agency";
import { CategoryItem } from "@/types/news";

interface RssPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewData: RssFetchResult | null;
  categories: CategoryItem[];
  onImportSelected: (
    selectedGuids: string[],
    targetCategory?: string,
    itemCategories?: Record<string, string>
  ) => Promise<void>;
  isImporting: boolean;
}

export default function RssPreviewModal({
  isOpen,
  onClose,
  previewData,
  categories,
  onImportSelected,
  isImporting,
}: RssPreviewModalProps) {
  const [selectedGuids, setSelectedGuids] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<"all" | "new" | "imported">("all");
  
  // Dinamik Kategori Yönetimi
  const [globalCategory, setGlobalCategory] = useState<string>("gundem");
  const [itemCategories, setItemCategories] = useState<Record<string, string>>({});

  // Modal her açıldığında veya yeni ajans verisi geldiğinde
  useEffect(() => {
    if (previewData) {
      // Varsayılan olarak sadece yeni (eklenmemiş) haberleri seç
      const newGuids = previewData.items
        .filter((item) => !item.isImported)
        .map((item) => item.guid || item.link);
      setSelectedGuids(newGuids);
      
      const defaultCat = previewData.agency.defaultCategory || categories[0]?.key || "gundem";
      setGlobalCategory(defaultCat);
      
      // Tekil kategori state'ini sıfırla/başlat
      const initialItemCats: Record<string, string> = {};
      previewData.items.forEach((item) => {
        const guid = item.guid || item.link;
        initialItemCats[guid] = defaultCat;
      });
      setItemCategories(initialItemCats);

      setFilterType("all");
    }
  }, [previewData, categories]);

  if (!isOpen || !previewData) return null;

  const items = previewData.items || [];
  const newItems = items.filter((i) => !i.isImported);
  const importedItems = items.filter((i) => i.isImported);

  // Filtrelenmiş liste
  const filteredItems = items.filter((item) => {
    if (filterType === "new") return !item.isImported;
    if (filterType === "imported") return item.isImported;
    return true;
  });

  const allVisibleGuids = filteredItems.map((i) => i.guid || i.link);
  const isAllVisibleSelected =
    allVisibleGuids.length > 0 &&
    allVisibleGuids.every((guid) => selectedGuids.includes(guid));

  // Tek tek seçim aç/kapa
  const toggleSelect = (guid: string) => {
    setSelectedGuids((prev) =>
      prev.includes(guid) ? prev.filter((id) => id !== guid) : [...prev, guid]
    );
  };

  // Tümünü Seç / Seçimi Kaldır
  const toggleSelectAll = () => {
    if (isAllVisibleSelected) {
      const visibleSet = new Set(allVisibleGuids);
      setSelectedGuids((prev) => prev.filter((id) => !visibleSet.has(id)));
    } else {
      const newSelection = Array.from(new Set([...selectedGuids, ...allVisibleGuids]));
      setSelectedGuids(newSelection);
    }
  };

  // Sadece Yeni Haberleri Seç
  const selectOnlyNew = () => {
    const newGuids = newItems.map((i) => i.guid || i.link);
    setSelectedGuids(newGuids);
  };

  // Seçimi tamamen temizle
  const clearSelection = () => {
    setSelectedGuids([]);
  };

  // Genel Kategori Değiştirildiğinde
  const handleGlobalCategoryChange = (newCat: string) => {
    setGlobalCategory(newCat);
    // Tüm öğelerin kategorisini de topluca güncelle
    setItemCategories((prev) => {
      const updated = { ...prev };
      items.forEach((item) => {
        const guid = item.guid || item.link;
        updated[guid] = newCat;
      });
      return updated;
    });
  };

  // Tekil Haber İçin Kategori Değiştirildiğinde
  const handleItemCategoryChange = (guid: string, newCat: string) => {
    setItemCategories((prev) => ({
      ...prev,
      [guid]: newCat,
    }));
  };

  // Aktarımı Başlat
  const handleImport = () => {
    if (selectedGuids.length === 0) {
      alert("Lütfen sisteme aktarmak için en az bir haber seçiniz.");
      return;
    }

    if (!globalCategory) {
      alert("Lütfen hedef kategori seçiniz.");
      return;
    }

    // Seçilen haberler için tekil kategori haritasını hazırla
    const finalItemCategories: Record<string, string> = {};
    selectedGuids.forEach((guid) => {
      finalItemCategories[guid] = itemCategories[guid] || globalCategory;
    });

    onImportSelected(selectedGuids, globalCategory, finalItemCategories);
  };

  const selectedCategoryName =
    categories.find((c) => c.key === globalCategory)?.name || globalCategory.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* 1. MODAL BAŞLIĞI */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-white dark:bg-zinc-900">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
                <Rss className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">
                {previewData.agency.name} — RSS Akış Önizlemesi
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              <span>Toplam {previewData.totalFound} haber tarandı</span>
              <span>•</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {previewData.newItemsCount} yeni haber yayına hazır
              </span>
              <span>•</span>
              <span className="text-zinc-400">
                {importedItems.length} haber zaten ekli
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. SEÇİM KONTROL & FİLTRELEME ARAÇ ÇUBUĞU */}
        <div className="px-5 sm:px-6 py-3 bg-zinc-50 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Sol: Ana Seçim Butonu & Hızlı Filtreler */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                isAllVisibleSelected
                  ? "bg-amber-500 text-black border-amber-600 shadow-xs"
                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-amber-500"
              }`}
            >
              {isAllVisibleSelected ? (
                <CheckSquare className="w-4 h-4 text-black" />
              ) : (
                <Square className="w-4 h-4 text-zinc-400" />
              )}
              <span>{isAllVisibleSelected ? "Seçimi Kaldır" : "Tümünü Seç"}</span>
            </button>

            {/* Sadece Yenileri Seç */}
            {newItems.length > 0 && (
              <button
                type="button"
                onClick={selectOnlyNew}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100 transition"
              >
                Sadece Yenileri Seç ({newItems.length})
              </button>
            )}

            {/* Seçimi Temizle */}
            {selectedGuids.length > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                className="px-2.5 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-red-600 transition"
              >
                Temizle
              </button>
            )}
          </div>

          {/* Sağ: Filtre Sekmeleri & Sayaç */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className="flex items-center bg-zinc-200/80 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setFilterType("all")}
                className={`px-2.5 py-1 rounded-md transition text-[11px] ${
                  filterType === "all"
                    ? "bg-white dark:bg-zinc-900 font-bold text-zinc-900 dark:text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Tümü ({items.length})
              </button>
              <button
                onClick={() => setFilterType("new")}
                className={`px-2.5 py-1 rounded-md transition text-[11px] ${
                  filterType === "new"
                    ? "bg-white dark:bg-zinc-900 font-bold text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Yeniler ({newItems.length})
              </button>
              <button
                onClick={() => setFilterType("imported")}
                className={`px-2.5 py-1 rounded-md transition text-[11px] ${
                  filterType === "imported"
                    ? "bg-white dark:bg-zinc-900 font-bold text-zinc-900 dark:text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                Ekliler ({importedItems.length})
              </button>
            </div>

            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 pl-2">
              <span className="text-amber-600 dark:text-amber-400 font-black">
                {selectedGuids.length}
              </span>{" "}
              / {items.length} seçildi
            </div>
          </div>
        </div>

        {/* 3. MODAL İÇERİK: HABER KARTLARI LİSTESİ */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1 bg-zinc-100/40 dark:bg-zinc-950/40">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-zinc-400 mx-auto" />
              <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                Seçilen filtre kriterine uygun haber bulunamadı.
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const guid = item.guid || item.link;
              const isSelected = selectedGuids.includes(guid);
              const currentItemCat = itemCategories[guid] || globalCategory;

              return (
                <div
                  key={guid || idx}
                  onClick={() => toggleSelect(guid)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row gap-4 items-start relative select-none ${
                    isSelected
                      ? "bg-amber-50/70 dark:bg-amber-950/20 border-amber-500/80 shadow-xs ring-2 ring-amber-500/30"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  } ${item.isImported ? "opacity-75" : ""}`}
                >
                  {/* SOL ÜST CHECKBOX */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(guid);
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition border ${
                        isSelected
                          ? "bg-amber-500 border-amber-600 text-black shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-transparent hover:border-amber-400"
                      }`}
                    >
                      <Check className={`w-4 h-4 stroke-[3] ${isSelected ? "text-black" : "text-transparent"}`} />
                    </button>

                    {item.imageUrl && (
                      <div className="relative w-24 sm:w-32 aspect-16/10 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* HABER BİLGİ ALANI */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.isImported ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            ✓ Zaten Ekli
                          </span>
                        ) : (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            ★ Yeni Haber
                          </span>
                        )}

                        {isSelected && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                            Seçildi
                          </span>
                        )}

                        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.pubDate}
                        </span>
                      </div>

                      {/* TEKİL KATEGORİ SEÇİCİ (ÖZEL KATEGORİ ATAMA) */}
                      <div
                        className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tag className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                          Kategori:
                        </span>
                        <select
                          value={currentItemCat}
                          onChange={(e) => handleItemCategoryChange(guid, e.target.value)}
                          className="text-[11px] font-bold bg-transparent text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                        >
                          {categories.map((cat) => (
                            <option key={cat.key} value={cat.key} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug line-clamp-2">
                      {item.title}
                    </h4>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-1 flex items-center justify-between">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Orijinal Kaynağa Git</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 4. MODAL ALT BİLGİ, DİNAMİK KATEGORİ SEÇİCİ VE ANA AKSİYON */}
        <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Sol: TOPLU HEDEF KATEGORİ SEÇİMİ */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 shrink-0">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Toplu Hedef Kategori:</span>
            </div>
            <select
              value={globalCategory}
              onChange={(e) => handleGlobalCategoryChange(e.target.value)}
              className="px-3 py-2 rounded-xl border bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key} className="bg-white dark:bg-zinc-900">
                  {cat.name} ({cat.key.toUpperCase()})
                </option>
              ))}
            </select>
            <span className="text-[11px] text-zinc-400 hidden sm:inline">
              (Her habere yukarıdan ayrı kategori de atayabilirsiniz)
            </span>
          </div>

          {/* Sağ: İPTAL VE AKTARIM BUTONLARI */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Vazgeç
            </button>

            <button
              type="button"
              disabled={isImporting || selectedGuids.length === 0}
              onClick={handleImport}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                selectedGuids.length > 0
                  ? "bg-amber-500 hover:bg-amber-600 text-black active:scale-95"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
              }`}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Sisteme Aktarılıyor...</span>
                </>
              ) : selectedGuids.length > 0 ? (
                <>
                  <Download className="w-4 h-4 text-black" />
                  <span>Seçilen {selectedGuids.length} Haberi Aktar</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Haber Seçiniz</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
