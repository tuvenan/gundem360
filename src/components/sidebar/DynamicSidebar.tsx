"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SidebarWidget, DEFAULT_SIDEBAR_WIDGETS } from "@/lib/types/sidebar";
import { NewsItem, Poll, FinanceRate, WeatherInfo } from "@/types/news";
import { INITIAL_FINANCE_RATES } from "@/lib/data/mock-news";
import SafeImage from "@/components/common/SafeImage";
import {
  TrendingUp,
  TrendingDown,
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  DollarSign,
  Vote,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface DynamicSidebarProps {
  widgets?: SidebarWidget[];
  popularNews?: NewsItem[];
  relatedNews?: NewsItem[];
  poll?: Poll | null;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CANLI FİNANS BİLEŞENİ
// ─────────────────────────────────────────────────────────────────────────────
function SidebarFinanceWidget({ title }: { title?: string }) {
  const [rates, setRates] = useState<FinanceRate[]>(INITIAL_FINANCE_RATES.slice(0, 4));
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchFinance = async () => {
      try {
        const res = await fetch("/api/finance", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.rates) && data.rates.length > 0) {
            setRates(data.rates.slice(0, 4));
            setIsLive(true);
          }
        }
      } catch (err) {
        console.error("Sidebar finance fetch failed:", err);
      }
    };

    fetchFinance();
    const interval = setInterval(fetchFinance, 30000); // 30 saniyede bir güncelle
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs">
      <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-2 mb-3.5">
        <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          {title || "Piyasalar & Kurlar"}
        </h3>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          {isLive ? "Canlı" : "Güncel"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {rates.map((rate) => (
          <div
            key={rate.code}
            className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between hover:border-emerald-500/30 transition duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                {rate.name}
              </span>
              <span
                className={`flex items-center text-[10px] font-bold ${
                  rate.isUp ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {rate.isUp ? (
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                )}
                {rate.change}
              </span>
            </div>
            <div className="text-sm font-black font-mono text-zinc-900 dark:text-white mt-1">
              {rate.value} {rate.code === "BIST" ? "" : "₺"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CANLI HAVA DURUMU BİLEŞENİ (3 BÜYÜK ŞEHİR)
// ─────────────────────────────────────────────────────────────────────────────
function SidebarWeatherWidget({ title }: { title?: string }) {
  const [weatherList, setWeatherList] = useState<WeatherInfo[]>([
    { city: "İstanbul", degree: 21, condition: "Açık ve Güneşli" },
    { city: "Ankara", degree: 18, condition: "Parçalı Bulutlu" },
    { city: "İzmir", degree: 24, condition: "Güneşli ve Açık" },
  ]);

  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async () => {
      try {
        const res = await fetch("/api/weather?cities=istanbul,ankara,izmir", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.weatherList) && data.weatherList.length > 0) {
            setWeatherList(data.weatherList);
          }
        }
      } catch (err) {
        console.error("Sidebar weather fetch failed:", err);
      }
    };

    fetchWeather();
    return () => {
      isMounted = false;
    };
  }, []);

  const getWeatherIcon = (cond: string) => {
    const c = (cond || "").toLowerCase();
    if (c.includes("yağmur") || c.includes("sağanak") || c.includes("çise")) {
      return <CloudRain className="w-5 h-5 text-blue-500" />;
    }
    if (c.includes("kar")) {
      return <CloudSnow className="w-5 h-5 text-sky-300" />;
    }
    if (c.includes("fırtına")) {
      return <CloudLightning className="w-5 h-5 text-purple-500" />;
    }
    if (c.includes("bulut")) {
      return <Cloud className="w-5 h-5 text-slate-400" />;
    }
    if (c.includes("parçalı")) {
      return <CloudSun className="w-5 h-5 text-amber-500" />;
    }
    return <Sun className="w-5 h-5 text-amber-400" />;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs">
      <div className="flex items-center justify-between border-b-2 border-sky-500 pb-2 mb-3.5">
        <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5">
          <CloudSun className="w-4 h-4 text-sky-500" />
          {title || "Hava Durumu"}
        </h3>
        <span className="text-[10px] text-zinc-400 font-bold uppercase">Anlık</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {weatherList.map((item) => (
          <div
            key={item.city}
            className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 flex flex-col items-center gap-1 hover:border-sky-500/30 transition duration-200"
          >
            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
              {item.city}
            </span>
            <div className="my-0.5">{getWeatherIcon(item.condition)}</div>
            <span className="text-sm font-black text-zinc-900 dark:text-white font-mono">
              {item.degree}°C
            </span>
            <span className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate max-w-full font-medium">
              {item.condition}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. İNTERAKTİF ANKET BİLEŞENİ
// ─────────────────────────────────────────────────────────────────────────────
function SidebarPollWidget({
  initialPoll,
  title,
}: {
  initialPoll: Poll | null;
  title?: string;
}) {
  const [poll, setPoll] = useState<Poll | null>(initialPoll);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (initialPoll) {
      setPoll(initialPoll);
      try {
        const stored = localStorage.getItem(`voted_poll_${initialPoll.id}`);
        const storedOpt = localStorage.getItem(`voted_option_${initialPoll.id}`);
        if (stored === "true") {
          setHasVoted(true);
          setVotedOptionId(storedOpt);
          setShowResults(true);
        }
      } catch {}
    } else {
      // Eğer prop gelmediyse API'den öne çıkan anketi çek
      fetch("/api/polls?featured=true")
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data && data.id) {
            setPoll(data);
            try {
              const stored = localStorage.getItem(`voted_poll_${data.id}`);
              const storedOpt = localStorage.getItem(`voted_option_${data.id}`);
              if (stored === "true") {
                setHasVoted(true);
                setVotedOptionId(storedOpt);
                setShowResults(true);
              }
            } catch {}
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [initialPoll]);

  if (!poll) return null;

  const totalVotes = poll.totalVotes || 0;

  const handleVote = async () => {
    if (!selectedOptionId || submitting || hasVoted) return;

    setSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: poll.id, optionId: selectedOptionId }),
      });

      const data = await res.json();
      if (res.ok && data.poll) {
        setPoll(data.poll);
        setHasVoted(true);
        setVotedOptionId(selectedOptionId);
        setShowResults(true);
        try {
          localStorage.setItem(`voted_poll_${poll.id}`, "true");
          localStorage.setItem(`voted_option_${poll.id}`, selectedOptionId);
        } catch {}
      } else {
        setStatusMsg(data.error || "Oy kaydedilemedi.");
      }
    } catch {
      setStatusMsg("Sunucuya bağlanılamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs">
      <div className="flex items-center justify-between border-b-2 border-purple-600 pb-2 mb-3.5">
        <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5">
          <Vote className="w-4 h-4 text-purple-600" />
          {title || "Günün Anketi"}
        </h3>
        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
          {totalVotes.toLocaleString("tr-TR")} Oy
        </span>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-snug">
          {poll.question}
        </p>

        {statusMsg && (
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[11px] font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {!showResults && !hasVoted ? (
          // Oylama Modu
          <div className="space-y-2 pt-1">
            {poll.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-center gap-2.5 ${
                    isSelected
                      ? "border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200"
                      : "border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                      isSelected ? "border-purple-600 bg-purple-600" : "border-zinc-300 dark:border-zinc-600"
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs font-semibold line-clamp-2 leading-tight">
                    {opt.text}
                  </span>
                </button>
              );
            })}

            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={handleVote}
                disabled={!selectedOptionId || submitting}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  selectedOptionId && !submitting
                    ? "bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                }`}
              >
                <Vote className="w-3.5 h-3.5" />
                {submitting ? "Oylanıyor..." : "Oy Ver"}
              </button>

              <button
                type="button"
                onClick={() => setShowResults(true)}
                className="px-3 py-2 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
              >
                Sonuçlar
              </button>
            </div>
          </div>
        ) : (
          // Sonuçlar Modu
          <div className="space-y-2 pt-1">
            {poll.options.map((opt) => {
              const percent =
                totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              const isVoted = votedOptionId === opt.id;

              return (
                <div
                  key={opt.id}
                  className={`p-2.5 rounded-xl border relative overflow-hidden ${
                    isVoted
                      ? "border-purple-500/50 bg-purple-50/30 dark:bg-purple-950/20"
                      : "border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40"
                  }`}
                >
                  {/* Arka plan doluluk çubuğu */}
                  <div
                    className="absolute inset-y-0 left-0 bg-purple-500/10 dark:bg-purple-500/20 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />

                  <div className="relative z-10 flex items-center justify-between text-xs gap-2">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1 flex items-center gap-1">
                      {opt.text}
                      {isVoted && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 inline shrink-0" />
                      )}
                    </span>
                    <span className="text-[11px] font-black font-mono text-purple-700 dark:text-purple-300 shrink-0">
                      %{percent}
                    </span>
                  </div>
                </div>
              );
            })}

            {!hasVoted && (
              <button
                type="button"
                onClick={() => setShowResults(false)}
                className="w-full text-center py-1.5 text-[11px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 transition"
              >
                Oy Kullanımına Dön
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANA DİNAMİK SİDEBAR BİLEŞENİ
// ─────────────────────────────────────────────────────────────────────────────
export default function DynamicSidebar({
  widgets = DEFAULT_SIDEBAR_WIDGETS,
  popularNews = [],
  relatedNews = [],
  poll = null,
  className = "space-y-6",
}: DynamicSidebarProps) {
  const activeWidgets = (widgets && widgets.length > 0 ? widgets : DEFAULT_SIDEBAR_WIDGETS)
    .filter((w) => w.isVisible)
    .sort((a, b) => a.order - b.order);

  // Çok okunanlar için liste kaynağı
  const displayNews =
    popularNews.length > 0
      ? popularNews
      : relatedNews.length > 0
      ? relatedNews
      : [];

  return (
    <aside className={className}>
      {activeWidgets.map((widget) => {
        switch (widget.type) {
          // 1. ÇOK OKUNANLAR / İLGİLİ HABERLER
          case "most-read": {
            const limit = widget.config?.itemCount || 5;
            const items = displayNews.slice(0, limit);

            if (items.length === 0) return null;

            return (
              <div
                key={widget.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs"
              >
                <div className="flex items-center justify-between border-b-2 border-red-600 pb-2 mb-4">
                  <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-red-600" />
                    {widget.title || "Çok Okunan Haberler"}
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    Günün Trendi
                  </span>
                </div>

                <div className="space-y-3.5">
                  {items.map((item, idx) => (
                    <Link
                      key={item.id}
                      href={`/haber/${item.slug}`}
                      className="group flex items-start gap-3 p-1.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition"
                    >
                      {/* Sıralama Rozeti */}
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                          idx === 0
                            ? "bg-red-600 text-white shadow-xs"
                            : idx === 1
                            ? "bg-amber-500 text-white"
                            : idx === 2
                            ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {idx + 1}
                      </span>

                      {/* Küçük Görsel — Güvenli Fallback ile */}
                      <div className="relative w-16 aspect-4/3 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60">
                        <SafeImage
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="64px"
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>

                      {/* Başlık ve Bilgi */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1">
                          <span className="truncate">{item.categoryTitle}</span>
                          <span>•</span>
                          <span>{item.views?.toLocaleString("tr-TR")} okuma</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          // 2. PİYASALAR & CANLI KURLAR (CANLI API BAĞLANTILI)
          case "finance": {
            return (
              <SidebarFinanceWidget
                key={widget.id}
                title={widget.title}
              />
            );
          }

          // 3. CANLI HAVA DURUMU (CANLI API BAĞLANTILI - 3 BÜYÜK ŞEHİR)
          case "weather": {
            return (
              <SidebarWeatherWidget
                key={widget.id}
                title={widget.title}
              />
            );
          }

          // 4. ANKET & KAMUOYU YOKLAMASI (İNTERAKTİF OYLAMA DESTEKLİ)
          case "poll": {
            return (
              <SidebarPollWidget
                key={widget.id}
                initialPoll={poll}
                title={widget.title}
              />
            );
          }

          // 5. SPONSOR / REKLAM BANNER'I
          case "banner": {
            const imageUrl =
              widget.config?.imageUrl ||
              "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80";
            const targetUrl = widget.config?.targetUrl || "https://gundem360.com";
            const altText = widget.config?.altText || "Sponsor Reklamı";

            return (
              <div
                key={widget.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xs group"
              >
                <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  <span>Sponsorlu İçerik</span>
                  <ExternalLink className="w-3 h-3" />
                </div>

                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative aspect-16/9 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800"
                >
                  <SafeImage
                    src={imageUrl}
                    alt={altText}
                    fill
                    sizes="(max-width: 1024px) 100vw, 30vw"
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      İncele <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              </div>
            );
          }

          // 6. ÖZEL HTML / DUYURU ALANI
          case "custom-html": {
            const content = widget.config?.htmlContent;
            if (!content) return null;

            return (
              <div
                key={widget.id}
                className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xs"
              >
                <div
                  dangerouslySetInnerHTML={{ __html: content }}
                  className="overflow-hidden"
                />
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </aside>
  );
}
