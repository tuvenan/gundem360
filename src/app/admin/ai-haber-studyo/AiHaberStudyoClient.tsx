"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CategoryItem } from "@/types/news";
import { AIGeneratedNewsResponse, NewsTone, NewsLength } from "@/lib/types/ai-news";
import { AIProviderConfig, DEFAULT_AI_PROVIDERS } from "@/lib/types/settings";
import NewsImageBadge from "@/components/common/NewsImageBadge";
import ImageBadgeSelector from "@/components/admin/ImageBadgeSelector";
import AiImageManager from "@/components/admin/AiImageManager";
import RichTextEditor from "@/components/admin/RichTextEditor";
import {
  Sparkles,
  Bot,
  Zap,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Eye,
  Edit3,
  Search,
  ArrowRight,
  Layers,
  FileText,
  Clock,
  Tag,
  AlertCircle,
  Copy,
  Check,
  Send,
  Wand2,
  Camera,
  Cpu,
} from "lucide-react";

interface AiHaberStudyoClientProps {
  categories: CategoryItem[];
  providers?: AIProviderConfig[];
  activeProviderId?: string;
}

const SAMPLE_PROMPTS = [
  {
    title: "Yapay Zeka & Teknoloji",
    text: "TÜBİTAK ve Türk mühendisler tarafından geliştirilen yeni nesil yerli yapay zeka çipi 'KARTAL-1' kamuoyuna tanıtıldı. Çip, yüksek enerji verimliliği ve savunma sanayii ile otonom araçlarda kullanılmak üzere yerli mimariyle üretildi. İlk testlerde küresel rakipleriyle yarışır performans sergiledi.",
    category: "teknoloji",
    tone: "analytical" as NewsTone,
  },
  {
    title: "Merkez Bankası & Ekonomi",
    text: "Merkez Bankası Para Politikası Kurulu bu ayki faiz kararını açıkladı. Politika faizi beklentiler doğrultusunda yüzde 50 seviyesinde sabit bırakıldı. Karar metninde dezenflasyon sürecinin kararlılıkla sürdürüleceği ve küresel piyasalardaki oynaklığın yakından izlendiği belirtildi. Borsa ve döviz kurlarında ilk tepkiler dengeli oldu.",
    category: "ekonomi",
    tone: "formal" as NewsTone,
  },
  {
    title: "Sıcak Gelişme & Flaş Haber",
    text: "Marmara Denizi açıklarında meydana gelen 4.8 büyüklüğündeki deprem İstanbul ve çevre illerde hissedildi. AFAD ve Kandilli Rasathanesi ilk incelemelerde herhangi bir can ve mal kaybı bulunmadığını bildirdi. Vali açıklamasında panik yapılmaması ve resmi açıklamaların takip edilmesi gerektiğini söyledi.",
    category: "gundem",
    tone: "breaking" as NewsTone,
  },
];

