"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Link as LinkIcon,
  Trash2,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
}

export default function ImageUploader({
  value,
  onChange,
  label = "Kapak Görseli",
  required = false,
}: ImageUploaderProps) {
  const [mode, setMode] = useState<"upload" | "url">(
    value && !value.startsWith("/uploads/") && !value.startsWith("data:") ? "url" : "upload"
  );
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setError(null);
    setSuccess(null);

    if (!file.type.startsWith("image/")) {
      setError("Lütfen geçerli bir görsel dosyası seçin (JPG, PNG, WEBP, GIF, vb.).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Görsel boyutu en fazla 10MB olabilir.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        onChange(data.url);
        setSuccess("Görsel başarıyla yüklendi!");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        // Sunucu hatası varsa yedek olarak Base64'e dönüştür
        console.warn("Sunucu yüklemesi başarısız, Base64 yedeği kullanılıyor:", data.error);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            onChange(reader.result);
            setSuccess("Görsel yerel olarak kaydedildi!");
            setTimeout(() => setSuccess(null), 3000);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Yükleme hatası:", err);
      // Ağ hatasında da Base64 yedeği
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          onChange(reader.result);
          setSuccess("Görsel yerel olarak kaydedildi!");
          setTimeout(() => setSuccess(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const isLocalUpload = value?.startsWith("/uploads/");
  const isBase64 = value?.startsWith("data:image");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {/* Mod Değiştirici Sekmeler */}
        <div className="inline-flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
              mode === "upload"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Dosyadan Yükle</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
              mode === "url"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Görsel URL</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* 1. Dosya Yükleme Alanı */}
      {mode === "upload" && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            onChange={handleInputChange}
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[140px] ${
              isDragging
                ? "border-red-500 bg-red-50/50 dark:bg-red-950/20"
                : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-950/50"
            } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Görsel yükleniyor ve sunucuya kaydediliyor...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400 mb-1">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Görseli buraya sürükleyip bırakın veya{" "}
                    <span className="text-red-600 dark:text-red-400 underline">dosya seçin</span>
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    PNG, JPG, WEBP, GIF (Maks. 10 MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. URL Giriş Alanı */}
      {mode === "url" && (
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <LinkIcon className="w-4 h-4" />
            </div>
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://images.unsplash.com/... veya görsel web bağlantısı"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            İnternetten doğrudan bir görsel URL&apos;si yapıştırabilirsiniz.
          </p>
        </div>
      )}

      {/* Önizleme Alanı */}
      {value && (
        <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-700 dark:text-zinc-300">Seçilen Görsel:</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isLocalUpload
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : isBase64
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                }`}
              >
                {isLocalUpload ? "📁 Yüklenen Dosya" : isBase64 ? "⚡ Yerel Görsel" : "🔗 Web URL"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (mode === "upload") {
                    fileInputRef.current?.click();
                  } else {
                    onChange("");
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-200/60 dark:bg-zinc-800 rounded hover:bg-zinc-200 transition"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Değiştir</span>
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/50 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition"
              >
                <Trash2 className="w-3 h-3" />
                <span>Kaldır</span>
              </button>
            </div>
          </div>

          {/* 16:9 Görsel Önizleme */}
          <div className="relative aspect-16/9 w-full max-w-md rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
            <Image
              src={value}
              alt="Önizleme"
              fill
              sizes="(max-width: 768px) 100vw, 450px"
              className="object-cover"
              onError={() => setError("Görsel yüklenemedi. Lütfen bağlantıyı veya dosyayı kontrol edin.")}
            />
          </div>

          <div className="text-[11px] text-zinc-400 font-mono truncate max-w-full" title={value}>
            {value}
          </div>
        </div>
      )}
    </div>
  );
}
