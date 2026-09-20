import Link from "next/link";
import SafeImage from "@/components/common/SafeImage";
import { Camera, ChevronRight, Eye } from "lucide-react";
import { PhotoGallery } from "@/types/news";

interface Props {
  galleries: PhotoGallery[];
}

export default function PhotoGallerySection({ galleries }: Props) {
  if (!galleries || galleries.length === 0) return null;

  // Ana sayfada tam 4 adet eşit büyüklükte galeri kutusu gösterilir
  const displayGalleries = galleries.slice(0, 4);

  return (
    <section className="bg-zinc-950 text-white rounded-2xl p-4 sm:p-6 border border-zinc-800 shadow-xl overflow-hidden relative">
      {/* Arka plan dekoratif hafif ışıltı */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-600/5 blur-3xl pointer-events-none rounded-full" />

      {/* Bölüm Başlığı */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-zinc-800/80 gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 text-white rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                Foto Galeri
              </h2>
              <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-red-500/30">
                Görsel Hafıza
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Günün en çarpıcı kareleri ve fotoğraf serileri
            </p>
          </div>
        </div>

        <Link
          href="/foto-galeri"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-red-400 transition group self-start sm:self-auto px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-500/40"
        >
          <span>Tüm Galerileri Gör ({galleries.length})</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* 4 Eşit Bağımsız Kutu Düzeni: Masaüstü lg: 4 sütun, Tablet md: 2 sütun, Mobil: 1 sütun */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
        {displayGalleries.map((gallery) => {
          const coverImg =
            gallery.coverImage ||
            gallery.slides?.[0]?.imageUrl ||
            "/placeholder-news.jpg";
          const photoCount = gallery.slides?.length || 0;

          return (
            <Link
              key={gallery.id}
              href={`/foto-galeri/${gallery.slug}`}
              className="group flex flex-col bg-zinc-900/90 hover:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800/80 hover:border-red-500/50 transition-all duration-300 shadow-md hover:-translate-y-1"
            >
              {/* Albüm Kapak Görseli */}
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                <SafeImage
                  src={coverImg}
                  alt={gallery.title}
                  fill
                  fallbackSrc="/uploads/default-news.jpg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                {/* Kararma / Gradyan Katmanı */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent group-hover:from-black/90 group-hover:bg-black/10 transition-colors duration-300" />

                {/* Sol Üst: Kategori Rozeti */}
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow ${
                      gallery.categoryBadgeColor || "bg-red-600"
                    } uppercase tracking-wider`}
                  >
                    {gallery.categoryTitle || gallery.category}
                  </span>
                </div>

                {/* Sağ Üst: Görüntülenme */}
                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
                  <Eye className="w-3 h-3 text-zinc-400" />
                  <span>{gallery.viewCount?.toLocaleString("tr-TR") || 0}</span>
                </div>

                {/* Sol Alt Köşe: Zarif Siyah Şeffaf "X Fotoğraf" Rozeti */}
                <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/15 shadow-md">
                  <Camera className="w-3.5 h-3.5 text-red-400" />
                  <span>{photoCount} Fotoğraf</span>
                </div>
              </div>

              {/* Kutunun Altı: Albüm Başlığı, Yüklenme Tarihi ve Ajans/Kaynak Bilgisi */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                  {gallery.title}
                </h3>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80 mt-auto">
                  <span className="truncate max-w-[130px] font-medium text-zinc-300">
                    {gallery.author?.name || "Gündem360 Görsel Servisi"}
                  </span>
                  <span className="shrink-0">{gallery.publishedAt}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
