"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CategoryItem } from "@/types/news";
import { CategoryLayoutVariant, LAYOUT_VARIANT_OPTIONS } from "@/lib/types/category";
import {
  FolderTree,
  PlusCircle,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  ExternalLink,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  LayoutGrid,
} from "lucide-react";

interface CategoryManagerProps {
  initialCategories: CategoryItem[];
  onUpdate?: () => void;
}

const COLOR_OPTIONS = [
  { label: "Kırmızı (Gündem)", value: "bg-red-600", border: "border-red-600" },
  { label: "Yeşil (Ekonomi)", value: "bg-emerald-600", border: "border-emerald-600" },
  { label: "Turuncu (Spor)", value: "bg-amber-600", border: "border-amber-600" },
  { label: "Mavi (Teknoloji)", value: "bg-blue-600", border: "border-blue-600" },
  { label: "Mor (Kültür & Sanat)", value: "bg-purple-600", border: "border-purple-600" },
  { label: "Teal (Yaşam & Sağlık)", value: "bg-teal-600", border: "border-teal-600" },
  { label: "İndigo (Dünya)", value: "bg-indigo-600", border: "border-indigo-600" },
  { label: "Pembe (Magazin)", value: "bg-rose-600", border: "border-rose-600" },
  { label: "Gri (Özel Dosya)", value: "bg-zinc-700", border: "border-zinc-700" },
];

