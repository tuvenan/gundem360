"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Clock,
  ShieldCheck,
  Share2,
  Flame,
} from "lucide-react";
import { SiteSettings } from "@/lib/types/settings";

interface IletisimClientProps {
  settings: SiteSettings;
}

const SUBJECT_OPTIONS = [
  "Haber İhbarı & Özel İstihbarat",
  "Genel Görüş ve Öneri",
  "Reklam ve Sponsorluk Talebi",
  "Düzeltme, Cevap ve Düzeltme (Tekzip)",
  "KVKK ve Kişisel Veri Talebi",
  "Teknik Arıza ve Hata Bildirimi",
];

export default function IletisimClient({ settings }: IletisimClientProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0]);
  const [message, setMessage] = useState("");
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage("Lütfen geçerli bir Ad Soyad giriniz.");
      return;
    }

    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setErrorMessage("Lütfen geçerli bir e-posta adresi giriniz.");
      return;
    }

    if (!message.trim() || message.trim().length < 5) {
      setErrorMessage("Lütfen en az 5 karakterden oluşan mesajınızı yazınız.");
      return;
    }

    if (!kvkkAccepted) {
      setErrorMessage("Lütfen devam etmek için KVKK Aydınlatma Metnini onaylayınız.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject,
          message,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Mesajınız iletilirken bir hata oluştu.");
      }

      setSuccessMessage(
        "Mesajınız başarıyla editörlerimize ulaştı. İlginiz için teşekkür ederiz, en kısa sürede sizinle iletişime geçilecektir."
      );
      // Formu temizle
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setKvkkAccepted(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Mesaj gönderilemedi. Lütfen tekrar deneyiniz.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Ekmek Kırıntısı (Breadcrumb) */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-red-600 transition">
            Ana Sayfa
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-900 dark:text-white font-medium">İletişim & İhbar</span>
        </nav>

        {/* Üst Başlık */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-red-600/10 text-red-600 font-bold px-2.5 py-0.5 rounded text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Gündem360 İletişim & Haber Masası</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              Bizimle İletişime Geçin
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Haber ihbarlarınız, basın bültenleriniz, reklam talepleriniz veya görüşleriniz için
              aşağıdaki formu kullanabilir ya da doğrudan iletişim kanallarımızdan bize ulaşabilirsiniz.
            </p>
          </div>
        </div>

        {/* 2 Sütunlu Düzen: Sol İletişim Kartları / Sağ Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sol Kolon: Doğrudan İletişim Kanalları */}
          <div className="lg:col-span-5 space-y-5">
            {/* Merkez Ofis Kartı */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-600 text-white rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Genel Merkez & Haber Masası
                  </h3>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">
                    {settings.companyName || "Gündem360 Medya ve Yayıncılık A.Ş."}
                  </p>
                </div>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pl-12">
                {settings.address || "Büyükdere Cad. No:190, Maslak / Sarıyer / İstanbul"}
              </p>
            </div>

            {/* Telefon & WhatsApp */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Telefon & İhbar Hattı
                  </h3>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">
                    {settings.contactPhone || "+90 (212) 555 36 00"}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-xs pl-12 text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-2">
                  <span>Santral / Faks:</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {settings.contactPhone || "+90 (212) 555 36 00"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-2">
                  <span>WhatsApp İhbar:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    +90 (532) 555 36 36
                  </span>
                </div>
              </div>
            </div>

            {/* E-Posta Masaları */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Departman E-Posta Adresleri
                  </h3>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">
                    {settings.contactEmail || "iletisim@gundem360.com"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs pl-12 text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-2">
                  <span>Haber Bülteni & İhbar:</span>
                  <a
                    href="mailto:haber@gundem360.com"
                    className="font-semibold text-red-600 dark:text-red-400 hover:underline"
                  >
                    haber@gundem360.com
                  </a>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-2">
                  <span>Reklam & Sponsorluk:</span>
                  <a
                    href="mailto:reklam@gundem360.com"
                    className="font-semibold text-zinc-900 dark:text-white hover:underline"
                  >
                    reklam@gundem360.com
                  </a>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-2">
                  <span>KVKK & Hukuk:</span>
                  <a
                    href="mailto:kvkk@gundem360.com"
                    className="font-semibold text-zinc-900 dark:text-white hover:underline"
                  >
                    kvkk@gundem360.com
                  </a>
                </div>
              </div>
            </div>

            {/* Çalışma Saatleri & Güvence */}
            <div className="p-4 bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-400">
                <Clock className="w-4 h-4" />
                <span>7/24 Kesintisiz Yayın Merkezi</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Haber masamız günün her saati son dakika gelişmelerini takip etmektedir.
                İhbarlarınız gizlilik esasıyla değerlendirilir ve kaynak güvenliği Basın Kanunu gereği korunur.
              </p>
            </div>
          </div>

          {/* Sağ Kolon: İletişim ve Haber İhbar Formu */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
                <h2 className="text-lg font-black text-zinc-900 dark:text-white">
                  Mesaj veya İhbar Gönderin
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Tüm alanları doldurarak mesajınızı doğrudan nöbetçi editörlerimize ulaştırabilirsiniz.
                </p>
              </div>

              {/* Başarı Bildirimi */}
              {successMessage && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Teşekkürler!</div>
                    <div>{successMessage}</div>
                  </div>
                </div>
              )}

              {/* Hata Bildirimi */}
              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 rounded-xl flex items-start gap-3 text-xs text-red-800 dark:text-red-300 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Lütfen Kontrol Edin:</div>
                    <div>{errorMessage}</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ad Soyad */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Adınız ve Soyadınız <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Örn: Ahmet Yılmaz"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* E-Posta */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      E-Posta Adresiniz <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@alanadi.com"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Telefon */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Telefon Numaranız <span className="text-zinc-400 font-normal">(İsteğe Bağlı)</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Konu */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Mesaj Konusu <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mesaj */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Mesajınız veya Haber Detayları <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Konuyla ilgili detaylı bilgi, haber detayı veya sorunuzu buraya yazabilirsiniz..."
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* KVKK Onay Kutusu */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={kvkkAccepted}
                      onChange={(e) => setKvkkAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-zinc-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca hazırlanan{" "}
                      <Link
                        href="/kvkk/aydinlatma-metni"
                        target="_blank"
                        className="text-red-600 dark:text-red-400 font-semibold underline hover:text-red-700"
                      >
                        KVKK Aydınlatma Metni
                      </Link>
                      'ni okudum ve kişisel verilerimin bu kapsamda işlenmesini onaylıyorum.
                    </span>
                  </label>
                </div>

                {/* Gönder Butonu */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>İletiliyor...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Mesajı Gönder</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
