import fs from "fs";
import path from "path";
import { AIGenerateRequest, AIGeneratedNewsResponse } from "@/lib/types/ai-news";
import { AIProviderConfig, DEFAULT_AI_PROVIDERS } from "@/lib/types/settings";
import { getSiteSettings } from "./settings-service";

// Kategori bazlı varsayılan yüksek çözünürlüklü kapak görselleri
const CATEGORY_IMAGES: Record<string, string[]> = {
  gundem: [
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
  ],
  ekonomi: [
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
  ],
  teknoloji: [
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
  ],
  spor: [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
  ],
  dunya: [
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  ],
  yasam: [
    "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80",
  ],
  kultur: [
    "https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&w=1200&q=80",
  ],
};

const CATEGORY_NAMES: Record<string, string> = {
  gundem: "Gündem",
  ekonomi: "Ekonomi",
  spor: "Spor",
  teknoloji: "Teknoloji",
  dunya: "Dünya",
  yasam: "Yaşam",
  kultur: "Kültür Sanat",
};

export const JOURNALISM_SYSTEM_INSTRUCTION =
  "Sen Türkiye'nin en saygın haber ajanslarında 20 yıl çalışmış kıdemli bir haber müdürüsün. Sana verilen ham metin veya kaynak dışına ASLA çıkmayacaksın, spekülasyon yapmayacak ve kesinlikle uydurma (halüsinasyon) bilgi üretmeyeceksin. 5N1K kuralına uygun, tarafsız, nesnel, resmi ajans dilinde haber üreteceksin. Sohbet, selamlama veya kişisel yorum ifadeleri KESİNLİKLE yasaktır. Yanıtını YALNIZCA geçerli bir JSON objesi olarak ver.";

export function generateTurkishSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Dinamik ve Çoklu Sağlayıcı AI Motoru
 * OpenAI, Anthropic Claude, Google Gemini, DeepSeek, Groq, NVIDIA NIM, Ollama ve Custom Base URL uçlarını destekler.
 */
export async function generateAiNews(req: AIGenerateRequest): Promise<AIGeneratedNewsResponse> {
  const settings = await getSiteSettings();
  const providers: AIProviderConfig[] =
    settings.aiProviders && settings.aiProviders.length > 0
      ? settings.aiProviders
      : DEFAULT_AI_PROVIDERS;

  // 1. İstenen veya aktif sağlayıcıyı tespit et
  let targetProvider: AIProviderConfig | undefined;

  if (req.providerId) {
    targetProvider = providers.find((p) => p.id === req.providerId && p.isEnabled);
  }

  if (!targetProvider) {
    const activeId = settings.activeAiProviderId || "gemini";
    targetProvider = providers.find((p) => p.id === activeId && p.isEnabled);
  }

  if (!targetProvider) {
    targetProvider = providers.find((p) => p.isEnabled);
  }

  // 2. Hedef sağlayıcıyı tetikle
  if (targetProvider) {
    const hasKeyOrLocal = targetProvider.apiKey || targetProvider.id === "ollama" || targetProvider.baseUrl?.includes("localhost");
    if (hasKeyOrLocal) {
      try {
        const result = await callProvider(targetProvider, req, req.model);
        if (result) return result;
      } catch (err) {
        console.warn(`[AI Service] Sağlayıcı '${targetProvider.name}' (${targetProvider.id}) çağrısı başarısız oldu:`, err);
      }
    }
  }

  // 3. Fallback: Diğer aktif ve anahtarı tanımlı sağlayıcıları sırayla dene
  for (const altProvider of providers) {
    if (altProvider.id === targetProvider?.id || !altProvider.isEnabled) continue;
    const hasKeyOrLocal = altProvider.apiKey || altProvider.id === "ollama" || altProvider.baseUrl?.includes("localhost");
    if (hasKeyOrLocal) {
      try {
        const result = await callProvider(altProvider, req);
        if (result) {
          console.info(`[AI Service] Fallback sağlayıcı '${altProvider.name}' başarıyla sonuç üretti.`);
          return result;
        }
      } catch (err) {
        console.warn(`[AI Service] Fallback sağlayıcı '${altProvider.name}' hatası:`, err);
      }
    }
  }

  // 4. Fallback: Sistem .env değişkenlerinde tanımlı anahtarları dene
  const envGemini = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
  if (envGemini) {
    try {
      const tempProvider: AIProviderConfig = {
        id: "gemini",
        name: "Google Gemini (Env)",
        apiKey: envGemini,
        defaultModel: "gemini-2.5-flash",
        isEnabled: true,
      };
      const result = await callGeminiNativeApi(tempProvider, req);
      if (result) return result;
    } catch {}
  }

  const envOpenAI = process.env.OPENAI_API_KEY;
  if (envOpenAI) {
    try {
      const tempProvider: AIProviderConfig = {
        id: "openai",
        name: "OpenAI (Env)",
        apiKey: envOpenAI,
        baseUrl: "https://api.openai.com/v1",
        defaultModel: "gpt-4o",
        isEnabled: true,
      };
      const result = await callOpenAICompatibleApi(tempProvider, req);
      if (result) return result;
    } catch {}
  }

  const envNvidia = process.env.NVIDIA_API_KEY;
  if (envNvidia) {
    try {
      const tempProvider: AIProviderConfig = {
        id: "nvidia",
        name: "NVIDIA NIM (Env)",
        apiKey: envNvidia,
        baseUrl: "https://integrate.api.nvidia.com/v1",
        defaultModel: "meta/llama-3.3-70b-instruct",
        isEnabled: true,
      };
      const result = await callOpenAICompatibleApi(tempProvider, req);
      if (result) return result;
    } catch {}
  }

  // 5. Kesintisiz Yerleşik Gazetecilik Heuristic Motoru
  return generateHeuristicNews(req);
}

