"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NewsItem } from "@/types/news";
import {
  Save,
  CheckCircle,
  Flame,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  RotateCcw,
  ExternalLink,
  Move,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface MansetlerClientProps {
  initialNews: NewsItem[];
}

export default function MansetlerClient({ initialNews }: MansetlerClientProps) {
  const router = useRouter();

  // 1'den 10'a kadar sıralanmış slotlar
  const initialSlots: (NewsItem | null)[] = Array.from({ length: 10 }, (_, i) => {
    const order = i + 1;
    const found = initialNews.find(
      (n) => n.headlineType === "main" && n.headlineOrder === order
    );
    return found || null;
  });

  const [slots, setSlots] = useState<(NewsItem | null)[]>(initialSlots);
  const [allNews] = useState<NewsItem[]>(initialNews);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // Sürükle-bırak durumları
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // API'ye kaydetme fonksiyonu
  const saveOrderToApi = async (updatedSlots: (NewsItem | null)[]) => {
    setSaving(true);
    try {
      const orderedIds = updatedSlots.map((item) => (item ? item.id : null));

      const res = await fetch("/api/headlines", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });

      if (!res.ok) {
        throw new Error("Kayıt başarısız");
      }

      setSavedMsg(true);
      router.refresh();
      setTimeout(() => setSavedMsg(false), 3500);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // --- SÜRÜKLE & BIRAK OLAYLARI ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent, index: number) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData("text/plain");
    const sourceIndex =
      draggedIndex !== null ? draggedIndex : parseInt(sourceIndexStr, 10);

    if (isNaN(sourceIndex) || sourceIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Sürüklenen öğeyi listeden çıkarıp hedef konuma ekleme
    const newSlots = [...slots];
    const [movedItem] = newSlots.splice(sourceIndex, 1);
    newSlots.splice(targetIndex, 0, movedItem);

    setSlots(newSlots);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Otomatik olarak veritabanına kaydet ve anında ana sayfada güncelle
    await saveOrderToApi(newSlots);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // --- OKLARLA TEK ADIM TAŞIMA ---
  const handleMoveStep = async (currentIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= 10) return;

    const newSlots = [...slots];
    const temp = newSlots[currentIndex];
    newSlots[currentIndex] = newSlots[targetIndex];
    newSlots[targetIndex] = temp;

    setSlots(newSlots);
    await saveOrderToApi(newSlots);
  };

  // --- SLOTA FARKLI BİR HABER SEÇME ---
  const handleSelectNews = async (slotIndex: number, newsId: string) => {
    let newSlots = [...slots];
    if (!newsId) {
      newSlots[slotIndex] = null;
    } else {
      const selectedItem = allNews.find((n) => n.id === newsId);
      if (!selectedItem) return;

      // Eğer seçilen haber başka bir slotta varsa oradan temizle
      for (let i = 0; i < newSlots.length; i++) {
        if (newSlots[i]?.id === newsId && i !== slotIndex) {
          newSlots[i] = null;
        }
      }
      newSlots[slotIndex] = selectedItem;
    }

    setSlots(newSlots);
    await saveOrderToApi(newSlots);
  };

  // --- SLOTU TEMİZLE ---
  const handleClearSlot = async (slotIndex: number) => {
    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    setSlots(newSlots);
    await saveOrderToApi(newSlots);
  };

  // --- İPTAL ET / İLK HALİNE DÖNDÜR ---
  const handleReset = async () => {
    setSlots(initialSlots);
    await saveOrderToApi(initialSlots);
  };

  // --- MANUEL KAYDET BUTONU ---
  const handleManualSave = async () => {
    await saveOrderToApi(slots);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Üst Karşılama ve Aksiyon Butonları */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-red-600/10 text-red-600 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-red-600" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              Manşet Sıralayıcı (1 - 10)
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-zinc-400" />
            Sürükleyip bıraktığınız anda yeni sıralama otomatik kaydedilir ve ana sayfada yayına girer.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            title="Varsayılan sıralamaya dön"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sıfırla</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition border border-zinc-200 dark:border-zinc-700 shadow-xs"
          >
            <span>Ana Sayfada Canlı Gör</span>
            <ExternalLink className="w-3.5 h-3.5 text-red-600" />
          </Link>

          <button
            onClick={handleManualSave}
            disabled={saving}
            className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Kaydediliyor..." : "Sıralamayı Kaydet"}</span>
          </button>
        </div>
      </div>

      {/* Kaydedildi Bildirimi */}
      {savedMsg && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl shadow-xs transition animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 font-medium">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Manşet sıralaması anında güncellendi! Ana sayfadaki 1-10 manşet vitrini yenilendi.</span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="underline font-bold hover:text-emerald-950 dark:hover:text-emerald-100 ml-4 shrink-0 flex items-center gap-1"
          >
            <span>Ana Sayfayı Aç</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* İpucu Kutusu */}
      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-red-500 shrink-0" />
          <span>
            <strong>Otomatik Kayıt:</strong> Bir manşet kartını tutup istediğiniz sıraya sürükleyin. Bıraktığınız anda değişiklik kaydedilir ve ana sayfadaki 1-10 slider'a anında yansır.
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium text-zinc-400">
          <span className="flex items-center gap-1">
            <GripVertical className="w-3.5 h-3.5" /> Sürükle & Bırak
          </span>
          <span className="flex items-center gap-1">
            <ChevronUp className="w-3.5 h-3.5" /> Tek Adım Kaydır
          </span>
        </div>
      </div>

      {/* 10 Manşet Slotu (Sürükle & Bırak Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slots.map((assignedNews, index) => {
          const slotNum = index + 1;
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index && draggedIndex !== index;

          return (
            <div
              key={assignedNews ? `news-${assignedNews.id}` : `slot-${slotNum}`}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={(e) => handleDragLeave(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative p-4 rounded-2xl border transition-all duration-200 select-none flex flex-col justify-between group ${
                isDragging
                  ? "opacity-30 scale-[0.98] border-dashed border-red-500 bg-red-50/20 dark:bg-red-950/20 shadow-none cursor-grabbing"
                  : isDragOver
                  ? "ring-2 ring-red-500 border-red-500 bg-red-50/60 dark:bg-red-950/40 shadow-lg scale-[1.01] cursor-pointer"
                  : assignedNews
                  ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs cursor-grab active:cursor-grabbing"
                  : "bg-zinc-50/80 dark:bg-zinc-950 border-dashed border-zinc-300 dark:border-zinc-800 cursor-grab"
              }`}
            >
              {/* Sürükleme hedefi göstergesi */}
              {isDragOver && (
                <div className="absolute inset-0 z-20 rounded-2xl border-2 border-red-500 bg-red-500/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                  <div className="bg-red-600 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
                    <Move className="w-3.5 h-3.5" />
                    <span>Slot #{slotNum} Konumuna Yerleştir</span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-start gap-3">
                  {/* Sürükleme Tutamacı (Grip) */}
                  <div
                    className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition shrink-0"
                    title="Sürükleyip sırasını değiştirin"
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Numara Rozeti ve Tek Tıkla Taşıma Kontrolleri */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div
                      className={`w-9 h-9 rounded-xl text-white font-black text-base flex items-center justify-center font-mono shadow-xs ${
                        slotNum === 1
                          ? "bg-red-600 ring-2 ring-red-500/30"
                          : "bg-zinc-800 dark:bg-zinc-700"
                      }`}
                    >
                      {slotNum}
                    </div>

                    {/* Hızlı Yukarı / Aşağı Adım Butonları */}
                    <div className="flex flex-col gap-0.5 opacity-60 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveStep(index, "up");
                        }}
                        disabled={index === 0}
                        title="Bir basamak yukarı taşı"
                        className="p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveStep(index, "down");
                        }}
                        disabled={index === 9}
                        title="Bir basamak aşağı taşı"
                        className="p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* İçerik Bilgisi */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Slot #{slotNum}{" "}
                        {slotNum === 1 && (
                          <span className="text-red-600 font-extrabold ml-1">
                            ★ (Açılış Manşeti)
                          </span>
                        )}
                      </span>

                      {assignedNews && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearSlot(index);
                          }}
                          className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition p-1 cursor-pointer"
                          title="Bu slotu temizle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {assignedNews ? (
                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 leading-snug">
                          {assignedNews.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                          <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
                            {assignedNews.categoryTitle}
                          </span>
                          <span>•</span>
                          <span>{assignedNews.views.toLocaleString("tr-TR")} okunma</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 italic py-1">
                        Bu slot boş. Aşağıdan bir haber seçin veya başka bir kartı buraya sürükleyin.
                      </p>
                    )}
                  </div>

                  {/* Küçük Kapak Fotoğrafı */}
                  {assignedNews && (
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/60 dark:border-zinc-700/60">
                      <Image
                        src={assignedNews.imageUrl}
                        alt={assignedNews.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Slot Haberi Değiştirme Açılır Menüsü */}
              <div
                className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-[11px] font-semibold text-zinc-500 shrink-0">
                  Değiştir:
                </span>
                <select
                  value={assignedNews?.id || ""}
                  onChange={(e) => handleSelectNews(index, e.target.value)}
                  className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-red-500 truncate"
                >
                  <option value="">-- Haber Seçin (veya Boşalt) --</option>
                  {allNews.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.categoryTitle}] {item.title.slice(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
