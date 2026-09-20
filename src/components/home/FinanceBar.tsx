"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { FinanceRate } from "@/types/news";
import { FALLBACK_FINANCE_RATES } from "@/lib/services/finance-service";

interface FinanceBarProps {
  rates?: FinanceRate[];
}

export default function FinanceBar({ rates }: FinanceBarProps) {
  const [currentRates, setCurrentRates] = useState<FinanceRate[]>(
    rates && rates.length > 0 ? rates : FALLBACK_FINANCE_RATES
  );
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchRates = async () => {
      try {
        const res = await fetch("/api/finance");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.rates) && data.rates.length > 0) {
            setCurrentRates(data.rates);
            setIsLive(true);
          }
        }
      } catch {
        // Sessizce mevcut veriyi koru
      }
    };

    fetchRates();

    // 60 saniyede bir kurları güncelle
    const interval = setInterval(fetchRates, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-2xl px-4 py-3 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        {/* Sol Başlık & Canlı Rozeti */}
        <div className="flex items-center gap-2 text-xs font-black uppercase text-zinc-300 shrink-0 border-r border-zinc-800 pr-4">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight tracking-wider">Piyasalar</span>
            <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              {isLive ? "Canlı" : "Güncel"}
            </span>
          </div>
        </div>

        {/* Kurlar Listesi */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth w-full py-0.5">
          {currentRates.map((rate) => (
            <div
              key={rate.code}
              className="flex items-center gap-2.5 shrink-0 text-xs hover:text-white transition group py-1"
            >
              <span className="font-bold text-zinc-400 group-hover:text-zinc-200">
                {rate.name}:
              </span>
              <span className="font-mono font-black text-white tracking-tight">
                {rate.value} {rate.code.includes("BTC") ? "$" : "₺"}
              </span>
              <span
                className={`flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md font-mono ${
                  rate.isUp
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {rate.isUp ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                {rate.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