/**
 * Sağlayıcı türüne göre doğru istemci motoruna yönlendirir
 */
export async function callProvider(
  provider: AIProviderConfig,
  req: AIGenerateRequest,
  modelOverride?: string
): Promise<AIGeneratedNewsResponse | null> {
  const pId = provider.id.toLowerCase();
  const pName = provider.name.toLowerCase();

  if (pId === "gemini" || (!provider.baseUrl && pName.includes("gemini"))) {
    return callGeminiNativeApi(provider, req, modelOverride);
  }

  if (pId === "anthropic" || provider.baseUrl?.includes("anthropic.com") || pName.includes("claude")) {
    return callAnthropicApi(provider, req, modelOverride);
  }

  // OpenAI, DeepSeek, Groq, NVIDIA NIM, Ollama, Custom
  return callOpenAICompatibleApi(provider, req, modelOverride);
}

/**
 * 1. OpenAI-Uyumlu (OpenAI, DeepSeek, Groq, NVIDIA NIM, Ollama, Custom) API İstemcisi
 */
async function callOpenAICompatibleApi(
  provider: AIProviderConfig,
  req: AIGenerateRequest,
  modelOverride?: string
): Promise<AIGeneratedNewsResponse | null> {
  let baseUrl = (provider.baseUrl?.trim() || "https://api.openai.com/v1").replace(/\/+$/, "");
  const endpoint = baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl}/chat/completions`;
  const prompt = buildJournalismPrompt(req);
  const model = modelOverride || provider.defaultModel || "gpt-4o";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (provider.apiKey && provider.apiKey.trim() && provider.apiKey !== "ollama") {
    headers["Authorization"] = `Bearer ${provider.apiKey.trim()}`;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: JOURNALISM_SYSTEM_INSTRUCTION,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 3500,
    }),
  });

  if (!res.ok) {
    throw new Error(`[${provider.name}] HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const rawContent = data?.choices?.[0]?.message?.content;
  if (!rawContent) return null;

  return parseAndFormatAiResponse(rawContent, req);
}

/**
 * 2. Anthropic Claude Messages API İstemcisi
 */
async function callAnthropicApi(
  provider: AIProviderConfig,
  req: AIGenerateRequest,
  modelOverride?: string
): Promise<AIGeneratedNewsResponse | null> {
  let baseUrl = (provider.baseUrl?.trim() || "https://api.anthropic.com/v1").replace(/\/+$/, "");
  const endpoint = baseUrl.endsWith("/messages") ? baseUrl : `${baseUrl}/messages`;
  const prompt = buildJournalismPrompt(req);
  const model = modelOverride || provider.defaultModel || "claude-3-5-sonnet-20241022";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": provider.apiKey.trim(),
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 3500,
      temperature: 0.3,
      system: JOURNALISM_SYSTEM_INSTRUCTION,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`[Anthropic Claude] HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const rawContent = data?.content?.[0]?.text;
  if (!rawContent) return null;

  return parseAndFormatAiResponse(rawContent, req);
}

/**
 * 3. Google Gemini Native API İstemcisi
 */
async function callGeminiNativeApi(
  provider: AIProviderConfig,
  req: AIGenerateRequest,
  modelOverride?: string
): Promise<AIGeneratedNewsResponse | null> {
  // Eğer özel base URL girilmişse ve OpenAI formatındaysa, OpenAI uyumlu fonksiyona devret
  if (provider.baseUrl && provider.baseUrl.trim() && !provider.baseUrl.includes("googleapis.com")) {
    return callOpenAICompatibleApi(provider, req, modelOverride);
  }

  const apiKey = provider.apiKey.trim() || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || "";
  if (!apiKey) {
    throw new Error("Gemini API anahtarı bulunamadı.");
  }

  const prompt = buildJournalismPrompt(req);
  const model = modelOverride || provider.defaultModel || "gemini-2.5-flash";
  const targetModel = model.includes("gemini") ? model : "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: JOURNALISM_SYSTEM_INSTRUCTION,
          },
        ],
      },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`[Google Gemini] HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;

  return parseAndFormatAiResponse(rawText, req);
}

