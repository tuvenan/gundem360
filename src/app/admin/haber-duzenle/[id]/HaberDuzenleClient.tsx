"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { NewsItem, CategoryItem } from "@/types/news";
import { ArrowLeft, Save, Sparkles, Trash2, Eye } from "lucide-react";
import SeoToolsSection, { SeoData } from "@/components/admin/SeoToolsSection";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageUploader from "@/components/admin/ImageUploader";
import ImageBadgeSelector from "@/components/admin/ImageBadgeSelector";

interface HaberDuzenleClientProps {
  newsItem: NewsItem;
  categories: CategoryItem[];
}

export default function HaberDuzenleClient({
  newsItem,
  categories,
}: HaberDuzenleClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: newsItem.title,
    summary: newsItem.summary,
    content: newsItem.content,
    category: newsItem.category,
    imageUrl: newsItem.imageUrl,
    headlineType: newsItem.headlineType,
    headlineOrder: newsItem.headlineOrder?.toString() || "1",
    isBreaking: newsItem.isBreaking || false,
    imageBadgeText: newsItem.imageBadgeText || "",
    imageBadgeColor: newsItem.imageBadgeColor || "bg-red-600",
    tags: newsItem.tags?.join(", ") || "",
  });

  const [seoData, setSeoData] = useState<SeoData>({
    metaTitle: newsItem.seo?.metaTitle || `${newsItem.title} | Gündem360`,
    metaDescription: newsItem.seo?.metaDescription || newsItem.summary,
    focusKeyword: newsItem.seo?.focusKeyword || (newsItem.tags?.[0] || ""),
    urlSlug: newsItem.slug || "",
    canonicalUrl: newsItem.seo?.canonicalUrl || `https://gundem360.com/haber/${newsItem.slug}`,
    noIndex: newsItem.seo?.noIndex || false,
    ogTitle: newsItem.seo?.ogTitle || newsItem.title,
    ogDescription: newsItem.seo?.ogDescription || newsItem.summary,
    tags: newsItem.tags || ["Haber"],
    seoScore: newsItem.seo?.seoScore || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const strippedContent = formData.content.replace(/<[^>]*>/g, "").trim();
    if (!formData.title || !formData.summary || !formData.content || !strippedContent) {
      setError("Lütfen gerekli alanları (başlık, spot, içerik) doldurun.");
      return;
    }
    if (!formData.imageUrl) {
      setError("Lütfen bir kapak görseli yükleyin veya URL girin.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const catObj = categories.find((c) => c.key === formData.category);

    try {
      const res = await fetch("/api/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newsItem.id,
          title: formData.title,
          summary: formData.summary,
          content: formData.content,
          category: formData.category,
          categoryTitle: catObj ? catObj.name : "Gündem",
          imageUrl: formData.imageUrl,
          headlineType: formData.headlineType,
          headlineOrder: formData.headlineType === "main" ? Number(formData.headlineOrder) : undefined,
          isBreaking: formData.isBreaking,
          imageBadgeText: formData.imageBadgeText.trim() || undefined,
          imageBadgeColor: formData.imageBadgeText.trim() ? formData.imageBadgeColor : undefined,
          tags: seoData.tags.length > 0 ? seoData.tags : formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
          seo: seoData,
          slug: seoData.urlSlug || newsItem.slug,
        }),
      });

      if (res.ok) {
        setSuccessMessage("✅ Haber ve tüm içerik değişiklikleri başarıyla kaydedildi!");
        router.refresh();
        setTimeout(() => {
          router.push("/admin/haberler");
        }, 1200);
      } else {
        const data = await res.json();
        setError(data.error || "Güncelleme başarısız.");
      }
    } catch (err) {
      console.error(err);
      setError("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Üst Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/haberler"
          className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Haberler Listesine Dön
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/haber/${newsItem.slug}`}
            target="_blank"
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 rounded-md transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Haberi Önizle</span>
          </Link>
          <h1 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            Haberi Düzenle
          </h1>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6"
      >
        {/* Başlık */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
            Haber Başlığı *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none font-bold"
          />
        </div>

        {/* Spot */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
            Spot (Özet Metin) *
          </label>
          <textarea
            required
            rows={2}
            value={formData.summary}
            onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-xs sm:text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        {/* Kategori, Manşet Tipi & Sıra */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              {categories.map((c) => (
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
              onChange={(e) => setFormData((prev) => ({ ...prev, headlineType: e.target.value as any }))}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="main">Ana Manşet (1-10 Slider)</option>
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
                onChange={(e) => setFormData((prev) => ({ ...prev, headlineOrder: e.target.value }))}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    Manşet #{num}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Flaş Haber */}
        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <input
            type="checkbox"
            id="editIsBreaking"
            checked={formData.isBreaking}
            onChange={(e) => setFormData((prev) => ({ ...prev, isBreaking: e.target.checked }))}
            className="w-4 h-4 text-red-600 rounded"
          />
          <label htmlFor="editIsBreaking" className="text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
            Flaş / Son Dakika Bandında Göster
          </label>
        </div>

        {/* Kapak Görseli (Dosyadan Yükleme veya URL) */}
        <ImageUploader
          label="Kapak Görseli"
          required
          value={formData.imageUrl}
          onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
        />

        {/* Görsel Üzeri Rozet / Etiket Seçici & Canlı Önizleme */}
        <ImageBadgeSelector
          badgeText={formData.imageBadgeText}
          badgeColor={formData.imageBadgeColor}
          imageUrl={formData.imageUrl}
          onTextChange={(text) => setFormData((prev) => ({ ...prev, imageBadgeText: text }))}
          onColorChange={(color) => setFormData((prev) => ({ ...prev, imageBadgeColor: color }))}
        />

        {/* İçerik (Zengin Metin Editörü) */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-2">
            Haber İçeriği *
          </label>
          <RichTextEditor
            value={formData.content}
            onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
            placeholder="Haber içeriğini düzenleyin..."
          />
        </div>

        {/* Etiketler */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
            Etiketler (Virgülle ayırın)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
            placeholder="Örn: Teknoloji, Yapay Zeka, Türkiye"
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white"
          />
        </div>

        {/* SEO Araçları */}
        <SeoToolsSection
          title={formData.title}
          summary={formData.summary}
          content={formData.content}
          category={formData.category}
          imageUrl={formData.imageUrl}
          authorName={newsItem.author.name}
          seoData={seoData}
          onChange={setSeoData}
        />

        {/* Kaydet */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
          <Link
            href="/admin/haberler"
            className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-lg transition shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
