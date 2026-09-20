"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { FinanceRate } from "@/types/news";
import { FALLBACK_FINANCE_RATES } from "@/lib/services/finance-service";

interface FinanceTickerProps {
  className?: string;
}

export default function FinanceTicker({ className = "" }: FinanceTickerProps) {
  const [rates, setRates] = useState<FinanceRate[]>(FALLBACK_FINANCE_RATES);

  useEffect(() => {
    let isMounted = true;
    const fetchRates = async () => {
      try {
        const res = await fetch("/api/finance");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.rates) && data.rates.length > 0) {
            setRates(data.rates);
          }
        }
      } catch {
        // Fallback veriyi koru
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={`flex items-center space-x-2 sm:space-x-3 overflow-x-auto py-0.5 no-scrollbar scroll-smooth whitespace-nowrap max-w-full ${className}`}
    >
      {rates.map((rate) => (
        <div
          key={rate.code}
          className="flex items-center gap-1 sm:gap-1.5 shrink-0 font-mono text-xs"
        >
          <span className="text-zinc-400 font-sans font-medium text-[11px] sm:text-xs truncate">
            {rate.code === "GAU/TRY" ? (
              <>
                <span className="hidden sm:inline">Gram </span>Altın:
              </>
            ) : rate.code === "BIST100" ? (
              <>
                BIST<span className="hidden sm:inline"> 100</span>:
              </>
            ) : (
              `${rate.name}:`
            )}
          </span>
          <span className="font-bold text-white text-[11px] sm:text-xs">{rate.value}</span>
          <span
            className={`flex items-center text-[10px] font-semibold ${
              rate.isUp ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {rate.isUp ? (
              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mr-0.5 shrink-0" />
            ) : (
              <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mr-0.5 shrink-0" />
            )}
            {rate.change}
          </span>
        </div>
      ))}
    </div>
  );
}
