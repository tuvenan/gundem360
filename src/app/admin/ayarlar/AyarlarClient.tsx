"use client";

import React, { useState, useTransition } from "react";
import {
  SiteSettings,
  CategoryItem,
  SiteSeoSettings,
  AIProviderConfig,
  DEFAULT_AI_PROVIDERS,
} from "@/types/news";
import {
  Settings,
  Save,
  CheckCircle,
  Globe,
  Sliders,
  Share2,
  Search,
  Code,
  ShieldAlert,
  RotateCcw,
  Check,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Layers,
  Flame,
  Camera,
  Film,
  Vote,
  CloudSun,
  TrendingUp,
  Radio,
  FileCode,
  Zap,
  Wand2,
  Cpu,
  Key,
  Eye,
  EyeOff,
  Bot,
  Plus,
  Trash2,
  Server,
  Terminal,
  Info,
  CheckCircle2,
  X,
} from "lucide-react";
import SiteSeoPanel from "@/components/admin/SiteSeoPanel";
import ClearCacheButton from "@/components/admin/ClearCacheButton";

interface AyarlarClientProps {
  initialSettings: SiteSettings;
  initialCategories?: CategoryItem[];
}

type TabKey = "general" | "widgets" | "social" | "seo" | "ai" | "advanced";

const PROVIDER_PRESETS = [
  {
    id: "openai",
    name: "OpenAI (ChatGPT)",
    defaultModel: "gpt-4o",
    baseUrl: "https://api.openai.com/v1",
    keyPlaceholder: "sk-proj-...",
    popularModels: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o3-mini"],
    description: "Dünya standartlarında genel amaçlı model ailesi (GPT-4o serisi).",
  },
  {
    id: "deepseek",
    name: "DeepSeek AI",
    defaultModel: "deepseek-chat",
    baseUrl: "https://api.deepseek.com/v1",
    keyPlaceholder: "sk-...",
    popularModels: ["deepseek-chat", "deepseek-reasoner"],
    description: "Yüksek akıl yürütme kabiliyetli, ultra ekonomik açık mimarili model.",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    defaultModel: "claude-3-5-sonnet-20241022",
    baseUrl: "https://api.anthropic.com/v1",
    keyPlaceholder: "sk-ant-...",
    popularModels: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
    description: "Editoryal metin yazımı ve karmaşık analizlerde üstün Türkçe performansı.",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    defaultModel: "gemini-2.5-flash",
    baseUrl: "",
    keyPlaceholder: "AIzaSy...",
    popularModels: ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
    description: "Google'ın hızlı, geniş bağlamlı ve güçlü Türkçe haber asistanı.",
  },
  {
    id: "nvidia",
    name: "NVIDIA NIM",
    defaultModel: "meta/llama-3.3-70b-instruct",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    keyPlaceholder: "nvapi-...",
    popularModels: ["meta/llama-3.3-70b-instruct", "nvidia/nemotron-4-340b-instruct", "mistralai/mistral-large-2-instruct"],
    description: "NVIDIA bulut çıkarım hızlandırmalı kurumsal LLaMA 3.3 altyapısı.",
  },
  {
    id: "groq",
    name: "Groq Cloud (LPU)",
    defaultModel: "llama-3.3-70b-versatile",
    baseUrl: "https://api.groq.com/openai/v1",
    keyPlaceholder: "gsk_...",
    popularModels: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768"],
    description: "LPU donanımı ile saniyede yüzlerce kelime üreten ışık hızında haber motoru.",
  },
  {
    id: "ollama",
    name: "Ollama (Yerel Sunucu)",
    defaultModel: "llama3:latest",
    baseUrl: "http://localhost:11434/v1",
    keyPlaceholder: "ollama (isteğe bağlı)",
    popularModels: ["llama3:latest", "mistral:latest", "qwen2.5:latest"],
    description: "Kendi yerel bilgisayarınızda veya sunucunuzda çalışan gizli AI modelleri.",
  },
  {
    id: "custom",
    name: "Özel (Custom Base URL)",
    defaultModel: "custom-model",
    baseUrl: "https://",
    keyPlaceholder: "API Anahtarı...",
    popularModels: [],
    description: "Herhangi bir OpenAI uyumlu proxy veya kurumsal yapay zeka uç noktası.",
  },
];