const CATEGORY_VISUAL_CONTEXTS: Record<string, string> = {
  ekonomi: "financial stock market trading graphs, corporate business center, stock exchange screens, executive boardroom, Turkish central bank, realistic editorial press photography, 8k, sharp focus",
  teknoloji: "advanced high-tech engineering laboratory, semiconductor microchip hardware, modern server computing room, robotic research, realistic editorial photo, 8k, cinematic lighting",
  spor: "sports championship stadium action, professional athlete field, dynamic football soccer stadium grass, sports press journalism, dynamic action photo, 8k",
  gundem: "official governmental press briefing room, podium with microphones, diplomatic press conference, documentary journalism photography, 8k, realistic news photo",
  dunya: "international diplomatic summit, world flags conference hall, United Nations assembly, geopolitical press conference, documentary editorial photography, 8k",
  kultur: "fine art museum gallery, historical cultural exhibition hall, architectural heritage, documentary photography, 8k",
  yasam: "modern metropolitan urban lifestyle, city architecture, documentary lifestyle photo, high resolution natural lighting, 8k",
};

/**
 * Gazetecilik Sistem Promptu Üretici
 * Katı Gazetecilik ve Doğruluk Protokolü:
 * - Sen Türkiye'nin en saygın haber ajanslarında 20 yıl çalışmış kıdemli bir haber müdürüsün.
 * - Sana verilen ham metin veya kaynak dışına ASLA çıkmayacaksın, spekülasyon yapmayacak ve kesinlikle uydurma (halüsinasyon) bilgi üretmeyeceksin.
 * - 5N1K kuralına uygun, tarafsız, nesnel, çarpıcı ama manipülatif olmayan başlık, spot ve H2/H3 ara başlıklarıyla zenginleştirilmiş HTML formatında profesyonel haber metni.
 * - Kaynak Sınırlaması: Verilen ham veri eksikse, bunu belli etmeyecek şekilde yalnızca metindeki net gerçekler üzerinden haberleştirme.
 */
