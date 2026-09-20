import { Metadata } from "next";
import Link from "next/link";
import { getLegalPageById } from "@/lib/services/legal-service";
import { getSiteSettings } from "@/lib/services/settings-service";
import {
  FileText,
  Building2,
  ShieldCheck,
  Printer,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPageById("kunye");
  return {
    title: `${page?.title || "Künye ve İmtiaz Sahibi"} | Gündem360`,
    description:
      page?.description ||
      "Gündem360 dijital haber portalı resmi künye, imtiyaz sahibi, yayın kurulu ve yasal iletişim bilgileri.",
  };
}

export default async function KunyePage() {
  const [page, settings] = await Promise.all([
    getLegalPageById("kunye"),
    getSiteSettings(),
  ]);

  const lastUpdated = page?.updatedAt
    ? new Date(page.updatedAt).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "20 Eylül 2026";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Ekmek Kırıntısı (Breadcrumb) */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-red-600 transition">
            Ana Sayfa
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-900 dark:text-white font-medium">Künye</span>
        </nav>

        {/* Başlık Kartı */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded tracking-wide uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" /> Resmi Künye
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  5187 Sayılı Basın Kanunu
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                {page?.title || "Gündem360 Künye & Yayın İlkeleri"}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
                {page?.description ||
                  "Gündem360 dijital haber portalı imtiyaz sahibi, sorumlu müdür, yayın kurulu ve resmi iletişim bilgileri."}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <div className="text-right text-[11px] text-zinc-400 mr-2 hidden sm:block">
                <div className="flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3" /> Son Güncelleme:
                </div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {lastUpdated}
                </span>
              </div>
            </div>
          </div>

          {/* Hızlı İletişim Şeridi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6">
            <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
              <div className="p-2 bg-red-600/10 text-red-600 rounded-lg shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-zinc-400 font-bold uppercase">Şirket</div>
                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                  {settings.companyName || "Gündem360 Medya A.Ş."}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
              <div className="p-2 bg-red-600/10 text-red-600 rounded-lg shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-zinc-400 font-bold uppercase">Santral</div>
                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                  {settings.contactPhone || "+90 (212) 555 36 00"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
              <div className="p-2 bg-red-600/10 text-red-600 rounded-lg shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-zinc-400 font-bold uppercase">E-Posta</div>
                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                  {settings.contactEmail || "iletisim@gundem360.com"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ana İçerik Bloğu (Rich HTML) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-xs">
          <article
            className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed
              prose-headings:font-black prose-headings:tracking-tight
              prose-h2:text-lg prose-h2:border-b prose-h2:border-zinc-200 dark:prose-h2:border-zinc-800 prose-h2:pb-2 prose-h2:mt-6 prose-h2:text-red-600 dark:prose-h2:text-red-500
              prose-h3:text-sm prose-h3:font-bold prose-h3:mt-5 prose-h3:uppercase prose-h3:tracking-wider prose-h3:text-zinc-800 dark:prose-h3:text-zinc-200
              prose-ul:space-y-1 prose-li:text-xs sm:prose-li:text-sm
              prose-blockquote:border-l-4 prose-blockquote:border-red-600 prose-blockquote:bg-zinc-50 dark:prose-blockquote:bg-zinc-800/40 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-blockquote:text-xs prose-blockquote:italic"
            dangerouslySetInnerHTML={{ __html: page?.content || "" }}
          />
        </div>

        {/* Yasal Bağlantılar Alt Çubuğu */}
        <div className="p-5 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-zinc-500">Diğer Yasal ve Kurumsal Belgeler:</span>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/iletisim" className="text-red-600 font-bold hover:underline">
              İletişim & İhbar Hattı →
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <Link href="/kvkk/aydinlatma-metni" className="text-zinc-600 dark:text-zinc-400 hover:text-red-600">
              KVKK Aydınlatma Metni
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <Link href="/kvkk/cerez-politikasi" className="text-zinc-600 dark:text-zinc-400 hover:text-red-600">
              Çerez Politikası
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <Link href="/kvkk/basvuru-formu" className="text-zinc-600 dark:text-zinc-400 hover:text-red-600">
              KVKK Başvuru Formu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
