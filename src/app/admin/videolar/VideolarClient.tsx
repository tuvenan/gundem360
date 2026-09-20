"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Video,
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  ExternalLink,
  X,
  AlertCircle,
  CheckCircle2,
  Tag,
  Clock,
  Sparkles,
  TrendingUp,
  FolderTree,
  Palette,
  Play,
  Film,
  Check,
  GripVertical,
  Loader2,
} from "lucide-react";
import { YoutubeIcon } from "@/components/icons/YoutubeIcon";
import { VideoItem, VideoCategory, CategoryDeleteStrategy, UNCATEGORIZED_CATEGORY } from "@/types/news";
import { YouTubeService } from "@/services/youtube.service";
import ImageUploader from "@/components/admin/ImageUploader";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface Props {
  initialVideos: VideoItem[];
  initialCategories: VideoCategory[];
}

const COLOR_OPTIONS = [
  { label: "Kırmızı", value: "bg-red-600", dot: "bg-red-600" },
  { label: "Mavi", value: "bg-blue-600", dot: "bg-blue-600" },
  { label: "Zümrüt Yeşili", value: "bg-emerald-600", dot: "bg-emerald-600" },
  { label: "Kehribar / Sarı", value: "bg-amber-600", dot: "bg-amber-600" },
  { label: "Mor", value: "bg-purple-600", dot: "bg-purple-600" },
  { label: "Gül Kurusu", value: "bg-rose-600", dot: "bg-rose-600" },
  { label: "Turkuaz / Cyan", value: "bg-cyan-600", dot: "bg-cyan-600" },
  { label: "İndigo", value: "bg-indigo-600", dot: "bg-indigo-600" },
  { label: "Teal", value: "bg-teal-600", dot: "bg-teal-600" },
  { label: "Koyu Gri", value: "bg-zinc-700", dot: "bg-zinc-700" },
];

function extractYoutubeIdClient(url: string): string | null {
  return YouTubeService.extractId(url);
}

