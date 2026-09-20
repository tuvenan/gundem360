"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [categoriesList, setCategoriesList] = useState(CATEGORIES);
  const [showWeatherWidget, setShowWeatherWidget] = useState(true);
  const [showFinanceBar, setShowFinanceBar] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/arama?q=${encodeURIComponent(q)}`);
      setMobileMenuOpen(false);
    }
  };

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
      {/* 1. TOP BAR: Finans, Hava Durumu, Tarih (Mobilde Taşmaları Önleyen Duyarlı Şerit) */}
      {(showWeatherWidget || showFinanceBar) && (
        <div className="bg-zinc-900 text-zinc-200 text-xs py-1 px-3 sm:px-4 border-b border-zinc-800/80">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 overflow-hidden">
            {/* Sol: Tarih ve Hava Durumu */}
            <div className="flex items-center space-x-2 sm:space-x-4 shrink-0 min-w-0">
              <span className="hidden sm:flex items-center gap-1.5 text-zinc-400 truncate text-[11px] sm:text-xs">
                <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="truncate">{currentDate || "Güncel"}</span>
              </span>
              {showWeatherWidget && <WeatherWidget className="truncate max-w-full" />}
            </div>

            {/* Sağ: Canlı Finans Kurları (Mobilde Kaydırılabilir & Sığdırılmış) */}
            {showFinanceBar && (
              <div className="flex-1 min-w-0 max-w-full overflow-hidden flex justify-end">
                <FinanceTicker className="max-w-full" />
              </div>
            )}
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

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <input
              type="text"
              placeholder="Haber veya konu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 lg:w-72 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs px-3.5 py-2 pr-9 rounded-full border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            />
            <button
              type="submit"
              className="absolute right-3 top-2.5 text-zinc-400 hover:text-red-600 transition"
              aria-label="Ara"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Mobil Menü Butonu (Hamburger) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Menüyü Aç / Kapat"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-red-600" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* 3. CATEGORIES NAVIGATION BAR (Yalnızca Masaüstünde Gösterilir: hidden md:flex) */}
      <nav className="hidden md:flex w-full bg-red-700 text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between overflow-x-auto no-scrollbar">
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

      {/* 4. MOBİL AÇILIR MENÜ (Tüm Gezinme ve Kategoriler Mobilde Buradan Yönetilir) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-xl">
          {/* Mobil Arama */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Haber veya konu ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs p-2.5 pr-9 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              className="absolute right-3 top-3 text-zinc-400 hover:text-red-600 transition"
              aria-label="Ara"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Kategoriler Izgarası */}
          <div>
            <span className="text-[11px] font-black uppercase text-zinc-400 tracking-wider block mb-2">
              Kategoriler
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-red-50 hover:text-red-600 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition flex items-center justify-between"
              >
                <span>Ana Sayfa</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              </Link>
              {categoriesList.map((cat) => (
                <Link
                  key={cat.key}
                  href={cat.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-red-50 hover:text-red-600 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition flex items-center justify-between"
                >
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Özel Bölümler (Medya & Yazarlar) */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] font-black uppercase text-zinc-400 tracking-wider block mb-2">
              Öne Çıkanlar & Medya
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold">
              <Link
                href="/#yazarlar"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-red-50 text-red-600 dark:text-red-400 transition flex items-center gap-2"
              >
                <Flame className="w-4 h-4" />
                <span>Köşe Yazarları</span>
              </Link>
              <Link
                href="/foto-galeri"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-amber-50 text-amber-600 dark:text-amber-400 transition flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Foto Galeri</span>
              </Link>
              <Link
                href="/video-galeri"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-amber-50 text-amber-600 dark:text-amber-400 transition flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                <span>Video Galeri</span>
              </Link>
            </div>
          </div>

          {/* Kurumsal Hızlı Bağlantılar */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
            <Link href="/kunye" onClick={() => setMobileMenuOpen(false)} className="hover:underline">
              Künye
            </Link>
            <span>•</span>
            <Link href="/iletisim" onClick={() => setMobileMenuOpen(false)} className="hover:underline">
              İletişim
            </Link>
            <span>•</span>
            <Link href="/kvkk" onClick={() => setMobileMenuOpen(false)} className="hover:underline">
              KVKK & Gizlilik
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
