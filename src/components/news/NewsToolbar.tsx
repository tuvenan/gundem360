"use client";

import { useState, useRef, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Share2,
  Check,
  MessageCircle,
  MoreHorizontal,
  Mail,
  Printer,
  Send,
} from "lucide-react";

interface NewsToolbarProps {
  title: string;
  textToRead: string;
  onFontSizeChange: (size: "sm" | "md" | "lg") => void;
}

export default function NewsToolbar({
  title,
  textToRead,
  onFontSizeChange,
}: NewsToolbarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSize, setActiveSize] = useState<"sm" | "md" | "lg">("md");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Menü dışına tıklandığında açılır menüyü kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMoreMenu]);

  // Sesli Okuma (Text-to-Speech Web API)
  const toggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Tarayıcınız sesli okuma özelliğini desteklemiyor.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${title}. ${textToRead}`);
      utterance.lang = "tr-TR";
      utterance.rate = 1.0;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleFontSize = (size: "sm" | "md" | "lg") => {
    setActiveSize(size);
    onFontSizeChange(size);
  };

  const shareOnTwitter = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(title);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    }
  };

  const shareOnWhatsApp = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`${title} - ${url}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    }
  };

  const shareOnFacebook = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
      setShowMoreMenu(false);
    }
  };

  const shareOnTelegram = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(title);
      window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
      setShowMoreMenu(false);
    }
  };

  const shareOnLinkedIn = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
      setShowMoreMenu(false);
    }
  };

  const shareViaEmail = () => {
    if (typeof window !== "undefined") {
      const subject = encodeURIComponent(title);
      const body = encodeURIComponent(`${title}\n\nHaberi okumak için: ${window.location.href}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      setShowMoreMenu(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
      setShowMoreMenu(false);
    }
  };

  const handleNativeShare = async () => {
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url: window.location.href,
        });
        setShowMoreMenu(false);
      } catch {
        // Kullanıcı iptal ettiğinde hata vermemesi için
      }
    } else {
      handleCopyLink();
      setShowMoreMenu(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 my-4 text-xs font-medium">
      {/* Sol: Sesli Dinle & Font Boyutu */}
      <div className="flex items-center gap-3">
        {/* Sesli Okuma Butonu */}
        <button
          onClick={toggleSpeech}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition ${
            isPlaying
              ? "bg-red-600 text-white animate-pulse"
              : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-600" />}
          <span>{isPlaying ? "Dinlemeyi Durdur" : "Haberi Dinle"}</span>
        </button>

        {/* Yazı Boyutu */}
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 rounded-md p-1 border border-zinc-200 dark:border-zinc-700">
          <span className="text-[10px] text-zinc-400 px-1">Yazı:</span>
          <button
            onClick={() => handleFontSize("sm")}
            className={`px-1.5 py-0.5 rounded text-[11px] ${
              activeSize === "sm" ? "bg-red-600 text-white font-bold" : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            A-
          </button>
          <button
            onClick={() => handleFontSize("md")}
            className={`px-1.5 py-0.5 rounded text-xs ${
              activeSize === "md" ? "bg-red-600 text-white font-bold" : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            A
          </button>
          <button
            onClick={() => handleFontSize("lg")}
            className={`px-1.5 py-0.5 rounded text-sm ${
              activeSize === "lg" ? "bg-red-600 text-white font-bold" : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            A+
          </button>
        </div>
      </div>

      {/* Sağ: Paylaşım Butonları */}
      <div className="flex items-center gap-2">
        <span className="text-zinc-400 mr-0.5 hidden sm:inline">Paylaş:</span>

        {/* WhatsApp Butonu */}
        <button
          onClick={shareOnWhatsApp}
          className="w-8 h-8 flex items-center justify-center bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-lg transition shadow-2xs cursor-pointer"
          title="WhatsApp'ta Paylaş"
          aria-label="WhatsApp'ta Paylaş"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
        </button>

        {/* X / Twitter Butonu */}
        <button
          onClick={shareOnTwitter}
          className="w-8 h-8 flex items-center justify-center bg-zinc-900 hover:bg-black text-white rounded-lg transition shadow-2xs cursor-pointer"
          title="X / Twitter'da Paylaş"
          aria-label="X'te Paylaş"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        {/* Linki Kopyala Butonu */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-3 h-8 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition shadow-2xs cursor-pointer text-xs font-semibold"
          title="Bağlantıyı Kopyala"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? "Kopyalandı!" : "Linki Kopyala"}</span>
        </button>

        {/* Örnek Görseldeki 3 Noktalı Yuvarlak Buton (...) */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMoreMenu((prev) => !prev)}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition cursor-pointer shadow-2xs ${
              showMoreMenu
                ? "bg-zinc-100 dark:bg-zinc-700 border-zinc-400 dark:border-zinc-600 text-zinc-900 dark:text-white"
                : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-300"
            }`}
            title="Daha Fazla Paylaşım Seçeneği"
            aria-label="Daha fazla seçenek"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Açılır Paylaşım Menüsü (Dropdown) */}
          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                Diğer Paylaşım Seçenekleri
              </div>

              {/* Facebook */}
              <button
                onClick={shareOnFacebook}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer text-left"
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook'ta Paylaş</span>
              </button>

              {/* Telegram */}
              <button
                onClick={shareOnTelegram}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer text-left"
              >
                <Send className="w-4 h-4 text-[#24A1DE]" />
                <span>Telegram'da Gönder</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={shareOnLinkedIn}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer text-left"
              >
                <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>LinkedIn'de Paylaş</span>
              </button>

              {/* E-posta */}
              <button
                onClick={shareViaEmail}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer text-left"
              >
                <Mail className="w-4 h-4 text-amber-500" />
                <span>E-posta ile Gönder</span>
              </button>

              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

              {/* Yazdır */}
              <button
                onClick={handlePrint}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer text-left"
              >
                <Printer className="w-4 h-4 text-zinc-500" />
                <span>Haberi Yazdır</span>
              </button>

              {/* Sistem Paylaşımı (Varsa) */}
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer text-left"
              >
                <Share2 className="w-4 h-4 text-zinc-500" />
                <span>Tüm Uygulamalarda Paylaş</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
