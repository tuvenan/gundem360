"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Images,
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  X,
  AlertCircle,
  CheckCircle2,
  Tag,
  Camera,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FolderTree,
  Palette,
  UploadCloud,
  GripVertical,
  Star,
  Loader2,
  FileWarning,
  Check,
} from "lucide-react";
import { PhotoGallery, GallerySlide, GalleryCategory } from "@/types/news";
import ImageUploader from "@/components/admin/ImageUploader";

interface Props {
  initialGalleries: PhotoGallery[];
  initialCategories: GalleryCategory[];
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

export default function GalerilerClient({ initialGalleries, initialCategories }: Props) {
  const [galleries, setGalleries] = useState<PhotoGallery[]>(initialGalleries);
  const [categories, setCategories] = useState<GalleryCategory[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Galeri Modalı State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<PhotoGallery | null>(null);
  const [deleteModalGallery, setDeleteModalGallery] = useState<PhotoGallery | null>(null);

  // Kategori Yönetim Modalı State (Kategori Stüdyosu)
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCatKey, setEditingCatKey] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catKey, setCatKey] = useState("");
  const [catColor, setCatColor] = useState("bg-red-600");
  const [catDesc, setCatDesc] = useState("");
  const [catCoverImage, setCatCoverImage] = useState("");
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  const [deleteCatTarget, setDeleteCatTarget] = useState<GalleryCategory | null>(null);

  // Hızlı Kategori Ekleme State (Galeri Formu İçi AJAX)
  const [isQuickCatOpen, setIsQuickCatOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState("");
  const [quickCatKey, setQuickCatKey] = useState("");
  const [quickCatColor, setQuickCatColor] = useState("bg-red-600");
  const [quickCatDesc, setQuickCatDesc] = useState("");
  const [quickCatLoading, setQuickCatLoading] = useState(false);
  const [quickCatError, setQuickCatError] = useState<string | null>(null);

  // Çoklu Dosya Yükleme & Dropzone & Sıralı Progress State
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // 0 to 100
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [uploadErrors, setUploadErrors] = useState<{ fileName: string; error: string }[]>([]);
  const dropzoneInputRef = useRef<HTMLInputElement>(null);

  // Sürükle-Bırak Sıralama (Sortable Drag & Drop) State
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null);
  const [dragOverSlideIndex, setDragOverSlideIndex] = useState<number | null>(null);

  // Galeri Form State
  const [title, setTitle] = useState("");
  const [spot, setSpot] = useState("");
  const [category, setCategory] = useState("gundem");
  const [coverImage, setCoverImage] = useState("");
  const [authorName, setAuthorName] = useState("Gündem360 Görsel Servisi");
  const [tags, setTags] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [slides, setSlides] = useState<GallerySlide[]>([]);

  // Geri Bildirim & Yükleme
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Aktif Slayt Akordeon İndeksi
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // --- KATEGORİ MODAL METOTLARI ---
  const handleOpenCatModal = () => {
    setEditingCatKey(null);
    setCatName("");
    setCatKey("");
    setCatColor("bg-red-600");
    setCatDesc("");
    setCatCoverImage("");
    setCatError(null);
    setIsCatModalOpen(true);
  };

  const handleEditCatClick = (cat: GalleryCategory) => {
    setEditingCatKey(cat.key);
    setCatName(cat.name);
    setCatKey(cat.key);
    setCatColor(cat.badgeColor || "bg-red-600");
    setCatDesc(cat.description || "");
    setCatCoverImage(cat.coverImage || "");
    setCatError(null);
  };