export default function AiHaberStudyoClient({
  categories,
  providers = DEFAULT_AI_PROVIDERS,
  activeProviderId = "gemini",
}: AiHaberStudyoClientProps) {
  const router = useRouter();

  // Sol Panel Form State
  const [rawContent, setRawContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("auto");
  const [selectedTone, setSelectedTone] = useState<NewsTone>("formal");
  const [selectedLength, setSelectedLength] = useState<NewsLength>("medium");
  const [selectedProviderId, setSelectedProviderId] = useState<string>("auto");

  // Üretim & Kayıt Durumları
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publishedNewsSlug, setPublishedNewsSlug] = useState<string | null>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Sağ Panel Düzenleme State'i
  const [generatedNews, setGeneratedNews] = useState<AIGeneratedNewsResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "image" | "editor" | "seo">("preview");

  // Aktif sağlayıcı tespiti
  const currentActiveProvider =
    providers.find((p) => p.id === (selectedProviderId === "auto" ? activeProviderId : selectedProviderId)) ||
    providers.find((p) => p.id === activeProviderId) ||
    providers[0];

  // Örnek Yükleme
  const handleLoadSample = (sample: (typeof SAMPLE_PROMPTS)[0]) => {
    setRawContent(sample.text);
    setSelectedCategory(sample.category);
    setSelectedTone(sample.tone);
    setErrorMessage(null);
  };

  // AI ile Haber Üret
  const handleGenerate = async () => {
    if (!rawContent.trim()) {
      setErrorMessage("Lütfen sol konsola haber yapılacak bir kaynak metin, not veya bülten girin.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setPublishedNewsSlug(null);

    try {
      const res = await fetch("/api/admin/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawContent,
          category: selectedCategory === "auto" ? undefined : selectedCategory,
          tone: selectedTone,
          length: selectedLength,
          providerId: selectedProviderId === "auto" ? undefined : selectedProviderId,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setGeneratedNews(json.data);
        setActiveTab("preview");
      } else {
        setErrorMessage(json.error || "Yapay zeka haber üretirken bir hata oluştu.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Sunucuya bağlanırken bir sorun oluştu.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Haberi Sisteme Doğrudan Kaydet & Canlıya Al
  const handlePublish = async () => {
    if (!generatedNews) return;

    setIsPublishing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: generatedNews.title,
          slug: generatedNews.slug,
          summary: generatedNews.summary,
          content: generatedNews.content,
          category: generatedNews.category,
          categoryTitle: generatedNews.categoryTitle,
          imageUrl: generatedNews.imageUrl,
          headlineType: selectedTone === "breaking" ? "breaking" : "main",
          isBreaking: selectedTone === "breaking",
          authorName: "Gündem360 AI Stüdyosu",
          readTimeMinutes: generatedNews.readTimeMinutes,
          tags: generatedNews.tags,
          imageBadgeText: generatedNews.imageBadgeText || undefined,
          imageBadgeColor: generatedNews.imageBadgeColor || undefined,
          imageBadge: generatedNews.imageBadgeText
            ? {
                text: generatedNews.imageBadgeText,
                color: generatedNews.imageBadgeColor || "bg-red-600",
              }
            : undefined,
          seo: {
            metaTitle: generatedNews.metaTitle,
            metaDescription: generatedNews.metaDescription,
            focusKeyword: generatedNews.focusKeyword,
            tags: generatedNews.tags,
          },
        }),
      });

      const savedData = await res.json();
      if (res.ok) {
        setPublishedNewsSlug(savedData.slug || generatedNews.slug);
        router.refresh();
      } else {
        setErrorMessage(savedData.error || "Haber sisteme kaydedilemedi.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Yayınlama esnasında sunucu bağlantı hatası oluştu.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyHtml = () => {
    if (!generatedNews) return;
    navigator.clipboard.writeText(generatedNews.content);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. ÜST BAŞLIK VE KONTROL BARI */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-red-950 p-6 sm:p-8 rounded-3xl border border-zinc-800 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Yapay Zeka Stüdyosu v2.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-2.5">
            <Wand2 className="w-8 h-8 text-red-500" />
            <span>AI Haber Üretim & Yönetim Stüdyosu</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            Ham basın bültenlerini, ajans metinlerini veya özet notları saniyeler içinde 5N1K gazetecilik standardında,
            SEO dostu, zengin HTML içerikli ve rozetli manşet haberlerine dönüştürün.
          </p>
        </div>

        {/* Hızlı Bilgi Rozetleri */}
        <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
          <div className="bg-black/40 border border-zinc-800/80 px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-zinc-300 font-medium">Motor:</span>
            <strong className="text-white">
              {currentActiveProvider ? `${currentActiveProvider.name} (${currentActiveProvider.defaultModel})` : "Multi-Provider AI"}
            </strong>
          </div>
          <div className="bg-black/40 border border-zinc-800/80 px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
            <span className="text-zinc-300 font-medium">Standart:</span>
            <strong className="text-white">Doğrulanmış 5N1K Kuralı</strong>
          </div>
        </div>
      </div>

      {/* Hata Bildirimi */}
      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-bold">{errorMessage}</span>
        </div>
      )}

      {/* Yayınlandı Başarı Modalı/Bannerı */}
      {publishedNewsSlug && (
        <div className="p-6 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-3xl text-zinc-900 dark:text-white space-y-4 animate-in fade-in shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500 text-white rounded-2xl shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
                  Tebrikler! Haber Başarıyla Canlıya Alındı
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">
                  Haber sisteme işlendi, ana sayfa ve kategori önbellekleri otomatik olarak temizlendi.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/haber/${publishedNewsSlug}`}
                target="_blank"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                <span>Önyüzde Gör</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/admin/haberler"
                className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 transition"
              >
                <span>Haber Listesi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. ANA İKİ KOLONLU ÇALIŞMA ALANI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* SOL PANEL: ÜRETİM KONSOLU (5 KOLON)                      */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h2 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
                <Bot className="w-4 h-4 text-red-600" />
                <span>1. Kaynak Bilgisi & Talimatlar</span>
              </h2>
              {rawContent && (
                <button
                  type="button"
                  onClick={() => setRawContent("")}
                  className="text-[11px] font-bold text-zinc-400 hover:text-red-500 transition"
                >
                  Temizle
                </button>
              )}
            </div>

            {/* Hızlı Örnek Yükleyiciler */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight block">
                Hızlı Örnek Metin Yükle:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PROMPTS.map((sample) => (
                  <button
                    key={sample.title}
                    type="button"
                    onClick={() => handleLoadSample(sample)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-700 dark:text-zinc-300 hover:text-red-600 border border-zinc-200 dark:border-zinc-700 transition"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Ham Metin Alanı */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                Kaynak Metin / Bülten / Notlar *
              </label>
              <textarea
                rows={8}
                placeholder="Örn: Ajans bülteni metni, şirket basın duyurusu, olay özeti veya birkaç satırlık kaba taslak notları buraya yapıştırın..."
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-2xl p-3.5 text-xs text-zinc-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono px-1">
                <span>5N1K Analizine Hazır</span>
                <span>{rawContent.length} karakter</span>
              </div>
            </div>

            {/* Tercihler: Sağlayıcı, Kategori, Ton, Uzunluk */}
            <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              {/* Yapay Zeka Sağlayıcısı & Modeli */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-purple-600" />
                    <span>Yapay Zeka Motoru & Model</span>
                  </label>
                  <Link
                    href="/admin/ayarlar"
                    className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-bold"
                  >
                    ⚙️ API Yönetimi
                  </Link>
                </div>
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="auto">
                    ⚡ Varsayılan Motor ({currentActiveProvider?.name || "Otomatik"} - {currentActiveProvider?.defaultModel})
                  </option>
                  {(providers || DEFAULT_AI_PROVIDERS)
                    .filter((p) => p.isEnabled)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.defaultModel} {p.id === activeProviderId ? "(Aktif)" : ""}
                      </option>
                    ))}
                </select>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1.5">
                  Kategori Tercihi
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="auto">✨ Otomatik Tespit Et (Tavsiye Edilen)</option>
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Haber Tonu */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1.5">
                  Haber Dili & Tonu
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "formal", label: "📻 Resmi & Ajans Dili" },
                    { id: "breaking", label: "⚡ Flaş & Son Dakika" },
                    { id: "analytical", label: "📊 Derinlemesine Analiz" },
                    { id: "editorial", label: "✍️ Köşe / Yorum" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTone(t.id as NewsTone)}
                      className={`text-[11px] font-bold p-2.5 rounded-xl border text-left transition ${
                        selectedTone === t.id
                          ? "bg-red-600 text-white border-red-600 shadow-xs"
                          : "bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Uzunluk */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1.5">
                  Haber Kapsamı
                </label>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { id: "short", label: "Hızlı / Kısa" },
                    { id: "medium", label: "Standart" },
                    { id: "long", label: "Kapsamlı Dosya" },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setSelectedLength(l.id as NewsLength)}
                      className={`text-[11px] font-bold py-2 rounded-xl border transition ${
                        selectedLength === l.id
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-xs"
                          : "bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Üretim Butonu */}
            <button
              type="button"
              disabled={isGenerating || !rawContent.trim()}
              onClick={handleGenerate}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition transform active:scale-98 shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Yapay Zeka Haberi Üretiyor...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Yapay Zeka ile Haberi Üret</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SAĞ PANEL: ÖNİZLEME VE DÜZENLEME STÜDYOSU (7 KOLON)       */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-5">
          {!generatedNews ? (
            /* Boş Durum (Placeholder) */
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-6 min-h-[550px] flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-red-600/10 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-inner">
                <Bot className="w-10 h-10" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                  Stüdyo Hazır: Üretim Bekleniyor
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Sol taraftaki konsola haber metnini veya bülteni yapıştırın, ton ve kategori tercihlerinizi belirleyip
                  <strong> "Yapay Zeka ile Haberi Üret"</strong> butonuna basın.
                </p>
              </div>

              {/* 3 Adımlı Hızlı Akış Bilgilendirmesi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg pt-4 text-left">
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[10px] font-black text-red-600 uppercase block mb-1">Adım 1</span>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Metni Girin</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[10px] font-black text-amber-600 uppercase block mb-1">Adım 2</span>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">AI Üretsin</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[10px] font-black text-emerald-600 uppercase block mb-1">Adım 3</span>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Tek Tıkla Yayınla</span>
                </div>
              </div>
            </div>
          ) : (
            /* Üretilmiş Haber Kartı ve Düzenleyici */
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden space-y-6 p-6 sm:p-7">
              {/* Üst Eylem Barı & Sekmeler */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                      activeTab === "preview"
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Önizleme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("image")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                      activeTab === "image"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400"
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Kapak Görseli & Medya</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                      activeTab === "image" ? "bg-white/20 text-white" : "bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300"
                    }`}>
                      3 Sekme ✨
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("editor")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                      activeTab === "editor"
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>İçerik & Metin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("seo")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                      activeTab === "seo"
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>SEO & Meta</span>
                  </button>
                </div>

                {/* Aksiyon Butonları (Yeniden Üret & Doğrudan Yayınla) */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || isPublishing}
                    className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition cursor-pointer"
                    title="Aynı girdilerle yeniden üret"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Yeniden Üret</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPublishing || isGenerating}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isPublishing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Kaydediliyor...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Sisteme Doğrudan Kaydet & Yayınla</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SEKME 1: ÖNİZLEME */}
              {activeTab === "preview" && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Başlık ve Kategori */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="bg-red-600 text-white px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        {generatedNews.categoryTitle}
                      </span>
                      <span className="text-zinc-400">•</span>
                      <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {generatedNews.readTimeMinutes} dk okuma
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                      {generatedNews.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                      {generatedNews.summary}
                    </p>
                  </div>

                  {/* Kapak Görseli ve Üzerindeki Dinamik Rozet */}
                  <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-zinc-900 shadow-md border border-zinc-200 dark:border-zinc-800">
                    <Image
                      src={generatedNews.imageUrl}
                      alt={generatedNews.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />

                    {/* Rozet */}
                    {generatedNews.imageBadgeText && (
                      <NewsImageBadge
                        text={generatedNews.imageBadgeText}
                        color={generatedNews.imageBadgeColor}
                        size="md"
                        position="top-left"
                      />
                    )}

                    {/* Hızlı Görsel Değiştir Butonu */}
                    <button
                      type="button"
                      onClick={() => setActiveTab("image")}
                      className="absolute bottom-3 right-3 z-10 px-3 py-1.5 bg-black/70 hover:bg-black/90 backdrop-blur-md text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-purple-400" />
                      <span>Görsel Stüdyosuna Git</span>
                    </button>
                  </div>

                  {/* Kapak Görseli ve Medya Ataması (Önizleme Ekranında Anında Erişim) */}
                  <div className="space-y-4 pt-2">
                    <AiImageManager
                      currentImageUrl={generatedNews.imageUrl}
                      newsTitle={generatedNews.title}
                      category={generatedNews.category}
                      summary={generatedNews.summary}
                      suggestedPrompt={generatedNews.imagePrompt}
                      onImageChange={(url) => setGeneratedNews((prev) => (prev ? { ...prev, imageUrl: url } : null))}
                    />

                    {/* Rozet Seçici */}
                    <ImageBadgeSelector
                      badgeText={generatedNews.imageBadgeText || ""}
                      badgeColor={generatedNews.imageBadgeColor || "bg-red-600"}
                      imageUrl={generatedNews.imageUrl}
                      onTextChange={(text) => setGeneratedNews({ ...generatedNews, imageBadgeText: text })}
                      onColorChange={(color) => setGeneratedNews({ ...generatedNews, imageBadgeColor: color })}
                    />
                  </div>

                  {/* Zengin HTML İçerik Önizlemesi */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <span>Detaylı Haber İçeriği (HTML)</span>
                      <button
                        type="button"
                        onClick={handleCopyHtml}
                        className="flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold cursor-pointer"
                      >
                        {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedHtml ? "Kopyalandı" : "HTML Kopyala"}</span>
                      </button>
                    </div>

                    <div
                      className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed [&_h3]:text-base [&_h3]:font-black [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-zinc-900 [&_h3]:dark:text-white [&_blockquote]:border-l-4 [&_blockquote]:border-red-600 [&_blockquote]:pl-4 [&_blockquote]:py-1.5 [&_blockquote]:my-3 [&_blockquote]:italic [&_blockquote]:bg-zinc-50 [&_blockquote]:dark:bg-zinc-800/40 [&_blockquote]:rounded-r-lg [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_li]:my-1"
                      dangerouslySetInnerHTML={{ __html: generatedNews.content }}
                    />
                  </div>

                  {/* Etiketler */}
                  {generatedNews.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <Tag className="w-3.5 h-3.5 text-zinc-400 mr-1" />
                      {generatedNews.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SEKME 2: ÖZEL KAPAK GÖRSELİ VE MEDYA ATAMASI */}
              {activeTab === "image" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                    <div>
                      <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Camera className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span>Kapak Görseli ve Medya Ataması</span>
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Haberinizin vitrin görselini bilgisayardan yükleyebilir, harici bir URL belirtebilir veya yapay zeka ile otomatik çizebilirsiniz.
                      </p>
                    </div>
                  </div>

                  {/* Canlı Görsel Önizleme Kartı (Rozetli) */}
                  <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-zinc-900 shadow-lg border-2 border-purple-500/30">
                    <Image
                      src={generatedNews.imageUrl}
                      alt={generatedNews.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />

                    {/* Rozet */}
                    {generatedNews.imageBadgeText && (
                      <NewsImageBadge
                        text={generatedNews.imageBadgeText}
                        color={generatedNews.imageBadgeColor}
                        size="md"
                        position="top-left"
                      />
                    )}

                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[11px] font-bold border border-white/20 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-purple-400" />
                      <span>Önyüz Canlı Görünümü</span>
                    </div>
                  </div>

                  {/* Üçlü Görsel Yönetim Modülü (1. Dosya Yükle, 2. Harici URL Ver, 3. Yapay Zeka ile Görsel Üret) */}
                  <AiImageManager
                    currentImageUrl={generatedNews.imageUrl}
                    newsTitle={generatedNews.title}
                    category={generatedNews.category}
                    summary={generatedNews.summary}
                    suggestedPrompt={generatedNews.imagePrompt}
                    onImageChange={(url) => setGeneratedNews((prev) => (prev ? { ...prev, imageUrl: url } : null))}
                  />

                  {/* Rozet Seçici ve Canlı Önizleme */}
                  <ImageBadgeSelector
                    badgeText={generatedNews.imageBadgeText || ""}
                    badgeColor={generatedNews.imageBadgeColor || "bg-red-600"}
                    imageUrl={generatedNews.imageUrl}
                    onTextChange={(text) => setGeneratedNews({ ...generatedNews, imageBadgeText: text })}
                    onColorChange={(color) => setGeneratedNews({ ...generatedNews, imageBadgeColor: color })}
                  />
                </div>
              )}

              {/* SEKME 2: İÇERİK & ROZET DÜZENLEYİCİ */}
              {activeTab === "editor" && (
                <div className="space-y-5 animate-in fade-in">
                  {/* Editoryal Kalite ve Doğruluk Bilgi Kartı */}
                  <div className="flex items-center justify-between p-3.5 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-white">
                          Editoryal Doğruluk & 5N1K Protokolü Aktif
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Haber metnini ve görselini yayınlamadan önce inceleyebilir, zengin metin editörüyle düzenleyebilirsiniz.
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[11px] font-bold rounded-lg">
                      <span>Kategori: {generatedNews.category.toUpperCase()}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                        Başlık
                      </label>
                      <span className={`text-[11px] font-bold ${generatedNews.title.length > 85 ? "text-amber-500" : "text-zinc-400"}`}>
                        {generatedNews.title.length} / 85 karakter {generatedNews.title.length >= 60 && generatedNews.title.length <= 85 ? "(İdeal)" : ""}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={generatedNews.title}
                      onChange={(e) => setGeneratedNews({ ...generatedNews, title: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-3 text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                        Spot (Özet)
                      </label>
                      <span className={`text-[11px] font-bold ${generatedNews.summary.length > 190 ? "text-amber-500" : "text-zinc-400"}`}>
                        {generatedNews.summary.length} / 190 karakter {generatedNews.summary.length >= 140 && generatedNews.summary.length <= 190 ? "(İdeal)" : ""}
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={generatedNews.summary}
                      onChange={(e) => setGeneratedNews({ ...generatedNews, summary: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-3 text-xs text-zinc-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Üçlü Görsel Yönetim Modülü: Dosya Yükle, URL Ver, AI ile Üret */}
                  <AiImageManager
                    currentImageUrl={generatedNews.imageUrl}
                    newsTitle={generatedNews.title}
                    category={generatedNews.category}
                    summary={generatedNews.summary}
                    suggestedPrompt={generatedNews.imagePrompt}
                    onImageChange={(url) => setGeneratedNews((prev) => (prev ? { ...prev, imageUrl: url } : null))}
                  />

                  {/* Rozet Seçici ve Canlı Önizleme */}
                  <ImageBadgeSelector
                    badgeText={generatedNews.imageBadgeText || ""}
                    badgeColor={generatedNews.imageBadgeColor || "bg-red-600"}
                    imageUrl={generatedNews.imageUrl}
                    onTextChange={(text) => setGeneratedNews({ ...generatedNews, imageBadgeText: text })}
                    onColorChange={(color) => setGeneratedNews({ ...generatedNews, imageBadgeColor: color })}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                        Haber Detayı (Zengin Metin Editörü & HTML)
                      </label>
                    </div>
                    <RichTextEditor
                      value={generatedNews.content}
                      onChange={(content) => setGeneratedNews({ ...generatedNews, content })}
                      minHeight="350px"
                    />
                  </div>
                </div>
              )}

              {/* SEKME 3: SEO VE META DÜZENLEYİCİ */}
              {activeTab === "seo" && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                      SEO Meta Başlığı
                    </label>
                    <input
                      type="text"
                      value={generatedNews.metaTitle}
                      onChange={(e) => setGeneratedNews({ ...generatedNews, metaTitle: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                      SEO Meta Açıklaması
                    </label>
                    <textarea
                      rows={3}
                      value={generatedNews.metaDescription}
                      onChange={(e) => setGeneratedNews({ ...generatedNews, metaDescription: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                        Odak Anahtar Kelime
                      </label>
                      <input
                        type="text"
                        value={generatedNews.focusKeyword}
                        onChange={(e) => setGeneratedNews({ ...generatedNews, focusKeyword: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={generatedNews.slug}
                        onChange={(e) => setGeneratedNews({ ...generatedNews, slug: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                      Etiketler (Virgülle ayrılmış)
                    </label>
                    <input
                      type="text"
                      value={generatedNews.tags.join(", ")}
                      onChange={(e) =>
                        setGeneratedNews({
                          ...generatedNews,
                          tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                        })
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
