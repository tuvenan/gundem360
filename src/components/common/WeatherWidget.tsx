"use client";

import React, { useState, useEffect } from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
} from "lucide-react";
import { WeatherInfo } from "@/types/news";
import { FALLBACK_WEATHER } from "@/lib/services/weather-service";

interface WeatherWidgetProps {
  className?: string;
}

export default function WeatherWidget({ className = "" }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherInfo>(FALLBACK_WEATHER);
  const [selectedCity, setSelectedCity] = useState("istanbul");
  const [cityMenuOpen, setCityMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        const res = await fetch(`/api/weather?city=${selectedCity}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && data.weather) {
            setWeather(data.weather);
          }
        }
      } catch {
        // Hata durumunda mevcut veya fallback veriyi koru
      }
    };

    fetchWeather();
  }, [selectedCity]);

  // Hava durumu koşuluna göre uygun ikonu döner
  const getWeatherIcon = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes("fırtına") || c.includes("şimşek")) {
      return <CloudLightning className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (c.includes("kar")) {
      return <CloudSnow className="w-3.5 h-3.5 text-blue-300" />;
    }
    if (c.includes("sağanak") || c.includes("yağmur")) {
      return <CloudRain className="w-3.5 h-3.5 text-blue-400" />;
    }
    if (c.includes("çise")) {
      return <CloudDrizzle className="w-3.5 h-3.5 text-blue-300" />;
    }
    if (c.includes("bulut")) {
      return <CloudSun className="w-3.5 h-3.5 text-amber-400" />;
    }
    return <Sun className="w-3.5 h-3.5 text-amber-400" />;
  };

  return (
    <div className={`relative inline-flex items-center gap-1.5 text-zinc-300 text-xs ${className}`}>
      {/* Şehir Seçici Açılır Buton */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setCityMenuOpen(!cityMenuOpen)}
          className="flex items-center gap-1 sm:gap-1.5 hover:text-white transition py-0.5 px-1 rounded hover:bg-zinc-800 cursor-pointer text-[11px] sm:text-xs"
          title="Şehir Değiştir"
        >
          <span className="shrink-0">{getWeatherIcon(weather.condition)}</span>
          <span className="font-semibold text-zinc-300 truncate max-w-[65px] sm:max-w-none">{weather.city}:</span>
          <span className="font-mono font-bold text-white shrink-0">{weather.degree}°C</span>
          <span className="text-zinc-400 hidden lg:inline truncate">({weather.condition})</span>
        </button>

        {cityMenuOpen && (
          <div
            className="absolute left-0 top-full mt-1 w-32 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1 z-50 text-xs font-semibold"
            onMouseLeave={() => setCityMenuOpen(false)}
          >
            {[
              { key: "istanbul", name: "İstanbul" },
              { key: "ankara", name: "Ankara" },
              { key: "izmir", name: "İzmir" },
              { key: "antalya", name: "Antalya" },
              { key: "bursa", name: "Bursa" },
              { key: "trabzon", name: "Trabzon" },
            ].map((city) => (
              <button
                key={city.key}
                type="button"
                onClick={() => {
                  setSelectedCity(city.key);
                  setCityMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-zinc-800 transition ${
                  selectedCity === city.key ? "text-red-400 font-bold bg-zinc-800/50" : "text-zinc-300"
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
