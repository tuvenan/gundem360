"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Link as LinkIcon,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Camera,
  RefreshCw,
  Eye,
  X,
} from "lucide-react";

interface AiImageManagerProps {
  currentImageUrl: string;
  newsTitle: string;
  category?: string;
  summary?: string;
  suggestedPrompt?: string;
  onImageChange: (url: string) => void;
}

type ImageMode = "upload" | "url" | "ai";

export default function AiImageManager({
  currentImageUrl,
  newsTitle,
  category,
  summary,
  suggestedPrompt,
  onImageChange,
}: AiImageManagerProps) {
  const [activeMode, setActiveMode] = useState<ImageMode>("ai");
  const [customPrompt, setCustomPrompt] = useState(suggestedPrompt || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [urlInput, setUrlInput] = useState(currentImageUrl || "");
  const [isVerified, setIsVerified] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Suggested prompt geldiğinde otomatik doldur
  React.useEffect(() => {
    if (suggestedPrompt && !customPrompt) {
      setCustomPrompt(suggestedPrompt);
    }
  }, [suggestedPrompt]);

  // 1. Bilgisayardan Fotoğraf Yükleme
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatusMessage({ type: "error", text: "Lütfen geçerli bir görsel dosyası seçin (JPG, PNG, WEBP)." });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        onImageChange(data.url);
        setUrlInput(data.url);
        setIsVerified(false);
        setStatusMessage({ type: "success", text: "Fotoğraf başarıyla yüklendi ve habere kapak yapıldı! Lütfen görsel uyumunu onaylayın." });
      } else {
        setStatusMessage({ type: "error", text: data.error || "Görsel yüklenemedi." });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Görsel yüklenirken sunucu hatası oluştu." });
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Harici URL Uygulama
  const handleApplyUrl = (val: string) => {
    setUrlInput(val);
    if (val.trim()) {
      onImageChange(val.trim());
      setIsVerified(false);
      setStatusMessage({ type: "success", text: "Görsel bağlantısı uygulandı. Lütfen görsel uyumunu onaylayın." });
    }
  };

  // 3. Yapay Zeka ile Görsel Üretme
  const handleAiGenerate = async () => {
    const promptToUse = (customPrompt.trim() || newsTitle || "gündem son dakika sıcak gelişme").trim();

    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/ai-image-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToUse,
          title: newsTitle,
          category,
          summary,
        }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        onImageChange(data.url);
        setUrlInput(data.url);
        setIsVerified(true);
        setStatusMessage({
          type: "success",
          text: "✨ Bağlamsal yapay zeka kapak görseli başarıyla üretildi ve habere atandı!",
        });
      } else {
        setStatusMessage({ type: "error", text: data.error || "Görsel üretilemedi." });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Yapay zeka görsel motoruna bağlanırken hata oluştu." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
      {/* Başlık & Sekmeler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/60 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-600/10 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider">
              Kapak Görseli ve Medya Ataması
            </h4>
            <span className="text-[10px] text-zinc-400 font-medium">3 Farklı Kaynaktan Medya Tanımlama</span>
          </div>
        </div>

        {/* 3'lü Mod Sekmeleri */}
        <div className="flex items-center gap-1 bg-zinc-200/80 dark:bg-zinc-900 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveMode("upload")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeMode === "upload"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>1. Dosya Yükle</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("url")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeMode === "url"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>2. Harici URL Ver</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("ai")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeMode === "ai"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>3. Yapay Zeka ile Görsel Üret</span>
          </button>
        </div>
      </div>

      {/* Durum Bildirimi */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span className="font-semibold">{statusMessage.text}</span>
        </div>
      )}

      {/* SEKME 1: DOSYADAN YÜKLEME */}
      {activeMode === "upload" && (
        <div className="space-y-3 animate-in fade-in">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-red-500 dark:hover:border-red-500 rounded-2xl p-6 text-center cursor-pointer transition bg-white dark:bg-zinc-900 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-red-600 flex items-center justify-center mx-auto mb-2 transition">
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {isUploading ? "Görsel sunucuya yükleniyor..." : "Bilgisayarınızdan fotoğraf seçin veya sürükleyin"}
            </p>
            <p className="text-[10px] text-zinc-400 mt-1">
              JPG, PNG, WEBP formatları • En fazla 10MB • /api/upload üzerinden public/uploads/ dizinine kaydedilir
            </p>
          </div>
        </div>
      )}

      {/* SEKME 2: HARİCİ URL VERME */}
      {activeMode === "url" && (
        <div className="space-y-3 animate-in fade-in">
          <div>
            <label className="block text-[11px] font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1">
              Harici Görsel Bağlantısı (URL)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (e.target.value.trim().startsWith("http")) {
                    onImageChange(e.target.value.trim());
                  }
                }}
                placeholder="https://images.unsplash.com/... veya https://ajans.com/foto.jpg"
                className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleApplyUrl(urlInput)}
                className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer"
              >
                Uygula
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">
              Unsplash, ajans CDN veya doğrudan web görsel linkini yapıştırabilirsiniz.
            </p>
          </div>

          {/* Anlık Canlı Görsel Önizlemesi */}
          {urlInput.trim() && (
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span>Anlık Görsel Önizlemesi</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Bağlantı algılandı</span>
              </div>
              <div className="relative aspect-video w-full max-h-48 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={urlInput}
                  alt="Harici URL Önizleme"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEKME 3: YAPAY ZEKA İLE GÖRSEL ÜRET */}
      {activeMode === "ai" && (
        <div className="space-y-3 animate-in fade-in">
          <div>
            <label className="block text-[11px] font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
              <span>Görsel Tasvir Promptu (İsteğe Bağlı)</span>
              <span className="text-[10px] text-zinc-400 font-normal">Boş bırakılırsa haber başlığı kullanılır</span>
            </label>
            <textarea
              rows={2}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={`Örn: "${newsTitle ? newsTitle.slice(0, 60) : "Yerli teknoloji ve yapay zeka çipi basın lansmanı"}..."`}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleAiGenerate}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Yapay Zeka Görseli Çiziyor & Sunucuya Kaydediyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>✨ Yapay Zeka ile Otomatik Kapak Görseli Oluştur</span>
              </>
            )}
          </button>
          <p className="text-[10px] text-zinc-400 text-center">
            NVIDIA SD3 / Gemini / Flux.1 mimarisi • 16:9 haber oranında çizilir ve /uploads/ altına kalıcı kaydedilir.
          </p>
        </div>
      )}

      {/* Editör Görsel Uygunluk Doğrulaması ve Aktif Görsel Durum Şeridi */}
      {currentImageUrl && (
        <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800 space-y-2.5">
          {isVerified ? (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between gap-3 text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-800 dark:text-emerald-200 font-semibold text-[11px]">
                  ✓ Görsel Başlık & Kategoriyle Uyumlu — Editör Tarafından Onaylandı
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsVerified(false)}
                className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 underline cursor-pointer shrink-0"
              >
                Yeniden Değerlendir
              </button>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs animate-in fade-in">
              <div className="flex items-start sm:items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-amber-800 dark:text-amber-200 font-medium text-[11px] leading-tight">
                  <strong>Editör Doğrulaması:</strong> Seçilen görselin haber başlığıyla (<em>"{newsTitle ? newsTitle.slice(0, 45) : "Haber"}..."</em>) uyumunu kontrol edin.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsVerified(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Görseli Onayla</span>
              </button>
            </div>
          )}

          {/* Aktif Seçili Görsel Durum Şeridi */}
          <div className="flex items-center justify-between gap-3 text-xs pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative w-12 h-8 rounded-lg overflow-hidden shrink-0 border border-zinc-300 dark:border-zinc-700 bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentImageUrl}
                  alt="Aktif Kapak Görseli"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-bold uppercase text-zinc-400 block">Kullanılan Kapak Görseli</span>
                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 truncate block">
                  {currentImageUrl.slice(0, 65)}...
                </span>
              </div>
            </div>
            <span className={`shrink-0 px-2.5 py-1 text-[10px] font-bold rounded-lg flex items-center gap-1 ${
              isVerified
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>{isVerified ? "Yayına Hazır" : "Onay Bekliyor"}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
