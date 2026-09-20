"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Columnist, ColumnistArticle } from "@/types/news";
import ImageUploader from "@/components/admin/ImageUploader";
import RichTextEditor from "@/components/admin/RichTextEditor";
import {
  Feather,
  PlusCircle,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Edit3,
  Trash2,
  X,
  Search,
  Calendar,
  User,
  BookOpen,
  Sparkles,
  Loader2,
  Archive,
  UserPlus,
  FileText,
  Mail,
  ChevronRight,
  Plus,
  Eye,
  ArrowUpRight,
} from "lucide-react";

interface YazarlarClientProps {
  initialColumnists: Columnist[];
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function YazarlarClient({
  initialColumnists,
}: YazarlarClientProps) {
  const [columnists, setColumnists] = useState<Columnist[]>(initialColumnists);
  const [activeTab, setActiveTab] = useState<"list" | "new_author" | "new_article">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // 1. Seçili Yazarın Makale Arşivi Modal State'i
  const [archiveModalAuthor, setArchiveModalAuthor] = useState<Columnist | null>(null);
  const [archiveSearchQuery, setArchiveSearchQuery] = useState("");

  // 2. Yazar Profili Düzenleme Modal State'i
  const [editingAuthor, setEditingAuthor] = useState<Columnist | null>(null);
  const [authorEditForm, setAuthorEditForm] = useState({
    name: "",
    title: "",
    avatar: "",
    bio: "",
    email: "",
    socialTwitter: "",
    socialLinkedin: "",
  });

  // 3. Makale Düzenleme Modal State'i
  const [editingArticle, setEditingArticle] = useState<{
    authorId: string;
    article: ColumnistArticle;
  } | null>(null);
  const [articleEditForm, setArticleEditForm] = useState({
    title: "",
    date: "",
    slug: "",
    excerpt: "",
    content: "",
  });

  // 4. Silme Onay State'leri
  const [deletingAuthor, setDeletingAuthor] = useState<Columnist | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<{
    authorId: string;
    article: ColumnistArticle;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 5. Yeni Yazar Ekle Form State'i
  const [newAuthorForm, setNewAuthorForm] = useState({
    name: "",
    title: "Köşe Yazarı & Analist",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    bio: "",
    email: "",
    socialTwitter: "",
    socialLinkedin: "",
  });

  // 6. Yazara Yeni Makale Ekle Form State'i
  const [newArticleForm, setNewArticleForm] = useState({
    authorId: initialColumnists[0]?.id || "",
    title: "",
    date: new Date().toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    slug: "",
    excerpt: "",
    content: "",
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // Toplam makale sayısı hesaplama
  const totalArticlesCount = useMemo(() => {
    return columnists.reduce((acc, col) => acc + (col.articles?.length || 1), 0);
  }, [columnists]);

  // Arama filtreleme
  const filteredColumnists = useMemo(() => {
    if (!searchQuery.trim()) return columnists;
    const q = searchQuery.toLowerCase();
    return columnists.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.bio?.toLowerCase().includes(q) ||
        c.articles?.some((a) => a.title.toLowerCase().includes(q))
    );
  }, [columnists, searchQuery]);

  // Arşiv modalı içi makale filtreleme
  const filteredArchiveArticles = useMemo(() => {
    if (!archiveModalAuthor) return [];
    const articles = archiveModalAuthor.articles || [];
    if (!archiveSearchQuery.trim()) return articles;
    const q = archiveSearchQuery.toLowerCase();
    return articles.filter(
      (a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
    );
  }, [archiveModalAuthor, archiveSearchQuery]);

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------

  // Yazar Profili Düzenlemeyi Başlat
  const handleStartAuthorEdit = (author: Columnist) => {
    setEditingAuthor(author);
    setAuthorEditForm({
      name: author.name,
      title: author.title,
      avatar: author.avatar,
      bio: author.bio || "",
      email: author.email || "",
      socialTwitter: author.socialTwitter || "",
      socialLinkedin: author.socialLinkedin || "",
    });
  };

  // Yazar Profilini Kaydet
  const handleSaveAuthorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuthor) return;
    if (!authorEditForm.name.trim()) {
      showToast("Yazar Adı Soyadı gereklidir.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/columnists", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_author",
          id: editingAuthor.id,
          ...authorEditForm,
        }),
      });

      if (res.ok) {
        const updated: Columnist = await res.json();
        setColumnists((prev) =>
          prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
        );
        if (archiveModalAuthor && archiveModalAuthor.id === updated.id) {
          setArchiveModalAuthor((prev) => (prev ? { ...prev, ...updated } : null));
        }
        showToast(`"${updated.name}" yazar profili başarıyla güncellendi!`);
        setEditingAuthor(null);
      } else {
        const err = await res.json();
        showToast(err.error || "Güncelleme başarısız.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Ağ hatası oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Yeni Yazar Profili Ekle
  const handleCreateAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthorForm.name.trim()) {
      showToast("Lütfen yazar adı soyadı girin.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/columnists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_author",
          ...newAuthorForm,
        }),
      });

