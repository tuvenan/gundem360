"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Shield,
  Cookie,
  Archive,
  Camera,
  FileSpreadsheet,
  Save,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Inbox,
  Mail,
  Phone,
  Calendar,
  Trash2,
  Eye,
  Check,
  Search,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { LegalPageItem, ContactMessage, DEFAULT_LEGAL_PAGES } from "@/lib/types/legal";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface KurumsalSayfalarClientProps {
  initialPages: LegalPageItem[];
  initialMessages: ContactMessage[];
}

const PAGE_ICONS: Record<string, any> = {
  kunye: FileText,
  "kvkk-aydinlatma": Shield,
  "cerez-politikasi": Cookie,
  "imha-politikasi": Archive,
  "kamera-aydinlatma": Camera,
  "kvkk-basvuru": FileSpreadsheet,
};

export default function KurumsalSayfalarClient({
  initialPages,
  initialMessages,
}: KurumsalSayfalarClientProps) {
  const [activeTab, setActiveTab] = useState<"pages" | "messages">("pages");
  const [pages, setPages] = useState<LegalPageItem[]>(initialPages);
  const [selectedPageId, setSelectedPageId] = useState<string>(
    initialPages[0]?.id || "kunye"
  );

  // Form state for active page
  const selectedPage = pages.find((p) => p.id === selectedPageId) || pages[0];
  const [title, setTitle] = useState<string>(selectedPage?.title || "");
  const [slug, setSlug] = useState<string>(selectedPage?.slug || "");
  const [description, setDescription] = useState<string>(
    selectedPage?.description || ""
  );
  const [content, setContent] = useState<string>(selectedPage?.content || "");

  // Status & loading
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Messages state
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [messageSearch, setMessageSearch] = useState("");
  const [messageFilter, setMessageFilter] = useState<"all" | "unread" | "read">("all");

  // Sayfa değiştiğinde form state'ini güncelle
  const handleSelectPage = (id: string) => {
    const p = pages.find((item) => item.id === id);
    if (p) {
      setSelectedPageId(id);
      setTitle(p.title);
      setSlug(p.slug);
      setDescription(p.description || "");
      setContent(p.content);
      setSaveSuccess(null);
      setSaveError(null);
    }
  };

  // Sayfayı kaydet
  const handleSavePage = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch("/api/legal-pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPageId,
          title,
          slug,
          description,
          content,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Kayıt işlemi başarısız.");
      }

      // State'i güncelle
      setPages((prev) =>
        prev.map((item) =>
          item.id === selectedPageId
            ? { ...item, title, slug, description, content, updatedAt: new Date().toISOString() }
            : item
        )
      );

      setSaveSuccess(`"${title}" başarıyla kaydedildi ve canlı yayına aktarıldı.`);
      setTimeout(() => setSaveSuccess(null), 4500);
    } catch (err: any) {
      setSaveError(err.message || "Kaydetme sırasında bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  // Varsayılan şablona sıfırla
  const handleResetToDefault = () => {
    const defaultTemplate = DEFAULT_LEGAL_PAGES.find((d) => d.id === selectedPageId);
    if (!defaultTemplate) return;

    if (
      confirm(
        `"${defaultTemplate.title}" sayfasını orijinal standart yasal şablonuna sıfırlamak istediğinize emin misiniz?`
      )
    ) {
      setTitle(defaultTemplate.title);
      setContent(defaultTemplate.content);
      setDescription(defaultTemplate.description || "");
      setSaveSuccess("Varsayılan şablon editöre yüklendi. Değişiklikleri geçerli kılmak için 'Kaydet' butonuna basınız.");
    }
  };

  // Mesaj okundu durumunu güncelle
  const handleToggleMessageRead = async (id: string, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: nextStatus }),
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isRead: nextStatus } : m))
        );
        if (selectedMessage?.id === id) {
          setSelectedMessage((prev) => (prev ? { ...prev, isRead: nextStatus } : null));
        }
      }
    } catch (err) {
      console.error("Error toggling message read status:", err);
    }
  };

  // Mesaj sil
  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Bu mesajı kalıcı olarak silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/contact?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      }
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  // Mesaj filtreleme
  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.subject.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.message.toLowerCase().includes(messageSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (messageFilter === "unread") return !m.isRead;
    if (messageFilter === "read") return m.isRead;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* Üst Başlık & Sekmeler */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-600/10 text-red-600 dark:text-red-400 font-bold px-2 py-0.5 rounded text-xs">
                Yasal & Kurumsal CMS
              </span>
              <span className="text-zinc-400 text-xs">•</span>
              <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                6698 KVKK & 5187 Basın Mevzuatı
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1 tracking-tight">
              Kurumsal Sayfalar & İletişim Merkezi
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Künye, KVKK aydınlatma ve çerez politikalarını zengin metin editörüyle düzenleyin; gelen okur mesajlarını yönetin.
            </p>
          </div>

          {/* Sekme Değiştirici */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg border border-zinc-200/80 dark:border-zinc-700/60 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("pages")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition ${
                activeTab === "pages"
                  ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Yasal & Kurumsal Sayfalar</span>
              <span className="text-[10px] bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.2 rounded-full font-extrabold">
                {pages.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("messages")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition relative ${
                activeTab === "messages"
                  ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Gelen Mesajlar</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-black animate-pulse">
                  {unreadCount} yeni
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SEKME: YASAL & KURUMSAL SAYFALAR */}
      {/* ========================================================================= */}
      {activeTab === "pages" && (
        <div className="space-y-6">
          {/* Sayfa Seçim Şeridi */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {pages.map((p) => {
              const Icon = PAGE_ICONS[p.id] || FileText;
              const isSelected = p.id === selectedPageId;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPage(p.id)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition relative ${
                    isSelected
                      ? "bg-red-50/70 dark:bg-red-950/30 border-red-500 shadow-xs ring-2 ring-red-500/20"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected
                          ? "bg-red-600 text-white"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400">
                        Aktif
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold line-clamp-1 ${
                      isSelected
                        ? "text-red-700 dark:text-red-400"
                        : "text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    {p.title.split(" - ")[0].split(" | ")[0]}
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                    {p.slug}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bildirim Kartları */}
          {saveSuccess && (
            <div className="flex items-center gap-2 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium rounded-xl animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {saveError && (
            <div className="flex items-center gap-2 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-medium rounded-xl animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Editör & Form Kartı */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 space-y-5 shadow-xs">
            {/* Sayfa Meta Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="md:col-span-8 space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Sayfa Başlığı (H1 / Title)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Sayfa başlığı..."
                />
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>URL Bağlantısı (Slug)</span>
                  <Link
                    href={slug}
                    target="_blank"
                    className="text-[11px] text-red-600 hover:underline flex items-center gap-0.5"
                  >
                    Canlı Gör <ExternalLink className="w-3 h-3" />
                  </Link>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="/sayfa-adi"
                />
              </div>

              <div className="md:col-span-12 space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Kısa Açıklama / Spot Metin (SEO & Önizleme)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Arama motorları ve sayfa üstü için kısa özet..."
                />
              </div>
            </div>

            {/* Zengin Metin Editörü */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>Detaylı Sayfa İçeriği (Rich Text & HTML)</span>
                </label>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-xs text-zinc-500 hover:text-red-600 flex items-center gap-1 transition"
                  title="Standart yasal metne geri dön"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Varsayılan Şablona Sıfırla</span>
                </button>
              </div>

              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Yasal metin veya sayfa içeriğini buraya giriniz..."
                minHeight="420px"
              />
            </div>

            {/* Alt İşlem Butonları */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Son Güncelleme:{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {selectedPage?.updatedAt
                    ? new Date(selectedPage.updatedAt).toLocaleString("tr-TR")
                    : "Belirtilmedi"}
                </span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Link
                  href={slug}
                  target="_blank"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-xs font-bold transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Önizle ↗</span>
                </Link>

                <button
                  type="button"
                  onClick={handleSavePage}
                  disabled={isSaving}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Değişiklikleri Yayınla</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SEKME: GELEN İLETİŞİM MESAJLARI */}
      {/* ========================================================================= */}
      {activeTab === "messages" && (
        <div className="space-y-4">
          {/* Arama & Filtre Çubuğu */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
                placeholder="Gönderen, konu veya mesajda ara..."
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setMessageFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  messageFilter === "all"
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Tümü ({messages.length})
              </button>
              <button
                onClick={() => setMessageFilter("unread")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  messageFilter === "unread"
                    ? "bg-red-600 text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span>Okunmamış</span>
                {unreadCount > 0 && (
                  <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMessageFilter("read")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  messageFilter === "read"
                    ? "bg-emerald-600 text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Okunmuş ({messages.length - unreadCount})
              </button>
            </div>
          </div>

          {/* Mesaj Tablosu & Seçili Mesaj Yan Paneli */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Mesaj Listesi */}
            <div className={`${selectedMessage ? "lg:col-span-6" : "lg:col-span-12"} transition-all`}>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
                {filteredMessages.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <Inbox className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
                    <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                      Gelen kutusu boş
                    </p>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Ziyaretçileriniz `/iletisim` sayfasındaki formu doldurduklarında mesajları burada listelenecektir.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredMessages.map((msg) => {
                      const isSelected = selectedMessage?.id === msg.id;
                      return (
                        <div
                          key={msg.id}
                          onClick={() => {
                            setSelectedMessage(msg);
                            if (!msg.isRead) {
                              handleToggleMessageRead(msg.id, false);
                            }
                          }}
                          className={`p-4 transition cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-start justify-between gap-3 ${
                            !msg.isRead
                              ? "bg-red-50/40 dark:bg-red-950/20 border-l-4 border-l-red-600"
                              : ""
                          } ${isSelected ? "ring-2 ring-inset ring-red-500/40" : ""}`}
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold truncate ${
                                  !msg.isRead
                                    ? "text-zinc-950 dark:text-white"
                                    : "text-zinc-700 dark:text-zinc-300"
                                }`}
                              >
                                {msg.name}
                              </span>
                              {!msg.isRead && (
                                <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-sm uppercase tracking-wider shrink-0">
                                  YENİ
                                </span>
                              )}
                              <span className="text-[11px] text-zinc-400 truncate">
                                &lt;{msg.email}&gt;
                              </span>
                            </div>

                            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {msg.subject}
                            </h4>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                              {msg.message}
                            </p>

                            <div className="flex items-center gap-3 text-[10px] text-zinc-400 pt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(msg.createdAt).toLocaleString("tr-TR")}
                              </span>
                              {msg.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {msg.phone}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleMessageRead(msg.id, msg.isRead);
                              }}
                              className={`p-1.5 rounded-lg border transition ${
                                msg.isRead
                                  ? "text-zinc-400 hover:text-zinc-600 border-zinc-200 dark:border-zinc-700"
                                  : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800"
                              }`}
                              title={msg.isRead ? "Okunmadı olarak işaretle" : "Okundu olarak işaretle"}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMessage(msg.id);
                              }}
                              className="p-1.5 text-zinc-400 hover:text-red-600 border border-zinc-200 dark:border-zinc-700 hover:border-red-300 rounded-lg transition"
                              title="Mesajı sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Mesaj Detay Yan Paneli */}
            {selectedMessage && (
              <div className="lg:col-span-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-xs sticky top-4">
                  <div className="flex items-start justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded">
                        Mesaj Detayı
                      </span>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-1.5">
                        {selectedMessage.subject}
                      </h3>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {new Date(selectedMessage.createdAt).toLocaleString("tr-TR")}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 px-2 py-1 border border-zinc-200 dark:border-zinc-700 rounded-md"
                    >
                      Kapat ✕
                    </button>
                  </div>

                  {/* Gönderen Bilgileri */}
                  <div className="grid grid-cols-2 gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg text-xs">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Gönderen:</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {selectedMessage.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">E-Posta:</span>
                      <a
                        href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                        className="font-semibold text-red-600 dark:text-red-400 hover:underline truncate block"
                      >
                        {selectedMessage.email}
                      </a>
                    </div>
                    {selectedMessage.phone && (
                      <div className="col-span-2">
                        <span className="text-zinc-400 block text-[10px]">Telefon:</span>
                        <a
                          href={`tel:${selectedMessage.phone}`}
                          className="font-semibold text-zinc-800 dark:text-zinc-200 hover:underline"
                        >
                          {selectedMessage.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Mesaj İçeriği */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      Mesaj Metni
                    </span>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                      {selectedMessage.message}
                    </div>
                  </div>

                  {/* Hızlı Aksiyonlar */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() =>
                        handleToggleMessageRead(selectedMessage.id, selectedMessage.isRead)
                      }
                      className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{selectedMessage.isRead ? "Okunmadı Yap" : "Okundu İşaretle"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                        className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg font-bold border border-red-200 dark:border-red-900/40 transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Sil</span>
                      </button>

                      <a
                        href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>E-posta ile Yanıtla</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
