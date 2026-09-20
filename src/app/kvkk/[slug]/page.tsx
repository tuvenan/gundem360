import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getLegalPages, getLegalPageBySlug } from "@/lib/services/legal-service";
import { Shield, Clock, FileText, Share2, Printer, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLegalPageBySlug(`/kvkk/${slug}`);
  if (!page) {
    return {
      title: "Yasal Politika | Gündem360",
    };
  }
  return {
    title: `${page.title} | Gündem360 Yasal`,
    description: page.description || "Gündem360 dijital haber portalı yasal bilgilendirme metni.",
  };
}

export default async function KvkkDynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getLegalPageBySlug(`/kvkk/${slug}`);

  if (!page) {
    notFound();
  }

  const lastUpdated = page.updatedAt
    ? new Date(page.updatedAt).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "20 Eylül 2026";

  return (
    <div className="space-y-6">
      {/* Başlık Kartı */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-zinc-900 dark:bg-zinc-800 text-zinc-100 text-[11px] font-black px-2.5 py-0.5 rounded tracking-wide uppercase">
                <Shield className="w-3.5 h-3.5 text-red-500" />
                6698 Sayılı KVKK
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {page.slug}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Son Güncelleme: {lastUpdated}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            {page.title}
          </h1>

          {page.description && (
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-3xl">
              {page.description}
            </p>
          )}
        </div>
      </div>

      {/* Zengin HTML Metin Kartı */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-xs">
        <article
          className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed
            prose-headings:font-black prose-headings:tracking-tight
            prose-h2:text-lg prose-h2:border-b prose-h2:border-zinc-200 dark:prose-h2:border-zinc-800 prose-h2:pb-2 prose-h2:mt-6 prose-h2:text-red-600 dark:prose-h2:text-red-500
            prose-h3:text-sm prose-h3:font-bold prose-h3:mt-5 prose-h3:uppercase prose-h3:tracking-wider prose-h3:text-zinc-800 dark:prose-h3:text-zinc-200
            prose-ul:space-y-1.5 prose-li:text-xs sm:prose-li:text-sm
            prose-ol:space-y-1.5 prose-ol:text-xs sm:prose-ol:text-sm
            prose-blockquote:border-l-4 prose-blockquote:border-red-600 prose-blockquote:bg-zinc-50 dark:prose-blockquote:bg-zinc-800/40 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-blockquote:text-xs prose-blockquote:italic"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>

      {/* Alt Bilgi & KVKK Güvence Rozeti */}
      <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Bu metin T.C. Kişisel Verileri Koruma Kurumu güncel mevzuatına tam uyumludur.</span>
        </div>
        <Link
          href="/iletisim"
          className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
        >
          Hukuk Birimi ile İletişim →
        </Link>
      </div>
    </div>
  );
}
