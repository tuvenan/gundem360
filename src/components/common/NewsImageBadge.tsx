import React from "react";
import { Zap, Flame, Sparkles, Award } from "lucide-react";

export interface NewsImageBadgeProps {
  text?: string | null;
  color?: string | null;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "relative";
}

export const BADGE_COLOR_PALETTE = [
  { label: "Kırmızı (Son Dakika/Flaş)", value: "bg-red-600", textClass: "text-white" },
  { label: "Sarı / Turuncu (Öne Çıkan)", value: "bg-amber-500", textClass: "text-black" },
  { label: "Mavi (Özel Haber/Analiz)", value: "bg-blue-600", textClass: "text-white" },
  { label: "Mor (Kültür/Dosya)", value: "bg-purple-600", textClass: "text-white" },
  { label: "Yeşil (Ekonomi/Başarı)", value: "bg-emerald-600", textClass: "text-white" },
  { label: "Koyu Siyah (Ağırbaşlı/Resmi)", value: "bg-zinc-950/90", textClass: "text-white" },
];

export const PRESET_BADGE_TEXTS = [
  "FLAŞ HABER",
  "SON DAKİKA",
  "ÖZEL HABER",
  "MANŞET",
  "GÜNDEM",
  "ANALİZ",
  "ÖZEL RÖPORTAJ",
  "DOSYA HABER",
  "CANLI",
  "VİDEO HABER",
];

export default function NewsImageBadge({
  text,
  color = "bg-red-600",
  className = "",
  size = "sm",
  position = "top-left",
}: NewsImageBadgeProps) {
  if (!text || !text.trim() || text.trim().toLowerCase() === "yok") {
    return null;
  }

  const cleanText = text.trim();
  const upper = cleanText.toUpperCase();
  const resolvedColor = color || "bg-red-600";
  const isAmber = resolvedColor.includes("amber") || resolvedColor.includes("yellow");
  const textColor = isAmber ? "text-zinc-950 font-black" : "text-white font-black";

  // Konumlandırma sınıfları
  const positionClasses = {
    "top-left": "absolute top-2.5 left-2.5 z-10",
    "top-right": "absolute top-2.5 right-2.5 z-10",
    "bottom-left": "absolute bottom-2.5 left-2.5 z-10",
    "bottom-right": "absolute bottom-2.5 right-2.5 z-10",
    relative: "relative inline-flex",
  }[position];

  // Boyutlandırma sınıfları
  const sizeClasses = {
    xs: "text-[9px] px-1.5 py-0.5 rounded-sm gap-1 tracking-wider",
    sm: "text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md gap-1 tracking-wider shadow-sm",
    md: "text-xs sm:text-sm px-3 py-1 sm:py-1.5 rounded-md gap-1.5 tracking-wide shadow-md",
    lg: "text-sm sm:text-base px-3.5 py-1.5 rounded-lg gap-2 tracking-wide shadow-lg",
  }[size];

  // İkon seçimi
  const isBreaking = upper.includes("FLAŞ") || upper.includes("SON DAKİKA") || upper.includes("CANLI");
  const isSpecial = upper.includes("ÖZEL") || upper.includes("RÖPORTAJ");
  const isAnalysis = upper.includes("ANALİZ") || upper.includes("DOSYA");

  return (
    <span
      className={`inline-flex items-center uppercase font-black select-none backdrop-blur-md border border-white/25 drop-shadow-md transition-transform duration-300 hover:scale-105 ${positionClasses} ${resolvedColor} ${textColor} ${sizeClasses} ${className}`}
    >
      {isBreaking ? (
        <Zap className="w-3 h-3 fill-current shrink-0 animate-pulse" />
      ) : isSpecial ? (
        <Flame className="w-3 h-3 fill-current shrink-0" />
      ) : isAnalysis ? (
        <Sparkles className="w-3 h-3 shrink-0" />
      ) : (
        <Award className="w-3 h-3 shrink-0" />
      )}
      <span className="truncate">{cleanText}</span>
    </span>
  );
}
