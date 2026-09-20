"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarWidget, SidebarWidgetType } from "@/lib/types/sidebar";
import {
  PanelRightClose,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Edit3,
  Trash2,
  ExternalLink,
  Flame,
  DollarSign,
  CloudSun,
  Vote,
  ImageIcon,
  Code,
  Sparkles,
  Info,
  X,
  Settings,
} from "lucide-react";

interface SagBlokClientProps {
  initialWidgets: SidebarWidget[];
}

const cloneWidgets = (arr: SidebarWidget[]): SidebarWidget[] =>
  arr.map((w, idx) => ({
    ...w,
    order: idx + 1,
    config: w.config ? { ...w.config } : undefined,
  }));

export default function SagBlokClient({ initialWidgets }: SagBlokClientProps) {
  const router = useRouter();
  const [widgets, setWidgets] = useState<SidebarWidget[]>(() => cloneWidgets(initialWidgets));
  const [originalWidgets, setOriginalWidgets] = useState<SidebarWidget[]>(() => cloneWidgets(initialWidgets));
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Düzenleme Modalı State
  const [editingWidget, setEditingWidget] = useState<SidebarWidget | null>(null);

  // Yeni Widget Modalı State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWidgetType, setNewWidgetType] = useState<SidebarWidgetType>("banner");
  const [newWidgetTitle, setNewWidgetTitle] = useState("");
  const [newWidgetImageUrl, setNewWidgetImageUrl] = useState("");
  const [newWidgetTargetUrl, setNewWidgetTargetUrl] = useState("");
  const [newWidgetAltText, setNewWidgetAltText] = useState("");
  const [newWidgetHtml, setNewWidgetHtml] = useState("");

  const hasChanges = isDirty || JSON.stringify(widgets) !== JSON.stringify(originalWidgets);

  const getWidgetIcon = (type: SidebarWidgetType) => {
    switch (type) {
      case "most-read":
        return <Flame className="w-5 h-5 text-red-500" />;
      case "finance":
        return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case "weather":
        return <CloudSun className="w-5 h-5 text-sky-500" />;
      case "poll":
        return <Vote className="w-5 h-5 text-purple-500" />;
      case "banner":
        return <ImageIcon className="w-5 h-5 text-amber-500" />;
      case "custom-html":
        return <Code className="w-5 h-5 text-indigo-500" />;
      default:
        return <PanelRightClose className="w-5 h-5 text-zinc-500" />;
    }
  };

  const getWidgetTypeLabel = (type: SidebarWidgetType) => {
    switch (type) {
      case "most-read":
        return "Çok Okunanlar";
      case "finance":
        return "Piyasalar";
      case "weather":
        return "Hava Durumu";
      case "poll":
        return "Anket";
      case "banner":
        return "Sponsor / Banner";
      case "custom-html":
        return "Özel HTML / Kod";
      default:
        return "Sağ Blok";
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = cloneWidgets(widgets);
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    newItems.forEach((w, i) => (w.order = i + 1));
    setWidgets(newItems);
    setIsDirty(true);
  };

  const handleMoveDown = (index: number) => {
    if (index === widgets.length - 1) return;
    const newItems = cloneWidgets(widgets);
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    newItems.forEach((w, i) => (w.order = i + 1));
    setWidgets(newItems);
    setIsDirty(true);
  };

  const handleToggleVisibility = (index: number) => {
    const newItems = cloneWidgets(widgets);
    newItems[index].isVisible = !newItems[index].isVisible;
    setWidgets(newItems);
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/sidebar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgets }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOriginalWidgets(cloneWidgets(widgets));
        setIsDirty(false);
        router.refresh(); // Server Component'i yeni widget listesiyle yeniden render et
        setStatusMessage({
          type: "success",
          text: "Sağ blok düzeni başarıyla kaydedildi ve önbellek yenilendi.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Kaydedilirken hata oluştu.",
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: "Sunucu bağlantı hatası oluştu.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Tüm sağ blokları varsayılan ayarlara sıfırlamak istediğinize emin misiniz?")) {
      return;
    }

    setIsResetting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/sidebar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });

      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.widgets)) {
        const cloned = cloneWidgets(data.widgets);
        setWidgets(cloned);
        setOriginalWidgets(cloned);
        setIsDirty(false);
        router.refresh(); // Server Component'i varsayılan widget listesiyle yeniden render et
        setStatusMessage({
          type: "info",
          text: "Sağ bloklar varsayılan düzene sıfırlandı.",
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: "Sıfırlanırken sunucu hatası oluştu.",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteWidget = (id: string, title: string) => {
    if (!confirm(`"${title}" bloğunu kaldırmak istediğinize emin misiniz?`)) return;

    const filtered = cloneWidgets(widgets.filter((w) => w.id !== id));
    setWidgets(filtered);
    setIsDirty(true);
    setStatusMessage({
      type: "info",
      text: `"${title}" bloğu kaldırıldı. Değişikliklerin kalıcı olması için "Düzeni Kaydet"e tıklayın.`,
    });
  };

  const handleSaveEdit = () => {
    if (!editingWidget) return;

    const newItems = widgets.map((w) => (w.id === editingWidget.id ? { ...editingWidget } : { ...w }));
    setWidgets(cloneWidgets(newItems));
    setIsDirty(true);
    setEditingWidget(null);
  };

  const handleAddCustomWidget = () => {
    if (!newWidgetTitle.trim()) {
      alert("Lütfen blok başlığı giriniz.");
      return;
    }

    const created: SidebarWidget = {
      id: `widget-custom-${Date.now()}`,
      type: newWidgetType,
      title: newWidgetTitle.trim(),
      description: newWidgetType === "banner" ? "Özel Sponsor Banner" : "Özel HTML / Duyuru",
      isVisible: true,
      order: widgets.length + 1,
      config:
        newWidgetType === "banner"
          ? {
              imageUrl: newWidgetImageUrl || "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80",
              targetUrl: newWidgetTargetUrl || "https://gundem360.com",
              altText: newWidgetAltText || newWidgetTitle,
            }
          : {
              htmlContent: newWidgetHtml || `<div class="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold text-center">${newWidgetTitle}</div>`,
            },
    };

    setWidgets([...cloneWidgets(widgets), created]);
    setIsDirty(true);
    setIsAddModalOpen(false);
    setNewWidgetTitle("");
    setNewWidgetImageUrl("");
    setNewWidgetTargetUrl("");
    setNewWidgetAltText("");
    setNewWidgetHtml("");
  };

  const activeCount = widgets.filter((w) => w.isVisible).length;
  const passiveCount = widgets.length - activeCount;

  return (
    <div className="space-y-6 pb-20">
      {/* 1. BAŞLIK VE HIZLI AKSİYONLAR */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-red-600/10 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl">
              <PanelRightClose className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                Sağ Blok Yönetimi (Sidebar Builder)
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                  <Sparkles className="w-3 h-3" /> Modüler
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Haber detay ve içerik sayfalarındaki sağ kolon bileşenlerinin sıralamasını, görünürlüğünü ve reklamlarını yönetin.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Yeni Blok Ekle
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting || isSaving}
            className="px-3.5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
            Varsayılana Sıfırla
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Kaydediliyor..." : "Düzeni Kaydet"}
          </button>
        </div>
      </div>

      {/* 2. DURUM BİLDİRİMİ */}
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

      {/* 3. İSTATİSTİKLER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 font-medium">Toplam Sağ Blok</span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-0.5">
              {widgets.length}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            <PanelRightClose className="w-5 h-5" />
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
              Sağ blok sıralamasında veya ayarlarında kaydedilmemiş değişiklikler var.
            </span>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition"
          >
            {isSaving ? "Kaydediliyor..." : "Hemen Kaydet"}
          </button>
        </div>
      )}

      {/* 4. BLOK LİSTESİ */}
      <div className="space-y-3">
        {widgets.map((widget, index) => {
          const isFirst = index === 0;
          const isLast = index === widgets.length - 1;

          return (
            <div
              key={widget.id}
              className={`group bg-white dark:bg-zinc-900 border transition-all rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                widget.isVisible
                  ? "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs"
                  : "border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/40 opacity-70"
              }`}
            >
              {/* Sol Bilgiler */}
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                    widget.isVisible
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
                  }`}
                >
                  #{index + 1}
                </div>

                <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl shrink-0">
                  {getWidgetIcon(widget.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`text-sm sm:text-base font-black tracking-tight ${
                        widget.isVisible
                          ? "text-zinc-900 dark:text-white"
                          : "text-zinc-500 dark:text-zinc-400 line-through"
                      }`}
                    >
                      {widget.title}
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                      {getWidgetTypeLabel(widget.type)}
                    </span>
                  </div>
                  {widget.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-md sm:max-w-xl">
                      {widget.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Sağ Eylemler */}
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                {/* Sıralama Butonları */}
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={isFirst}
                    title="Yukarı Taşı"
                    className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 transition"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={isLast}
                    title="Aşağı Taşı"
                    className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 transition"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Düzenle Butonu (Modal açar) */}
                <button
                  type="button"
                  onClick={() => setEditingWidget({ ...widget })}
                  className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                  title="Bloğu Düzenle"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Görünürlük Durumu */}
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(index)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    widget.isVisible
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-100"
                      : "bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {widget.isVisible ? (
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

                {/* Özel Widget İse Silme Butonu */}
                {widget.id.startsWith("widget-custom") && (
                  <button
                    type="button"
                    onClick={() => handleDeleteWidget(widget.id, widget.title)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    title="Bloğu Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. DÜZENLEME MODALI */}
      {editingWidget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-red-600" />
                Sağ Bloğu Düzenle
              </h3>
              <button
                type="button"
                onClick={() => setEditingWidget(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Blok Başlığı
                </label>
                <input
                  type="text"
                  value={editingWidget.title}
                  onChange={(e) =>
                    setEditingWidget({ ...editingWidget, title: e.target.value })
                  }
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Banner Ayarları */}
              {editingWidget.type === "banner" && (
                <>
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Banner Görsel URL'si
                    </label>
                    <input
                      type="text"
                      value={editingWidget.config?.imageUrl || ""}
                      onChange={(e) =>
                        setEditingWidget({
                          ...editingWidget,
                          config: {
                            ...editingWidget.config,
                            imageUrl: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Hedef Bağlantı (Target URL)
                    </label>
                    <input
                      type="text"
                      value={editingWidget.config?.targetUrl || ""}
                      onChange={(e) =>
                        setEditingWidget({
                          ...editingWidget,
                          config: {
                            ...editingWidget.config,
                            targetUrl: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </>
              )}

              {/* Custom HTML Ayarları */}
              {editingWidget.type === "custom-html" && (
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Özel HTML / Kod İçeriği
                  </label>
                  <textarea
                    rows={6}
                    value={editingWidget.config?.htmlContent || ""}
                    onChange={(e) =>
                      setEditingWidget({
                        ...editingWidget,
                        config: {
                          ...editingWidget.config,
                          htmlContent: e.target.value,
                        },
                      })
                    }
                    className="w-full font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              {/* Most-read Ayarları */}
              {editingWidget.type === "most-read" && (
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Listelenecek Haber Sayısı
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={10}
                    value={editingWidget.config?.itemCount || 5}
                    onChange={(e) =>
                      setEditingWidget({
                        ...editingWidget,
                        config: {
                          ...editingWidget.config,
                          itemCount: parseInt(e.target.value, 10) || 5,
                        },
                      })
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingWidget(null)}
                className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-xs"
              >
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. YENİ BLOK EKLEME MODALI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-red-600" />
                Yeni Özel Sağ Blok Ekle
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Blok Türü
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewWidgetType("banner")}
                    className={`p-3 rounded-xl border text-left font-bold flex items-center gap-2 transition ${
                      newWidgetType === "banner"
                        ? "border-red-600 bg-red-50/50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Sponsor / Banner
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewWidgetType("custom-html")}
                    className={`p-3 rounded-xl border text-left font-bold flex items-center gap-2 transition ${
                      newWidgetType === "custom-html"
                        ? "border-red-600 bg-red-50/50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    Özel HTML / Kod
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Blok Başlığı *
                </label>
                <input
                  type="text"
                  placeholder="Örn: Özel Tanıtım veya Mobil Uygulama"
                  value={newWidgetTitle}
                  onChange={(e) => setNewWidgetTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {newWidgetType === "banner" && (
                <>
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Banner Görsel URL'si
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={newWidgetImageUrl}
                      onChange={(e) => setNewWidgetImageUrl(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Hedef Bağlantı (Target URL)
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={newWidgetTargetUrl}
                      onChange={(e) => setNewWidgetTargetUrl(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </>
              )}

              {newWidgetType === "custom-html" && (
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    HTML İçeriği
                  </label>
                  <textarea
                    rows={4}
                    placeholder="<div>Duyuru metniniz...</div>"
                    value={newWidgetHtml}
                    onChange={(e) => setNewWidgetHtml(e.target.value)}
                    className="w-full font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleAddCustomWidget}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-xs"
              >
                Bloğu Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. ALT SABİT KAYDET BAR */}
      {hasChanges && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 dark:bg-zinc-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-xl border border-zinc-700 flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <div className="text-xs">
            <span className="font-bold text-amber-400">● Değişiklikler yapıldı.</span>
            <span className="hidden sm:inline text-zinc-300 ml-1.5">
              Haber detay sayfalarına yansıması için kaydedin.
            </span>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      )}
    </div>
  );
}
