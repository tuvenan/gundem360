import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getColumnistBySlug,
  getColumnists,
  getArticleBySlug,
  getColumnistById,
} from "@/lib/news-service";
import {
  ChevronRight,
  Calendar,
  Feather,
  BookOpen,
  Mail,
  Clock,
  ArrowRight,
  Share2,
  Archive,
  User,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface ColumnistPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ColumnistPageProps): Promise<Metadata> {
  const { id } = await params;

  // 1. Önce makale olarak ara
  const articleData = await getArticleBySlug(id);
  if (articleData) {
    return {
      title: `${articleData.columnist.name} - ${articleData.article.title} | Gündem360`,
      description: articleData.article.excerpt,
    };
  }

  // 2. Yazar profili olarak ara
  const columnist = await getColumnistBySlug(id);
  if (columnist) {
    return {
      title: `${columnist.name} - Köşe Yazıları ve Makale Arşivi | Gündem360`,
      description: columnist.bio || `${columnist.name} köşe yazıları ve analiz arşivi.`,
    };
  }

  return { title: "Yazı veya Yazar Bulunamadı | Gündem360" };
}

export default async function ColumnistPage({ params }: ColumnistPageProps) {
  const { id } = await params;

  // 1. Önce makale olarak kontrol et
  const articleMatch = await getArticleBySlug(id);

  // 2. Yazar olarak kontrol et
  const columnistMatch = !articleMatch ? await getColumnistBySlug(id) : null;

  if (!articleMatch && !columnistMatch) {
    notFound();
  }

  const allColumnists = await getColumnists();

  // -------------------------------------------------------------
  // DURUM A: YAZAR PROFİLİ VE TÜM MAKALE ARŞİVİ SAYFASI
  // -------------------------------------------------------------
  if (columnistMatch) {
    const columnist = columnistMatch;
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

        {/* Yazar Büyük Profil Bannerı */}
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
              <div className="flex items-center gap-3 pt-2 text-xs text-zinc-400">
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
                  Tüm Makaleleri (Arşiv)
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
                      <span className="text-[11px] text-zinc-400">
                        Gündem360 Köşe Yazısı
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
                    href={`/yazarlar/${c.slug || c.id}`}
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

  // -------------------------------------------------------------
  // DURUM B: MAKALE OKUMA SAYFASI (Article Detail Page)
  // -------------------------------------------------------------
  const { article, columnist } = articleMatch!;
  const authorArticles = columnist.articles || [];
  const otherArticles = authorArticles.filter((a) => a.slug !== article.slug);
  const otherColumnists = allColumnists.filter((c) => c.id !== columnist.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sol: Makale Gövdesi (8 cols) */}
      <article className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-red-600 transition">Ana Sayfa</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/#yazarlar" className="hover:text-red-600 transition">Köşe Yazarları</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/yazarlar/${columnist.slug || columnist.id}`}
            className="hover:text-red-600 transition font-semibold"
          >
            {columnist.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="truncate max-w-xs">{article.title}</span>
        </nav>

        {/* Yazar Başlığı & Arşiv Bağlantısı */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-6">
          <Link
            href={`/yazarlar/${columnist.slug || columnist.id}`}
            className="flex items-center gap-4 group"
          >
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-red-600 shrink-0 shadow-sm group-hover:scale-105 transition">
              <Image
                src={columnist.avatar}
                alt={columnist.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white group-hover:text-red-600 transition">
                {columnist.name}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {columnist.title}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
                <Calendar className="w-3.5 h-3.5 text-red-500" />
                <span>{article.date}</span>
              </div>
            </div>
          </Link>

          <Link
            href={`/yazarlar/${columnist.slug || columnist.id}`}
            className="self-start sm:self-center flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/40 px-3.5 py-2 rounded-xl border border-red-100 dark:border-red-900/40 transition"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Yazarın Tüm Arşivi ({authorArticles.length}) →</span>
          </Link>
        </div>

        {/* Makale Başlığı */}
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white leading-tight tracking-tight mb-6">
          {article.title}
        </h1>

        {/* Makale Metni (Zengin HTML veya Düz Metin) */}
        {article.content.includes("<p>") ||
        article.content.includes("<h") ||
        article.content.includes("<div>") ||
        article.content.includes("<blockquote") ? (
          <div
            className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 text-base sm:text-lg leading-relaxed [&_h2]:text-2xl [&_h2]:font-black [&_h2]:my-4 [&_h2]:text-zinc-900 [&_h2]:dark:text-white [&_h3]:text-xl [&_h3]:font-bold [&_h3]:my-3 [&_h3]:text-zinc-900 [&_h3]:dark:text-white [&_p]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-red-600 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:bg-zinc-50 [&_blockquote]:dark:bg-zinc-800/40 [&_blockquote]:rounded-r-lg [&_a]:text-red-600 [&_a]:underline [&_img]:rounded-xl [&_img]:shadow-md"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <div className="space-y-4 text-zinc-800 dark:text-zinc-200 text-base sm:text-lg leading-relaxed">
            {article.content.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}

        {/* Makale Sonu Yazar Kartı & Arşiv Çağrısı */}
        <div className="mt-10 p-5 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-red-600 shrink-0">
                <Image
                  src={columnist.avatar}
                  alt={columnist.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {columnist.name}
                </h4>
                <p className="text-xs text-zinc-400">{columnist.title}</p>
              </div>
            </div>

            <Link
              href={`/yazarlar/${columnist.slug || columnist.id}`}
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
            >
              <span>Arşive Git</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {columnist.bio && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
              "{columnist.bio}"
            </p>
          )}
        </div>
      </article>

      {/* Sağ Kolon: Yazarın Diğer Makaleleri + Diğer Yazarlar (4 cols) */}
      <aside className="lg:col-span-4 space-y-6">
        {/* 1. Yazarın Diğer Yazıları (Makale Arşivi Widget) */}
        {otherArticles.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-tight">
                  Yazarın Diğer Yazıları
                </h3>
              </div>
              <Link
                href={`/yazarlar/${columnist.slug || columnist.id}`}
                className="text-[11px] font-bold text-red-600 hover:underline"
              >
                Tümü ({authorArticles.length})
              </Link>
            </div>

            <div className="space-y-3">
              {otherArticles.map((art) => (
                <Link
                  key={art.id}
                  href={`/yazarlar/${art.slug}`}
                  className="block p-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                >
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-red-500" />
                    <span>{art.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-red-600 transition line-clamp-2 leading-snug">
                    "{art.title}"
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-1 italic">
                    {art.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 2. Diğer Köşe Yazarları */}
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
                href={`/yazarlar/${c.slug || c.id}`}
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
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-snug mt-0.5">
                    "{c.articleTitle}"
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