export default function CategoryManager({
  initialCategories,
  onUpdate,
}: CategoryManagerProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Yeni Kategori Ekleme Form Durumu
  const [newName, setNewName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newBadgeColor, setNewBadgeColor] = useState("bg-red-600");
  const [newLayoutVariant, setNewLayoutVariant] = useState<CategoryLayoutVariant>("classic-split");
  const [addingLoading, setAddingLoading] = useState(false);

  // Kategori Düzenleme Durumu
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editKey, setEditKey] = useState("");
  const [editBadgeColor, setEditBadgeColor] = useState("bg-red-600");
  const [editLayoutVariant, setEditLayoutVariant] = useState<CategoryLayoutVariant>("classic-split");
  const [editingLoading, setEditingLoading] = useState(false);

  // Silme Onay Modal Durumu
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // Sıralama Değişim Durumu
  const [reorderLoading, setReorderLoading] = useState(false);

  // Bildirim Durumu
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNewNameChange = (val: string) => {
    setNewName(val);
    setNewKey(generateSlug(val));
  };

  const handleEditNameChange = (val: string) => {
    setEditName(val);
  };

  // 1. Yeni Kategori Ekle
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newKey.trim()) {
      showToast("error", "Lütfen kategori adı ve URL kodunu girin.");
      return;
    }

    setAddingLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          key: newKey.trim(),
          badgeColor: newBadgeColor,
          layoutVariant: newLayoutVariant,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCategories((prev) => [...prev, { ...data, count: 0 }]);
        setNewName("");
        setNewKey("");
        setNewBadgeColor("bg-red-600");
        setNewLayoutVariant("classic-split");
        setIsAddOpen(false);
        showToast("success", `"${data.name}" kategorisi başarıyla eklendi!`);
        if (onUpdate) onUpdate();
      } else {
        showToast("error", data.error || "Kategori eklenirken hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Bağlantı hatası oluştu.");
    } finally {
      setAddingLoading(false);
    }
  };

  // 2. Kategori Düzenlemeyi Başlat
  const startEditing = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditKey(cat.key);
    setEditBadgeColor(cat.badgeColor || "bg-red-600");
    setEditLayoutVariant(cat.layoutVariant || "classic-split");
  };

  // 3. Kategori Düzenlemeyi Kaydet
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim() || !editKey.trim()) return;

    setEditingLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldKey: editingCategory.key,
          name: editName.trim(),
          key: editKey.trim(),
          badgeColor: editBadgeColor,
          layoutVariant: editLayoutVariant,
        }),
      });

      const data = await res.json();

      if (res.ok && data.category) {
        setCategories((prev) =>
          prev.map((c) => (c.key === editingCategory.key ? { ...data.category, count: c.count } : c))
        );
        showToast("success", `"${data.category.name}" kategorisi başarıyla güncellendi!`);
        setEditingCategory(null);
        if (onUpdate) onUpdate();
      } else {
        showToast("error", data.error || "Kategori güncellenemedi.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Bağlantı hatası oluştu.");
    } finally {
      setEditingLoading(false);
    }
  };

  // 4. Kategori Sil
  const confirmDelete = async () => {
    if (!deletingCategory) return;

    setDeletingLoading(true);
    try {
      const res = await fetch(`/api/categories?key=${deletingCategory.key}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.key !== deletingCategory.key));
        showToast(
          "success",
          data.message || `"${deletingCategory.name}" kategorisi başarıyla silindi.`
        );
        setDeletingCategory(null);
        if (onUpdate) onUpdate();
      } else {
        showToast("error", data.error || "Kategori silinemedi.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Bağlantı hatası oluştu.");
    } finally {
      setDeletingLoading(false);
    }
  };

  // 5. Sıralamayı Değiştir (Yukarı / Aşağı)
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    setCategories(newCategories);
    setReorderLoading(true);

    try {
      const reorderKeys = newCategories.map((c) => c.key);
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorder: reorderKeys }),
      });

      if (res.ok) {
        showToast("success", "Kategori sıralaması güncellendi!");
        if (onUpdate) onUpdate();
      } else {
        showToast("error", "Sıralama güncellenemedi.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Sıralama kaydedilirken hata oluştu.");
    } finally {
      setReorderLoading(false);
    }
  };

  const getLayoutVariantLabel = (variant?: CategoryLayoutVariant) => {
    switch (variant) {
      case "grid-4":
        return "4'lü Izgara";
      case "list-vertical":
        return "Dikey Liste";
      case "featured-hero-banner":
        return "Hero Banner";
      case "classic-split":
      default:
        return "Klasik 7+5";
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden space-y-4">
      {/* Üst Başlık & Eylem Butonu */}
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-950/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600">
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                Haber Kategorileri Yönetimi
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {categories.length} Kategori
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Menüde ve sitede yer alan kategorileri ekleyin, çıkarın, ismini veya sırasını değiştirin.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(!isAddOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
            isAddOpen
              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isAddOpen ? <X className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
          <span>{isAddOpen ? "Formu Kapat" : "Yeni Kategori Ekle"}</span>
        </button>
      </div>

      {/* Bildirim Toast */}
      {toast && (
        <div className="mx-5">
          <div
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
              toast.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* 1. Yeni Kategori Ekleme Açılır Kartı */}
      {isAddOpen && (
        <div className="mx-5 p-5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/10 space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-red-100 dark:border-red-900/30 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4" />
              <span>Yeni Haber Kategorisi Oluştur</span>
            </h3>
            <span className="text-[11px] text-zinc-500">Slug otomatik üretilir</span>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Kültür & Sanat"
                  value={newName}
                  onChange={(e) => handleNewNameChange(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  URL Kodu (Slug) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="kultur-sanat"
                  value={newKey}
                  onChange={(e) => setNewKey(generateSlug(e.target.value))}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Rozet / Tema Rengi
                </label>
                <select
                  value={newBadgeColor}
                  onChange={(e) => setNewBadgeColor(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {COLOR_OPTIONS.map((col) => (
                    <option key={col.value} value={col.value}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Görünüm Şablonu
                </label>
                <select
                  value={newLayoutVariant}
                  onChange={(e) => setNewLayoutVariant(e.target.value as CategoryLayoutVariant)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none cursor-pointer font-medium"
                >
                  {LAYOUT_VARIANT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 rounded-lg transition"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={addingLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 shadow-xs"
              >
                {addingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                <span>{addingLoading ? "Ekleniyor..." : "Kategoriyi Ekle"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Kategoriler Tablosu */}
      <div className="px-5 pb-5 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              <th className="py-2.5 px-2 w-16 text-center">Sıra</th>
              <th className="py-2.5 px-3">Kategori Adı</th>
              <th className="py-2.5 px-3">URL Kodu (Slug)</th>
              <th className="py-2.5 px-3">Görünüm Şablonu</th>
              <th className="py-2.5 px-3 text-center">Haber Adedi</th>
              <th className="py-2.5 px-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {categories.map((cat, idx) => {
              const isEditing = editingCategory?.key === cat.key;

              return (
                <React.Fragment key={cat.key}>
                  <tr
                    className={`group transition ${
                      isEditing
                        ? "bg-red-50/40 dark:bg-red-950/20"
                        : "hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30"
                    }`}
                  >
                    {/* Sıralama Butonları */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded p-0.5">
                        <button
                          type="button"
                          disabled={idx === 0 || reorderLoading}
                          onClick={() => handleMove(idx, "up")}
                          title="Yukarı Taşı"
                          className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 disabled:opacity-30 transition"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === categories.length - 1 || reorderLoading}
                          onClick={() => handleMove(idx, "down")}
                          title="Aşağı Taşı"
                          className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 disabled:opacity-30 transition"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Kategori Adı ve Renk Noktası */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5 font-bold text-zinc-900 dark:text-white">
                        <span
                          className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ${
                            cat.badgeColor || "bg-red-600"
                          }`}
                        />
                        <span className="text-xs sm:text-sm">{cat.name}</span>
                      </div>
                    </td>

                    {/* URL Kodu */}
                    <td className="py-3 px-3 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                      /kategori/{cat.key}
                    </td>

                    {/* Görünüm Şablonu */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        <LayoutGrid className="w-3 h-3 text-red-500" />
                        {getLayoutVariantLabel(cat.layoutVariant)}
                      </span>
                    </td>

                    {/* Haber Sayısı */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                        {cat.count ?? 0} haber
                      </span>
                    </td>

                    {/* Aksiyonlar: Sitede Aç, Düzenle, Sil */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/kategori/${cat.key}`}
                          target="_blank"
                          title="Sitede Görüntüle"
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => (isEditing ? setEditingCategory(null) : startEditing(cat))}
                          title="Kategoriyi Düzenle"
                          className={`p-1.5 rounded-md transition ${
                            isEditing
                              ? "bg-red-600 text-white"
                              : "text-zinc-600 dark:text-zinc-400 hover:text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={categories.length <= 1}
                          onClick={() => setDeletingCategory(cat)}
                          title={categories.length <= 1 ? "Son kategori silinemez" : "Kategoriyi Sil"}
                          className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition disabled:opacity-30 disabled:hover:text-zinc-400 disabled:hover:bg-transparent"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* 3. Inline Kategori Düzenleme Alanı */}
                  {isEditing && (
                    <tr>
                      <td colSpan={6} className="p-4 bg-zinc-50 dark:bg-zinc-950/80 border-y border-red-200 dark:border-red-900/40">
                        <form onSubmit={handleSaveEdit} className="space-y-3">
                          <div className="flex items-center justify-between pb-1">
                            <span className="text-xs font-bold text-red-600 uppercase flex items-center gap-1.5">
                              <Pencil className="w-3.5 h-3.5" />
                              <span>&quot;{cat.name}&quot; Kategorisini Düzenle</span>
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              (Kod değiştiğinde bağlı {cat.count || 0} haber otomatik güncellenir)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                                Kategori Adı
                              </label>
                              <input
                                type="text"
                                required
                                value={editName}
                                onChange={(e) => handleEditNameChange(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                                URL Kodu (Slug)
                              </label>
                              <input
                                type="text"
                                required
                                value={editKey}
                                onChange={(e) => setEditKey(generateSlug(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                                Rozet / Tema Rengi
                              </label>
                              <select
                                value={editBadgeColor}
                                onChange={(e) => setEditBadgeColor(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-xs text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
                              >
                                {COLOR_OPTIONS.map((col) => (
                                  <option key={col.value} value={col.value}>
                                    {col.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                                Görünüm Şablonu
                              </label>
                              <select
                                value={editLayoutVariant}
                                onChange={(e) => setEditLayoutVariant(e.target.value as CategoryLayoutVariant)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-xs text-zinc-900 dark:text-white focus:outline-none cursor-pointer font-medium"
                              >
                                {LAYOUT_VARIANT_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setEditingCategory(null)}
                              className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-lg transition"
                            >
                              İptal
                            </button>
                            <button
                              type="submit"
                              disabled={editingLoading}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 shadow-xs"
                            >
                              {editingLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                              <span>{editingLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}</span>
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Silme Onay Modalı */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide">
                  Kategoriyi Sil
                </h3>
                <p className="text-xs text-zinc-500">Bu işlem geri alınamaz.</p>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
              <p>
                <strong className="text-red-600 dark:text-red-400">&quot;{deletingCategory.name}&quot;</strong> kategorisini silmek üzeresiniz.
              </p>
              {deletingCategory.count && deletingCategory.count > 0 ? (
                <p className="text-amber-600 dark:text-amber-400 font-medium">
                  ⚠️ Bu kategoriye ait <strong>{deletingCategory.count} adet haber</strong> bulunmaktadır. Kategori silindiğinde bu haberler otomatik olarak varsayılan <strong>&quot;Gündem&quot;</strong> kategorisine aktarılacaktır.
                </p>
              ) : (
                <p className="text-zinc-500">Bu kategoriye ait herhangi bir haber bulunmamaktadır.</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deletingLoading}
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={deletingLoading}
                onClick={confirmDelete}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50"
              >
                {deletingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{deletingLoading ? "Siliniyor..." : "Evet, Kategoriyi Sil"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