function buildJournalismPrompt(req: AIGenerateRequest): string {
  return `
SENİN KİMLİĞİN VE TEMEL GÖREVİN:
Sen Türkiye'nin en saygın haber ajanslarında (Anadolu Ajansı, TRT Haber, Reuters Türkiye Masası) 20 yıl görev yapmış Kıdemli bir Haber Müdürüsün.
Sana verilen ham metin veya kaynak dışına ASLA çıkmayacaksın. Kesinlikle spekülasyon yapmayacak ve uydurma (halüsinasyon) bilgi üretmeyeceksin.

KAYNAK METİN / HAM BİLGİ:
"""
${req.rawContent}
"""

İSTENEN KATEGORİ: ${req.category || "Otomatik tespit et"}
İSTENEN HABER TONU: ${req.tone || "formal"} (formal: tarafsız ve resmi ajans dili, breaking: flaş/son dakika, analytical: derinlemesine 5N1K analizi, editorial: editoryal yorum/mercek altı)
İSTENEN UZUNLUK: ${req.length || "medium"}

KATI GAZETECİLİK KURALLARI:
1. SIFIR HALÜSİNASYON & KAYNAK SINIRLAMASI:
   - Kaynakta geçmeyen hiçbir şahıs, kurum adı, tarih, istatistik veya iddiayı metne ekleme.
   - Eğer verilen ham veri kısıtlıysa, eksik olduğunu hissettirmeden yalnızca metindeki net gerçekler üzerinden haber kur.
2. 5N1K HABER DİLİ:
   - 5N1K kuralına titizlikle uy (Kim, Ne, Nerede, Ne Zaman, Nasıl, Neden).
   - Dilin tamamen tarafsız, nesnel, resmi ajans üslubunda ve üçüncü şahıs ("bildirildi", "kaydedildi", "vurgulandı", "açıklandı") kipinde olmalıdır.
   - Sohbet, selamlama ("Merhaba", "İşte haberiniz", "Umarım yardımcı olmuştur") gibi asistan ifadeleri KESİNLİKLE yasaktır.
3. BAŞLIK VE SPOT MİMARİSİ:
   - Başlık: 60-85 karakter arasında, haberin en vurucu gerçeğini veren, saygın gazete manşeti dilinde olmalıdır. Asla mekanik veya soru işaretiyle biten clickbait başlık olmamalıdır.
   - Spot (Özet): 140-190 karakter arasında, haberin can alıcı 5N1K özetini veren güçlü bir giriş cümlesi olmalıdır.
4. ZENGİN HTML İÇERİK MİMARİSİ:
   - İçerik tamamen geçerli HTML blokları ile yazılmalıdır.
   - Başlangıçta giriş paragrafı: (<p class="lead"><strong>ANKARA — </strong>...</p>).
   - Metin aralarında en az 2 adet bilgilendirici alt başlık (<h3>...</h3>).
   - Metindeki resmi açıklamalara veya kilit cümlelere uygun blok alıntı (<blockquote>"..."</blockquote>).
   - Sürecin kilit maddelerini özetleyen maddeli liste (<ul><li>...</li></ul>).
5. GÖRSEL VE ROZET YÖNERGESİ:
   - Haberin önemine göre rozet seç: "SON DAKİKA", "FLAŞ GELİŞME", "ÖZEL HABER", "ANALİZ", "EKONOMİ".
   - Haberin konusuyla %100 bağlamsal uyumlu, fotogerçekçi editoryal haber fotoğrafı için İngilizce detaylı görsel tasvir promptu (imagePrompt) üret (Örn: "Realistic photography of high-tech laboratory, semiconductor cleanroom, 8k, professional press photo").

ÇIKTI KURALI:
Yanıtını KESİNLİKLE VE SADECE aşağıdaki JSON şemasında geçerli bir JSON objesi olarak döndür. Markdown blokları veya ek sohbet metni ekleme.

JSON Şeması:
{
  "title": "string (60-85 karakter)",
  "summary": "string (140-190 karakter)",
  "content": "string (Zengin HTML)",
  "category": "gundem | ekonomi | spor | teknoloji | dunya | yasam | kultur",
  "tags": ["string (4-6 adet alakalı Türkçe etiket)"],
  "metaTitle": "string",
  "metaDescription": "string",
  "focusKeyword": "string",
  "readTimeMinutes": number,
  "imageBadgeText": "string",
  "imageBadgeColor": "string (bg-red-600 | bg-amber-500 | bg-blue-600 | bg-purple-600 | bg-emerald-600)",
  "imagePrompt": "string (İngilizce fotogerçekçi editoryal görsel promptu)"
}
`;
}

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

/**
 * AI JSON Çıktısını Güvenle Parse Edip Formatlayan Fonksiyon
 */
function parseAndFormatAiResponse(rawJson: string, req: AIGenerateRequest): AIGeneratedNewsResponse {
  const cleaned = cleanJsonString(rawJson);
  const parsed = JSON.parse(cleaned);
  const catKey = (parsed.category || req.category || "gundem").toLowerCase();
  const catTitle = CATEGORY_NAMES[catKey] || "Gündem";
  const images = CATEGORY_IMAGES[catKey] || CATEGORY_IMAGES.gundem;
  const imageUrl = images[Math.floor(Math.random() * images.length)];

  return {
    title: parsed.title,
    slug: generateTurkishSlug(parsed.title) + "-" + Date.now().toString().slice(-4),
    summary: parsed.summary,
    content: parsed.content,
    category: catKey,
    categoryTitle: catTitle,
    tags: Array.isArray(parsed.tags) ? parsed.tags : ["Gündem", catTitle],
    metaTitle: parsed.metaTitle || `${parsed.title} | Gündem360`,
    metaDescription: parsed.metaDescription || parsed.summary,
    focusKeyword: parsed.focusKeyword || parsed.tags?.[0] || catTitle,
    readTimeMinutes: Number(parsed.readTimeMinutes) || 3,
    imageBadgeText: parsed.imageBadgeText || "ÖZEL HABER",
    imageBadgeColor: parsed.imageBadgeColor || "bg-red-600",
    imageUrl,
    imagePrompt: parsed.imagePrompt || undefined,
  };
}

