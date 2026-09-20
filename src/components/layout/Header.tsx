"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  CloudSun,
  Clock,
  Search,
  Menu,
  X,
  ShieldCheck,
  Flame,
  Camera,
  Video,
} from "lucide-react";
import { CATEGORIES } from "@/lib/data/mock-news";
import WeatherWidget from "@/components/common/WeatherWidget";
import FinanceTicker from "@/components/common/FinanceTicker";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [categoriesList, setCategoriesList] = useState(CATEGORIES);
  const [showWeatherWidget, setShowWeatherWidget] = useState(true);
  const [showFinanceBar, setShowFinanceBar] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategoriesList(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          if (typeof data.showWeatherWidget === "boolean") {
            setShowWeatherWidget(data.showWeatherWidget);
          }
          if (typeof data.showFinanceBar === "boolean") {
            setShowFinanceBar(data.showFinanceBar);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const date = new Date().toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(date);
  }, []);

  return (
    <header className="w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-xs">
      {/* 1. TOP BAR: Finans, Hava Durumu, Tarih */}
      {(showWeatherWidget || showFinanceBar) && (
        <div className="bg-zinc-900 text-zinc-200 text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            {/* Sol: Tarih ve Hava */}
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                <span>{currentDate || "Güncel"}</span>
              </span>
              {showWeatherWidget && <WeatherWidget />}
            </div>

            {/* Sağ: Canlı Finans Kurları */}
            {showFinanceBar && <FinanceTicker />}
          </div>
        </div>
      )}

      {/* 2. MAIN LOGO & ACTIONS BAR */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-red-600 text-white font-black px-2.5 py-1 text-xl rounded-sm tracking-tighter flex items-center gap-1 group-hover:bg-red-700 transition">
            <Flame className="w-5 h-5 fill-white" />
            <span>GÜNDEM</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            360<span className="text-red-600">.</span>
          </span>
          <span className="hidden md:inline-block text-[11px] font-medium text-zinc-500 border-l border-zinc-300 dark:border-zinc-700 pl-2">
            Hızlı, Tarafsız & Doğru Haber
          </span>
        </Link>

        {/* Search & Admin Quick Action */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Haber veya konu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 lg:w-72 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs px-3 py-2 pr-8 rounded-full border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute right-2.5 top-2.5" />
          </div>


          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-700 dark:text-zinc-300 hover:text-black"
            aria-label="Menü"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 3. CATEGORIES NAVIGATION BAR */}
      <nav className="bg-red-700 text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1 sm:space-x-2 py-1 shrink-0 text-xs sm:text-sm font-bold uppercase tracking-wide">
            <Link
              href="/"
              className="px-3 py-2 hover:bg-red-800 rounded transition whitespace-nowrap bg-red-800/60"
            >
              Ana Sayfa
            </Link>
            {categoriesList.map((cat) => (
              <Link
                key={cat.key}
                href={cat.href}
                className="px-3 py-2 hover:bg-red-800 rounded transition whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/#yazarlar"
              className="px-3 py-2 hover:bg-red-800 rounded transition whitespace-nowrap text-amber-200"
            >
              Yazarlar
            </Link>
            <Link
              href="/foto-galeri"
              className="px-3 py-2 hover:bg-red-800 rounded transition whitespace-nowrap text-amber-300 font-extrabold flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Foto Galeri</span>
            </Link>
            <Link
              href="/video-galeri"
              className="px-3 py-2 hover:bg-red-800 rounded transition whitespace-nowrap text-amber-300 font-extrabold flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Galeri</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Haber ara..."
              className="w-full bg-zinc-100 dark:bg-zinc-800 text-xs p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 text-sm font-semibold">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-800 dark:text-zinc-200"
            >
              Ana Sayfa
            </Link>
            {categoriesList.map((cat) => (
              <Link
                key={cat.key}
                href={cat.href}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-800 dark:text-zinc-200"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/#yazarlar"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-red-600 dark:text-red-400"
            >
              Köşe Yazarları
            </Link>
            <Link
              href="/foto-galeri"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Foto Galeri</span>
            </Link>
            <Link
              href="/video-galeri"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5"
            >
              <Video className="w-4 h-4" />
              <span>Video Galeri</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
