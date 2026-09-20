"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Eraser,
  Image as ImageIcon,
  Code,
  Eye,
  FileText,
  Minus,
  Sparkles,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// Düz metin veya markdown formatındaki içeriği zengin HTML'e dönüştürür
function formatInitialContent(text: string): string {
  if (!text) return "<p><br></p>";
  // Eğer zaten HTML etiketleri içeriyorsa doğrudan kullan
  if (
    text.includes("<p>") ||
    text.includes("<h2>") ||
    text.includes("<h3>") ||
    text.includes("<div>") ||
    text.includes("<ul>")
  ) {
    return text;
  }

  // Çift satır boşluklarını paragraflara ve **başlık** ifadelerini <h3>'e çevir
  return text
    .split(/\n\s*\n/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        return `<h3>${trimmed.replace(/\*\*/g, "")}</h3>`;
      }
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .filter(Boolean)
    .join("");
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Haberin detaylı içeriğini buraya yazın...",
  minHeight = "340px",
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"visual" | "code" | "preview">("visual");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef<string>("");
  const isInitialized = useRef<boolean>(false);

  // Editör başlatıldığında ilk içeriği yükle; yalnızca harici (parent) değişikliklerde DOM'u güncelle
  useEffect(() => {
    const formatted = formatInitialContent(value);

    if (!isInitialized.current) {
      isInitialized.current = true;
      lastHtmlRef.current = formatted;
      if (editorRef.current) {
        editorRef.current.innerHTML = formatted;
      }
      // İlk metin markdown ise parent'a derlenmiş HTML versiyonunu hemen aktar
      if (value !== formatted) {
        onChange(formatted);
      }
      return;
    }

    // Yalnızca dışarıdan (harici) bir değer geldiyse DOM'u güncelle
    if (value !== lastHtmlRef.current) {
      lastHtmlRef.current = formatted;
      if (editorRef.current && editorRef.current.innerHTML !== formatted) {
        editorRef.current.innerHTML = formatted;
      }
    }
  }, [value, onChange]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastHtmlRef.current = html;
      onChange(html);
    }
  };

  // execCommand ile zengin metin komutu çalıştırma
  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (activeTab !== "visual") {
      setActiveTab("visual");
    }
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    handleInput();
  };

  // Başlık / Blok Formatı: Chromium formatBlock için <tag> gerektirir
  const handleFormatBlock = (tag: string) => {
    const blockTag = tag.startsWith("<") ? tag : `<${tag}>`;
    executeCommand("formatBlock", blockTag);
  };

  // Bağlantı (Link) Ekle
  const handleInsertLink = () => {
    const url = prompt("Bağlantı URL'sini girin:", "https://");
    if (url && url !== "https://") {
      executeCommand("createLink", url);
    }
  };

  // Haber İçi Görsel Ekle
  const handleInsertImage = () => {
    const url = prompt(
      "Haber içi görsel URL'sini girin (Unsplash vb.):",
      "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1000&q=80"
    );
    if (url) {
      const alt = prompt("Görsel açıklaması (Alt Metin):", "Haber görseli") || "Haber görseli";
      const imageHtml = `<figure class="my-6"><img src="${url}" alt="${alt}" class="w-full rounded-xl shadow-md object-cover max-h-[480px]" /><figcaption class="text-xs text-zinc-500 mt-2 text-center italic">${alt}</figcaption></figure><p><br></p>`;
      executeCommand("insertHTML", imageHtml);
    }
  };

  // Özel Alıntı Kutusu Ekle
  const handleInsertQuoteBox = () => {
    const quoteHtml = `<blockquote class="border-l-4 border-red-600 pl-4 py-2 my-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-r-lg italic text-zinc-800 dark:text-zinc-200 font-medium">"Buraya dikkat çekici önemli bir demeç veya alıntı metni yazın..."</blockquote><p><br></p>`;
    executeCommand("insertHTML", quoteHtml);
  };

  // Özel Vurgu / Bilgi Kutusu Ekle
  const handleInsertInfoBox = () => {
    const infoHtml = `<div class="p-4 my-4 bg-blue-50 dark:bg-blue-950/40 border-l-4 border-blue-600 rounded-r-xl text-xs text-blue-900 dark:text-blue-200 space-y-1"><strong class="font-bold flex items-center gap-1">📌 BİLGİ NOTU:</strong><p>Gelişmeyle ilgili arka plan veya istatistiki bilgiyi buraya ekleyebilirsiniz.</p></div><p><br></p>`;
    executeCommand("insertHTML", infoHtml);
  };

  // İstatistikler (Kelime ve Karakter)
  const plainText = typeof window !== "undefined"
    ? (editorRef.current?.innerText || value.replace(/<[^>]*>/g, " "))
    : value.replace(/<[^>]*>/g, " ");

  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const charCount = plainText.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div
      className={`border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-xs overflow-hidden transition-all ${
        isFullscreen
          ? "fixed inset-4 z-50 flex flex-col shadow-2xl border-zinc-400"
          : "relative"
      }`}
    >
      {/* 1. ÜST ARAÇ ÇUBUĞU (TOOLBAR) */}
      <div className="p-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xs flex flex-wrap items-center justify-between gap-2 select-none">
        {/* Sol Biçimlendirme Araçları */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Geri / İleri Al */}
          <div className="flex items-center border-r border-zinc-200 dark:border-zinc-800 pr-1 mr-1">
            <button
              type="button"
              onClick={() => executeCommand("undo")}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              title="Geri Al (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("redo")}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              title="İleri Al (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Başlık Seviyeleri */}
          <div className="flex items-center gap-0.5 border-r border-zinc-200 dark:border-zinc-800 pr-1 mr-1">
            <button
              type="button"
              onClick={() => handleFormatBlock("p")}
              className="px-2 py-1 rounded-lg text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              title="Normal Paragraf"
            >
              Paragraf
            </button>
            <button
              type="button"
              onClick={() => handleFormatBlock("h2")}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer font-bold text-xs"
              title="Büyük Ara Başlık (H2)"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleFormatBlock("h3")}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer font-bold text-xs"
              title="Alt Ara Başlık (H3)"
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          {/* Temel Karakter Stilleri */}
          <div className="flex items-center gap-0.5 border-r border-zinc-200 dark:border-zinc-800 pr-1 mr-1">
            <button
              type="button"
              onClick={() => executeCommand("bold")}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              title="Kalın (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("italic")}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              title="İtalik (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("underline")}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              title="Altı Çizili (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("strikeThrough")}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              title="Üstü Çizili"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          {/* Hizalama */}
          <div className="flex items-center gap-0.5 border-r border-zinc-200 dark:border-zinc-800 pr-1 mr-1">
            <button
              type="button"
              onClick={() => executeCommand("justifyLeft")}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              title="Sola Hizala"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("justifyCenter")}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              title="Ortala"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("justifyRight")}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              title="Sağa Hizala"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Listeler */}
          <div className="flex items-center gap-0.5 border-r border-zinc-200 dark:border-zinc-800 pr-1 mr-1">
            <button
              type="button"
              onClick={() => executeCommand("insertUnorderedList")}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              title="Madde İmleri Listesi"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("insertOrderedList")}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              title="Numaralı Liste"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Zengin Haber Öğeleri: Bağlantı, Görsel, Alıntı Kutusu */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleInsertLink}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              title="Bağlantı (Link) Ekle"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleInsertImage}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              title="Haber İçi Görsel Ekle"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleInsertQuoteBox}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              title="Öne Çıkan Alıntı Kutusu Ekle"
            >
              <Quote className="w-4 h-4 text-red-600" />
            </button>
            <button
              type="button"
              onClick={handleInsertInfoBox}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800 text-blue-600 transition cursor-pointer"
              title="Bilgi Notu Kutusu Ekle"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Not Kutusu</span>
            </button>
            <button
              type="button"
              onClick={() => executeCommand("insertHorizontalRule")}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              title="Yatay Çizgi (Ayırıcı)"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("removeFormat")}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
              title="Biçimlendirmeyi Temizle"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sağ: Görünüm Modları (Görsel / Kaynak Kod / Önizleme) & Tam Ekran */}
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 rounded-lg p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab("visual");
                if (editorRef.current && editorRef.current.innerHTML !== value) {
                  editorRef.current.innerHTML = value;
                  lastHtmlRef.current = value;
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                activeTab === "visual"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Görsel</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (editorRef.current) {
                  const html = editorRef.current.innerHTML;
                  lastHtmlRef.current = html;
                  onChange(html);
                }
                setActiveTab("code");
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                activeTab === "code"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>HTML</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (editorRef.current) {
                  const html = editorRef.current.innerHTML;
                  lastHtmlRef.current = html;
                  onChange(html);
                }
                setActiveTab("preview");
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                activeTab === "preview"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Önizle</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
            title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. METİN YAZMA ALANI */}
      <div
        className={`relative ${
          isFullscreen ? "flex-1 overflow-y-auto" : "overflow-y-auto"
        }`}
        style={{ minHeight: isFullscreen ? "auto" : minHeight }}
      >
        {/* Görsel WYSIWYG Modu */}
        <div
          ref={editorRef}
          contentEditable={activeTab === "visual"}
          onInput={handleInput}
          onBlur={handleInput}
          onKeyUp={handleInput}
          onPaste={handleInput}
          suppressContentEditableWarning
          className={`p-5 sm:p-6 outline-none text-sm sm:text-base text-zinc-900 dark:text-zinc-100 font-sans leading-relaxed prose dark:prose-invert max-w-none focus:ring-0 ${
            activeTab === "visual" ? "block" : "hidden"
          } [&_h2]:text-2xl [&_h2]:font-black [&_h2]:my-4 [&_h2]:text-zinc-900 [&_h2]:dark:text-white [&_h3]:text-xl [&_h3]:font-bold [&_h3]:my-3 [&_h3]:text-zinc-900 [&_h3]:dark:text-white [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-red-600 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:bg-zinc-50 [&_blockquote]:dark:bg-zinc-800/40 [&_blockquote]:rounded-r-lg [&_a]:text-blue-600 [&_a]:underline [&_img]:rounded-xl [&_img]:shadow-md`}
          data-placeholder={placeholder}
        />

        {/* HTML / Kaynak Kodu Modu */}
        {activeTab === "code" && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full p-4 font-mono text-xs text-emerald-600 dark:text-emerald-400 bg-zinc-950 outline-none resize-none leading-relaxed"
            style={{ minHeight }}
          />
        )}

        {/* Canlı Önizleme Modu */}
        {activeTab === "preview" && (
          <div className="p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-950">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2 flex items-center justify-between">
              <span>Haber Sayfası Görünüm Simülasyonu</span>
              <span className="text-emerald-600">Okuyucu Görünümü</span>
            </div>
            <div
              className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed [&_h2]:text-2xl [&_h2]:font-black [&_h2]:my-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-red-600 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:italic [&_a]:text-blue-600 [&_img]:rounded-xl"
              dangerouslySetInnerHTML={{
                __html: editorRef.current?.innerHTML || formatInitialContent(value),
              }}
            />
          </div>
        )}
      </div>

      {/* 3. ALT BİLGİ VE İSTATİSTİK ÇUBUĞU */}
      <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
        <div className="flex items-center gap-3 text-[11px]">
          <span>
            Kelime: <strong className="text-zinc-800 dark:text-zinc-200">{wordCount}</strong>
          </span>
          <span>•</span>
          <span>
            Karakter: <strong className="text-zinc-800 dark:text-zinc-200">{charCount}</strong>
          </span>
          <span>•</span>
          <span>
            Okuma Süresi:{" "}
            <strong className="text-zinc-800 dark:text-zinc-200">~{readTimeMin} dk</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <span className="hidden sm:inline">İpucu: Metni seçerek üstteki araçlarla stillendirebilirsiniz.</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Zengin Editör Aktif
          </span>
        </div>
      </div>
    </div>
  );
}
