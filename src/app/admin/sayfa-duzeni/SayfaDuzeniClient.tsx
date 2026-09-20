"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutBlock, LayoutBlockType } from "@/lib/types/layout";
import {
  Layers,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Flame,
  LayoutGrid,
  Newspaper,
  Feather,
  Images,
  Video,
  Vote,
  DollarSign,
  FolderTree,
  Sliders,
  Sparkles,
  Info,
  Loader2,
} from "lucide-react";

interface SayfaDuzeniClientProps {
  initialLayout: LayoutBlock[];
}

const cloneBlocks = (arr: LayoutBlock[]): LayoutBlock[] =>
  arr.map((b, idx) => ({
    ...b,
    order: idx + 1,
    config: b.config ? { ...b.config } : undefined,
  }));

export default function SayfaDuzeniClient({ initialLayout }: SayfaDuzeniClientProps) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<LayoutBlock[]>(() => cloneBlocks(initialLayout));
  const [originalBlocks, setOriginalBlocks] = useState<LayoutBlock[]>(() => cloneBlocks(initialLayout));
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Kaydedilmemiş değişiklik var mı kontrolü
  const hasChanges = isDirty || JSON.stringify(blocks) !== JSON.stringify(originalBlocks);

  // İkon seçici
  const getBlockIcon = (type: LayoutBlockType) => {
    switch (type) {
      case "breaking-ticker":
        return <Flame className="w-5 h-5 text-red-500" />;
      case "finance-bar":
        return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case "classic-hero":
        return <Sliders className="w-5 h-5 text-blue-500" />;
      case "surmanset-grid":
        return <LayoutGrid className="w-5 h-5 text-purple-500" />;
      case "category-block":
        return <FolderTree className="w-5 h-5 text-amber-500" />;
      case "columnists-section":
        return <Feather className="w-5 h-5 text-indigo-500" />;
      case "photo-gallery-grid":
        return <Images className="w-5 h-5 text-rose-500" />;
      case "video-gallery-grid":
        return <Video className="w-5 h-5 text-orange-500" />;
      case "poll-widget":
        return <Vote className="w-5 h-5 text-teal-500" />;
      default:
        return <Layers className="w-5 h-5 text-zinc-500" />;
    }
  };

  // Blok Tipi Etiketi
  const getBlockTypeLabel = (type: LayoutBlockType) => {
    switch (type) {
      case "breaking-ticker":
        return "Flaş Bant";
      case "finance-bar":
        return "Finans & Borsa";
      case "classic-hero":
        return "1-10 Manşet";
      case "surmanset-grid":
        return "Sürmanşet";
      case "category-block":
        return "Kategori Vitrini";
      case "columnists-section":
        return "Köşe Yazarları";
      case "photo-gallery-grid":
        return "Foto Galeri";
      case "video-gallery-grid":
        return "Video Galeri";
      case "poll-widget":
        return "Kamuoyu & Anket";
      default:
        return "Özel Modül";
    }
  };

  // Yukarı Taşı
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setBlocks((prev) => {
      const next = cloneBlocks(prev);
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      next.forEach((b, i) => {
        b.order = i + 1;
      });
      return next;
    });
    setIsDirty(true);
    setStatusMessage(null);
  };

  // Aşağı Taşı
  const handleMoveDown = (index: number) => {
    if (index >= blocks.length - 1) return;
    setBlocks((prev) => {
      const next = cloneBlocks(prev);
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      next.forEach((b, i) => {
        b.order = i + 1;
      });
      return next;
    });
    setIsDirty(true);
    setStatusMessage(null);
  };

  // Görünürlük Aç/Kapa
  const handleToggleVisibility = (index: number) => {
    setBlocks((prev) => {
      const next = cloneBlocks(prev);
      next[index].isVisible = !next[index].isVisible;
      return next;
    });
    setIsDirty(true);
    setStatusMessage(null);
  };

  // Kaydet
  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/layout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const savedLayout = data.layout && Array.isArray(data.layout) ? data.layout : blocks;
        setBlocks(cloneBlocks(savedLayout));
        setOriginalBlocks(cloneBlocks(savedLayout));
        setIsDirty(false);
        router.refresh();
        setStatusMessage({
          type: "success",
          text: "Sayfa düzeni ve blok sıralaması başarıyla kaydedildi! Ana sayfa anında güncellendi.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Kaydedilirken bir hata oluştu.",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Sunucu bağlantı hatası oluştu.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Varsayılana Sıfırla
  const handleReset = async () => {
    if (
      !confirm(
        "Tüm blok sıralamasını ve görünürlük ayarlarını varsayılan fabrika ayarlarına döndürmek istediğinize emin misiniz?"
      )
    ) {
      return;
    }

    setIsResetting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });

      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.layout)) {
        setBlocks(cloneBlocks(data.layout));
        setOriginalBlocks(cloneBlocks(data.layout));
        setIsDirty(false);
        router.refresh();
        setStatusMessage({
          type: "info",
          text: "Sayfa düzeni varsayılan ayarlara sıfırlandı ve kaydedildi.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Sıfırlanırken hata oluştu.",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Sunucu bağlantı hatası oluştu.",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const activeCount = blocks.filter((b) => b.isVisible).length;
  const passiveCount = blocks.length - activeCount;

  return (
    <div className="space-y-6 pb-20">
      {/* 1. BAŞLIK VE HIZLI EYLEMLER */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-red-600/10 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                Modüler Sayfa Düzeni (Layout Builder)
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                  <Sparkles className="w-3 h-3" /> Canlı Vitrin
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Ana sayfada yer alan tüm bölümlerin sırasını, görünürlüğünü ve hiyerarşisini anlık yönetin.
              </p>
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Önizle
          </a>
          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting || isSaving}
            className="px-3.5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
            Varsayılana Sıfırla
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer ${
              hasChanges
                ? "bg-red-600 hover:bg-red-700 ring-2 ring-red-500/50 animate-pulse"
                : "bg-red-600 hover:bg-red-700 opacity-90"
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{hasChanges ? "Düzeni Kaydet ●" : "Düzeni Kaydet"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. DURUM MESAJI VE BİLGİLENDİRME */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
              : statusMessage.type === "info"
              ? "bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800"
              : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 3. İSTATİSTİK & REHBER ŞERİDİ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 font-medium">Toplam Modül</span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-0.5">
              {blocks.length}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Yayında Olanlar</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {activeCount}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 font-medium">Gizlenen (Pasif)</span>
            <div className="text-2xl font-black text-zinc-600 dark:text-zinc-400 mt-0.5">
              {passiveCount}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            <EyeOff className="w-5 h-5" />
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Sıralama veya görünürlükte kaydedilmemiş değişiklikler var. Ana sayfaya anında yansıması için <strong>"Düzeni Kaydet"</strong> butonuna tıklayın.
            </span>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition cursor-pointer"
          >
            {isSaving ? "Kaydediliyor..." : "Hemen Kaydet"}
          </button>
        </div>
      )}

      {/* 4. DİNAMİK BLOK LİSTESİ */}
      <div className="space-y-3">
        {blocks.map((block, index) => {
          const isFirst = index === 0;
          const isLast = index === blocks.length - 1;

          return (
            <div
              key={block.id}
              className={`group bg-white dark:bg-zinc-900 border transition-all rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                block.isVisible
                  ? "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs"
                  : "border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/40 opacity-70"
              }`}
            >
              {/* Sol: Sıra Numarası, İkon ve Bilgiler */}
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                {/* Sıra Numarası */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                    block.isVisible
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
                  }`}
                >
                  #{index + 1}
                </div>

                {/* Modül İkonu */}
                <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl shrink-0">
                  {getBlockIcon(block.type)}
                </div>

                {/* Başlık & Detay */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`text-sm sm:text-base font-black tracking-tight ${
                        block.isVisible
                          ? "text-zinc-900 dark:text-white"
                          : "text-zinc-500 dark:text-zinc-400 line-through"
                      }`}
                    >
                      {block.title}
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                      {getBlockTypeLabel(block.type)}
                    </span>
                    {block.config?.categoryKey && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Kategori: {block.config.categoryKey}
                      </span>
                    )}
                  </div>
                  {block.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-md sm:max-w-xl">
                      {block.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Sağ: Sıralama Butonları ve Görünürlük Switch */}
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                {/* Sıralama Taşıma Butonları */}
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={isFirst}
                    title="Yukarı Taşı"
                    aria-label="Yukarı Taşı"
                    className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={isLast}
                    title="Aşağı Taşı"
                    aria-label="Aşağı Taşı"
                    className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Görünürlük Durumu */}
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(index)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    block.isVisible
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-100"
                      : "bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {block.isVisible ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Aktif</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Gizli</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. ALT SABİT KAYDET BAR */}
      {hasChanges && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 dark:bg-zinc-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-xl border border-zinc-700 flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <div className="text-xs">
            <span className="font-bold text-amber-400">● Değişiklikler yapıldı.</span>
            <span className="hidden sm:inline text-zinc-300 ml-1.5">
              Ana sayfaya aktarmak için kaydedin.
            </span>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Kaydet</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
