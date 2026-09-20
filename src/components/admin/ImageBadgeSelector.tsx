"use client";

import React from "react";
import Image from "next/image";
import { Award, Palette, X, Sparkles, Eye } from "lucide-react";
import NewsImageBadge, {
  BADGE_COLOR_PALETTE,
  PRESET_BADGE_TEXTS,
} from "@/components/common/NewsImageBadge";

interface ImageBadgeSelectorProps {
  badgeText: string;
  badgeColor: string;
  imageUrl?: string;
  onTextChange: (text: string) => void;
  onColorChange: (color: string) => void;
}

export default function ImageBadgeSelector({
  badgeText,
  badgeColor,
  imageUrl,
  onTextChange,
  onColorChange,
}: ImageBadgeSelectorProps) {
  const selectedColor = badgeColor || "bg-red-600";
  const hasBadge = Boolean(badgeText && badgeText.trim());

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-600/10 text-red-600 dark:text-red-400 rounded-lg">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider">
              Görsel Üzeri Rozet / Etiket Ayarları
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Haberin manşet ve vitrin görsellerinin üzerine şık bir rozet ekleyin
            </p>
          </div>
        </div>

        {hasBadge && (
          <button
            type="button"
            onClick={() => onTextChange("")}
            className="flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900/50 transition"
          >
            <X className="w-3.5 h-3.5" /> Rozeti Kaldır
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Sol Alan: Seçimler (8 Kolon) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Hızlı Rozet Seçenekleri */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-2">
              Hazır Rozet Şablonları
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onTextChange("")}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                  !hasBadge
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Yok (Rozetsiz)
              </button>
              {PRESET_BADGE_TEXTS.map((preset) => {
                const isSelected = badgeText?.trim() === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      onTextChange(preset);
                      // Otomatik uygun renk önerisi
                      if (!badgeColor) {
                        if (preset.includes("FLAŞ") || preset.includes("SON DAKİKA")) {
                          onColorChange("bg-amber-500");
                        } else if (preset.includes("ÖZEL")) {
                          onColorChange("bg-red-600");
                        } else if (preset.includes("ANALİZ")) {
                          onColorChange("bg-blue-600");
                        }
                      }
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                      isSelected
                        ? "bg-red-600 text-white border-red-600 shadow-xs"
                        : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-red-400 dark:hover:border-red-600"
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Serbest Metin Girişi */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-1.5">
              Özel Rozet Metni (İsteğe Bağlı)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Örn: ÖZEL DOSYA, DÜNYA KUPASI, CANLI AKTARIM..."
                value={badgeText}
                onChange={(e) => onTextChange(e.target.value)}
                maxLength={25}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white uppercase focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              {badgeText && (
                <span className="absolute right-3 top-2.5 text-[10px] text-zinc-400 font-mono">
                  {badgeText.length}/25
                </span>
              )}
            </div>
          </div>

          {/* Renk Paleti */}
          {hasBadge && (
            <div className="pt-1">
              <label className="block text-[11px] font-bold uppercase text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-zinc-500" />
                Rozet Rengi Seçimi
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BADGE_COLOR_PALETTE.map((c) => {
                  const isSelected = selectedColor === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => onColorChange(c.value)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                        isSelected
                          ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 ring-2 ring-red-500/20"
                          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md ${c.value} border border-black/10 shrink-0 shadow-xs`}
                      />
                      <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1">
                        {c.label.split(" (")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sağ Alan: Canlı Görsel Önizleme (4 Kolon) */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-red-500" /> Canlı Önizleme
            </span>
            <span className="text-[10px] text-zinc-400">Vitrin / Kart</span>
          </div>

          <div className="relative aspect-16/10 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 shadow-inner">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Önizleme"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-zinc-500 text-xs">
                Görsel Yok
              </div>
            )}

            {/* Rozet Önizleme */}
            {hasBadge ? (
              <NewsImageBadge
                text={badgeText}
                color={selectedColor}
                size="sm"
                position="top-left"
              />
            ) : (
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-zinc-300 text-[10px] px-2 py-0.5 rounded-sm">
                Rozetsiz
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <div className="h-2 w-3/4 bg-white/30 rounded-xs mb-1" />
              <div className="h-1.5 w-1/2 bg-white/20 rounded-xs" />
            </div>
          </div>

          <p className="text-[10px] text-zinc-400 text-center leading-tight">
            {hasBadge
              ? `Rozet aktif: "${badgeText.trim()}"`
              : "Rozet eklenmedi, standart görünüm uygulanacak."}
          </p>
        </div>
      </div>
    </div>
  );
}
