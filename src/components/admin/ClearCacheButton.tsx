"use client";

import React, { useState } from "react";
import { RotateCcw, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface ClearCacheButtonProps {
  variant?: "header" | "card" | "button";
  className?: string;
}

export default function ClearCacheButton({
  variant = "header",
  className = "",
}: ClearCacheButtonProps) {
  const [isClearing, setIsClearing] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleClearCache = async () => {
    if (isClearing) return;
    setIsClearing(true);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/clear-cache", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setNotification({
          type: "success",
          message: data.message || "Önbellek başarıyla temizlendi ve site güncellendi.",
        });
      } else {
        setNotification({
          type: "error",
          message: data.error || "Önbellek temizlenirken bir hata oluştu.",
        });
      }
    } catch {
      setNotification({
        type: "error",
        message: "Sunucu bağlantı hatası oluştu.",
      });
    } finally {
      setIsClearing(false);
      setTimeout(() => {
        setNotification(null);
      }, 4000);
    }
  };

  if (variant === "card") {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
              <RotateCcw className={`w-5 h-5 ${isClearing ? "animate-spin" : ""}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Önbellek ve Performans Yönetimi</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                  Canlı
                </span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Next.js sunucu önbelleğini sıfırlayarak tüm haber, anket, kategori ve ayar değişikliklerinin anında ziyaretçilere yansımasını sağlar.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearCache}
            disabled={isClearing}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer shadow-sm"
          >
            <RotateCcw className={`w-4 h-4 ${isClearing ? "animate-spin" : ""}`} />
            <span>{isClearing ? "Temizleniyor..." : "Önbelleği Temizle"}</span>
          </button>
        </div>

        {notification && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}
      </div>
    );
  }

  // Header veya standart buton görünümü
  return (
    <>
      <button
        type="button"
        onClick={handleClearCache}
        disabled={isClearing}
        title="Tüm site önbelleğini sıfırla ve sayfaları yenile"
        className={`text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg disabled:opacity-50 cursor-pointer ${className}`}
      >
        <RotateCcw
          className={`w-3.5 h-3.5 text-red-600 dark:text-red-400 ${
            isClearing ? "animate-spin" : ""
          }`}
        />
        <span className="hidden sm:inline">
          {isClearing ? "Temizleniyor..." : "Önbelleği Temizle"}
        </span>
        <span className="sm:hidden">
          {isClearing ? "..." : "Önbellek"}
        </span>
      </button>

      {/* Floating Bildirim Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-bold border backdrop-blur-md ${
              notification.type === "success"
                ? "bg-zinc-900/95 text-white border-zinc-700"
                : "bg-red-900/95 text-white border-red-700"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </>
  );
}