  const handleCancelCatEdit = () => {
    setEditingCatKey(null);
    setCatName("");
    setCatKey("");
    setCatColor("bg-red-600");
    setCatDesc("");
    setCatCoverImage("");
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
      const isEditing = Boolean(editingCatKey);
      const url = "/api/galleries/categories";
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing
        ? {
            oldKey: editingCatKey,
            name: catName.trim(),
            key: catKey.trim() || undefined,
            badgeColor: catColor,
            description: catDesc.trim(),
            coverImage: catCoverImage.trim() || undefined,
          }
        : {
            name: catName.trim(),
            key: catKey.trim() || undefined,
            badgeColor: catColor,
            description: catDesc.trim(),
            coverImage: catCoverImage.trim() || undefined,
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

      if (isEditing) {
        setCategories((prev) =>
          prev.map((c) => (c.key === editingCatKey ? data : c))
        );
        // Galerileri de güncelle
        setGalleries((prev) =>
          prev.map((g) =>
            g.category === editingCatKey
              ? {
                  ...g,
                  category: data.key,
                  categoryTitle: data.name,
                  categoryBadgeColor: data.badgeColor,
                }
              : g
          )
        );
        setSuccessMessage(`"${data.name}" kategorisi başarıyla güncellendi.`);
      } else {
        setCategories((prev) => [...prev, data]);
        setSuccessMessage(`"${data.name}" kategorisi başarıyla eklendi.`);
        // Yeni eklenen kategoriyi aktif form seçimine al
        setCategory(data.key);
      }

      handleCancelCatEdit();
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setCatError(err.message || "İşlem sırasında hata oluştu.");
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategoryConfirm = async () => {
    if (!deleteCatTarget) return;

    setCatLoading(true);
    try {
      const res = await fetch(
        `/api/galleries/categories?key=${deleteCatTarget.key}`,
        { method: "DELETE" }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kategori silinemedi.");
      }

      const remaining = categories.filter((c) => c.key !== deleteCatTarget.key);
      setCategories(remaining);

      // Silinen kategoriye ait galerileri fallback kategoriye geçir
      const fallback = remaining[0];
      if (fallback) {
        setGalleries((prev) =>
          prev.map((g) =>
            g.category === deleteCatTarget.key
              ? {
                  ...g,
                  category: fallback.key,
                  categoryTitle: fallback.name,
                  categoryBadgeColor: fallback.badgeColor,
                }
              : g
          )
        );
      }

      setDeleteCatTarget(null);
      setSuccessMessage(`"${deleteCatTarget.name}" kategorisi silindi.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setCatLoading(false);
    }
  };

  // --- HIZLI KATEGORİ EKLEME (AJAX) ---
  const handleQuickAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickCatError(null);

    if (!quickCatName.trim()) {
      setQuickCatError("Lütfen bir kategori adı girin.");
      return;
    }

    setQuickCatLoading(true);
    try {
      const res = await fetch("/api/galleries/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: quickCatName.trim(),
          key: quickCatKey.trim() || undefined,
          badgeColor: quickCatColor,
          description: quickCatDesc.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kategori eklenemedi.");
      }

      setCategories((prev) => [...prev, data]);
      setCategory(data.key);
      setSuccessMessage(`"${data.name}" kategorisi başarıyla eklendi ve seçildi.`);
      setTimeout(() => setSuccessMessage(null), 4000);

      setQuickCatName("");
      setQuickCatKey("");
      setQuickCatDesc("");
      setIsQuickCatOpen(false);
    } catch (err: any) {
      setQuickCatError(err.message || "Kategori eklenirken hata oluştu.");
    } finally {
      setQuickCatLoading(false);
    }
  };

  // --- ÇOKLU ASENKRON (SIRALI) DOSYA YÜKLEME ---
  const handleFilesUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatusText(`0 / ${fileList.length} fotoğraf yüklendi`);

    const newErrors: { fileName: string; error: string }[] = [];
    const uploadedSlides: GallerySlide[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const progressCurrent = Math.round((i / fileList.length) * 100);
      setUploadProgress(progressCurrent);
      setUploadStatusText(`Fotoğraf ${i + 1}/${fileList.length} yükleniyor: ${file.name}`);

      // 1. Format Doğrulama (MIME Type)
      if (!file.type.startsWith("image/")) {
        newErrors.push({
          fileName: file.name,
          error: "Geçersiz dosya biçimi. Yalnızca görsel dosyaları (JPG, PNG, WEBP, GIF) yüklenebilir.",
        });
        continue;
      }

      // 2. Boyut Doğrulama (>10MB)
      if (file.size > 10 * 1024 * 1024) {
        newErrors.push({
          fileName: file.name,
          error: `Dosya boyutu 10MB sınırını aşıyor (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
        });
        continue;
      }

      // 3. Asenkron API Yükleme
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error || "Görsel yüklenemedi.");
        }

        const cleanTitle = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .trim();

        uploadedSlides.push({
          id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          imageUrl: data.url,
          title: cleanTitle,
          caption: "",
          order: slides.length + uploadedSlides.length + 1,
        });
      } catch (err: any) {
        newErrors.push({
          fileName: file.name,
          error: err.message || "Yükleme sırasında ağ hatası oluştu.",
        });
      }
    }

    if (newErrors.length > 0) {
      setUploadErrors((prev) => [...prev, ...newErrors]);
    }

    if (uploadedSlides.length > 0) {
      setSlides((prev) => {
        const currentValid = prev.filter((s) => s.imageUrl.trim() !== "");
        const combined = [...currentValid, ...uploadedSlides].map((s, idx) => ({
          ...s,
          order: idx + 1,
        }));
        return combined;
      });

      // Henüz kapak görseli yoksa ilk yüklenen görseli kapak yap
      setCoverImage((prevCover) => (prevCover ? prevCover : uploadedSlides[0].imageUrl));
    }

    setUploadProgress(100);
    setUploadStatusText(`Tamamlandı! ${uploadedSlides.length} fotoğraf başarıyla eklendi.`);
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatusText("");
    }, 1200);
  };

  // --- SÜRÜKLE-BIRAK (SORTABLE) SIRALAMA METOTLARI ---
  const handleDragStartSlide = (index: number) => {
    setDraggedSlideIndex(index);
  };

  const handleDragOverSlide = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSlideIndex === null || draggedSlideIndex === index) return;
    setDragOverSlideIndex(index);
  };

  const handleDropSlide = (targetIndex: number) => {
    if (draggedSlideIndex === null || draggedSlideIndex === targetIndex) {
      setDraggedSlideIndex(null);
      setDragOverSlideIndex(null);
      return;
    }

    setSlides((prev) => {
      const newSlides = [...prev];
      const [movedItem] = newSlides.splice(draggedSlideIndex, 1);
      newSlides.splice(targetIndex, 0, movedItem);
      return newSlides.map((s, idx) => ({ ...s, order: idx + 1 }));
    });

    setDraggedSlideIndex(null);
    setDragOverSlideIndex(null);
  };

  // --- GALERİ MODAL METOTLARI ---
  const handleOpenCreate = () => {
    setEditingGallery(null);
    setTitle("");
    setSpot("");
    setCategory(categories[0]?.key || "gundem");
    setCoverImage("");
    setAuthorName("Gündem360 Görsel Servisi");
    setTags("");
    setIsFeatured(false);
    setSlides([]);
    setActiveSlideIndex(0);
    setErrorMessage(null);
    setUploadErrors([]);
    setIsUploading(false);
    setUploadProgress(0);
    setIsQuickCatOpen(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (gallery: PhotoGallery) => {
    setEditingGallery(gallery);
    setTitle(gallery.title);
    setSpot(gallery.spot || "");
    setCategory(gallery.category || categories[0]?.key || "gundem");
    setCoverImage(gallery.coverImage || "");
    setAuthorName(gallery.author?.name || "Gündem360 Görsel Servisi");
    setTags(Array.isArray(gallery.tags) ? gallery.tags.join(", ") : "");
    setIsFeatured(Boolean(gallery.isFeatured));
    setSlides(
      gallery.slides && gallery.slides.length > 0
        ? gallery.slides.map((s, idx) => ({ ...s, order: idx + 1 }))
        : []
    );
    setActiveSlideIndex(0);
    setErrorMessage(null);
    setUploadErrors([]);
    setIsUploading(false);
    setUploadProgress(0);
    setIsQuickCatOpen(false);
    setIsModalOpen(true);
  };

  // Slayt Ekleme
  const handleAddSlide = () => {
    const newSlide: GallerySlide = {
      id: `slide-${Date.now()}-${slides.length + 1}`,
      imageUrl: "",
      title: "",
      caption: "",
      order: slides.length + 1,
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setActiveSlideIndex(updated.length - 1);
  };

  // Slayt Güncelleme
  const handleUpdateSlide = (index: number, field: keyof GallerySlide, val: any) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: val };
    setSlides(updated);
  };

  // Slayt Silme
  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      alert("Galeride en az 1 adet fotoğraf bulunmalıdır.");
      return;
    }
    const updated = slides.filter((_, i) => i !== index).map((s, idx) => ({ ...s, order: idx + 1 }));
    setSlides(updated);
    if (activeSlideIndex >= updated.length) {
      setActiveSlideIndex(Math.max(0, updated.length - 1));
    }
  };

  // Slayt Sıralama (Yukarı / Aşağı)
  const handleMoveSlide = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSlides(reordered);
    setActiveSlideIndex(targetIndex);
  };

  // Galeri Kaydet / Güncelle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Lütfen galeri başlığını girin.");
      return;
    }

    if (slides.length === 0) {
      setErrorMessage("En az 1 adet slayt/fotoğraf eklemelisiniz.");
      return;
    }

    for (let i = 0; i < slides.length; i++) {
      if (!slides[i].imageUrl.trim()) {
        setErrorMessage(`${i + 1}. slayt için lütfen bir görsel yükleyin veya URL belirtin.`);
        setActiveSlideIndex(i);
        return;
      }
    }

    const currentCover = coverImage.trim() || slides[0].imageUrl;
    const catItem = categories.find((c) => c.key === category);

    const payload = {
      id: editingGallery ? editingGallery.id : undefined,
      title: title.trim(),
      spot: spot.trim(),
      category,
      categoryTitle: catItem ? catItem.name : "Gündem",
      categoryBadgeColor: catItem ? catItem.badgeColor : "bg-red-600",
      coverImage: currentCover,
      slides,
      author: {
        name: authorName.trim() || "Gündem360 Görsel Servisi",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      },
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isFeatured,
    };

    setLoading(true);

    try {
      const res = await fetch("/api/galleries", {
        method: editingGallery ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "İşlem sırasında bir hata oluştu.");
      }

      if (editingGallery) {
        setGalleries((prev) => prev.map((g) => (g.id === data.id ? data : g)));
        setSuccessMessage("Galeri başarıyla güncellendi!");
      } else {
        setGalleries((prev) => [data, ...prev]);
        setSuccessMessage("Yeni galeri başarıyla yayınlandı!");
      }

      setTimeout(() => setSuccessMessage(null), 4000);
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Bir hata meydana geldi.");
    } finally {
      setLoading(false);
    }
  };

  // Galeri Silme Onayı
  const handleDeleteConfirm = async () => {
    if (!deleteModalGallery) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/galleries?id=${deleteModalGallery.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Silinemedi.");
      }

      setGalleries((prev) => prev.filter((g) => g.id !== deleteModalGallery.id));
      setDeleteModalGallery(null);
      setSuccessMessage("Galeri başarıyla silindi.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme
  const filteredGalleries = galleries.filter((g) => {
    const matchesCategory = selectedCategory === "all" || g.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      g.title.toLowerCase().includes(query) ||
      (g.spot && g.spot.toLowerCase().includes(query)) ||
      (g.tags && g.tags.some((t) => t.toLowerCase().includes(query)));
    return matchesCategory && matchesSearch;
  });

  const totalGalleries = galleries.length;
  const totalSlides = galleries.reduce((acc, g) => acc + (g.slides?.length || 0), 0);
  const totalViews = galleries.reduce((acc, g) => acc + (g.viewCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. ÜST BİLGİ & İSTATİSTİK BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-lg">
              <Images className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              Foto Galeri Yönetimi
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Haber portalınızdaki tüm fotoğraf galerilerini yönetin, kategorileri özelleştirin, çoklu slaytlar ekleyin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/foto-galeri"
            target="_blank"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            <ExternalLink className="w-4 h-4 text-zinc-400" />
            <span>Siteyi Aç</span>
          </Link>

          {/* KATEGORİLERİ YÖNET BUTONU */}
          <button
            onClick={handleOpenCatModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-red-500/50 bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer shadow-xs"
          >
            <FolderTree className="w-4 h-4 text-red-500" />
            <span>Kategorileri Yönet ({categories.length})</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Galeri Oluştur</span>
          </button>
        </div>
      </div>

      {/* İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Toplam Galeri</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">{totalGalleries}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Kategoriler</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">{categories.length}</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
            <FolderTree className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Toplam Fotoğraf</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">{totalSlides}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <Camera className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Toplam Görüntülenme</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {totalViews.toLocaleString("tr-TR")}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* BİLDİRİM MESAJLARI */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2. ARAMA VE KATEGORİ FİLTRESİ */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Başlık, özet veya etiketlerde ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Kategori Filtresi */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === "all"
                ? "bg-red-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            Tümü ({galleries.length})
          </button>
          {categories.map((cat) => {
            const count = galleries.filter((g) => g.category === cat.key).length;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cat.badgeColor || "bg-red-600"}`} />
                <span>{cat.name}</span>
                <span className="opacity-60 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. GALERİ LİSTESİ GRID */}
      {filteredGalleries.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <Images className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Henüz galeri bulunamadı</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Arama kriterlerinize uygun galeri bulunamadı ya da bu kategoride henüz bir fotoğraf galerisi yok.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>İlk Galeriyi Oluştur</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGalleries.map((gallery) => {
            const slideCount = gallery.slides?.length || 0;
            const catBadgeColor = gallery.categoryBadgeColor || "bg-red-600";
            return (
              <div
                key={gallery.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition flex flex-col justify-between group"
              >
                <div>
                  {/* Görsel & Rozetler */}
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-800">
                    <Image
                      src={gallery.coverImage || "/placeholder-news.jpg"}
                      alt={gallery.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                    {/* Slayt Sayısı Rozeti */}
                    <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
                      <Camera className="w-3.5 h-3.5 text-red-400" />
                      <span>{slideCount} Fotoğraf</span>
                    </div>

                    {/* Kategori Rozeti (Dinamik Renkli) */}
                    <div
                      className={`absolute top-3 left-3 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm ${catBadgeColor}`}
                    >
                      {gallery.categoryTitle || gallery.category}
                    </div>

                    {/* Görüntülenme */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{gallery.viewCount?.toLocaleString("tr-TR") || 0}</span>
                    </div>
                  </div>

                  {/* İçerik */}
                  <div className="p-4">
                    <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mb-1">
                      {gallery.publishedAt}
                    </p>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                      {gallery.title}
                    </h3>
                    {gallery.spot && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                        {gallery.spot}
                      </p>
                    )}

                    {/* Etiketler */}
                    {gallery.tags && gallery.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {gallery.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Aksiyon Butonları */}
                <div className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between mt-2">
                  <Link
                    href={`/foto-galeri/${gallery.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Önizle</span>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(gallery)}
                      className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-white hover:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Galeriyi Düzenle"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Düzenle</span>
                    </button>
                    <button
                      onClick={() => setDeleteModalGallery(gallery)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition text-xs font-semibold cursor-pointer"
                      title="Galeriyi Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. KATEGORİ YÖNETİM MODALI */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-xl">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                    Foto Galeri Kategorileri Yönetimi
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Foto galeriye özel kategorileri düzenleyin, yeni kategoriler ekleyin ve rozet renklerini belirleyin.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Hata Bildirimi */}
              {catError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{catError}</span>
                </div>
              )}

              {/* Kategori Ekleme / Düzenleme Formu */}
              <form
                onSubmit={handleSaveCategory}
                className="p-5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-purple-500" />
                    <span>{editingCatKey ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}</span>
                  </h3>
                  {editingCatKey && (
                    <button
                      type="button"
                      onClick={handleCancelCatEdit}
                      className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-bold"
                    >
                      Vazgeç / Yeni Ekle
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Kategori Adı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      placeholder="Örn: Doğa & Vahşi Yaşam"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Slug / Kod (Boş bırakılırsa otomatik üretilir)
                    </label>
                    <input
                      type="text"
                      value={catKey}
                      onChange={(e) => setCatKey(e.target.value)}
                      placeholder="Örn: doga-yasam"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Rozet Rengi Seçimi */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Rozet Rengi
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => setCatColor(col.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          catColor === col.value
                            ? "border-zinc-900 dark:border-white bg-white dark:bg-zinc-900 shadow-xs"
                            : "border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/60 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${col.dot}`} />
                        <span className="text-zinc-800 dark:text-zinc-200">{col.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Açıklama (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Bu kategorinin içeriğini tanımlayan kısa açıklama"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <ImageUploader
                    value={catCoverImage}
                    onChange={(url) => setCatCoverImage(url)}
                    label="Kategori Kapak Görseli (Opsiyonel)"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={catLoading}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-md shadow-purple-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {catLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    <span>{editingCatKey ? "Değişiklikleri Kaydet" : "Kategoriyi Ekle"}</span>
                  </button>
                </div>
              </form>

              {/* Mevcut Kategoriler Listesi */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Mevcut Kategoriler ({categories.length})
                </h3>

                <div className="space-y-2">
                  {categories.map((cat) => {
                    const galleryCount = galleries.filter((g) => g.category === cat.key).length;
                    const isSelectedForEdit = editingCatKey === cat.key;
                    return (
                      <div
                        key={cat.key}
                        className={`p-3.5 rounded-xl border transition flex items-center justify-between ${
                          isSelectedForEdit
                            ? "bg-purple-50 dark:bg-purple-950/40 border-purple-400"
                            : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {cat.coverImage ? (
                            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                              <Image src={cat.coverImage} alt={cat.name} fill className="object-cover" />
                            </div>
                          ) : (
                            <span
                              className={`w-3.5 h-3.5 rounded-full ${cat.badgeColor || "bg-red-600"} shrink-0 shadow-xs`}
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                                {cat.name}
                              </p>
                              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-300 px-2 py-0.5 rounded-md font-mono">
                                {cat.key}
                              </span>
                            </div>
                            {cat.description && (
                              <p className="text-[11px] text-zinc-400 mt-0.5">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>{cat.photoCount !== undefined ? cat.photoCount : galleries.filter((g) => g.category === cat.key).reduce((sum, g) => sum + (g.slides?.length || 0), 0)} Fotoğraf</span>
                          </span>

                          <span className="text-xs font-bold text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            {galleryCount} Galeri
                          </span>

                          <div className="flex items-center gap-1 ml-1">
                            <button
                              type="button"
                              onClick={() => handleEditCatClick(cat)}
                              className="p-1.5 text-zinc-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition cursor-pointer"
                              title="Kategoriyi Düzenle"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteCatTarget(cat)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                              title="Kategoriyi Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. KATEGORİ SİLME ONAY MODALI */}
      {deleteCatTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-950/60 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                  Galeri Kategorisini Sil
                </h3>
                <p className="text-xs text-zinc-500">Bu işlem kategoriyi kaldıracaktır.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
              <strong className="text-zinc-900 dark:text-zinc-100">&quot;{deleteCatTarget.name}&quot;</strong> kategorisini silmek istediğinize emin misiniz? Bu kategoriye bağlı galeriler varsa otomatik olarak varsayılan kategoriye aktarılacaktır.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteCatTarget(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={catLoading}
                onClick={handleDeleteCategoryConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {catLoading ? "Siliniyor..." : "Evet, Kategoriyi Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. GALERİ OLUŞTUR / DÜZENLE MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-100 dark:bg-red-950 text-red-600 rounded-xl">
                  <Images className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                    {editingGallery ? "Foto Galeri Düzenle" : "Yeni Foto Galeri Ekle"}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Galeri bilgilerini doldurun, kategoriyi belirleyin ve fotoğraflarınızı yükleyin.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* TEMEL BİLGİLER */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  Temel Galeri Bilgileri
                </h3>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Galeri Başlığı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn: 2026 Yılının En Etkileyici Yaban Hayatı Fotoğrafları"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Spot / Özet Açıklama
                  </label>
                  <textarea
                    rows={2}
                    value={spot}
                    onChange={(e) => setSpot(e.target.value)}
                    placeholder="Kullanıcıların galeri listesinde ve başında göreceği çarpıcı özet..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Kategori Seçici & Hızlı Yönet Butonu */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Galeri Kategorisi
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsQuickCatOpen(!isQuickCatOpen)}
                          className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Hızlı Ekle</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleOpenCatModal}
                          className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <FolderTree className="w-3 h-3" />
                          <span>Kategori Stüdyosu</span>
                        </button>
                      </div>
                    </div>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
                    >
                      {categories.map((cat) => (
                        <option key={cat.key} value={cat.key}>
                          {cat.name} ({cat.photoCount !== undefined ? `${cat.photoCount} Fotoğraf` : ""})
                        </option>
                      ))}
                    </select>

                    {/* Hızlı Kategori Ekleme Mini Paneli (AJAX) */}
                    {isQuickCatOpen && (
                      <div className="mt-2.5 p-3.5 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-red-700 dark:text-red-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Hızlı Kategori Ekle (AJAX)
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsQuickCatOpen(false)}
                            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {quickCatError && (
                          <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold">
                            {quickCatError}
                          </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={quickCatName}
                            onChange={(e) => setQuickCatName(e.target.value)}
                            placeholder="Kategori Adı *"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                          />
                          <input
                            type="text"
                            value={quickCatKey}
                            onChange={(e) => setQuickCatKey(e.target.value)}
                            placeholder="Slug / Kod (opsiyonel)"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            {COLOR_OPTIONS.slice(0, 5).map((col) => (
                              <button
                                key={col.value}
                                type="button"
                                onClick={() => setQuickCatColor(col.value)}
                                className={`w-4 h-4 rounded-full ${col.dot} transition cursor-pointer ${
                                  quickCatColor === col.value ? "ring-2 ring-zinc-900 dark:ring-white scale-110" : "opacity-60 hover:opacity-100"
                                }`}
                                title={col.label}
                              />
                            ))}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setIsQuickCatOpen(false)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            >
                              İptal
                            </button>
                            <button
                              type="button"
                              disabled={quickCatLoading}
                              onClick={handleQuickAddCategory}
                              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                            >
                              {quickCatLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                              <span>Kaydet ve Seç</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Yazar / Foto Muhabir
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Görsel Servisi veya Editör İsmi"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Etiketler (Virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Fotoğraf, Teknoloji, TEKNOFEST, Doğa"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Kapak Görseli */}
                <div>
                  <ImageUploader
                    value={coverImage}
                    onChange={(url) => setCoverImage(url)}
                    label="Galeri Kapak Fotoğrafı (Boş bırakılırsa 1. slayt kullanılır)"
                  />
                </div>
              </div>

              {/* SLAYT YÖNETİCİSİ (MULTI-SLIDE STUDIO & DROPZONE) */}
              <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-red-500" />
                      Galeri Fotoğrafları ve Slaytlar ({slides.length} Fotoğraf)
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Fotoğrafları sürükleyip bırakarak toplu yükleyin, yüklenen kartları fareyle sürükleyerek (Drag & Drop) gösterim sırasını kolayca belirleyin.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddSlide}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Manuel Slayt Ekle</span>
                    </button>
                    {slides.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Tüm fotoğrafları silmek istediğinize emin misiniz?")) {
                            setSlides([]);
                            setCoverImage("");
                          }
                        }}
                        className="px-2.5 py-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer"
                      >
                        Tümünü Temizle
                      </button>
                    )}
                  </div>
                </div>

                {/* 1. ÇOKLU GÖRSEL YÜKLEME ALANI (DROPZONE) */}
                <input
                  ref={dropzoneInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFilesUpload(e.target.files);
                      e.target.value = "";
                    }
                  }}
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    if (e.dataTransfer.files) {
                      handleFilesUpload(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => dropzoneInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all select-none ${
                    isDraggingOver
                      ? "border-red-500 bg-red-50/20 dark:bg-red-950/30 scale-[1.01] shadow-xl"
                      : "border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-red-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/80"
                  }`}
                >
                  <div className="max-w-md mx-auto space-y-2 pointer-events-none">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto shadow-xs">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      Fotoğrafları buraya sürükleyip bırakın veya seçin
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Tek seferde birden fazla fotoğraf seçebilirsiniz • JPG, PNG, WEBP, GIF (Maks. 10MB)
                    </p>
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-xs">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Bilgisayardan Fotoğrafları Seç</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. ASENKRON SIRALI YÜKLEME & PROGRESS BAR */}
                {isUploading && (
                  <div className="p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-800 space-y-2.5 shadow-lg animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                        <span className="font-bold">{uploadStatusText}</span>
                      </div>
                      <span className="font-mono font-black text-red-400">%{uploadProgress}</span>
                    </div>

                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 3. YÜKLEME HATA BİLDİRİMLERİ (KIRMIZI UYARI KARTLARI) */}
                {uploadErrors.length > 0 && (
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Bazı fotoğraflar yüklenemedi ({uploadErrors.length} dosya):</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadErrors([])}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold"
                      >
                        Temizle
                      </button>
                    </div>

                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {uploadErrors.map((err, i) => (
                        <div
                          key={i}
                          className="text-[11px] bg-red-100/60 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-3 py-1.5 rounded-lg flex items-center justify-between gap-2"
                        >
                          <span className="font-mono font-bold truncate">{err.fileName}</span>
                          <span className="shrink-0 text-red-600 dark:text-red-400">{err.error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. YÜKLENDİKTEN SONRA SIRALAMA (SORTABLE DRAG & DROP KARTLARI) */}
                {slides.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-semibold flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-red-500 shrink-0" />
                      <span>
                        💡 <strong>Sürükle-Bırak Sıralama:</strong> Fotoğraf kartlarını fareyle tutarak istediğiniz yere sürükleyip bırakabilirsiniz. Gösterim sırası anında güncellenir.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {slides.map((slide, idx) => {
                        const isTarget = dragOverSlideIndex === idx;
                        const isCurrentCover =
                          coverImage === slide.imageUrl || (!coverImage && idx === 0 && slide.imageUrl);

                        return (
                          <div
                            key={slide.id || idx}
                            draggable
                            onDragStart={() => handleDragStartSlide(idx)}
                            onDragOver={(e) => handleDragOverSlide(e, idx)}
                            onDragLeave={() => setDragOverSlideIndex(null)}
                            onDrop={(e) => {
                              e.preventDefault();
                              handleDropSlide(idx);
                            }}
                            onDragEnd={() => {
                              setDraggedSlideIndex(null);
                              setDragOverSlideIndex(null);
                            }}
                            className={`rounded-2xl border transition-all duration-200 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                              isTarget
                                ? "ring-2 ring-red-500 border-red-500 scale-[1.02] shadow-xl bg-red-50/20"
                                : "border-zinc-200 dark:border-zinc-800"
                            }`}
                          >
                            {/* Kart Üst Kontrol Barı */}
                            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md"
                                  title="Sıralamak için sürükleyin"
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono">
                                  #{idx + 1}
                                </span>
                              </div>

                              {/* Kapak Yap & Aksiyonlar */}
                              <div className="flex items-center gap-1">
                                {slide.imageUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setCoverImage(slide.imageUrl)}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 transition cursor-pointer ${
                                      isCurrentCover
                                        ? "bg-amber-500 text-black shadow-xs"
                                        : "bg-zinc-200/80 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-amber-100 hover:text-amber-800"
                                    }`}
                                    title={isCurrentCover ? "Bu görsel galeri kapağıdır" : "Bu görseli galeri kapağı yap"}
                                  >
                                    <Star className={`w-3 h-3 ${isCurrentCover ? "fill-black" : ""}`} />
                                    <span>{isCurrentCover ? "Kapak" : "Kapak Yap"}</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveSlide(idx, "up")}
                                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                                  title="Yukarı Taşı"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === slides.length - 1}
                                  onClick={() => handleMoveSlide(idx, "down")}
                                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                                  title="Aşağı Taşı"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteSlide(idx)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition cursor-pointer"
                                  title="Bu fotoğrafı kaldır"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Fotoğraf Önizleme */}
                            <div className="p-3 space-y-2.5">
                              <div className="relative aspect-16/10 w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                                {slide.imageUrl ? (
                                  <Image
                                    src={slide.imageUrl}
                                    alt={slide.title || `Fotoğraf ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="text-center p-3 text-zinc-400">
                                    <Camera className="w-6 h-6 mx-auto mb-1 opacity-50" />
                                    <span className="text-[10px]">Görsel Seçilmedi</span>
                                  </div>
                                )}
                              </div>

                              {/* Görsel URL Düzenleme / Değiştirme */}
                              <div>
                                <input
                                  type="text"
                                  value={slide.imageUrl}
                                  onChange={(e) => handleUpdateSlide(idx, "imageUrl", e.target.value)}
                                  placeholder="Görsel URL veya dosya yolu..."
                                  className="w-full px-2.5 py-1 text-[11px] rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono truncate"
                                />
                              </div>

                              {/* SEO Alt Bilgi & Başlık Düzenleme */}
                              <div className="space-y-1.5 pt-1">
                                <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                  SEO Başlık (Alt Tagı)
                                </label>
                                <input
                                  type="text"
                                  value={slide.title || ""}
                                  onChange={(e) => handleUpdateSlide(idx, "title", e.target.value)}
                                  placeholder="Fotoğraf Başlığı (SEO Alt Tagı)..."
                                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-red-500 font-medium"
                                />
                              </div>

                              {/* Fotoğraf Açıklaması / Altyazı Düzenleme */}
                              <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                  Fotoğraf Açıklaması / Altyazı
                                </label>
                                <textarea
                                  rows={2}
                                  value={slide.caption || ""}
                                  onChange={(e) => handleUpdateSlide(idx, "caption", e.target.value)}
                                  placeholder="Bu karenin hikayesini veya altyazısını girin..."
                                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-red-500 resize-none"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingGallery ? "Değişiklikleri Kaydet" : "Galeriyi Yayınla"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. GALERİ SİLME ONAY MODALI */}
      {deleteModalGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-950/60 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                  Foto Galeriyi Sil
                </h3>
                <p className="text-xs text-zinc-500">Bu işlem geri alınamaz.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
              <strong className="text-zinc-900 dark:text-zinc-100">&quot;{deleteModalGallery.title}&quot;</strong> başlıklı galeriyi ve içerisindeki{" "}
              <strong>{deleteModalGallery.slides?.length || 0} adet slaytı</strong> silmek istediğinize emin misiniz?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalGallery(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Siliniyor..." : "Evet, Galeriyi Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