export default function VideolarClient({ initialVideos, initialCategories }: Props) {
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [categories, setCategories] = useState<VideoCategory[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Video Modalı State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [deleteModalVideo, setDeleteModalVideo] = useState<VideoItem | null>(null);

  // Kategori Yönetim Modalı State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catColor, setCatColor] = useState("bg-red-600");
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  const [deleteCatTarget, setDeleteCatTarget] = useState<VideoCategory | null>(null);
  const [deleteStrategy, setDeleteStrategy] = useState<CategoryDeleteStrategy>("uncategorize");
  const [targetCategorySlug, setTargetCategorySlug] = useState<string>("");

  // Video Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [customThumbnail, setCustomThumbnail] = useState("");
  const [duration, setDuration] = useState("03:45");
  const [category, setCategory] = useState("savunma-teknoloji");
  const [authorName, setAuthorName] = useState("Gündem360 Video Masası");
  const [tags, setTags] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<"active" | "draft" | "archived">("active");

  // Hızlı Kategori Ekleme State
  const [isQuickAddCatOpen, setIsQuickAddCatOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState("");
  const [quickCatColor, setQuickCatColor] = useState("bg-red-600");
  const [quickCatLoading, setQuickCatLoading] = useState(false);

  // Kategori Sürükle & Bırak State
  const [draggedCatIndex, setDraggedCatIndex] = useState<number | null>(null);
  const [dragOverCatIndex, setDragOverCatIndex] = useState<number | null>(null);
  const [catOrderSaving, setCatOrderSaving] = useState(false);

  // Geri Bildirim & Yükleme
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Otomatik tespit edilen YouTube ID
  const detectedYoutubeId = extractYoutubeIdClient(youtubeUrl);
  const currentThumbnail = customThumbnail.trim() || (detectedYoutubeId ? `https://img.youtube.com/vi/${detectedYoutubeId}/maxresdefault.jpg` : "");

  // YouTube'dan thumbnail otomatik çekme butonu
  const handlePullYoutubeThumbnail = () => {
    if (detectedYoutubeId) {
      const url = `https://img.youtube.com/vi/${detectedYoutubeId}/maxresdefault.jpg`;
      setCustomThumbnail(url);
      setSuccessMessage("YouTube kapak görseli başarıyla seçildi.");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Hızlı Kategori Ekleme
  const handleQuickAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCatName.trim()) return;

    setQuickCatLoading(true);
    try {
      const res = await fetch("/api/videos/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: quickCatName.trim(),
          color: quickCatColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kategori eklenemedi.");
      }

      // Kategorileri güncelle ve yeni ekleneni seç
      const freshCatsRes = await fetch("/api/videos/categories");
      if (freshCatsRes.ok) {
        const freshCats = await freshCatsRes.json();
        setCategories(freshCats);
      } else {
        setCategories((prev) => [...prev, data]);
      }
      setCategory(data.slug);
      setQuickCatName("");
      setIsQuickAddCatOpen(false);
      setSuccessMessage(`"${data.name}" kategorisi başarıyla eklendi ve seçildi.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || "Hızlı kategori eklenirken bir hata oluştu.");
    } finally {
      setQuickCatLoading(false);
    }
  };

  // Kategori Sürükle & Bırak Olayları
  const handleCatDragStart = (e: React.DragEvent, index: number) => {
    setDraggedCatIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleCatDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCatIndex !== index) {
      setDragOverCatIndex(index);
    }
  };

  const handleCatDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = draggedCatIndex;
    if (sourceIndex === null || sourceIndex === targetIndex) {
      setDraggedCatIndex(null);
      setDragOverCatIndex(null);
      return;
    }

    const reordered = [...categories];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const updated = reordered.map((cat, idx) => ({ ...cat, order: idx + 1 }));
    setCategories(updated);
    setDraggedCatIndex(null);
    setDragOverCatIndex(null);

    setCatOrderSaving(true);
    try {
      const res = await fetch("/api/videos/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderedIds: updated.map((c) => c.id),
        }),
      });
      if (!res.ok) {
        throw new Error("Sıralama kaydedilemedi.");
      }
      setSuccessMessage("Kategori sıralaması kaydedildi.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setCatError(err.message || "Sıralama güncellenemedi.");
    } finally {
      setCatOrderSaving(false);
    }
  };

  // --- KATEGORİ MODAL METOTLARI ---
  const handleOpenCatModal = () => {
    setEditingCatId(null);
    setCatName("");
    setCatSlug("");
    setCatColor("bg-red-600");
    setCatError(null);
    setIsCatModalOpen(true);
  };

  const handleEditCatClick = (cat: VideoCategory) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatColor(cat.color || "bg-red-600");
    setCatError(null);
  };

  const handleCancelCatEdit = () => {
    setEditingCatId(null);
    setCatName("");
    setCatSlug("");
    setCatColor("bg-red-600");
    setCatError(null);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);

    if (!catName.trim()) {
      setCatError("Lütfen kategori adını girin.");
      return;
    }

    setCatLoading(true);
    try {
      const isEditing = Boolean(editingCatId);
      const url = "/api/videos/categories";
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing
        ? {
            id: editingCatId,
            name: catName.trim(),
            slug: catSlug.trim() || undefined,
            color: catColor,
          }
        : {
            name: catName.trim(),
            slug: catSlug.trim() || undefined,
            color: catColor,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kategori kaydedilemedi.");
      }

      // Kategori listesini güncelle
      const catsRes = await fetch("/api/videos/categories");
      if (catsRes.ok) {
        const freshCats = await catsRes.json();
        setCategories(freshCats);
      }

      // Videoları da güncelle (eğer slug/renk değiştiyse)
      const vidsRes = await fetch("/api/videos");
      if (vidsRes.ok) {
        const freshVids = await vidsRes.json();
        setVideos(freshVids);
      }

      handleCancelCatEdit();
      setSuccessMessage(isEditing ? "Video kategorisi güncellendi." : "Yeni video kategorisi eklendi.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setCatError(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatTarget) return;
    setCatLoading(true);
    setCatError(null);

    try {
      const url = `/api/videos/categories?id=${encodeURIComponent(deleteCatTarget.id)}&strategy=${encodeURIComponent(
        deleteStrategy
      )}${targetCategorySlug ? `&targetCategorySlug=${encodeURIComponent(targetCategorySlug)}` : ""}`;

      const res = await fetch(url, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kategori silinemedi.");
      }

      const catsRes = await fetch("/api/videos/categories");
      if (catsRes.ok) {
        const freshCats = await catsRes.json();
        setCategories(freshCats);
      }

      const vidsRes = await fetch("/api/videos");
      if (vidsRes.ok) {
        const freshVids = await vidsRes.json();
        setVideos(freshVids);
      }

      setDeleteCatTarget(null);
      setSuccessMessage("Kategori silindi ve ilgili videolar güvenli şekilde aktarıldı.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setCatError(err.message || "Kategori silinemedi.");
    } finally {
      setCatLoading(false);
    }
  };

  // --- VİDEO MODAL METOTLARI ---
  const handleOpenCreateModal = () => {
    setEditingVideo(null);
    setTitle("");
    setDescription("");
    setYoutubeUrl("");
    setCustomThumbnail("");
    setDuration("04:30");
    setCategory(categories[0]?.slug || "savunma-teknoloji");
    setAuthorName("Gündem360 Video Masası");
    setTags("Video, Haber, Gündem");
    setIsFeatured(false);
    setStatus("active");
    setIsQuickAddCatOpen(false);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vid: VideoItem) => {
    setEditingVideo(vid);
    setTitle(vid.title);
    setDescription(vid.description);
    setYoutubeUrl(vid.youtubeUrl || `https://www.youtube.com/watch?v=${vid.youtubeId}`);
    setCustomThumbnail(vid.thumbnailUrl || "");
    setDuration(vid.duration || "03:45");
    setCategory(vid.category);
    setAuthorName(vid.author?.name || "Gündem360 Video Masası");
    setTags(Array.isArray(vid.tags) ? vid.tags.join(", ") : "");
    setIsFeatured(Boolean(vid.isFeatured));
    setStatus(vid.status || "active");
    setIsQuickAddCatOpen(false);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Lütfen video başlığını girin.");
      return;
    }

    if (!youtubeUrl.trim()) {
      setErrorMessage("Lütfen YouTube video bağlantısını girin.");
      return;
    }

    const ytValidation = YouTubeService.validate(youtubeUrl);
    if (!ytValidation.isValid || !ytValidation.youtubeId) {
      setErrorMessage(
        ytValidation.error ||
          "Geçersiz video kaynağı. Tüm videolar yalnızca YouTube üzerinden eklenebilir."
      );
      return;
    }

    const yId = ytValidation.youtubeId;

    setLoading(true);

    try {
      const selectedCatObj = categories.find((c) => c.slug === category);
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        youtubeUrl: youtubeUrl.trim(),
        youtubeId: yId,
        thumbnailUrl: currentThumbnail || `https://img.youtube.com/vi/${yId}/maxresdefault.jpg`,
        duration: duration.trim() || "03:00",
        category,
        categoryTitle: selectedCatObj?.name || "Genel",
        categoryBadgeColor: selectedCatObj?.color || "bg-red-600",
        isFeatured,
        status,
        author: {
          name: authorName.trim() || "Gündem360 Video Masası",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        },
        tags: tagList,
      };

      const isEditing = Boolean(editingVideo);
      const url = "/api/videos";
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing ? { ...payload, id: editingVideo!.id } : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Video kaydedilemedi.");
      }

      // Listeyi yenile
      const listRes = await fetch("/api/videos");
      if (listRes.ok) {
        const fresh = await listRes.json();
        setVideos(fresh);
      }

      setIsModalOpen(false);
      setSuccessMessage(isEditing ? "Video başarıyla güncellendi." : "Yeni video başarıyla yayınlandı.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Kaydetme sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!deleteModalVideo) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/videos?id=${deleteModalVideo.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Video silinemedi.");
      }

      setVideos((prev) => prev.filter((v) => v.id !== deleteModalVideo.id));
      setDeleteModalVideo(null);
      setSuccessMessage("Video başarıyla silindi.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || "Video silinirken bir hata meydana geldi.");
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme
  const filteredVideos = videos.filter((vid) => {
    const matchesCategory = selectedCategory === "all" || vid.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      vid.title.toLowerCase().includes(query) ||
      vid.description.toLowerCase().includes(query) ||
      (vid.youtubeId && vid.youtubeId.toLowerCase().includes(query)) ||
      (vid.tags && vid.tags.some((t) => t.toLowerCase().includes(query)));
    return matchesCategory && matchesSearch;
  });

  const totalViews = videos.reduce((acc, v) => acc + (v.viewCount || 0), 0);
  const featuredCount = videos.filter((v) => v.isFeatured).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. BAŞLIK VE HIZLI İŞLEMLER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20">
              <YoutubeIcon className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Video Galeri Yönetimi
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            YouTube entegrasyonlu video yayınları, canlı önizleme ve dinamik video kategorisi stüdyosu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenCatModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-semibold rounded-xl transition-all border border-zinc-200 dark:border-zinc-700"
          >
            <FolderTree className="w-4 h-4 text-red-500" />
            <span>Kategori Stüdyosu</span>
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-zinc-200 dark:bg-zinc-700 rounded-full font-bold">
              {categories.length}
            </span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-red-600/25 hover:shadow-red-600/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Video Ekle</span>
          </button>
        </div>
      </div>

      {/* 2. TOAST BİLDİRİMİ */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 3. İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{videos.length}</div>
            <div className="text-xs text-zinc-500">Kayıtlı Video</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {totalViews.toLocaleString("tr-TR")}
            </div>
            <div className="text-xs text-zinc-500">Toplam İzlenme</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{featuredCount}</div>
            <div className="text-xs text-zinc-500">Öne Çıkan Video</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{categories.length}</div>
            <div className="text-xs text-zinc-500">Video Kategorisi</div>
          </div>
        </div>
      </div>

      {/* 4. ARAMA VE KATEGORİ FİLTRESİ */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Arama Kutusu */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Video ara (başlık, ID, etiket)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
          />
        </div>

        {/* Kategori Hapları */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            Tümü ({videos.length})
          </button>
          {categories.map((cat) => {
            const count = videos.filter((v) => v.category === cat.slug).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategory === cat.slug
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cat.color || "bg-red-500"}`} />
                {cat.name} ({count})
              </button>
            );
          })}
          {videos.some((v) => v.category === "kategorisiz") && (
            <button
              onClick={() => setSelectedCategory("kategorisiz")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === "kategorisiz"
                  ? "bg-zinc-700 text-white shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-zinc-500" />
              Kategorisiz ({videos.filter((v) => v.category === "kategorisiz").length})
            </button>
          )}
        </div>
      </div>

      {/* 5. VİDEO LİSTESİ */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {filteredVideos.length === 0 ? (
          <div className="p-12 text-center">
            <YoutubeIcon className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
            <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
              Video bulunamadı
            </h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
              Arama kriterlerinize uyan video bulunamadı. Yeni bir video ekleyebilir veya filtreleri sıfırlayabilirsiniz.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              İlk Videoyu Ekle
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredVideos.map((vid) => {
              const catObj = categories.find((c) => c.slug === vid.category);
              const catBadgeColor = catObj?.color || vid.categoryBadgeColor || "bg-red-600";
              const catName = catObj?.name || vid.categoryTitle || vid.category;

              return (
                <div
                  key={vid.id}
                  className="p-4 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Sol Taraf: Thumbnail & Bilgi */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                    {/* Thumbnail + Duration Badge */}
                    <div className="relative w-36 sm:w-44 aspect-video rounded-lg overflow-hidden bg-zinc-950 flex-shrink-0 border border-zinc-200 dark:border-zinc-800 group shadow-sm">
                      <Image
                        src={vid.thumbnailUrl || `https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg`}
                        alt={vid.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md">
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] font-bold bg-black/80 text-white rounded">
                        {vid.duration || "03:45"}
                      </span>
                    </div>

                    {/* Metin Detayları */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded ${catBadgeColor}`}
                        >
                          {catName}
                        </span>
                        {vid.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                            <Sparkles className="w-3 h-3" />
                            Öne Çıkan
                          </span>
                        )}
                        <span className="text-xs text-zinc-400">
                          {vid.publishedAt}
                        </span>
                      </div>

                      <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white line-clamp-1">
                        {vid.title}
                      </h2>

                      {vid.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                          {vid.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-zinc-500 pt-0.5">
                        <span className="flex items-center gap-1 font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
                          <YoutubeIcon className="w-3 h-3 text-red-500" />
                          {vid.youtubeId}
                        </span>
                        <span>•</span>
                        <span>{vid.viewCount.toLocaleString("tr-TR")} izlenme</span>
                        {vid.tags && vid.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="hidden md:inline text-zinc-400">
                              {vid.tags.slice(0, 3).join(", ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sağ Taraf: Eylemler */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href={`/video-galeri/${vid.slug}`}
                      target="_blank"
                      className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors title='Önizle'"
                      title="Sitede Gör"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleOpenEditModal(vid)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                      <span>Düzenle</span>
                    </button>

                    <button
                      onClick={() => setDeleteModalVideo(vid)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. GELİŞMİŞ VİDEO EKLE / DÜZENLE MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center">
                  <YoutubeIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {editingVideo ? "Videoyu Düzenle" : "Yeni YouTube Videosu Ekle"}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    YouTube URL'sini yapıştırın; video ID'si ve kapak görseli otomatik algılanır.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveVideo} className="overflow-y-auto p-6 space-y-6 flex-1">
              {errorMessage && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. YOUTUBE URL & CANLI ÖNİZLEME BÖLÜMÜ */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  YouTube Video Bağlantısı *
                </label>
                <div className="relative">
                  <YoutubeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-red-600" />
                  <input
                    type="text"
                    required
                    placeholder="https://www.youtube.com/watch?v=L_LUpnjgPso veya youtu.be/..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-white"
                  />
                </div>

                {/* Algılama Rozeti ve Canlı Video Önizleyicisi */}
                {detectedYoutubeId ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        YouTube ID Algılandı: <span className="font-mono">{detectedYoutubeId}</span>
                      </span>
                      <span className="text-zinc-400">Canlı Oynatıcı Önizleme</span>
                    </div>

                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-200 dark:border-zinc-700 shadow-md">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${detectedYoutubeId}?rel=0`}
                        title="YouTube Canlı Önizleme"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>
                ) : youtubeUrl.trim() ? (
                  <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-semibold pt-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Geçersiz kaynak. Tüm videolar yalnızca YouTube üzerinden eklenebilir (Vimeo, Dailymotion vb. diğer platformlar desteklenmez).</span>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">
                    Örnek link formatları: <code className="text-red-500">youtube.com/watch?v=XYZ</code>, <code className="text-red-500">youtu.be/XYZ</code> veya doğrudan 11 haneli YouTube ID.
                  </p>
                )}
              </div>

              {/* 2. TEMEL BİLGİLER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Video Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Milli Muharip Uçak KAAN Yeni Nesil Test Uçuşunu Tamamladı"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-white"
                  />
                </div>

                {/* ZENGİN METİN EDİTÖRÜ (AÇIKLAMA) */}
                <div className="md:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Video Açıklaması / Detaylı Metin (Zengin Metin Editörü)
                    </label>
                    <span className="text-[11px] text-zinc-400 font-medium">Kalın, italik, liste, alıntı ve başlık araçları</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                    <RichTextEditor
                      value={description}
                      onChange={(val) => setDescription(val)}
                      placeholder="Videonun içeriği, önemli demeçler ve detayları hakkında açıklama yazısı..."
                      minHeight="180px"
                    />
                  </div>
                </div>

                {/* KATEGORİ SEÇİCİ & HIZLI KATEGORİ EKLEME */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Video Kategorisi *
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsQuickAddCatOpen((prev) => !prev)}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Hızlı Ekle</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenCatModal}
                        className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-semibold inline-flex items-center gap-1 px-1.5 py-0.5"
                      >
                        <FolderTree className="w-3 h-3" />
                        <span>Yönet</span>
                      </button>
                    </div>
                  </div>

                  {/* Hızlı Kategori Ekleme Mini Kartı */}
                  {isQuickAddCatOpen && (
                    <div className="p-3 bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between text-xs font-bold text-red-900 dark:text-red-200">
                        <span>Hızlı Video Kategorisi Ekle</span>
                        <button
                          type="button"
                          onClick={() => setIsQuickAddCatOpen(false)}
                          className="text-zinc-400 hover:text-zinc-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Kategori Adı (Örn: Savunma Sanayii)"
                          value={quickCatName}
                          onChange={(e) => setQuickCatName(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleQuickAddCategory}
                          disabled={quickCatLoading || !quickCatName.trim()}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {quickCatLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          <span>Ekle</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] text-zinc-500 font-medium">Renk:</span>
                        {COLOR_OPTIONS.slice(0, 6).map((c) => (
                          <button
                            type="button"
                            key={c.value}
                            onClick={() => setQuickCatColor(c.value)}
                            className={`w-4 h-4 rounded-full ${c.dot} transition-all ${
                              quickCatColor === c.value ? "ring-2 ring-zinc-800 dark:ring-white scale-110" : "opacity-60 hover:opacity-100"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Video Süresi */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Video Süresi (dakika:saniye)
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="04:35"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                {/* Yazar / Masa */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Hazırlayan / Servis
                  </label>
                  <input
                    type="text"
                    placeholder="Gündem360 Video Masası"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-white"
                  />
                </div>

                {/* Etiketler */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Etiketler (Virgülle ayırın)
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Havacılık, KAAN, Savunma, Teknoloji"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                {/* GÖRSEL SEÇİMİ (THUMBNAIL: YOUTUBE'DAN OTOMATİK ÇEK VEYA ÖZEL YÜKLE) */}
                <div className="md:col-span-2 space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        Kapak Görseli (Thumbnail)
                      </label>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        YouTube&apos;dan otomatik kapak çekebilir veya bilgisayarınızdan özel görsel yükleyebilirsiniz.
                      </p>
                    </div>

                    {detectedYoutubeId && (
                      <button
                        type="button"
                        onClick={handlePullYoutubeThumbnail}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg border border-red-300 dark:border-red-900/60 transition-colors shrink-0 cursor-pointer"
                      >
                        <YoutubeIcon className="w-4 h-4 text-red-600" />
                        <span>YouTube&apos;dan Otomatik Çek</span>
                      </button>
                    )}
                  </div>

                  <ImageUploader
                    value={customThumbnail || (detectedYoutubeId ? `https://img.youtube.com/vi/${detectedYoutubeId}/maxresdefault.jpg` : "")}
                    onChange={(url) => setCustomThumbnail(url)}
                    label="Kapak Resmi (Dosyadan Yükle veya URL)"
                  />
                </div>

                {/* ÖNE ÇIKAR & YAYIN DURUMU (MODERN TOGGLE / SWITCH KONTROLLERİ) */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Öne Çıkar Switch */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                    <div className="space-y-0.5 pr-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Öne Çıkarılan Video</span>
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        Anasayfa ve video galeri tepe vitrininde büyük kart olarak yer alır.
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={isFeatured}
                      onClick={() => setIsFeatured(!isFeatured)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        isFeatured ? "bg-red-600" : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isFeatured ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Yayın Durumu Switch / Segment */}
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                        Yayın Durumu
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          status === "active"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                            : status === "draft"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                            : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {status === "active" ? "Yayında" : status === "draft" ? "Taslak" : "Arşiv"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 bg-zinc-200/80 dark:bg-zinc-900 p-1 rounded-xl">
                      {(["active", "draft", "archived"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(s)}
                          className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            status === s
                              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs"
                              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                          }`}
                        >
                          {s === "active" ? "Aktif" : s === "draft" ? "Taslak" : "Arşiv"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingVideo ? "Değişiklikleri Kaydet" : "Videoyu Yayınla"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. KATEGORİ STÜDYOSU MODALI */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Video Kategori Stüdyosu
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Video kategorilerini ekleyin, isimlerini, URL sluglarını ve rozet renklerini düzenleyin.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {catError && (
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{catError}</span>
                </div>
              )}

              {/* Kategori Ekle / Düzenle Formu */}
              <form onSubmit={handleSaveCategory} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  {editingCatId ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Kategori Adı *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Röportaj & Özel"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Slug / URL Kodu (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      placeholder="roportaj-ozel"
                      value={catSlug}
                      onChange={(e) => setCatSlug(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                {/* Rozet Rengi Seçimi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Rozet Rengi</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        type="button"
                        key={c.value}
                        onClick={() => setCatColor(c.value)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium flex items-center gap-1.5 border transition-all ${
                          catColor === c.value
                            ? "border-zinc-900 dark:border-white ring-2 ring-zinc-400 font-bold"
                            : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  {editingCatId && (
                    <button
                      type="button"
                      onClick={handleCancelCatEdit}
                      className="px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      İptal
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={catLoading}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                  >
                    {catLoading ? "Kaydediliyor..." : editingCatId ? "Değişikliği Kaydet" : "+ Kategoriyi Ekle"}
                  </button>
                </div>
              </form>

              {/* Mevcut Kategoriler Listesi ve Sürükle-Bırak Sıralama */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <span>Mevcut Video Kategorileri ({categories.length})</span>
                    {catOrderSaving && (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-normal flex items-center gap-1 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Sıralama kaydediliyor...
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <GripVertical className="w-3.5 h-3.5 text-zinc-400" />
                    Sürükle-bırak ile sırala
                  </span>
                </div>

                <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-xs">
                  {categories.map((cat, idx) => {
                    const videoCount = videos.filter((v) => v.category === cat.slug && !v.isDeleted).length;
                    const isDragging = draggedCatIndex === idx;
                    const isDragOver = dragOverCatIndex === idx;

                    return (
                      <div
                        key={cat.id}
                        draggable={true}
                        onDragStart={(e) => handleCatDragStart(e, idx)}
                        onDragOver={(e) => handleCatDragOver(e, idx)}
                        onDrop={(e) => handleCatDrop(e, idx)}
                        onDragEnd={() => {
                          setDraggedCatIndex(null);
                          setDragOverCatIndex(null);
                        }}
                        className={`p-3 flex items-center justify-between gap-3 transition-all select-none cursor-grab active:cursor-grabbing ${
                          isDragging
                            ? "opacity-30 bg-zinc-100 dark:bg-zinc-800"
                            : isDragOver
                            ? "bg-red-50 dark:bg-red-950/40 border-t-2 border-b-2 border-red-500"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Sürükleme Tutamacı */}
                          <div className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 -ml-1">
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Sıra Numarası */}
                          <span className="w-5 h-5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>

                          {/* Renk Noktası */}
                          <span className={`w-3 h-3 rounded-full ${cat.color || "bg-red-500"} shrink-0`} />

                          {/* Kategori Bilgisi & Video Sayısı */}
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-zinc-900 dark:text-white truncate flex items-center gap-2">
                              <span>{cat.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80">
                                {videoCount} Video
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-zinc-400">
                              slug: {cat.slug} • sıra: #{cat.order ?? idx + 1}
                            </div>
                          </div>
                        </div>

                        {/* Eylemler */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditCatClick(cat)}
                            className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteCatTarget(cat)}
                            disabled={categories.length <= 1}
                            className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title={categories.length <= 1 ? "Son kategori silinemez" : "Sil"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. VİDEO SİLME ONAY MODALI */}
      {deleteModalVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Videoyu Silmek İstiyor musunuz?
              </h3>
              <p className="text-xs text-zinc-500">
                &quot;{deleteModalVideo.title}&quot; başlıklı video kalıcı olarak silinecektir. Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalVideo(null)}
                className="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleDeleteVideo}
                disabled={loading}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-red-600/20 transition-all cursor-pointer"
              >
                {loading ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. KATEGORİ SİLME ONAY MODALI */}
      {deleteCatTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  &quot;{deleteCatTarget.name}&quot; Kategorisini Sil
                </h3>
                <p className="text-xs text-zinc-500">
                  Bu kategoride yer alan videoların durumunu aşağıdan yönetebilirsiniz.
                </p>
              </div>
            </div>

            {/* Strateji Seçimi */}
            <div className="space-y-2.5 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block">
                Bağlı Videoların Yönetim Stratejisi (One-to-Many)
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/40 cursor-pointer hover:border-red-500 transition-colors">
                <input
                  type="radio"
                  name="delStrategy"
                  value="uncategorize"
                  checked={deleteStrategy === "uncategorize"}
                  onChange={() => setDeleteStrategy("uncategorize")}
                  className="mt-0.5 text-red-600 focus:ring-red-500"
                />
                <div className="text-xs">
                  <div className="font-bold text-zinc-900 dark:text-white">
                    Videoları &quot;Kategorisiz&quot; Olarak İşaretle (Önerilen)
                  </div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">
                    Videolar silinmez; sistemdeki &quot;Kategorisiz&quot; havuzuna aktarılır ve yayında kalır.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/40 cursor-pointer hover:border-red-500 transition-colors">
                <input
                  type="radio"
                  name="delStrategy"
                  value="soft_delete"
                  checked={deleteStrategy === "soft_delete"}
                  onChange={() => setDeleteStrategy("soft_delete")}
                  className="mt-0.5 text-red-600 focus:ring-red-500"
                />
                <div className="text-xs">
                  <div className="font-bold text-zinc-900 dark:text-white">
                    Videoları Arşive Taşı (Soft-Delete)
                  </div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">
                    Bu kategorideki tüm videolar siteden ve arama sonuçlarından gizlenir, arşivde saklanır.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/40 cursor-pointer hover:border-red-500 transition-colors">
                <input
                  type="radio"
                  name="delStrategy"
                  value="reassign"
                  checked={deleteStrategy === "reassign"}
                  onChange={() => {
                    setDeleteStrategy("reassign");
                    const otherCat = categories.find((c) => c.id !== deleteCatTarget.id);
                    if (otherCat && !targetCategorySlug) {
                      setTargetCategorySlug(otherCat.slug);
                    }
                  }}
                  className="mt-0.5 text-red-600 focus:ring-red-500"
                />
                <div className="text-xs flex-1">
                  <div className="font-bold text-zinc-900 dark:text-white">
                    Videoları Başka Bir Kategoriye Aktar
                  </div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">
                    Videolar seçeceğiniz hedef kategoriye taşınır.
                  </div>
                  {deleteStrategy === "reassign" && (
                    <select
                      value={targetCategorySlug}
                      onChange={(e) => setTargetCategorySlug(e.target.value)}
                      className="mt-2 w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-semibold dark:text-white"
                    >
                      {categories
                        .filter((c) => c.id !== deleteCatTarget.id)
                        .map((c) => (
                          <option key={c.id} value={c.slug}>
                            {c.name} ({c.slug})
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setDeleteCatTarget(null)}
                className="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={catLoading}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-red-600/20 transition-all cursor-pointer"
              >
                {catLoading ? "Siliniyor..." : "Kategoriyi Sil ve Uygula"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