export default function AyarlarClient({
  initialSettings,
}: AyarlarClientProps) {
  const [settings, setSettings] = useState<SiteSettings>({
    ...initialSettings,
    aiProviders:
      initialSettings.aiProviders && initialSettings.aiProviders.length > 0
        ? initialSettings.aiProviders
        : DEFAULT_AI_PROVIDERS,
    activeAiProviderId: initialSettings.activeAiProviderId || "gemini",
  });
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Çoklu sağlayıcı UI durumları
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("deepseek");
  const [newCustomName, setNewCustomName] = useState("");
  const [newCustomId, setNewCustomId] = useState("");
  const [newCustomApiKey, setNewCustomApiKey] = useState("");
  const [newCustomBaseUrl, setNewCustomBaseUrl] = useState("https://api.deepseek.com/v1");
  const [newCustomModel, setNewCustomModel] = useState("deepseek-chat");

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateProvider = (id: string, field: keyof AIProviderConfig, value: any) => {
    setSettings((prev) => {
      const providers = [...(prev.aiProviders || DEFAULT_AI_PROVIDERS)];
      const idx = providers.findIndex((p) => p.id === id);
      if (idx !== -1) {
        providers[idx] = { ...providers[idx], [field]: value };
      }
      return { ...prev, aiProviders: providers };
    });
  };

  const handleToggleProvider = (id: string) => {
    setSettings((prev) => {
      const providers = [...(prev.aiProviders || DEFAULT_AI_PROVIDERS)];
      const idx = providers.findIndex((p) => p.id === id);
      if (idx !== -1) {
        providers[idx] = { ...providers[idx], isEnabled: !providers[idx].isEnabled };
      }
      return { ...prev, aiProviders: providers };
    });
  };

  const handleSetDefaultProvider = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      activeAiProviderId: id,
    }));
  };

  const handleDeleteProvider = (id: string) => {
    if (!confirm("Bu yapay zeka sağlayıcısını kaldırmak istediğinize emin misiniz?")) return;
    setSettings((prev) => {
      const filtered = (prev.aiProviders || DEFAULT_AI_PROVIDERS).filter((p) => p.id !== id);
      const nextActive = prev.activeAiProviderId === id ? filtered[0]?.id || "gemini" : prev.activeAiProviderId;
      return { ...prev, aiProviders: filtered, activeAiProviderId: nextActive };
    });
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = PROVIDER_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setNewCustomName(preset.name);
      setNewCustomId(preset.id === "custom" ? `custom-${Date.now().toString().slice(-4)}` : preset.id);
      setNewCustomBaseUrl(preset.baseUrl);
      setNewCustomModel(preset.defaultModel);
      setNewCustomApiKey("");
    }
  };

  const handleAddProviderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const preset = PROVIDER_PRESETS.find((p) => p.id === selectedPresetId);

    const id = (newCustomId || (selectedPresetId === "custom" ? `custom-${Date.now().toString().slice(-4)}` : selectedPresetId)).trim().toLowerCase();
    const name = (newCustomName || preset?.name || "Özel Sağlayıcı").trim();
    const defaultModel = (newCustomModel || preset?.defaultModel || "gpt-4o").trim();
    const baseUrl = (newCustomBaseUrl || preset?.baseUrl || "").trim();
    const apiKey = newCustomApiKey.trim();

    const newEntry: AIProviderConfig = {
      id,
      name,
      apiKey,
      baseUrl: baseUrl || undefined,
      defaultModel,
      isEnabled: true,
    };

    setSettings((prev) => {
      const current = [...(prev.aiProviders || DEFAULT_AI_PROVIDERS)];
      const existingIdx = current.findIndex((p) => p.id === id);
      if (existingIdx !== -1) {
        current[existingIdx] = newEntry;
      } else {
        current.push(newEntry);
      }
      return {
        ...prev,
        aiProviders: current,
        activeAiProviderId: id,
      };
    });

    setIsAddModalOpen(false);
    setNewCustomName("");
    setNewCustomId("");
    setNewCustomApiKey("");
    setNewCustomBaseUrl("");
    setNewCustomModel("");
    setNotification({
      type: "success",
      message: `"${name}" sağlayıcısı başarıyla eklendi ve varsayılan olarak seçildi!`,
    });
    setTimeout(() => setNotification(null), 3500);
  };

  // Genel text input değişiklik işleyicisi
  const handleInputChange = (field: keyof SiteSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // SEO değişiklik işleyicisi
  const handleSeoChange = (updatedSeo: SiteSeoSettings) => {
    setSettings((prev) => ({
      ...prev,
      seo: updatedSeo,
    }));
  };

  // Form Gönderme (API Kayıt)
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Ayarlar kaydedilemedi.");
        }

        const updated: SiteSettings = await res.json();
        setSettings(updated);
        setNotification({
          type: "success",
          message: "Tüm site ayarları, widget tercihleri ve SEO konfigürasyonu başarıyla kaydedildi!",
        });
        setTimeout(() => setNotification(null), 4000);
      } catch (err: any) {
        console.error("Save settings error:", err);
        setNotification({
          type: "error",
          message: err.message || "Ayarlar kaydedilirken bir hata oluştu.",
        });
        setTimeout(() => setNotification(null), 5000);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* 1. ÜST BAŞLIK */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-red-600" />
              <span>Kontrol Merkezi & Site Ayarları</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
              CMS v2.5
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Genel kimlik, ön yüz widget görünürlükleri, sosyal medya, SEO şablonları, bakım modu ve özel kod enjeksiyonları.
          </p>
        </div>

        {/* Hızlı Kaydet Butonu */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>{isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}</span>
        </button>
      </div>

      {/* BİLDİRİM BANNER'I */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold animate-in fade-in transition ${
            notification.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 2. SEKME NAVİGASYONU (5 KAPSAMLI SEKME) */}
      <div className="flex p-1 bg-zinc-200/80 dark:bg-zinc-800/80 rounded-2xl gap-1 text-xs font-bold overflow-x-auto no-scrollbar shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition whitespace-nowrap cursor-pointer ${
            activeTab === "general"
              ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Genel & Kurumsal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("widgets")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition whitespace-nowrap cursor-pointer ${
            activeTab === "widgets"
              ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Ön Yüz Widget'ları</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition whitespace-nowrap cursor-pointer ${
            activeTab === "social"
              ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Sosyal Medya</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition whitespace-nowrap cursor-pointer ${
            activeTab === "seo"
              ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>SEO & Arama Motoru</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition whitespace-nowrap cursor-pointer ${
            activeTab === "ai"
              ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>Yapay Zeka (AI) & API</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("advanced")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition whitespace-nowrap cursor-pointer ${
            activeTab === "advanced"
              ? "bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Gelişmiş & Enjeksiyon</span>
        </button>
      </div>

      {/* 3. SEKME İÇERİKLERİ */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ===================== SEKME 1: GENEL KİMLİK & KURUMSAL ===================== */}
        {activeTab === "general" && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 animate-in fade-in">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-red-600" />
                <span>Genel Kimlik ve Yayın Bilgileri</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Site adı, sloganı, logonun URL adresi ve kurumsal künye bilgileri.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  Site Adı *
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange("siteName", e.target.value)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  Site Sloganı *
                </label>
                <input
                  type="text"
                  value={settings.siteSlogan}
                  onChange={(e) => handleInputChange("siteSlogan", e.target.value)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  Logo Görseli URL
                </label>
                <input
                  type="text"
                  value={settings.siteLogo || ""}
                  onChange={(e) => handleInputChange("siteLogo", e.target.value)}
                  placeholder="/logo.png veya https://..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  Favicon URL
                </label>
                <input
                  type="text"
                  value={settings.favicon || ""}
                  onChange={(e) => handleInputChange("favicon", e.target.value)}
                  placeholder="/favicon.ico"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  İletişim E-Postası *
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  İletişim Telefonu *
                </label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  Merkez Ofis Adresi *
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  Yayıncı Şirket Resmi Ünvanı
                </label>
                <input
                  type="text"
                  value={settings.companyName || ""}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  placeholder="Gündem360 Medya ve Yayıncılık A.Ş."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  Vergi Dairesi ve Numarası
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={settings.taxOffice || ""}
                    onChange={(e) => handleInputChange("taxOffice", e.target.value)}
                    placeholder="Beyoğlu V.D."
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="text"
                    value={settings.taxNumber || ""}
                    onChange={(e) => handleInputChange("taxNumber", e.target.value)}
                    placeholder="4820194829"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  Telif Hakkı & Footer Künye Metni
                </label>
                <input
                  type="text"
                  value={settings.copyrightText || ""}
                  onChange={(e) => handleInputChange("copyrightText", e.target.value)}
                  placeholder="© 2026 Gündem360 Medya Grubu. Tüm hakları saklıdır."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== SEKME 2: ÖN YÜZ WİDGET'LARI ===================== */}
        {activeTab === "widgets" && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 animate-in fade-in">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-red-600" />
                <span>Ön Yüz Modül ve Widget Görünürlükleri</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Ana sayfadaki ve üst başlıktaki (header) modülleri tek tıkla açıp kapatabilirsiniz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Widget 1: Canlı Finans Bandı */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Canlı Finans & Borsa Bandı
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Dolar, Euro, Altın ve BIST 100 anlık kur şeridi.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.showFinanceBar !== false}
                    onChange={(e) => handleInputChange("showFinanceBar", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Widget 2: Hava Durumu Modülü */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 shrink-0">
                    <CloudSun className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Hava Durumu Modülü
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Üst barda büyükşehirlerin anlık hava sıcaklıkları.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.showWeatherWidget !== false}
                    onChange={(e) => handleInputChange("showWeatherWidget", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Widget 3: Son Dakika Flaş Bandı */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Son Dakika Kayan Bandı
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Ana sayfanın tepesinde akan son dakika haberleri.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.showBreakingTicker !== false}
                    onChange={(e) => handleInputChange("showBreakingTicker", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Widget 4: Köşe Yazarları Vitrini */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 shrink-0">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Köşe Yazarları Vitrini
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Ana sayfada günün köşe yazarları ve makaleleri.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.showColumnistsSection !== false}
                    onChange={(e) => handleInputChange("showColumnistsSection", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* Widget 5: Foto Galeri Vitrini */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 shrink-0">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Foto Galeri Vitrini (4'lü Grid)
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Ana sayfadaki bağımsız 4 sütunlu foto galeri kutuları.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.showPhotoGallerySection !== false}
                    onChange={(e) => handleInputChange("showPhotoGallerySection", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Widget 6: Video Galeri Vitrini */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 shrink-0">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Video Galeri Vitrini (4'lü Grid)
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      YouTube bağlantılı 4 sütunlu video vitrini.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.showVideoGallerySection !== false}
                    onChange={(e) => handleInputChange("showVideoGallerySection", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Widget 7: Kamuoyu ve Anket Vitrini */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 shrink-0">
                    <Vote className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Kamuoyu Anketi Vitrini
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Ana sayfada öne çıkarılan canlı anket kartı.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.showPollWidget !== false}
                    onChange={(e) => handleInputChange("showPollWidget", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Widget 8: Otomatik Finans Kurları Servisi */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0">
                    <Zap className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Otomatik Kur Güncellemesi
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Piyasa kapalıyken son kapanış kurlarını koru.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.autoFinanceRates}
                    onChange={(e) => handleInputChange("autoFinanceRates", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ===================== SEKME 3: SOSYAL MEDYA KANALLARI ===================== */}
        {activeTab === "social" && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 animate-in fade-in">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-red-600" />
                <span>Resmi Sosyal Medya ve Kanal Hesapları</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Üst ve alt menülerde ziyaretçilere sunulan sosyal medya bağlantıları.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  X (Twitter) URL
                </label>
                <input
                  type="url"
                  value={settings.twitterUrl}
                  onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                  placeholder="https://x.com/..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  Facebook URL
                </label>
                <input
                  type="url"
                  value={settings.facebookUrl}
                  onChange={(e) => handleInputChange("facebookUrl", e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={settings.instagramUrl}
                  onChange={(e) => handleInputChange("instagramUrl", e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  YouTube Kanalı URL
                </label>
                <input
                  type="url"
                  value={settings.youtubeUrl}
                  onChange={(e) => handleInputChange("youtubeUrl", e.target.value)}
                  placeholder="https://youtube.com/@..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  WhatsApp Kanalı / Hattı
                </label>
                <input
                  type="url"
                  value={settings.whatsappUrl}
                  onChange={(e) => handleInputChange("whatsappUrl", e.target.value)}
                  placeholder="https://whatsapp.com/channel/..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  LinkedIn Şirket URL
                </label>
                <input
                  type="url"
                  value={settings.linkedinUrl || ""}
                  onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                  placeholder="https://linkedin.com/company/..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  Telegram Kanalı URL
                </label>
                <input
                  type="url"
                  value={settings.telegramUrl || ""}
                  onChange={(e) => handleInputChange("telegramUrl", e.target.value)}
                  placeholder="https://t.me/..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                  TikTok Hesabı URL
                </label>
                <input
                  type="url"
                  value={settings.tiktokUrl || ""}
                  onChange={(e) => handleInputChange("tiktokUrl", e.target.value)}
                  placeholder="https://tiktok.com/@..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== SEKME 4: SEO & ARAMA MOTORU ===================== */}
        {activeTab === "seo" && (
          <div className="space-y-4 animate-in fade-in">
            <SiteSeoPanel
              seo={settings.seo || {}}
              siteName={settings.siteName}
              onChange={handleSeoChange}
            />
          </div>
        )}

        {/* ===================== SEKME 5: GELİŞMİŞ & ENJEKSİYON ===================== */}
        {activeTab === "advanced" && (
          <div className="space-y-6 animate-in fade-in">
            {/* 0. Tek Tıkla Önbelleği Temizle Kartı */}
            <ClearCacheButton variant="card" />

            {/* 1. Bakım Modu Kutusu */}
            <div className={`rounded-3xl p-6 sm:p-8 border shadow-sm transition ${
              settings.maintenanceMode
                ? "bg-amber-500/10 border-amber-500/40 dark:bg-amber-950/30 dark:border-amber-700"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    settings.maintenanceMode
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                  }`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Site Bakım Modu (Maintenance Mode)
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Aktif edildiğinde ziyaretçilere bilgilendirme ekranı gösterilir; yönetim paneli erişilebilir kalır.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleInputChange("maintenanceMode", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {settings.maintenanceMode && (
                <div className="mt-4 space-y-2">
                  <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 uppercase">
                    Ziyaretçi Bakım Mesajı
                  </label>
                  <textarea
                    rows={3}
                    value={settings.maintenanceMessage || ""}
                    onChange={(e) => handleInputChange("maintenanceMessage", e.target.value)}
                    placeholder="Sitemiz altyapı çalışmaları nedeniyle geçici olarak bakımdadır..."
                    className="w-full bg-white dark:bg-zinc-950 border border-amber-300 dark:border-amber-800 rounded-xl p-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>

            {/* 2. Analitik & Tag Manager */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                  <span>Google Analytics & Tag Manager Entegrasyonları</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Ölçüm kimliklerini girdiğinizde izleme kodları sayfalara otomatik enjekte edilir.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                    Google Analytics 4 (GA4) Ölçüm Kimliği
                  </label>
                  <input
                    type="text"
                    value={settings.googleAnalyticsId || ""}
                    onChange={(e) => handleInputChange("googleAnalyticsId", e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase">
                    Google Tag Manager (GTM) ID
                  </label>
                  <input
                    type="text"
                    value={settings.googleTagManagerId || ""}
                    onChange={(e) => handleInputChange("googleTagManagerId", e.target.value)}
                    placeholder="GTM-XXXXXXX"
                    className="w-full font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. Özel Kod Enjeksiyonları (JS & CSS) */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-red-600" />
                  <span>Özel Script ve Stil Enjeksiyonları (Custom Code)</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Reklam pikselleri, canlı destek widget'ları veya özel stil tanımlamalarını kod dosyalarını değiştirmeden ekleyin.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase flex items-center justify-between">
                    <span>Özel Header &lt;head&gt; JavaScript Kodu</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Piksel & Doğrulama Kodları</span>
                  </label>
                  <textarea
                    rows={4}
                    value={settings.customHeaderJs || ""}
                    onChange={(e) => handleInputChange("customHeaderJs", e.target.value)}
                    placeholder="<script>/* Header kodu buraya */</script>"
                    className="w-full font-mono text-xs bg-zinc-950 text-emerald-400 border border-zinc-800 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase flex items-center justify-between">
                    <span>Özel Footer &lt;body&gt; JavaScript Kodu</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Canlı Destek & Sayaçlar</span>
                  </label>
                  <textarea
                    rows={4}
                    value={settings.customFooterJs || ""}
                    onChange={(e) => handleInputChange("customFooterJs", e.target.value)}
                    placeholder="<script>/* Footer / Body sonu kodu */</script>"
                    className="w-full font-mono text-xs bg-zinc-950 text-emerald-400 border border-zinc-800 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase flex items-center justify-between">
                    <span>Özel Global CSS (Cascading Style Sheets)</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Özel Renk ve Düzen Kodları</span>
                  </label>
                  <textarea
                    rows={4}
                    value={settings.customCss || ""}
                    onChange={(e) => handleInputChange("customCss", e.target.value)}
                    placeholder="body { /* Özel stiller */ }"
                    className="w-full font-mono text-xs bg-zinc-950 text-blue-400 border border-zinc-800 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== SEKME 5: DİNAMİK & ÇOKLU SAĞLAYICI YAPAY ZEKA (AI) ===================== */}
        {activeTab === "ai" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Üst Bilgi Başlığı ve Yeni Sağlayıcı Ekle Butonu */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-600/10 text-purple-600 dark:text-purple-400 rounded-2xl shrink-0">
                  <Wand2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <span>Çoklu Sağlayıcı Yapay Zeka (AI) Yönetimi</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      Multi-Provider
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5 max-w-2xl">
                    OpenAI, Anthropic Claude, DeepSeek, Google Gemini, Groq, NVIDIA NIM, Ollama veya dilediğiniz herhangi bir özel API uç noktasını tanımlayın; haber stüdyosunun motorunu tek tıkla belirleyin.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleSelectPreset("deepseek");
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 transition cursor-pointer shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Yeni Sağlayıcı Ekle</span>
              </button>
            </div>

            {/* Aktif Sağlayıcı Özet Bilgi Kartı */}
            {(() => {
              const activeProvider =
                (settings.aiProviders || DEFAULT_AI_PROVIDERS).find(
                  (p) => p.id === (settings.activeAiProviderId || "gemini")
                ) || (settings.aiProviders || DEFAULT_AI_PROVIDERS)[0];

              const hasKeyOrLocal =
                Boolean(activeProvider?.apiKey?.trim()) ||
                activeProvider?.id === "ollama" ||
                activeProvider?.baseUrl?.includes("localhost");

              return (
                <div className="p-4 rounded-2xl bg-linear-to-r from-purple-500/10 via-blue-500/5 to-transparent border border-purple-200 dark:border-purple-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      {activeProvider?.name?.slice(0, 2).toUpperCase() || "AI"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          Varsayılan Aktif AI Motoru:
                        </span>
                        <span className="text-xs font-black text-zinc-900 dark:text-white">
                          {activeProvider?.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {activeProvider?.defaultModel}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        Endpoint: <span className="font-mono">{activeProvider?.baseUrl || "Resmi Sağlayıcı Bulut API'si"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasKeyOrLocal ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Bağlantı Hazır & Aktif</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>API Anahtarı Girilmesi Bekleniyor</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Sağlayıcı Kartları Listesi */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">
                <span>Kayıtlı Yapay Zeka Sağlayıcıları ({(settings.aiProviders || DEFAULT_AI_PROVIDERS).length})</span>
                <span>Seçilen motor haber üretiminde doğrudan kullanılır</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {(settings.aiProviders || DEFAULT_AI_PROVIDERS).map((provider) => {
                  const isDefault = (settings.activeAiProviderId || "gemini") === provider.id;
                  const isKeyVisible = Boolean(visibleKeys[provider.id]);
                  const presetInfo = PROVIDER_PRESETS.find((p) => p.id === provider.id);

                  return (
                    <div
                      key={provider.id}
                      className={`rounded-2xl p-5 border transition ${
                        isDefault
                          ? "border-2 border-purple-600 bg-purple-50/20 dark:bg-purple-950/20 shadow-md shadow-purple-600/5"
                          : provider.isEnabled
                          ? "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs"
                          : "border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-100/60 dark:bg-zinc-950/40 opacity-70"
                      }`}
                    >
                      {/* Kart Üst Başlık & Eylemler */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                              isDefault
                                ? "bg-purple-600 text-white shadow-xs"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            <Bot className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                                {provider.name}
                              </h3>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                                {provider.id}
                              </span>
                              {provider.id.startsWith("custom-") && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                  Özel Sağlayıcı
                                </span>
                              )}
                            </div>
                            {presetInfo?.description && (
                              <p className="text-[11px] text-zinc-500 mt-0.5">
                                {presetInfo.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Eylemler: Varsayılan Yap + Aktiflik Toggle + Silme */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {isDefault ? (
                            <span className="px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs">
                              <Check className="w-3.5 h-3.5" />
                              <span>Varsayılan AI Motoru</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultProvider(provider.id)}
                              className="px-3 py-1 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:border-purple-500 text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 text-xs font-bold transition cursor-pointer"
                            >
                              Varsayılan Olarak Seç
                            </button>
                          )}

                          {/* Aktif/Pasif Toggle */}
                          <label className="relative inline-flex items-center cursor-pointer ml-1" title="Sağlayıcıyı Etkinleştir / Devre Dışı Bırak">
                            <input
                              type="checkbox"
                              checked={provider.isEnabled}
                              onChange={() => handleToggleProvider(provider.id)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>

                          {/* Sil Butonu (Özel eklenenler için) */}
                          {(provider.id.startsWith("custom-") || !DEFAULT_AI_PROVIDERS.some((p) => p.id === provider.id)) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteProvider(provider.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                              title="Sağlayıcıyı Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Giriş Alanları (API Key, Model, Base URL) */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-3.5">
                        {/* 1. API Anahtarı */}
                        <div className="md:col-span-5 space-y-1">
                          <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                            API Anahtarı (API Key)
                          </label>
                          <div className="relative">
                            <input
                              type={isKeyVisible ? "text" : "password"}
                              value={provider.apiKey || ""}
                              onChange={(e) => handleUpdateProvider(provider.id, "apiKey", e.target.value)}
                              placeholder={presetInfo?.keyPlaceholder || "API Anahtarınızı girin..."}
                              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 pr-9 text-xs font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => toggleKeyVisibility(provider.id)}
                              className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                              title={isKeyVisible ? "Gizle" : "Göster"}
                            >
                              {isKeyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* 2. Model Adı */}
                        <div className="md:col-span-3 space-y-1">
                          <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                            Model Adı
                          </label>
                          <input
                            type="text"
                            value={provider.defaultModel}
                            onChange={(e) => handleUpdateProvider(provider.id, "defaultModel", e.target.value)}
                            placeholder="Örn: gpt-4o, deepseek-chat"
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </div>

                        {/* 3. Özel Base URL */}
                        <div className="md:col-span-4 space-y-1">
                          <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase flex items-center justify-between">
                            <span>Özel Base URL (Endpoint)</span>
                            <span className="text-[10px] text-zinc-400 font-normal lowercase">isteğe bağlı</span>
                          </label>
                          <input
                            type="text"
                            value={provider.baseUrl || ""}
                            onChange={(e) => handleUpdateProvider(provider.id, "baseUrl", e.target.value)}
                            placeholder={presetInfo?.baseUrl || "https://api.openai.com/v1"}
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Popüler Model Hızlı Seçim Rozetleri */}
                      {presetInfo?.popularModels && presetInfo.popularModels.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2.5">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase mr-1">
                            Önerilen Modeller:
                          </span>
                          {presetInfo.popularModels.map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => handleUpdateProvider(provider.id, "defaultModel", m)}
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition cursor-pointer ${
                                provider.defaultModel === m
                                  ? "bg-purple-600 text-white font-bold"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Görsel Üretim Motoru Tercihi */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-500" />
                  <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider">
                    AI Görsel Üretim Motoru Tercihi
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      aiConfig: {
                        ...(prev.aiConfig || {
                          geminiApiKey: "",
                          geminiModel: "gemini-2.5-flash",
                          nvidiaApiKey: "",
                          nvidiaModel: "meta/llama-3.3-70b-instruct",
                          defaultProvider: "gemini",
                        }),
                        imageModelProvider: "pollinations",
                      },
                    }))
                  }
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    (settings.aiConfig?.imageModelProvider || "pollinations") === "pollinations"
                      ? "border-purple-600 bg-purple-50/40 dark:bg-purple-950/20 shadow-xs"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-zinc-900 dark:text-white">
                      Pollinations.ai (Flux.1 Hızlı Motor)
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      Ücretsiz / Hazır
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    API anahtarı gerektirmez, doğrudan yüksek çözünürlüklü 16:9 haber görseli üretip yerel depoya kaydeder.
                  </p>
                </div>

                <div
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      aiConfig: {
                        ...(prev.aiConfig || {
                          geminiApiKey: "",
                          geminiModel: "gemini-2.5-flash",
                          nvidiaApiKey: "",
                          nvidiaModel: "meta/llama-3.3-70b-instruct",
                          defaultProvider: "gemini",
                        }),
                        imageModelProvider: "nvidia",
                      },
                    }))
                  }
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    settings.aiConfig?.imageModelProvider === "nvidia"
                      ? "border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-zinc-900 dark:text-white">
                      NVIDIA Stable Diffusion 3 Medium
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      NVIDIA Key Gerekir
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    NVIDIA NIM altyapısı üzerinden fotogerçekçi editoryal haber fotoğrafları üretir.
                  </p>
                </div>
              </div>
            </div>

            {/* ===================== YENİ SAĞLAYICI EKLEME MODALI ===================== */}
            {isAddModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
                  {/* Modal Başlığı */}
                  <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                          Yeni Yapay Zeka Sağlayıcısı Ekle
                        </h3>
                        <p className="text-[11px] text-zinc-500">
                          Hazır bir şablon seçebilir veya tamamen özel bir API endpoint'i tanımlayabilirsiniz.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddProviderSubmit} className="p-5 space-y-4">
                    {/* Hızlı Şablon Seçici */}
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1.5">
                        Hızlı Şablon Seçimi
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PROVIDER_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPreset(preset.id)}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                              selectedPresetId === preset.id
                                ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold shadow-xs"
                                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300 text-xs"
                            }`}
                          >
                            <div className="text-xs font-black truncate">{preset.name.split(" ")[0]}</div>
                            <div className="text-[10px] text-zinc-400 truncate">{preset.defaultModel}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sağlayıcı Adı & ID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                          Sağlayıcı Adı
                        </label>
                        <input
                          type="text"
                          required
                          value={newCustomName}
                          onChange={(e) => setNewCustomName(e.target.value)}
                          placeholder="Örn: DeepSeek AI"
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                          Benzersiz Kimlik (ID)
                        </label>
                        <input
                          type="text"
                          required
                          value={newCustomId}
                          onChange={(e) => setNewCustomId(e.target.value)}
                          placeholder="Örn: deepseek, custom-llm"
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* API Key */}
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                        API Anahtarı (API Key)
                      </label>
                      <input
                        type="password"
                        value={newCustomApiKey}
                        onChange={(e) => setNewCustomApiKey(e.target.value)}
                        placeholder="sk-..., nvapi-... veya boş (yerel sunucu için)"
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    {/* Model & Base URL */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                          Varsayılan Model Adı
                        </label>
                        <input
                          type="text"
                          required
                          value={newCustomModel}
                          onChange={(e) => setNewCustomModel(e.target.value)}
                          placeholder="Örn: deepseek-chat, gpt-4o"
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                          Özel Base URL (Endpoint)
                        </label>
                        <input
                          type="text"
                          value={newCustomBaseUrl}
                          onChange={(e) => setNewCustomBaseUrl(e.target.value)}
                          placeholder="https://api.deepseek.com/v1"
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-mono text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Modal Aksiyon Butonları */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition cursor-pointer"
                      >
                        Sağlayıcıyı Ekle & Seç
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}


        {/* 4. YAPIŞKAN (STICKY) KAYDETME ÇUBUĞU */}
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:w-auto z-40 bg-zinc-950/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl border border-zinc-700 shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom duration-300">
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Değişiklikler anlık önbelleğe işlenir</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition disabled:opacity-50 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isPending ? "Kaydediliyor..." : "Tüm Ayarları Kaydet"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