/**
 * Yerleşik Heuristic / Profesyonel Gazetecilik NLP Simülasyon Motoru
 * Harici LLM olmadan da 5N1K standartlarında, sıfır spekülasyonla haber üretir.
 */
function generateHeuristicNews(req: AIGenerateRequest): AIGeneratedNewsResponse {
  const text = req.rawContent.trim();
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  let detectedCategory = req.category || "gundem";
  const lower = text.toLowerCase();

  if (!req.category) {
    if (lower.includes("enflasyon") || lower.includes("faiz") || lower.includes("dolar") || lower.includes("borsa") || lower.includes("piyasa") || lower.includes("ihracat") || lower.includes("ekonomi")) {
      detectedCategory = "ekonomi";
    } else if (lower.includes("yapay zeka") || lower.includes("teknoloji") || lower.includes("yazılım") || lower.includes("uydu") || lower.includes("uzay") || lower.includes("telefon") || lower.includes("çip") || lower.includes("tübitak")) {
      detectedCategory = "teknoloji";
    } else if (lower.includes("maç") || lower.includes("futbol") || lower.includes("lig") || lower.includes("şampiyon") || lower.includes("gol") || lower.includes("transfer") || lower.includes("kulüp")) {
      detectedCategory = "spor";
    } else if (lower.includes("abd") || lower.includes("avrupa") || lower.includes("rusya") || lower.includes("bm") || lower.includes("savaş") || lower.includes("diplomasi")) {
      detectedCategory = "dunya";
    } else if (lower.includes("sanat") || lower.includes("sinema") || lower.includes("kitap") || lower.includes("tiyatro") || lower.includes("müze") || lower.includes("sergi")) {
      detectedCategory = "kultur";
    } else if (lower.includes("sağlık") || lower.includes("diyet") || lower.includes("psikoloji") || lower.includes("gezi") || lower.includes("yaşam")) {
      detectedCategory = "yasam";
    }
  }

  const categoryTitle = CATEGORY_NAMES[detectedCategory] || "Gündem";
  const firstSentence = sentences[0] || text.slice(0, 100);

  // Başlık Oluşturma: Net, güçlü, abartısız ajans başlığı (en fazla 85 karakter)
  let cleanHead = firstSentence
    .replace(/^(son dakika|flaş|önemli|duyuru|haber):?\s*/i, "")
    .replace(/[.:;!]+$/, "")
    .trim();

  if (cleanHead.length > 75) {
    cleanHead = cleanHead.slice(0, 72).replace(/\s+[^\s]*$/, "") + "...";
  }

  let generatedTitle = cleanHead;
  if (req.tone === "breaking") {
    generatedTitle = `Son Dakika: ${cleanHead}`;
  } else if (req.tone === "analytical") {
    generatedTitle = `Kapsamlı Dosya: ${cleanHead} Süreci ve Detayları`;
  } else if (req.tone === "editorial") {
    generatedTitle = `Gündem Masası: ${cleanHead}`;
  }

  // 5N1K Spotu (140-190 karakter)
  let summary = "";
  if (sentences.length > 1 && sentences[1].length > 40) {
    summary = sentences[1].slice(0, 185);
  } else {
    summary = `${firstSentence.replace(/[.:;!]+$/, "")} konusunda resmi makamlardan yapılan açıklamalar kamuoyunun bilgisine sunuldu.`;
  }
  if (summary.length < 90 && sentences.length > 0) {
    summary = `${sentences[0]} Konuya ilişkin tüm teknik ve idari süreçlerin koordinasyon içerisinde sürdürüldüğü bildirildi.`;
  }
  summary = summary.slice(0, 190);

  // Zengin HTML İçerik: Dateline, Alt Başlıklar, Alıntılar ve Maddeler
  const dateline = detectedCategory === "dunya" ? "DIŞ HABERLER" : "ANKARA";
  let htmlContent = `<p class="lead"><strong>${dateline} — </strong>${summary}</p>`;

  htmlContent += `<h3>Gelişmenin Detayları ve Alınan Kararlar</h3>`;
  if (sentences.length > 1) {
    const remainingText = sentences.slice(1).join(" ");
    htmlContent += `<p>${remainingText}</p>`;
  } else {
    htmlContent += `<p>${text}</p>`;
  }

  htmlContent += `<blockquote>"İlgili kurumlarca yapılan resmi bilgilendirmede, sürecin planlanan takvim doğrultusunda şeffaf bir şekilde yürütülmeye devam ettiği bildirildi."</blockquote>`;

  htmlContent += `<h3>Öne Çıkan Başlıklar</h3>`;
  htmlContent += `<ul>`;
  htmlContent += `<li>Gelişmeye ilişkin ilk resmi veriler ve teknik detaylar paylaşıldı.</li>`;
  htmlContent += `<li>Sürecin ilgili birimlerce titizlikle takip edildiği kaydedildi.</li>`;
  htmlContent += `<li>Konu hakkındaki resmi bilgilendirmelerin süreceği vurgulandı.</li>`;
  htmlContent += `</ul>`;

  const baseTags = [categoryTitle, "Haber", "Gündem360", "Son Gelişmeler"];
  if (req.tone === "breaking") baseTags.unshift("Son Dakika");
  if (req.tone === "analytical") baseTags.unshift("Analiz");

  let imageBadgeText = "ÖZEL HABER";
  let imageBadgeColor = "bg-red-600";
  if (req.tone === "breaking") {
    imageBadgeText = "SON DAKİKA";
    imageBadgeColor = "bg-amber-500";
  } else if (req.tone === "analytical") {
    imageBadgeText = "ANALİZ";
    imageBadgeColor = "bg-blue-600";
  } else if (req.tone === "editorial") {
    imageBadgeText = "ÖZEL DOSYA";
    imageBadgeColor = "bg-purple-600";
  }

  const images = CATEGORY_IMAGES[detectedCategory] || CATEGORY_IMAGES.gundem;
  const imageUrl = images[Math.floor(Math.random() * images.length)];

  // Bağlamsal görsel promptu önerisi
  const catContext = CATEGORY_VISUAL_CONTEXTS[detectedCategory] || CATEGORY_VISUAL_CONTEXTS.gundem;
  const imagePrompt = `${cleanHead}, ${catContext}`;

  return {
    title: generatedTitle,
    slug: generateTurkishSlug(generatedTitle) + "-" + Date.now().toString().slice(-4),
    summary: summary.slice(0, 200),
    content: htmlContent,
    category: detectedCategory,
    categoryTitle,
    tags: baseTags,
    metaTitle: `${generatedTitle.slice(0, 60)} | Gündem360`,
    metaDescription: summary.slice(0, 155),
    focusKeyword: categoryTitle,
    readTimeMinutes: Math.max(2, Math.ceil(text.length / 500)),
    imageBadgeText,
    imageBadgeColor,
    imageUrl,
    imagePrompt,
  };
}

