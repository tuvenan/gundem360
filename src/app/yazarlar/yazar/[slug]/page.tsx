import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getColumnistBySlug, getColumnists } from "@/lib/news-service";
import {
  ChevronRight,
  Calendar,
  Feather,
  BookOpen,
  Mail,
  ArrowRight,
  Archive,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const columnist = await getColumnistBySlug(slug);

  if (!columnist) {
    return { title: "Yazar Bulunamadı | Gündem360" };
  }

  return {
    title: `${columnist.name} - Yazar Profili & Makale Arşivi | Gündem360`,
    description: columnist.bio || `${columnist.name} tüm köşe yazıları ve makale arşivi.`,
  };
}

export default async function AuthorProfilePage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const columnist = await getColumnistBySlug(slug);

  if (!columnist) {
    notFound();
  }

  const allColumnists = await getColumnists();
  const articles = columnist.articles || [];
  const otherColumnists = allColumnists.filter((c) => c.id !== columnist.id);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/" className="hover:text-red-600 transition">Ana Sayfa</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/#yazarlar" className="hover:text-red-600 transition">Köşe Yazarları</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{columnist.name}</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-red-600 font-bold">Makale Arşivi</span>
      </nav>

      {/* Yazar Büyük Profil Kartı */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-red-600 shrink-0 shadow-md">
            <Image
              src={columnist.avatar}
              alt={columnist.name}
              fill
              sizes="112px"
              className="object-cover"
              priority
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {columnist.name}
                </h1>
                <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-0.5">
                  {columnist.title}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-red-50 dark:bg-red-950/50 text-red-600 rounded-xl border border-red-100 dark:border-red-900/40 text-xs font-black flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>{articles.length} Makale</span>
                </div>
              </div>
            </div>

            {columnist.bio && (
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl pt-1">
                {columnist.bio}
              </p>
            )}

            {/* Sosyal Medya & İletişim */}
            <div className="flex items-center gap-4 pt-2 text-xs text-zinc-400">
              {columnist.socialTwitter && (
                <span className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white transition">
                  <svg className="w-3.5 h-3.5 fill-current text-zinc-600 dark:text-zinc-400" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>{columnist.socialTwitter}</span>
                </span>
              )}
              {columnist.email && (
                <span className="flex items-center gap-1 hover:text-zinc-600 transition">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{columnist.email}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Makale Arşivi Listesi ve Yan Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sol Kolon: Kronolojik Makale Arşivi (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                Yazarın Tüm Makaleleri ({articles.length})
              </h2>
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              Kronolojik Sıralama (Yeniden Eskiye)
            </span>
          </div>

          {articles.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
              Bu yazara ait henüz yayınlanmış bir makale bulunmamaktadır.
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((art, idx) => (
                <article
                  key={art.id || idx}
                  className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:shadow-xs transition group flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-red-500" />
                        <span>{art.date}</span>
                      </div>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[10px] rounded-sm uppercase tracking-wider">
                          Son Yazı
                        </span>
                      )}
                    </div>

                    <Link href={`/yazarlar/${art.slug}`} className="block">
                      <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white group-hover:text-red-600 transition leading-snug">
                        {art.title}
                      </h3>
                    </Link>

                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-mono">
                      /{art.slug}
                    </span>
                    <Link
                      href={`/yazarlar/${art.slug}`}
                      className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 group-hover:translate-x-0.5 transition"
                    >
                      <span>Makaleyi Oku</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Sağ Kolon: Diğer Köşe Yazarları (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-100 dark:border-zinc-800">
              <Feather className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-tight">
                Diğer Köşe Yazarları
              </h3>
            </div>

            <div className="space-y-4">
              {otherColumnists.map((c) => (
                <Link
                  key={c.id}
                  href={`/yazarlar/yazar/${c.slug || c.id}`}
                  className="group flex items-start gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-zinc-300 dark:border-zinc-700">
                    <Image
                      src={c.avatar}
                      alt={c.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition truncate">
                      {c.name}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {c.title}
                    </p>
                    <span className="text-[10px] text-red-600 font-semibold block mt-0.5">
                      {c.articles?.length || 1} Makale →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
