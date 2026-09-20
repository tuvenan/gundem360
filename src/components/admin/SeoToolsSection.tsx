"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  Globe,
  Share2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wand2,
  Copy,
  Check,
  Tags,
  Code,
  Sparkles,
  Smartphone,
  Monitor,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  ShieldCheck,
} from "lucide-react";

export interface SeoData {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  urlSlug: string;
  canonicalUrl: string;
  noIndex: boolean;
  ogTitle: string;
  ogDescription: string;
  tags: string[];
  seoScore: number;
}

interface SeoToolsSectionProps {
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl: string;
  authorName: string;
  seoData: SeoData;
  onChange: (data: SeoData) => void;
}

export default function SeoToolsSection({
  title,
  summary,
  content,
  category,
  imageUrl,
  authorName,
  seoData,
  onChange,
}: SeoToolsSectionProps) {
  const [activeTab, setActiveTab] = useState<"google" | "social" | "schema" | "settings">("google");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  // Türkçe karakter dönüştürücü
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);
  };

  // 1. OTOMATİK SEO SİHİRBAZI (Tek tıkla akıllı doldurucu)
  const handleAutoGenerate = () => {
    const cleanSlug = slugify(title);
    const words = title.split(/\s+/).filter((w) => w.length > 3);
    const suggestedKeyword = words.length > 0 ? words.slice(0, 2).join(" ") : "";

    const idealTitle = title.length > 55 ? `${title.slice(0, 55)}... | Gündem360` : `${title} | Gündem360`;
    const idealDesc =
      summary.length > 155
        ? `${summary.slice(0, 150)}...`
        : summary || "Son dakika haberleri, analizler ve güncel gelişmeler Gündem360'ta.";

    // Otomatik etiketler
    const extractedTags = Array.from(
      new Set([
        category.charAt(0).toUpperCase() + category.slice(1),
        ...words.slice(0, 4).map((w) => w.replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ]/g, "")),
      ])
    ).filter(Boolean);

    const updated: SeoData = {
      ...seoData,
      metaTitle: idealTitle,
      metaDescription: idealDesc,
      focusKeyword: seoData.focusKeyword || suggestedKeyword,
      urlSlug: seoData.urlSlug || cleanSlug,
      canonicalUrl: `https://gundem360.com/haber/${cleanSlug}`,
      ogTitle: title,
      ogDescription: summary,
      tags: seoData.tags.length > 0 ? seoData.tags : extractedTags,
    };

    onChange(updated);
  };

  // 2. GERÇEK ZAMANLI SEO ANALİZİ VE PUAN HESAPLAMA (0 - 100)
  const seoAnalysis = useMemo(() => {
    const checks: {
      id: string;
      title: string;
      status: "good" | "warning" | "bad";
      message: string;
      weight: number;
    }[] = [];

    const effectiveTitle = seoData.metaTitle || title;
    const effectiveDesc = seoData.metaDescription || summary;
    const keyword = seoData.focusKeyword.trim().toLowerCase();
    const cleanContent = content ? content.replace(/<[^>]*>/g, " ") : "";
    const contentLower = cleanContent.toLowerCase();
    const wordCount = cleanContent.trim() ? cleanContent.trim().split(/\s+/).length : 0;

    // Kriter 1: Başlık Uzunluğu (40-65 karakter)
    const titleLen = effectiveTitle.length;
    if (titleLen >= 40 && titleLen <= 65) {
      checks.push({
        id: "title_len",
        title: "Meta Başlık Uzunluğu",
        status: "good",
        message: `Mükemmel (${titleLen}/60 karakter). Arama sonuçlarında tam görünür.`,
        weight: 15,
      });
    } else if (titleLen > 0 && titleLen < 40) {
      checks.push({
        id: "title_len",
        title: "Meta Başlık Uzunluğu",
        status: "warning",
        message: `Kısa (${titleLen}/60 karakter). Daha açıklayıcı yapabilirsiniz.`,
        weight: 8,
      });
    } else {
      checks.push({
        id: "title_len",
        title: "Meta Başlık Uzunluğu",
        status: "bad",
        message: titleLen > 65 ? `Çok uzun (${titleLen}/60). Google kesebilir.` : "Başlık boş bırakılamaz.",
        weight: 0,
      });
    }

    // Kriter 2: Açıklama Uzunluğu (110-160 karakter)
    const descLen = effectiveDesc.length;
    if (descLen >= 110 && descLen <= 165) {
      checks.push({
        id: "desc_len",
        title: "Meta Açıklama Uzunluğu",
        status: "good",
        message: `İdeal (${descLen}/160 karakter). Tıklama oranını maksimize eder.`,
        weight: 15,
      });
    } else if (descLen > 0 && descLen < 110) {
      checks.push({
        id: "desc_len",
        title: "Meta Açıklama Uzunluğu",
        status: "warning",
        message: `Biraz kısa (${descLen}/160 karakter). Detaylandırabilirsiniz.`,
        weight: 8,
      });
    } else {
      checks.push({
        id: "desc_len",
        title: "Meta Açıklama Uzunluğu",
        status: "bad",
        message: descLen > 165 ? `Çok uzun (${descLen}/160). Snippet kesilecek.` : "Açıklama girilmedi.",
        weight: 0,
      });
    }

    // Kriter 3: Odak Anahtar Kelime Tanımlı mı?
    if (keyword.length > 2) {
      checks.push({
        id: "has_keyword",
        title: "Odak Anahtar Kelime",
        status: "good",
        message: `"${keyword}" belirlendi.`,
        weight: 10,
      });

      // Kriter 4: Başlıkta Anahtar Kelime
      if (effectiveTitle.toLowerCase().includes(keyword)) {
        checks.push({
          id: "keyword_in_title",
          title: "Başlıkta Anahtar Kelime",
          status: "good",
          message: "Anahtar kelime başlıkta yer alıyor.",
          weight: 15,
        });
      } else {
        checks.push({
          id: "keyword_in_title",
          title: "Başlıkta Anahtar Kelime",
          status: "bad",
          message: "Anahtar kelime başlıkta bulunamadı.",
          weight: 0,
        });
      }

      // Kriter 5: Açıklamada Anahtar Kelime
      if (effectiveDesc.toLowerCase().includes(keyword)) {
        checks.push({
          id: "keyword_in_desc",
          title: "Açıklamada Anahtar Kelime",
          status: "good",
          message: "Anahtar kelime meta açıklamada yer alıyor.",
          weight: 10,
        });
      } else {
        checks.push({
          id: "keyword_in_desc",
          title: "Açıklamada Anahtar Kelime",
          status: "warning",
          message: "Anahtar kelime meta açıklamada yok. Eklenmesi önerilir.",
          weight: 5,
        });
      }

      // Kriter 6: URL Slug'da Anahtar Kelime
      const slugNormalized = slugify(seoData.urlSlug || title);
      const keywordSlug = slugify(keyword);
      if (slugNormalized.includes(keywordSlug)) {
        checks.push({
          id: "keyword_in_slug",
          title: "URL Slug Uyumu",
          status: "good",
          message: "Anahtar kelime URL adresinde yer alıyor.",
          weight: 10,
        });
      } else {
        checks.push({
          id: "keyword_in_slug",
          title: "URL Slug Uyumu",
          status: "warning",
          message: "Anahtar kelime URL slug'ına dahil edilmemiş.",
          weight: 3,
        });
      }

      // Kriter 7: İçerikte Anahtar Kelime ve Yoğunluk
      const occurrences = (contentLower.match(new RegExp(keyword, "g")) || []).length;
      const density = wordCount > 0 ? ((occurrences * keyword.split(/\s+/).length) / wordCount) * 100 : 0;
      if (occurrences >= 2 && density <= 3.5) {
        checks.push({
          id: "keyword_density",
          title: "İçerik Anahtar Kelime Yoğunluğu",
          status: "good",
          message: `${occurrences} kez geçiyor (Yoğunluk: %${density.toFixed(1)} - Dengeli).`,
          weight: 10,
        });
      } else if (occurrences === 1) {
        checks.push({
          id: "keyword_density",
          title: "İçerik Anahtar Kelime Yoğunluğu",
          status: "warning",
          message: `İçerikte sadece 1 kez geçiyor. 2-3 kez geçmesi önerilir.`,
          weight: 5,
        });
      } else {
        checks.push({
          id: "keyword_density",
          title: "İçerik Anahtar Kelime Yoğunluğu",
          status: "bad",
          message: occurrences === 0 ? "İçerik metninde anahtar kelime hiç geçmiyor!" : "Aşırı anahtar kelime kullanımı (Spam riski).",
          weight: 0,
        });
      }
    } else {
      checks.push({
        id: "has_keyword",
        title: "Odak Anahtar Kelime",
        status: "bad",
        message: "Haber için bir odak anahtar kelime belirleyin.",
        weight: 0,
      });
    }

    // Kriter 8: İçerik Kelime Sayısı (Haber için min 150 kelime)
    if (wordCount >= 150) {
      checks.push({
        id: "word_count",
        title: "İçerik Uzunluğu",
        status: "good",
        message: `${wordCount} kelime. Derinlikli haber içeriği.`,
        weight: 10,
      });
    } else if (wordCount >= 60) {
      checks.push({
        id: "word_count",
        title: "İçerik Uzunluğu",
        status: "warning",
        message: `${wordCount} kelime. Haber için biraz kısa, 150+ kelime önerilir.`,
        weight: 5,
      });
    } else {
      checks.push({
        id: "word_count",
        title: "İçerik Uzunluğu",
        status: "bad",
        message: `Yetersiz içerik (${wordCount} kelime). Arama motorları zayıf içerik sayabilir.`,
        weight: 0,
      });
    }

    // Kriter 9: Görsel ve Medya
    if (imageUrl && imageUrl.startsWith("http")) {
      checks.push({
        id: "image_check",
        title: "Kapak Görseli / OpenGraph",
        status: "good",
        message: "Yüksek çözünürlüklü kapak görseli tanımlı.",
        weight: 5,
      });
    } else {
      checks.push({
        id: "image_check",
        title: "Kapak Görseli / OpenGraph",
        status: "bad",
        message: "Kapak görseli seçilmedi. Sosyal paylaşımlarda zayıf kalır.",
        weight: 0,
      });
    }

    // Puanı topla (Max 100)
    const totalScore = Math.min(100, checks.reduce((acc, c) => acc + c.weight, 0));

    return { score: totalScore, checks, wordCount };
  }, [title, summary, content, category, imageUrl, seoData]);

  // Otomatik skor güncellemesi
  useEffect(() => {
    if (seoData.seoScore !== seoAnalysis.score) {
      onChange({ ...seoData, seoScore: seoAnalysis.score });
    }
  }, [seoAnalysis.score]);

  // Etiket Ekle / Kaldır
  const handleAddTag = (tagToAdd?: string) => {
    const tag = (tagToAdd || tagInput).trim();
    if (!tag) return;
    if (!seoData.tags.includes(tag)) {
      onChange({ ...seoData, tags: [...seoData.tags, tag] });
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({ ...seoData, tags: seoData.tags.filter((t) => t !== tagToRemove) });
  };

  // İçerikten Otomatik Etiket Önerisi
  const handleSuggestTags = () => {
    const raw = `${title} ${summary} ${content}`.toLowerCase();
    const stopWords = new Set(["ve", "ile", "bir", "bu", "için", "olan", "olarak", "gibi", "daha", "çok", "yeni", "son", "kadar", "olan"]);
    const words = raw
      .replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !stopWords.has(w));

    const freq: Record<string, number> = {};
    words.forEach((w) => {
      freq[w] = (freq[w] || 0) + 1;
    });

    const topWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));

    const merged = Array.from(new Set([...seoData.tags, ...topWords]));
    onChange({ ...seoData, tags: merged });
  };

  // Google News JSON-LD Schema
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: seoData.metaTitle || title || "Haber Başlığı",
    description: seoData.metaDescription || summary || "Haber spot metni",
    image: [imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c"],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: [
      {
        "@type": "Person",
        name: authorName || "Haber Editörü",
        url: "https://gundem360.com/yazarlar",
      },
    ],
    publisher: {
      "@type": "NewsMediaOrganization",
      name: "Gündem360",
      url: "https://gundem360.com",
      logo: {
        "@type": "ImageObject",
        url: "https://gundem360.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": seoData.canonicalUrl || `https://gundem360.com/haber/${seoData.urlSlug || slugify(title)}`,
    },
    keywords: seoData.tags.join(", "),
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonLdSchema, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const displayTitle = seoData.metaTitle || (title ? `${title} | Gündem360` : "Haber Başlığı | Gündem360");
  const displayDesc = seoData.metaDescription || summary || "Haberin arama motorlarında ve sosyal medyada görüntülenecek özet spot metni...";
  const displaySlug = seoData.urlSlug || (title ? slugify(title) : "haber-basligi");

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition">
      {/* Üst Başlık & SEO Skor Özeti */}
      <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                Gelişmiş SEO & Arama Motoru Optimizasyonu
              </h3>
              <span className="bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                Canlı Araçlar
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Google, sosyal medya, schema yapısal veri ve anahtar kelime analiz araçları.
            </p>
          </div>
        </div>

        {/* Canlı Skor Rozeti ve Sihirli Doldurucu */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAutoGenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/50 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
            title="Başlık ve içerikten otomatik SEO üret"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Sihirli SEO Oluştur</span>
          </button>

          {/* Skor Göstergesi */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs shadow-2xs ${
              seoAnalysis.score >= 80
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                : seoAnalysis.score >= 50
                ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300"
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full animate-pulse bg-current" />
            <span>SEO Puanı: {seoAnalysis.score} / 100</span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Sekmeler: Google Önizleme, Sosyal Medya, Schema, İleri Ayarlar */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("google")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "google"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Google Önizleme</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("social")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "social"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Sosyal Medya Kartı</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("schema")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "schema"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Google News / JSON-LD</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "settings"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Kanonik & Robots</span>
            </button>
          </div>

          {/* TAB 1: GOOGLE SERP SIMULATOR */}
          {activeTab === "google" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Canlı Arama Sonucu Simülasyonu
                </span>
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition ${
                      previewDevice === "desktop"
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Masaüstü
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition ${
                      previewDevice === "mobile"
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobil
                  </button>
                </div>
              </div>

              {/* Google Snippet Kutusu */}
              <div
                className={`p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-sans shadow-xs transition-all ${
                  previewDevice === "mobile" ? "max-w-md mx-auto" : "w-full"
                }`}
              >
                {/* Üst URL / Favicon Satırı */}
                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                  <div className="w-4 h-4 rounded-full bg-red-600 text-white font-black text-[9px] flex items-center justify-center font-serif">
                    G
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1 text-[11px] truncate">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">Gündem360</span>
                    <span className="hidden sm:inline text-zinc-400">•</span>
                    <span className="text-zinc-500 truncate">
                      https://gundem360.com › {category || "haber"} › {displaySlug}
                    </span>
                  </div>
                </div>

                {/* Tıklanabilir Mavi Başlık */}
                <h4 className="text-base sm:text-lg font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer line-clamp-2 leading-snug">
                  {displayTitle}
                </h4>

                {/* Açıklama Paragrafı */}
                <p className="text-xs sm:text-sm text-[#4d5156] dark:text-[#bdc1c6] mt-1 line-clamp-2 leading-relaxed">
                  <span className="text-zinc-400 text-xs">Bugün — </span>
                  {displayDesc}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SOSYAL MEDYA KART SİMÜLATÖRÜ */}
          {activeTab === "social" && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                Sosyal Medya & WhatsApp Paylaşım Önizlemesi
              </span>

              <div className="max-w-md mx-auto bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-md">
                {/* Görsel */}
                <div className="relative aspect-16/9 w-full bg-zinc-900">
                  {imageUrl ? (
                    <Image src={imageUrl} alt="Sosyal Kart" fill sizes="450px" className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-600 text-xs">
                      Görsel Yok
                    </div>
                  )}
                </div>

                {/* İçerik */}
                <div className="p-3.5 space-y-1 bg-zinc-900 text-white">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                    GUNDEM360.COM
                  </div>
                  <h4 className="text-sm font-bold line-clamp-2 leading-snug">{seoData.ogTitle || title || displayTitle}</h4>
                  <p className="text-xs text-zinc-300 line-clamp-2 font-normal leading-relaxed">
                    {seoData.ogDescription || summary || displayDesc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA.ORG / JSON-LD */}
          {activeTab === "schema" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Google News & Schema.org JSON-LD Yapısal Verisi
                  </span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                    NewsArticle
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg transition"
                >
                  {copiedSchema ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>JSON-LD Kopyala</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-zinc-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-56 border border-zinc-800">
                {JSON.stringify(jsonLdSchema, null, 2)}
              </pre>
            </div>
          )}

          {/* TAB 4: İLERİ AYARLAR (KANONİK & ROBOTS) */}
          {activeTab === "settings" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                  Kanonik (Canonical) URL
                </label>
                <input
                  type="url"
                  placeholder="https://gundem360.com/haber/..."
                  value={seoData.canonicalUrl}
                  onChange={(e) => onChange({ ...seoData, canonicalUrl: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  İçerik başka bir kaynaktan alıntı ise orijinal kaynak URL'sini girin.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Arama Motoru İndeksleme (Robots Meta)
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="noIndex"
                      checked={!seoData.noIndex}
                      onChange={() => onChange({ ...seoData, noIndex: false })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>index, follow (Önerilen)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-red-600">
                    <input
                      type="radio"
                      name="noIndex"
                      checked={seoData.noIndex}
                      onChange={() => onChange({ ...seoData, noIndex: true })}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span>noindex (Gizle)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* GİRİŞ ALANLARI: Odak Anahtar Kelime, Meta Title, Meta Description, Slug */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            {/* 1. Odak Anahtar Kelime & URL Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                    Odak Anahtar Kelime (Focus Keyword)
                  </label>
                  <span className="text-[10px] text-zinc-400 font-medium">Örn: "Yapay Zeka"</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Hedeflenen arama terimi..."
                    value={seoData.focusKeyword}
                    onChange={(e) => onChange({ ...seoData, focusKeyword: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-zinc-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                    URL Slug (Kalıcı Bağlantı)
                  </label>
                  <button
                    type="button"
                    onClick={() => onChange({ ...seoData, urlSlug: slugify(title) })}
                    className="text-[10px] text-blue-600 hover:underline font-bold"
                  >
                    Başlıktan Üret
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="ornek-haber-basligi"
                  value={seoData.urlSlug}
                  onChange={(e) => onChange({ ...seoData, urlSlug: slugify(e.target.value) })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-xs font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Özel Meta Başlık & Karakter Barı */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                  Meta Başlık (SEO Title)
                </label>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    displayTitle.length >= 40 && displayTitle.length <= 60
                      ? "text-emerald-600"
                      : "text-amber-500"
                  }`}
                >
                  {displayTitle.length} / 60 Karakter
                </span>
              </div>
              <input
                type="text"
                placeholder={title ? `${title} | Gündem360` : "Özel SEO başlığı..."}
                value={seoData.metaTitle}
                onChange={(e) => onChange({ ...seoData, metaTitle: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className={`h-full transition-all duration-300 ${
                    displayTitle.length >= 40 && displayTitle.length <= 60
                      ? "bg-emerald-500"
                      : displayTitle.length > 60
                      ? "bg-red-500"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, (displayTitle.length / 60) * 100)}%` }}
                />
              </div>
            </div>

            {/* 3. Özel Meta Açıklama & Karakter Barı */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                  Meta Açıklama (SEO Description)
                </label>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    displayDesc.length >= 120 && displayDesc.length <= 160
                      ? "text-emerald-600"
                      : "text-amber-500"
                  }`}
                >
                  {displayDesc.length} / 160 Karakter
                </span>
              </div>
              <textarea
                rows={2}
                placeholder={summary || "Arama sonuçlarında başlığın altında görünecek spot metin..."}
                value={seoData.metaDescription}
                onChange={(e) => onChange({ ...seoData, metaDescription: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className={`h-full transition-all duration-300 ${
                    displayDesc.length >= 120 && displayDesc.length <= 160
                      ? "bg-emerald-500"
                      : displayDesc.length > 160
                      ? "bg-red-500"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, (displayDesc.length / 160) * 100)}%` }}
                />
              </div>
            </div>

            {/* 4. Haber Etiketleri (Tags) Yöneticisi */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase flex items-center gap-1.5">
                  <Tags className="w-3.5 h-3.5 text-blue-500" />
                  Haber Etiketleri (Keywords)
                </label>
                <button
                  type="button"
                  onClick={handleSuggestTags}
                  className="text-[10px] text-blue-600 hover:underline font-bold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  İçerikten Etiket Öner
                </button>
              </div>

              {/* Etiket Girişi */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Etiket yazıp Enter'a basın..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag()}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Ekle
                </button>
              </div>

              {/* Etiket Rozetleri (Chips) */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {seoData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 rounded-full text-[11px] font-semibold text-zinc-800 dark:text-zinc-200"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-zinc-400 hover:text-red-500 transition ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {seoData.tags.length === 0 && (
                  <span className="text-xs text-zinc-400 italic">Henüz etiket eklenmedi.</span>
                )}
              </div>
            </div>
          </div>

          {/* DENETİM LİSTESİ (SEO CHECKLIST) */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-3 flex items-center justify-between">
              <span>Canlı SEO Denetim Kontrol Listesi</span>
              <span className="text-[11px] font-normal text-zinc-400">
                {seoAnalysis.checks.filter((c) => c.status === "good").length} / {seoAnalysis.checks.length} Kriter Başarılı
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {seoAnalysis.checks.map((check) => (
                <div
                  key={check.id}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs"
                >
                  {check.status === "good" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : check.status === "warning" ? (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="font-bold text-zinc-800 dark:text-zinc-200">{check.title}</div>
                    <div className="text-[11px] text-zinc-500 leading-tight">{check.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
