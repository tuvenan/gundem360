"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Newspaper,
  PlusCircle,
  Sliders,
  MessageSquare,
  Feather,
  FolderTree,
  Settings,
  ExternalLink,
  Flame,
  Menu,
  X,
  Bell,
  Search,
  Images,
  Video,
  Vote,
  Layers,
  PanelRightClose,
  Wand2,
  Radio,
  FileText,
  LogOut,
} from "lucide-react";
import ClearCacheButton from "@/components/admin/ClearCacheButton";

interface AdminNavEntry {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

const NAV_ITEMS: AdminNavEntry[] = [
  { name: "Gösterge Paneli", href: "/admin", icon: LayoutDashboard },
  { name: "AI Haber Stüdyosu", href: "/admin/ai-haber-studyo", icon: Wand2, badge: "AI ✨" },
  { name: "Ajanslar & RSS", href: "/admin/ajanslar", icon: Radio, badge: "RSS" },
  { name: "Tüm Haberler", href: "/admin/haberler", icon: Newspaper },
  { name: "Yeni Haber Yayınla", href: "/admin/yeni-haber", icon: PlusCircle },
  { name: "Sayfa Düzeni", href: "/admin/sayfa-duzeni", icon: Layers, badge: "Bloklar" },
  { name: "Sağ Bloklar", href: "/admin/sag-blok", icon: PanelRightClose, badge: "Sidebar" },
  { name: "Foto Galeriler", href: "/admin/galeriler", icon: Images, badge: "Galeri" },
  { name: "Video Galeri", href: "/admin/videolar", icon: Video, badge: "Video" },
  { name: "Anket & Kamuoyu", href: "/admin/anketler", icon: Vote, badge: "Anket" },
  { name: "Manşet Sıralayıcı", href: "/admin/mansetler", icon: Sliders, badge: "1-10" },
  { name: "Yorum Moderasyonu", href: "/admin/yorumlar", icon: MessageSquare, badge: "Yeni" },
  { name: "Köşe Yazarları", href: "/admin/yazarlar", icon: Feather },
  { name: "Kategori Yönetimi", href: "/admin/kategoriler", icon: FolderTree },
  { name: "Kurumsal & Yasal", href: "/admin/kurumsal-sayfalar", icon: FileText, badge: "KVKK" },
  { name: "Site Ayarları", href: "/admin/ayarlar", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Giriş sayfası ise admin sidebar/header'ını gösterme
  if (pathname === "/admin/giris") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // sessizce devam et
    } finally {
      window.location.href = "/admin/giris";
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-100 dark:bg-zinc-950 -m-4">
      {/* 1. SIDEBAR (MASAÜSTÜ & MOBİL) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-zinc-950 text-zinc-200 border-r border-zinc-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Logo & Başlık */}
          <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="bg-red-600 text-white font-black px-2 py-0.5 text-base rounded-sm tracking-tighter flex items-center gap-1">
                <Flame className="w-4 h-4 fill-white" />
                <span>CMS</span>
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                Gündem360<span className="text-red-500">.</span>
              </span>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menü Linkleri */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            <div className="px-3 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              İçerik & Yayın
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition ${
                    isActive
                      ? "bg-red-600 text-white shadow-xs font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        isActive
                          ? "bg-white text-red-600"
                          : "bg-red-950/80 text-red-400 border border-red-800/40"
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

        {/* Alt Profil & Siteye Dön */}
        <div className="p-4 border-t border-zinc-800/80 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-bold transition border border-zinc-800"
          >
            <span>Siteyi Görüntüle</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                AD
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">Yönetici Hesabı</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Çevrimiçi
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Güvenli Çıkış Yap"
              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay mobil tıklandığında menüyü kapatmak için */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* 2. MAIN ADMIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin TopBar */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs font-bold text-zinc-500 hidden sm:block">
              Haber Portalı CMS v2.4 • Maslak Masası
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <ClearCacheButton variant="header" />

            <Link
              href="/admin/yeni-haber"
              className="hidden sm:flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Haber Ekle</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-red-600 transition flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg"
            >
              <span>Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Güvenli Çıkış Yap"
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </header>

        {/* Ana İçerik */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
