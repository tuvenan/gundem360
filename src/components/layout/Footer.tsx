"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Mail, Phone, MapPin, Globe } from "lucide-react";
import { CATEGORIES } from "@/lib/data/mock-news";

export default function Footer() {
  const [categoriesList, setCategoriesList] = useState(CATEGORIES);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setCategoriesList(data);
      })
      .catch(() => {});
  }, []);
  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sütun 1: Logo & Hakkında */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-red-600 text-white font-black px-2.5 py-1 text-lg rounded-sm tracking-tighter flex items-center gap-1">
                <Flame className="w-4 h-4 fill-white" />
                <span>GÜNDEM</span>
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                360<span className="text-red-600">.</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Türkiye ve dünya gündeminden son dakika gelişmeleri, ekonomi, spor, teknoloji ve analizlerle 7/24 kesintisiz ve tarafsız haber portalı.
            </p>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" /> Maslak, İstanbul
              </span>
            </div>
          </div>

          {/* Sütun 2: Kategoriler */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2">
              Kategoriler
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              {categoriesList.map((cat) => (
                <li key={cat.key}>
                  <Link
                    href={cat.href}
                    className="hover:text-red-400 transition block py-0.5"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/#yazarlar" className="hover:text-red-400 transition block py-0.5">
                  Köşe Yazarları
                </Link>
              </li>
            </ul>
          </div>

          {/* Sütun 3: Kurumsal & Yasal */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2">
              Kurumsal & Yasal
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/kunye" className="hover:text-white transition block">
                  Künye & Yayın İlkeleri
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-white transition block">
                  İletişim & Haber İhbarı
                </Link>
              </li>
              <li>
                <Link href="/kvkk/aydinlatma-metni" className="hover:text-white transition block">
                  KVKK Aydınlatma Metni
                </Link>
              </li>
              <li>
                <Link href="/kvkk/cerez-politikasi" className="hover:text-white transition block">
                  Çerez (Cookie) Politikası
                </Link>
              </li>
              <li>
                <Link href="/kvkk/saklama-ve-imha" className="hover:text-white transition block">
                  Saklama ve İmha Politikası
                </Link>
              </li>
              <li>
                <Link href="/kvkk/kamera-aydinlatma" className="hover:text-white transition block">
                  Kamera Aydınlatma Metni
                </Link>
              </li>
              <li>
                <Link href="/kvkk/basvuru-formu" className="hover:text-white transition block text-red-400">
                  KVKK Başvuru Formu
                </Link>
              </li>
            </ul>
          </div>

          {/* Sütun 4: Bülten Aboneliği */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-600 pl-2">
              Günün Özeti E-Postada
            </h4>
            <p className="text-xs text-zinc-400 mb-3">
              Günün en önemli gelişmelerini her sabah saat 08:00'de e-posta bültenimizle alın.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input
                type="email"
                placeholder="E-posta adresiniz..."
                className="w-full bg-zinc-900 border border-zinc-700 text-xs px-3 py-2 rounded text-zinc-200 focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded transition"
              >
                Ücretsiz Abone Ol
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-zinc-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} Gündem360 Haber Portalı. Tüm hakları saklıdır.</p>
          <p className="text-[11px] text-zinc-400">
            Next.js & Tailwind CSS ile güçlendirilmiştir.
          </p>
        </div>
      </div>
    </footer>
  );
}