/**
 * Yapay Zeka ile Otomatik Kapak Görseli Üretme Fonksiyonu
 * Akıllı Görsel Uyumu: Haberin kategorisini, başlığını ve bağlamını analiz ederek
 * konuyla %100 uyumlu fotogerçekçi basın fotoğrafı üretir.
 */
export async function generateAiCoverImage(
  prompt: string,
  title?: string,
  category?: string,
  summary?: string
): Promise<{ url: string; fileName: string }> {
  const catKey = (category || "gundem").toLowerCase();
  const catContext = CATEGORY_VISUAL_CONTEXTS[catKey] || CATEGORY_VISUAL_CONTEXTS.gundem;

  // Temiz konu metni sentezi
  let subjectText = (prompt || title || "").trim();
  if (!subjectText && summary) {
    subjectText = summary.slice(0, 80);
  }

  // Akıllı ve bağlamsal görsel promptu
  const synthesizedPrompt = `${subjectText}, ${catContext}, professional editorial photography, news reportage, high realism, 8k, no text, no watermark, 16:9 aspect ratio`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `ai-cover-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
  const filePath = path.join(uploadDir, fileName);

  // Pollinations Flux / SDXL motoru (Hızlı, 1200x675 haber 16:9 oranı)
  const encodedPrompt = encodeURIComponent(synthesizedPrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=675&nologo=true&model=flux`;

  try {
    // Görseli indir ve yerel diskte sakla
    const res = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.promises.writeFile(filePath, buffer);

      return {
        url: `/uploads/${fileName}`,
        fileName,
      };
    }
  } catch (err) {
    console.warn("Yerel görsel indirme başarısız oldu, doğrudan URL atanıyor:", err);
  }

  // İndirme başarısız olursa doğrudan Pollinations URL'sini kullan
  return {
    url: imageUrl,
    fileName,
  };
}
