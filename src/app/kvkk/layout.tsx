"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Cookie,
  Archive,
  Camera,
  FileSpreadsheet,
  ChevronRight,
  HelpCircle,
  FileText,
  Mail,
} from "lucide-react";

const KVKK_NAV = [
  {
    name: "KVKK Aydınlatma Metni",
    href: "/kvkk/aydinlatma-metni",
    icon: Shield,
    badge: "Zorunlu",
  },
  {
    name: "Çerez (Cookie) Politikası",
    href: "/kvkk/cerez-politikasi",
    icon: Cookie,
  },
  {
    name: "Saklama ve İmha Politikası",
    href: "/kvkk/saklama-ve-imha",
    icon: Archive,
  },
  {
    name: "Güvenlik Kamerası Aydınlatma",
    href: "/kvkk/kamera-aydinlatma",
    icon: Camera,
  },
  {
    name: "KVKK Başvuru Formu",
    href: "/kvkk/basvuru-formu",
    icon: FileSpreadsheet,
    badge: "Form",
  },
];

export default function KvkkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Ekmek Kırıntısı (Breadcrumb) */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-red-600 transition">
            Ana Sayfa
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-500">Yasal Mevzuat</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-900 dark:text-white font-medium">KVKK & Gizlilik</span>
        </nav>

        {/* 2 Sütunlu Düzen: Sol Navigasyon / Sağ İçerik */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sol Kolon: KVKK Dokümanları Menüsü */}
          <aside className="lg:col-span-4 space-y-5 sticky top-20">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="p-1.5 bg-red-600/10 text-red-600 rounded-lg">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Mevzuat Portalı
                  </h3>
                  <p className="text-sm font-black text-zinc-900 dark:text-white">
                    KVKK & Yasal Politikalar
                  </p>
                </div>
              </div>

              <nav className="space-y-1.5">
                {KVKK_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? "bg-red-600 text-white shadow-xs"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-red-600"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-zinc-400"}`} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-black shrink-0 ${
                            isActive
                              ? "bg-white text-red-600"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* İletişim / KVKK Destek Kartı */}
            <div className="bg-zinc-900 text-zinc-200 rounded-2xl p-5 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                <HelpCircle className="w-4 h-4" />
                <span>Bir Sorunuz mu Var?</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Kişisel verilerinizin işlenmesi veya hak taleplerinizle ilgili Veri Koruma Birimimize başvurabilirsiniz.
              </p>
              <div className="pt-2 border-t border-zinc-800">
                <a
                  href="mailto:kvkk@gundem360.com"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-red-400 transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>kvkk@gundem360.com</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Sağ Kolon: Sayfa İçeriği */}
          <main className="lg:col-span-8 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