      if (res.ok) {
        const created: Columnist = await res.json();
        setColumnists([created, ...columnists]);
        showToast(`"${created.name}" adlı yeni yazar profili eklendi!`);
        setNewAuthorForm({
          name: "",
          title: "Köşe Yazarı & Analist",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
          bio: "",
          email: "",
          socialTwitter: "",
          socialLinkedin: "",
        });
        setActiveTab("list");
      } else {
        const err = await res.json();
        showToast(err.error || "Yazar eklenemedi.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Sunucu hatası oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Yazara Yeni Makale Ekle
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticleForm.authorId || !newArticleForm.title.trim() || !newArticleForm.content.trim()) {
      showToast("Lütfen yazar seçin, makale başlığı ve içeriğini doldurun.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/columnists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_article",
          authorId: newArticleForm.authorId,
          title: newArticleForm.title.trim(),
          date: newArticleForm.date,
          slug: newArticleForm.slug.trim() || undefined,
          excerpt: newArticleForm.excerpt.trim() || undefined,
          content: newArticleForm.content,
        }),
      });

      if (res.ok) {
        const data: { author: Columnist; article: ColumnistArticle } = await res.json();
        setColumnists((prev) =>
          prev.map((c) => (c.id === data.author.id ? data.author : c))
        );
        if (archiveModalAuthor && archiveModalAuthor.id === data.author.id) {
          setArchiveModalAuthor(data.author);
        }
        showToast(`"${data.article.title}" makalesi yazara ait arşive başarıyla eklendi!`);
        setNewArticleForm({
          authorId: data.author.id,
          title: "",
          date: new Date().toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          slug: "",
          excerpt: "",
          content: "",
        });
        setActiveTab("list");
      } else {
        const err = await res.json();
        showToast(err.error || "Makale eklenemedi.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Sunucu hatası oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Makale Düzenlemeyi Başlat
  const handleStartArticleEdit = (authorId: string, article: ColumnistArticle) => {
    setEditingArticle({ authorId, article });
    setArticleEditForm({
      title: article.title,
      date: article.date,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
    });
  };

  // Makaleyi Kaydet
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    if (!articleEditForm.title.trim() || !articleEditForm.content.trim()) {
      showToast("Makale başlığı ve içeriği zorunludur.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/columnists", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_article",
          authorId: editingArticle.authorId,
          articleId: editingArticle.article.id,
          ...articleEditForm,
        }),
      });

      if (res.ok) {
        const data: { author: Columnist; article: ColumnistArticle } = await res.json();
        setColumnists((prev) =>
          prev.map((c) => (c.id === data.author.id ? data.author : c))
        );
        if (archiveModalAuthor && archiveModalAuthor.id === data.author.id) {
          setArchiveModalAuthor(data.author);
        }
        showToast(`"${data.article.title}" makalesi başarıyla güncellendi!`);
        setEditingArticle(null);
      } else {
        const err = await res.json();
        showToast(err.error || "Makale güncellenemedi.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("İletişim hatası oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Makale Silmeyi Onayla
  const handleDeleteArticleConfirm = async () => {
    if (!deletingArticle) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(
        `/api/columnists?authorId=${encodeURIComponent(deletingArticle.authorId)}&articleId=${encodeURIComponent(deletingArticle.article.id)}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setColumnists((prev) =>
          prev.map((c) => {
            if (c.id === deletingArticle.authorId) {
              const remaining = (c.articles || []).filter((a) => a.id !== deletingArticle.article.id);
              const latest = remaining[0];
              return {
                ...c,
                articles: remaining,
                articleTitle: latest ? latest.title : "",
                articleDate: latest ? latest.date : "",
                articleSlug: latest ? latest.slug : "",
                excerpt: latest ? latest.excerpt : "",
                content: latest ? latest.content : "",
              };
            }
            return c;
          })
        );
        if (archiveModalAuthor && archiveModalAuthor.id === deletingArticle.authorId) {
          setArchiveModalAuthor((prev) => {
            if (!prev) return null;
            const remaining = (prev.articles || []).filter((a) => a.id !== deletingArticle.article.id);
            return { ...prev, articles: remaining };
          });
        }
        showToast(`"${deletingArticle.article.title}" başlıklı makale arşivden silindi.`);
        setDeletingArticle(null);
      } else {
        const err = await res.json();
        showToast(err.error || "Silme başarısız.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Silinirken hata oluştu.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Yazarı Silmeyi Onayla
  const handleDeleteAuthorConfirm = async () => {
    if (!deletingAuthor) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/columnists?id=${encodeURIComponent(deletingAuthor.id)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setColumnists((prev) => prev.filter((c) => c.id !== deletingAuthor.id));
        if (archiveModalAuthor && archiveModalAuthor.id === deletingAuthor.id) {
          setArchiveModalAuthor(null);
        }
        showToast(`"${deletingAuthor.name}" ve tüm makale arşivi sistemden silindi.`);
        setDeletingAuthor(null);
      } else {
        const err = await res.json();
        showToast(err.error || "Yazar silinemedi.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Silme hatası oluştu.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. ÜST BAR & İSTATİSTİK ROZETLERİ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-red-600 text-white rounded-xl shadow-xs">
              <Feather className="w-5 h-5" />
            </div>
            <span>Yazar & Makale Arşivi Yönetimi</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Yazar profillerini oluşturun, yazarlara özel makale arşivlerini yönetin ve yeni köşe yazıları yayınlayın.
          </p>
        </div>

        {/* Sekme Butonları */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeTab === "list"
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Yazarlar & Arşivler</span>
          </button>

          <button
            onClick={() => setActiveTab("new_author")}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeTab === "new_author"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Yeni Yazar Ekle</span>
          </button>

          <button
            onClick={() => setActiveTab("new_article")}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer ${
              activeTab === "new_article"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Yeni Makale Yaz</span>
          </button>
        </div>
      </div>

      {/* 3 İstatistik Kartı */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 font-medium uppercase">Kayıtlı Yazar</div>
            <div className="text-lg font-black text-zinc-900 dark:text-white">
              {columnists.length}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 font-medium uppercase">Toplam Arşiv Makale</div>
            <div className="text-lg font-black text-zinc-900 dark:text-white">
              {totalArticlesCount}
            </div>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 font-medium uppercase">Yazar Başına Ortalama</div>
            <div className="text-lg font-black text-emerald-600">
              {columnists.length > 0 ? (totalArticlesCount / columnists.length).toFixed(1) : 0} Makale
            </div>
          </div>
        </div>
      </div>

      {/* Toast Bildirimi */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 shadow-xs transition-all animate-in fade-in ${
            notification.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      {/* 2. TAB: YENİ YAZAR PROFİLİ OLUŞTUR */}
      {activeTab === "new_author" && (
        <form
          onSubmit={handleCreateAuthor}
          className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-black uppercase text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-red-600" />
                <span>Yeni Köşe Yazarı Profili Tanımla</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Gazetenin yazar kadrosuna yeni bir yazar ekleyin. Profil kaydedildikten sonra yazara dilediğiniz kadar makale ekleyebilirsiniz.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Yazar Adı Soyadı <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Prof. Dr. İlber Ortaylı"
                value={newAuthorForm.name}
                onChange={(e) => setNewAuthorForm({ ...newAuthorForm, name: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Yazar Unvanı / Köşe Adı
              </label>
              <input
                type="text"
                placeholder="Örn: Tarih, Kültür & Medeniyet"
                value={newAuthorForm.title}
                onChange={(e) => setNewAuthorForm({ ...newAuthorForm, title: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Profil Fotoğrafı Yükleyici */}
          <div>
            <ImageUploader
              label="Yazar Profil Fotoğrafı"
              value={newAuthorForm.avatar}
              onChange={(url) => setNewAuthorForm({ ...newAuthorForm, avatar: url })}
              required
            />
          </div>

          {/* Biyografi */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Yazar Biyografisi (Özgeçmiş)
            </label>
            <textarea
              rows={3}
              placeholder="Yazarın kariyeri, uzmanlık alanları ve okuyucuya hitap eden kısa tanıtımı..."
              value={newAuthorForm.bio}
              onChange={(e) => setNewAuthorForm({ ...newAuthorForm, bio: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* İletişim ve Sosyal Medya */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                E-posta Adresi
              </label>
              <input
                type="email"
                placeholder="yazar@gundem360.com"
                value={newAuthorForm.email}
                onChange={(e) => setNewAuthorForm({ ...newAuthorForm, email: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Twitter / X Kullanıcı Adı
              </label>
              <input
                type="text"
                placeholder="@yazar_kullaniciadi"
                value={newAuthorForm.socialTwitter}
                onChange={(e) => setNewAuthorForm({ ...newAuthorForm, socialTwitter: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                LinkedIn Profili
              </label>
              <input
                type="text"
                placeholder="linkedin.com/in/yazar"
                value={newAuthorForm.socialLinkedin}
                onChange={(e) => setNewAuthorForm({ ...newAuthorForm, socialLinkedin: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Yazar Profilini Kaydet</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 3. TAB: YAZARA YENİ MAKALE YAZ */}
      {activeTab === "new_article" && (
        <form
          onSubmit={handleCreateArticle}
          className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-black uppercase text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-red-600" />
                <span>Yazara Yeni Makale Ekle</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Kayıtlı bir yazar seçin ve yazarın makale arşivine yeni bir köşe yazısı ekleyin.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Yazar Seçici */}
          <div className="bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
              Köşe Yazarı Seçin <span className="text-red-600">*</span>
            </label>
            <select
              required
              value={newArticleForm.authorId}
              onChange={(e) => setNewArticleForm({ ...newArticleForm, authorId: e.target.value })}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              {columnists.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.title} ({c.articles?.length || 0} Makale)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-400">
              Yayınlanan makale bu yazarın makale arşivine kaydedilecek ve yazarın son yazısı olarak öne çıkacaktır.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Makale Başlığı <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Örn: 2027 Küresel Finans Düzeninde Yeni Dönemeç"
                value={newArticleForm.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setNewArticleForm((prev) => ({
                    ...prev,
                    title,
                    slug: prev.slug || generateSlug(title),
                  }));
                }}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Yayın Tarihi
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newArticleForm.date}
                  onChange={(e) => setNewArticleForm({ ...newArticleForm, date: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setNewArticleForm({
                      ...newArticleForm,
                      date: new Date().toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }),
                    })
                  }
                  className="px-2.5 py-1 text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg shrink-0 cursor-pointer"
                >
                  Bugün
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                Makale Kısa Özeti / Spot (Excerpt)
              </label>
              <button
                type="button"
                onClick={() => {
                  const plain = newArticleForm.content.replace(/<[^>]*>/g, "").trim();
                  if (plain) {
                    setNewArticleForm({
                      ...newArticleForm,
                      excerpt: plain.slice(0, 140) + "...",
                    });
                  }
                }}
                className="text-[11px] text-red-600 dark:text-red-400 hover:underline font-semibold"
              >
                İçerikten Otomatik Üret
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="Makalenin ana sayfada ve yazar arşivinde görünecek vurucu özeti..."
              value={newArticleForm.excerpt}
              onChange={(e) => setNewArticleForm({ ...newArticleForm, excerpt: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1.5">
              Detaylı Makale Metni <span className="text-red-600">*</span>
            </label>
            <RichTextEditor
              value={newArticleForm.content}
              onChange={(val) => setNewArticleForm({ ...newArticleForm, content: val })}
              placeholder="Makale içeriğini ara başlıklar, paragraflar ve alıntılarla biçimlendirin..."
              minHeight="320px"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Yayınlanıyor...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Makaleyi Yayınla ve Arşive Ekle</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 4. TAB: YAZARLAR VE MAKALE ARŞİVLERİ (ANA LİSTE GÖRÜNÜMÜ) */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {/* Arama ve Filtreleme */}
          <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Yazar adı, unvanı veya makale başlığı ara..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-8 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs text-zinc-500 font-medium">
              Toplam <strong>{filteredColumnists.length}</strong> yazar listeleniyor
            </div>
          </div>

          {/* Kart Grid */}
          {filteredColumnists.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
                <Feather className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Aradığınız kriterlere uygun yazar veya makale bulunamadı
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Farklı bir arama terimi deneyin veya "Yeni Yazar Ekle" butonunu kullanarak yeni yazar ekleyin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredColumnists.map((col) => {
                const articleCount = col.articles?.length || 1;
                return (
                  <div
                    key={col.id}
                    className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:shadow-xs transition flex flex-col justify-between group"
                  >
                    <div className="space-y-3.5">
                      {/* Üst Kısım: Yazar Bilgisi ve Eylemler */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-red-600 shrink-0 shadow-2xs bg-zinc-100 dark:bg-zinc-800">
                            <Image
                              src={col.avatar}
                              alt={col.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-black text-zinc-900 dark:text-white group-hover:text-red-600 transition">
                                {col.name}
                              </h3>
                              <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950/50 text-red-600 border border-red-100 dark:border-red-900/40 text-[10px] font-black rounded-full">
                                {articleCount} Makale
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 font-medium mt-0.5">{col.title}</p>
                            {col.bio && (
                              <p className="text-[11px] text-zinc-400 line-clamp-1 mt-1 italic max-w-xs">
                                {col.bio}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Aksiyonlar: Profil Düzenle & Sil */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartAuthorEdit(col)}
                            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg transition cursor-pointer"
                            title="Yazar Profilini Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingAuthor(col)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/50 text-red-600 rounded-lg transition cursor-pointer"
                            title="Yazarı ve Makalelerini Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Son Makale Önizleme Kutusu */}
                      <div className="bg-zinc-50 dark:bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-red-600 dark:text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            <span>Son Makalesi:</span>
                          </span>
                          <span className="text-zinc-400">{col.articleDate}</span>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                          "{col.articleTitle || "Henüz makale yazılmadı"}"
                        </h4>
                        {col.excerpt && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 italic">
                            {col.excerpt}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Alt Çubuk: Arşiv Açma & Makale Ekleme Butonları */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setArchiveModalAuthor(col);
                          setArchiveSearchQuery("");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Makale Arşivi ({articleCount})</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setNewArticleForm((prev) => ({
                              ...prev,
                              authorId: col.id,
                            }));
                            setActiveTab("new_article");
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                          title="Bu yazara yeni makale ekle"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Yeni Yazı</span>
                        </button>

                        <Link
                          href={`/yazarlar/yazar/${col.slug || col.id}`}
                          target="_blank"
                          className="p-1.5 text-zinc-400 hover:text-red-600 transition"
                          title="Sitedeki Yazar Profilini Gör"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. MODAL: YAZAR MAKALE ARŞİVİ MODALI                         */}
      {/* ------------------------------------------------------------- */}
      {archiveModalAuthor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/80">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-red-600 shrink-0">
                  <Image
                    src={archiveModalAuthor.avatar}
                    alt={archiveModalAuthor.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-zinc-900 dark:text-white">
                      {archiveModalAuthor.name}
                    </h2>
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-full">
                      {archiveModalAuthor.articles?.length || 0} Makale
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{archiveModalAuthor.title} • Makale Arşivi</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewArticleForm((prev) => ({
                      ...prev,
                      authorId: archiveModalAuthor.id,
                    }));
                    setArchiveModalAuthor(null);
                    setActiveTab("new_article");
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yeni Makale Ekle</span>
                </button>

                <button
                  type="button"
                  onClick={() => setArchiveModalAuthor(null)}
                  className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Arşiv Arama Çubuğu */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={archiveSearchQuery}
                  onChange={(e) => setArchiveSearchQuery(e.target.value)}
                  placeholder="Bu yazara ait makalelerde ara..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-8 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {archiveSearchQuery && (
                  <button
                    onClick={() => setArchiveSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Arşiv Makale Listesi */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {filteredArchiveArticles.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  Bu yazara ait makale bulunamadı.
                </div>
              ) : (
                filteredArchiveArticles.map((art, idx) => (
                  <div
                    key={art.id || idx}
                    className="p-4 bg-zinc-50 dark:bg-zinc-950/70 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-zinc-300 dark:hover:border-zinc-700 transition"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-red-500" />
                          <span>{art.date}</span>
                        </div>
                        {idx === 0 && (
                          <span className="px-1.5 py-0.2 text-[9px] bg-red-600 text-white font-bold rounded">
                            Son Makale
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-zinc-400">
                          /{art.slug}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                        {art.title}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 italic">
                        {art.excerpt}
                      </p>
                    </div>

                    {/* Makale Aksiyonları */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <Link
                        href={`/yazarlar/${art.slug}`}
                        target="_blank"
                        className="p-2 bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold transition"
                        title="Sitede Görüntüle"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleStartArticleEdit(archiveModalAuthor.id, art)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 rounded-lg text-xs font-bold transition cursor-pointer"
                        title="Makaleyi Düzenle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Düzenle</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeletingArticle({
                            authorId: archiveModalAuthor.id,
                            article: art,
                          })
                        }
                        className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 rounded-lg transition cursor-pointer"
                        title="Makaleyi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 flex items-center justify-between">
              <Link
                href={`/yazarlar/yazar/${archiveModalAuthor.slug || archiveModalAuthor.id}`}
                target="_blank"
                className="text-xs text-red-600 hover:underline font-bold flex items-center gap-1"
              >
                <span>Yazarın Ön Yüz Arşiv Sayfasını Aç</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setArchiveModalAuthor(null)}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. MODAL: YAZAR PROFİLİ DÜZENLEME MODALI                     */}
      {/* ------------------------------------------------------------- */}
      {editingAuthor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/80">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-black uppercase text-zinc-900 dark:text-white">
                  Yazar Profilini Düzenle
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingAuthor(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAuthorProfile} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                    Yazar Adı Soyadı <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authorEditForm.name}
                    onChange={(e) => setAuthorEditForm({ ...authorEditForm, name: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                    Yazar Unvanı / Köşe Adı
                  </label>
                  <input
                    type="text"
                    value={authorEditForm.title}
                    onChange={(e) => setAuthorEditForm({ ...authorEditForm, title: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <ImageUploader
                  label="Profil Fotoğrafı"
                  value={authorEditForm.avatar}
                  onChange={(url) => setAuthorEditForm({ ...authorEditForm, avatar: url })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                  Biyografi (Özgeçmiş)
                </label>
                <textarea
                  rows={3}
                  value={authorEditForm.bio}
                  onChange={(e) => setAuthorEditForm({ ...authorEditForm, bio: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={authorEditForm.email}
                    onChange={(e) => setAuthorEditForm({ ...authorEditForm, email: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                    Twitter / X
                  </label>
                  <input
                    type="text"
                    value={authorEditForm.socialTwitter}
                    onChange={(e) => setAuthorEditForm({ ...authorEditForm, socialTwitter: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    value={authorEditForm.socialLinkedin}
                    onChange={(e) => setAuthorEditForm({ ...authorEditForm, socialLinkedin: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingAuthor(null)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {loading ? "Kaydediliyor..." : "Profili Güncelle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. MODAL: MAKALE DÜZENLEME MODALI (RichTextEditor)            */}
      {/* ------------------------------------------------------------- */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/80">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-black uppercase text-zinc-900 dark:text-white">
                  Makaleyi Düzenle
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                    Makale Başlığı <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={articleEditForm.title}
                    onChange={(e) => setArticleEditForm({ ...articleEditForm, title: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                    Yayın Tarihi
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={articleEditForm.date}
                      onChange={(e) => setArticleEditForm({ ...articleEditForm, date: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setArticleEditForm({
                          ...articleEditForm,
                          date: new Date().toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }),
                        })
                      }
                      className="px-2.5 py-1 text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg shrink-0 cursor-pointer"
                    >
                      Bugün
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                    Makale URL / Slug
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newSlug = generateSlug(articleEditForm.title);
                      if (newSlug) setArticleEditForm({ ...articleEditForm, slug: newSlug });
                    }}
                    className="text-[11px] text-red-600 hover:underline font-semibold"
                  >
                    Başlıktan Yenile
                  </button>
                </div>
                <input
                  type="text"
                  value={articleEditForm.slug}
                  onChange={(e) => setArticleEditForm({ ...articleEditForm, slug: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                    Kısa Özet / Spot
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const plain = articleEditForm.content.replace(/<[^>]*>/g, "").trim();
                      if (plain) {
                        setArticleEditForm({
                          ...articleEditForm,
                          excerpt: plain.slice(0, 140) + "...",
                        });
                      }
                    }}
                    className="text-[11px] text-red-600 hover:underline font-semibold"
                  >
                    Metinden Otomatik Çıkar
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={articleEditForm.excerpt}
                  onChange={(e) => setArticleEditForm({ ...articleEditForm, excerpt: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1.5">
                  Makale Tam İçeriği (Rich Text Editor) <span className="text-red-600">*</span>
                </label>
                <RichTextEditor
                  value={articleEditForm.content}
                  onChange={(val) => setArticleEditForm({ ...articleEditForm, content: val })}
                  minHeight="280px"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {loading ? "Kaydediliyor..." : "Makaleyi Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. SİLME ONAY MODALLARI                                       */}
      {/* ------------------------------------------------------------- */}
      {/* Yazar Silme Onayı */}
      {deletingAuthor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase">
                Yazarı ve Tüm Arşivini Sil
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                <strong>"{deletingAuthor.name}"</strong> adlı yazarı ve yazara ait{" "}
                <strong>{deletingAuthor.articles?.length || 1} adet</strong> makaleyi sistemden kalıcı olarak silmek istediğinize emin misiniz?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeletingAuthor(null)}
                className="flex-1 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteAuthorConfirm}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deleteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Evet, Yazarı Sil</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tek Makale Silme Onayı */}
      {deletingArticle && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase">
                Makaleyi Arşivden Sil
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                <strong>"{deletingArticle.article.title}"</strong> başlıklı makaleyi yazarın arşivinden kalıcı olarak silmek istediğinize emin misiniz?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeletingArticle(null)}
                className="flex-1 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteArticleConfirm}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deleteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Evet, Makaleyi Sil</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
