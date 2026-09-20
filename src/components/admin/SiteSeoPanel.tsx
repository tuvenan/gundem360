"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SiteSeoSettings } from "@/types/news";
import {
  Globe,
  Search,
  Share2,
  Bot,
  FileText,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  Smartphone,
  Monitor,
  AlertCircle,
  Check,
  ShieldCheck,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface SiteSeoPanelProps {
  seo: SiteSeoSettings;
  siteName: string;
  onChange: (updatedSeo: SiteSeoSettings) => void;
}

export default function SiteSeoPanel({
  seo,
  siteName,
  onChange,
}: SiteSeoPanelProps) {
  const [activeTab, setActiveTab] = useState<"meta" | "social" | "robots" | "schema" | "sitemap">("meta");
  const [serpView, setSerpView] = useState<"desktop" | "mobile">("desktop");
  const [copiedSchema, setCopiedSchema] = useState(false);

  const updateField = <K extends keyof SiteSeoSettings>(field: K, value: SiteSeoSettings[K]) => {
    onChange({
      ...seo,
      [field]: value,
    });
  };

  const metaTitle = seo.metaTitle || `${siteName} | Son Dakika, Güncel ve Tarafsız Haber Portalı`;
  const metaDesc = seo.metaDescription || "Türkiye ve dünyadan son dakika haberleri, ekonomi, spor, teknoloji, gündem ve analizlerle en hızlı ve doğru haber kaynağınız.";
  const canonical = seo.canonicalUrl || "https://gundem360.com";
  const ogTitle = seo.ogTitle || metaTitle;
  const ogDesc = seo.ogDescription || metaDesc;
  const ogImage = seo.ogImage || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80";

  // Hesaplanan SEO Skoru
  let score = 70;
  if (metaTitle.length >= 40 && metaTitle.length <= 70) score += 10;
  if (metaDesc.length >= 120 && metaDesc.length <= 165) score += 10;
  if (seo.googleVerification) score += 5;
  if (seo.ogImage) score += 5;

  // Schema.org JSON-LD NewsMediaOrganization
  const schemaJsonLd = {
    "@context": "https://schema.org",
    "@type": seo.publisherType || "NewsMediaOrganization",
    "name": seo.googleNewsName || siteName,
    "url": canonical,
    "logo": {
      "@type": "ImageObject",
      "url": seo.publisherLogo || ogImage,
      "width": 600,
      "height": 60,
    },
    "sameAs": [
      "https://twitter.com/gundem360",
      "https://facebook.com/gundem360",
      "https://instagram.com/gundem360",
      "https://youtube.com/gundem360",
    ],
    "publishingPrinciples": `${canonical}/kunye`,
    "inLanguage": "tr-TR",
  };

  const copySchemaCode = () => {
    navigator.clipboard.writeText(JSON.stringify(schemaJsonLd, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleResetRobots = () => {
    updateField(
      "robotsTxt",
      `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${canonical}/sitemap.xml\nSitemap: ${canonical}/news-sitemap.xml`
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden space-y-6">
      {/* 1. Üst Başlık ve Genel Sağlık Kartı */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                Detaylı Arama Motoru Optimizasyonu (Global SEO)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Google & News Uyumlu
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Tüm sitenin arama motoru indekslemesi, SERP görünümü, sosyal medya kartları, robots.txt ve Schema.org şeması.
            </p>
          </div>
        </div>

        {/* Skor Rozeti */}
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-2xs">
          <div className="text-right">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">SEO Sağlık Skoru</div>
            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">%{score} / 100</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 font-bold text-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Modül Sekmeleri */}
      <div className="px-6">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-2 overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("meta")}
            className={`flex items-center gap-2 pb-3 px-3 transition border-b-2 whitespace-nowrap ${
              activeTab === "meta"
                ? "border-red-600 text-red-600"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Genel Meta & SERP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("social")}
            className={`flex items-center gap-2 pb-3 px-3 transition border-b-2 whitespace-nowrap ${
              activeTab === "social"
                ? "border-red-600 text-red-600"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Open Graph & Sosyal Medya</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("robots")}
            className={`flex items-center gap-2 pb-3 px-3 transition border-b-2 whitespace-nowrap ${
              activeTab === "robots"
                ? "border-red-600 text-red-600"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>İndeksleme & Webmaster Doğrulama</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("schema")}
            className={`flex items-center gap-2 pb-3 px-3 transition border-b-2 whitespace-nowrap ${
              activeTab === "schema"
                ? "border-red-600 text-red-600"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Google News & Schema.org</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sitemap")}
            className={`flex items-center gap-2 pb-3 px-3 transition border-b-2 whitespace-nowrap ${
              activeTab === "sitemap"
                ? "border-red-600 text-red-600"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Site Haritası (Sitemap)</span>
          </button>
        </div>
      </div>

      {/* 3. Sekme İçerikleri */}
      <div className="px-6 pb-6 space-y-6">
        {/* SEKME 1: GENEL META & SERP */}
        {activeTab === "meta" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                    Ana Sayfa Meta Başlığı (Meta Title) *
                  </label>
                  <span className={`text-[10px] font-mono ${metaTitle.length > 70 ? "text-red-500" : "text-zinc-400"}`}>
                    {metaTitle.length} / 65 kr.
                  </span>
                </div>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => updateField("metaTitle", e.target.value)}
                  placeholder="Gündem360 | Son Dakika, Güncel ve Tarafsız Haber Portalı"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                  Alt Sayfa Başlık Şablonu (Title Template)
                </label>
                <input
                  type="text"
                  value={seo.metaTitleTemplate || "%s | Son Dakika ve Güncel Haberler - Gündem360"}
                  onChange={(e) => updateField("metaTitleTemplate", e.target.value)}
                  placeholder="%s | Son Dakika ve Güncel Haberler - Gündem360"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white font-mono focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                <p className="text-[10px] text-zinc-400 mt-1">
                  <code className="text-red-600">%s</code> yerine haber veya kategori başlığı otomatik gelir.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                  Ana Sayfa Meta Açıklaması (Meta Description) *
                </label>
                <span className={`text-[10px] font-mono ${metaDesc.length > 160 ? "text-red-500 font-bold" : "text-zinc-400"}`}>
                  {metaDesc.length} / 155 kr. (Önerilen: 120-160)
                </span>
              </div>
              <textarea
                rows={3}
                value={metaDesc}
                onChange={(e) => updateField("metaDescription", e.target.value)}
                placeholder="Türkiye ve dünyadan son dakika haberleri, ekonomi, spor, teknoloji..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                  Site Kanonik Adresi (Canonical Base URL)
                </label>
                <input
                  type="url"
                  value={canonical}
                  onChange={(e) => updateField("canonicalUrl", e.target.value)}
                  placeholder="https://gundem360.com"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                  Genel Anahtar Kelimeler (Focus Keywords)
                </label>
                <input
                  type="text"
                  value={seo.focusKeywords || "haber, son dakika, ekonomi, gündem, spor, canlı borsa"}
                  onChange={(e) => updateField("focusKeywords", e.target.value)}
                  placeholder="haber, son dakika, ekonomi, gündem"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Canlı Google SERP Simülatörü */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-500" />
                  <span>Canlı Google Arama Sonucu (SERP) Önizlemesi</span>
                </span>

                <div className="inline-flex rounded-lg bg-zinc-200 dark:bg-zinc-800 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setSerpView("desktop")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                      serpView === "desktop"
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                        : "text-zinc-500"
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    <span>Masaüstü</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSerpView("mobile")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                      serpView === "mobile"
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                        : "text-zinc-500"
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Mobil</span>
                  </button>
                </div>
              </div>

              {/* SERP Kutusu */}
              <div
                className={`p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1.5 transition-all ${
                  serpView === "mobile" ? "max-w-sm mx-auto" : "w-full"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                    G
                  </div>
                  <div className="text-[11px] text-zinc-700 dark:text-zinc-300 font-sans truncate">
                    <span className="font-bold">{siteName}</span>
                    <span className="text-zinc-400 font-mono ml-1.5 text-[10px]">{canonical}</span>
                  </div>
                </div>

                <div className="text-blue-700 dark:text-blue-400 font-medium text-base hover:underline cursor-pointer line-clamp-1">
                  {metaTitle}
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  {metaDesc}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SEKME 2: OPEN GRAPH & SOSYAL MEDYA */}
        {activeTab === "social" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                  Varsayılan Paylaşım Başlığı (og:title)
                </label>
                <input
                  type="text"
                  value={ogTitle}
                  onChange={(e) => updateField("ogTitle", e.target.value)}
                  placeholder={metaTitle}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                  Twitter / X Tanıtıcı Adı (Handle)
                </label>
                <input
                  type="text"
                  value={seo.twitterHandle || "@gundem360"}
                  onChange={(e) => updateField("twitterHandle", e.target.value)}
                  placeholder="@gundem360"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Varsayılan Paylaşım Açıklaması (og:description)
              </label>
              <textarea
                rows={2}
                value={ogDesc}
                onChange={(e) => updateField("ogDescription", e.target.value)}
                placeholder={metaDesc}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Paylaşım Görseli Yükleyici */}
            <div className="space-y-2">
              <ImageUploader
                label="Varsayılan Sosyal Medya Paylaşım Görseli (og:image - 1200x630)"
                value={ogImage}
                onChange={(url) => updateField("ogImage", url)}
              />
              <p className="text-[11px] text-zinc-400">
                Sosyal ağlarda (WhatsApp, Twitter/X, Facebook, LinkedIn) haber linki paylaşıldığında gösterilecek varsayılan görsel.
              </p>
            </div>

            {/* Canlı WhatsApp & X Paylaşım Kartı Simülatörü */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Canlı Sosyal Medya Kart Önizlemesi (WhatsApp / X / Facebook)</span>
              </span>

              <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xs">
                {ogImage && (
                  <div className="relative aspect-1.91/1 w-full bg-zinc-100 dark:bg-zinc-800">
                    <Image src={ogImage} alt="OG Preview" fill sizes="400px" className="object-cover" />
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">
                    {canonical.replace("https://", "")}
                  </div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                    {ogTitle}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {ogDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEKME 3: İNDEKSLENME, ROBOTS.TXT & WEBMASTER DOĞRULAMA */}
        {activeTab === "robots" && (
          <div className="space-y-6">
            {/* 1. Robots Index Direktifi */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                Arama Motoru İndeksleme Direktifi (Robots Meta)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    value: "index, follow",
                    title: "index, follow (Önerilen)",
                    desc: "Tüm sayfalar Google tarafından dizine eklenir ve linkler takip edilir.",
                  },
                  {
                    value: "noindex, follow",
                    title: "noindex, follow",
                    desc: "Sayfalar dizine eklenmez fakat sayfa içi linkler taranır.",
                  },
                  {
                    value: "noindex, nofollow",
                    title: "noindex, nofollow (Gizli)",
                    desc: "Arama motorları siteyi tamamen görmezden gelir.",
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField("robotsIndex", opt.value as any)}
                    className={`text-left p-3 rounded-xl border transition ${
                      (seo.robotsIndex || "index, follow") === opt.value
                        ? "border-red-600 bg-red-50/40 dark:bg-red-950/20 text-red-700 dark:text-red-300"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.title}</div>
                    <div className="text-[11px] mt-1 text-zinc-500 leading-normal">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Webmaster Doğrulama Kodları */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>Webmaster Arama Motoru Doğrulama Kodları</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Google Search Console Doğrulama
                  </label>
                  <input
                    type="text"
                    value={seo.googleVerification || ""}
                    onChange={(e) => updateField("googleVerification", e.target.value)}
                    placeholder="google-site-verification-kodunuz"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Bing Webmaster Tools Kodu
                  </label>
                  <input
                    type="text"
                    value={seo.bingVerification || ""}
                    onChange={(e) => updateField("bingVerification", e.target.value)}
                    placeholder="bing-verification-kodunuz"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Yandex Webmaster Kodu
                  </label>
                  <input
                    type="text"
                    value={seo.yandexVerification || ""}
                    onChange={(e) => updateField("yandexVerification", e.target.value)}
                    placeholder="yandex-verification-kodunuz"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. robots.txt Düzenleyici */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                  robots.txt Dosyası İçeriği
                </label>
                <button
                  type="button"
                  onClick={handleResetRobots}
                  className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
                >
                  Varsayılan robots.txt Yükle
                </button>
              </div>
              <textarea
                rows={5}
                value={
                  seo.robotsTxt ||
                  `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${canonical}/sitemap.xml`
                }
                onChange={(e) => updateField("robotsTxt", e.target.value)}
                className="w-full bg-zinc-950 text-zinc-200 border border-zinc-700 rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-red-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* SEKME 4: GOOGLE NEWS & SCHEMA.ORG */}
        {activeTab === "schema" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                  Yayıncı Schema Türü (Publisher Type)
                </label>
                <select
                  value={seo.publisherType || "NewsMediaOrganization"}
                  onChange={(e) => updateField("publisherType", e.target.value as any)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                >
                  <option value="NewsMediaOrganization">NewsMediaOrganization (Haber Medya Kuruluşu - Önerilen)</option>
                  <option value="Organization">Organization (Genel Kurum / Şirket)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                  Google News Yayın Adı (Publication Name)
                </label>
                <input
                  type="text"
                  value={seo.googleNewsName || siteName}
                  onChange={(e) => updateField("googleNewsName", e.target.value)}
                  placeholder="Gündem360"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Yayıncı Logosu (Publisher Logo URL)
              </label>
              <input
                type="url"
                value={seo.publisherLogo || ogImage}
                onChange={(e) => updateField("publisherLogo", e.target.value)}
                placeholder="https://gundem360.com/logo.png"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-white font-mono focus:outline-none"
              />
            </div>

            {/* Canlı JSON-LD Şema Kodu */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Otomatik Üretilen NewsMediaOrganization JSON-LD Şeması</span>
                </span>
                <button
                  type="button"
                  onClick={copySchemaCode}
                  className="flex items-center gap-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-red-600 transition"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? "Kopyalandı!" : "Kodu Kopyala"}</span>
                </button>
              </div>

              <pre className="p-4 bg-zinc-950 text-emerald-400 text-[11px] font-mono rounded-xl border border-zinc-800 overflow-x-auto leading-relaxed">
                {JSON.stringify(schemaJsonLd, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* SEKME 5: SİTE HARİTASI (SITEMAP) */}
        {activeTab === "sitemap" && (
          <div className="space-y-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase">
                    Aktif XML Site Haritaları
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Arama motorlarının haberleri anlık indekslemesi için otomatik oluşturulan XML sitemap rotaları.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Dinamik Aktif
                </span>
              </div>

              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">Genel Site Haritası:</span>
                    <code className="text-zinc-500 ml-2 font-mono">{canonical}/sitemap.xml</code>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">Tüm Sayfalar & Kategoriler</span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">Google News Haber Haritası:</span>
                    <code className="text-zinc-500 ml-2 font-mono">{canonical}/news-sitemap.xml</code>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">Son 48 Saatlik Haberler</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800/40 text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Google Search Console Entegrasyon Rehberi</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-700 dark:text-blue-400">
                Google Search Console panelinize giriş yaparak <strong>Site Haritaları</strong> bölümüne <code className="bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded">sitemap.xml</code> adresini ekleyiniz. Sistem her yeni haber yayınlandığında sitemap dosyasını otomatik olarak günceller.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
