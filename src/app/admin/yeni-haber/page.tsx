"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/data/mock-news";
import { ArrowLeft, Save, Sparkles, Image as ImageIcon } from "lucide-react";
import SeoToolsSection, { SeoData } from "@/components/admin/SeoToolsSection";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageUploader from "@/components/admin/ImageUploader";
import ImageBadgeSelector from "@/components/admin/ImageBadgeSelector";

const SAMPLE_IMAGES = [
  { label: "Gündem", url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80" },
  { label: "Ekonomi", url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1000&q=80" },
  { label: "Teknoloji", url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80" },
  { label: "Spor", url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80" },
  { label: "Dünya", url: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1000&q=80" },
];

export default function YeniHaberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoriesList, setCategoriesList] = useState(CATEGORIES);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setCategoriesList(data);
      })
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    category: "gundem",
    imageUrl: SAMPLE_IMAGES[0].url,
    headlineType: "main",
    headlineOrder: "1",
    authorName: "Gündem360 Editörü",
    readTimeMinutes: "3",
    isBreaking: false,
    imageBadgeText: "",
    imageBadgeColor: "bg-red-600",
  });

  const [seoData, setSeoData] = useState<SeoData>({
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
    urlSlug: "",
    canonicalUrl: "",
    noIndex: false,
    ogTitle: "",
    ogDescription: "",
    tags: ["Gündem"],
    seoScore: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const strippedContent = formData.content.replace(/<[^>]*>/g, "").trim();
    if (!formData.title || !formData.summary || !formData.content || !strippedContent) {
      setError("Lütfen gerekli alanları (başlık, spot, içerik) doldurun.");
      return;
    }

    setLoading(true);
    setError(null);

    const categoryObj = categoriesList.find((c) => c.key === formData.category);

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageBadgeText: formData.imageBadgeText.trim() || undefined,
          imageBadgeColor: formData.imageBadgeText.trim() ? formData.imageBadgeColor : undefined,
          slug: seoData.urlSlug || undefined,
          tags: seoData.tags.length > 0 ? seoData.tags : ["Haber", formData.category],
          seo: {
            metaTitle: seoData.metaTitle || `${formData.title} | Gündem360`,
            metaDescription: seoData.metaDescription || formData.summary,
            focusKeyword: seoData.focusKeyword,
            canonicalUrl: seoData.canonicalUrl,
            noIndex: seoData.noIndex,
            ogTitle: seoData.ogTitle || formData.title,
            ogDescription: seoData.ogDescription || formData.summary,
            tags: seoData.tags,
            seoScore: seoData.seoScore,
          },
          categoryTitle: categoryObj ? categoryObj.name : "Gündem",
          headlineOrder: formData.headlineType === "main" ? Number(formData.headlineOrder) : undefined,
        }),
      });

      if (res.ok) {
        router.push("/admin/haberler");
        router.refresh();
      } else {
        const errData = await res.json();
        setError(errData.error || "Haber kaydedilemedi.");
      }
    } catch (err) {
      console.error(err);
      setError("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Üst Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Paneline Dön
        </Link>
        <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
          Yeni Haber Yayınla
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl shadow-xs">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Temel Haber Bilgileri Kartı */}
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
          <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">
            1. Temel Haber Bilgileri
          </h2>

          {/* 1. Başlık */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Haber Başlığı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Yerli Yapay Zekâ Modeli Tanıtıldı: Dünyada Büyük Yankı"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-3 text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* 2. Spot / Özet */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Spot (Özet Metin) *
            </label>
            <textarea
              required
              rows={2}
              placeholder="Haberin ana fikrini ve en dikkat çekici detayını özetleyen spot cümle..."
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-3 text-xs sm:text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* 3. Kategori, Manşet Tipi & Sıra */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Kategori
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {categoriesList.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Manşet Türü
              </label>
              <select
                value={formData.headlineType}
                onChange={(e) => setFormData({ ...formData, headlineType: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="main">Ana Manşet (1-10 Klasik Slider)</option>
                <option value="sub">Sürmanşet (Öne Çıkan)</option>
                <option value="normal">Normal Haber</option>
              </select>
            </div>

            {formData.headlineType === "main" && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                  Manşet Sırası (1-10)
                </label>
                <select
                  value={formData.headlineOrder}
                  onChange={(e) => setFormData({ ...formData, headlineOrder: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      Manşet #{num} {num === 1 ? "(Açılış Manşeti)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Flaş Haber Onay Kutusu */}
          <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <input
              type="checkbox"
              id="isBreaking"
              checked={formData.isBreaking}
              onChange={(e) => setFormData({ ...formData, isBreaking: e.target.checked })}
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer"
            />
            <label htmlFor="isBreaking" className="text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
              Flaş / Son Dakika Bandında Göster (Kırmızı Kayan Bant)
            </label>
          </div>

          {/* 4. Kapak Görseli (Dosyadan Yükleme veya URL) */}
          <div className="space-y-2">
            <ImageUploader
              label="Kapak Görseli"
              required
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            />

            {/* Hızlı Örnek Görseller */}
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 flex-wrap pt-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Hazır Örnekler:</span>
              {SAMPLE_IMAGES.map((img) => (
                <button
                  key={img.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                  className="underline hover:text-red-600 transition cursor-pointer"
                >
                  {img.label}
                </button>
              ))}
            </div>
          </div>

          {/* Görsel Üzeri Rozet / Etiket Seçici & Canlı Önizleme */}
          <ImageBadgeSelector
            badgeText={formData.imageBadgeText}
            badgeColor={formData.imageBadgeColor}
            imageUrl={formData.imageUrl}
            onTextChange={(text) => setFormData((prev) => ({ ...prev, imageBadgeText: text }))}
            onColorChange={(color) => setFormData((prev) => ({ ...prev, imageBadgeColor: color }))}
          />

          {/* 5. Detaylı İçerik (Zengin Metin Editörü) */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-2">
              Haber Detay İçeriği *
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
              placeholder="Haberin tam detaylı metnini buraya yazın, biçimlendirin, ara başlıklar ve görseller ekleyin..."
            />
          </div>

          {/* 6. Yazar ve Okuma Süresi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Yazar / Kaynak
              </label>
              <input
                type="text"
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Okuma Süresi (Dakika)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.readTimeMinutes}
                onChange={(e) => setFormData({ ...formData, readTimeMinutes: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* 2. GELİŞMİŞ SEO ARAÇLARI MODÜLÜ */}
        <SeoToolsSection
          title={formData.title}
          summary={formData.summary}
          content={formData.content}
          category={formData.category}
          imageUrl={formData.imageUrl}
          authorName={formData.authorName}
          seoData={seoData}
          onChange={setSeoData}
        />

        {/* Yayınla Butonu */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            SEO Puanı: <strong className="text-zinc-900 dark:text-white">{seoData.seoScore}/100</strong> •{" "}
            {seoData.seoScore >= 80 ? "Mükemmel SEO Hazırlığı" : "Yayınlamaya Hazır"}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-xl transition shadow-md shadow-red-600/20 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Yayınlanıyor..." : "Haberi Hemen Yayınla"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
