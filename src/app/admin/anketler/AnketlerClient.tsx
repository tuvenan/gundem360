"use client";

import React, { useState } from "react";
import {
  Vote,
  Plus,
  BarChart2,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  Star,
  Eye,
  Check,
  X,
  Search,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Poll, PollOption } from "@/types/news";

interface Props {
  initialPolls: Poll[];
}

const COLOR_OPTIONS = [
  { name: "Zümrüt Yeşil", value: "bg-emerald-600", text: "text-emerald-500" },
  { name: "Gök Mavi", value: "bg-blue-600", text: "text-blue-500" },
  { name: "Kehribar Sarı", value: "bg-amber-600", text: "text-amber-500" },
  { name: "Ametist Mor", value: "bg-purple-600", text: "text-purple-500" },
  { name: "Mercan Kırmızı", value: "bg-red-600", text: "text-red-500" },
  { name: "Koyu Çinko", value: "bg-zinc-600", text: "text-zinc-400" },
];

export default function AnketlerClient({ initialPolls }: Props) {
  const [polls, setPolls] = useState<Poll[]>(initialPolls);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedPollId, setExpandedPollId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [formQuestion, setFormQuestion] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("gundem");
  const [formStatus, setFormStatus] = useState<"active" | "draft" | "closed">("active");
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formOptions, setFormOptions] = useState<Array<{ id?: string; text: string; color: string }>>([
    { text: "", color: "bg-emerald-600" },
    { text: "", color: "bg-blue-600" },
  ]);

  // Açılır/Kapanır Detay
  const toggleExpand = (id: string) => {
    setExpandedPollId(expandedPollId === id ? null : id);
  };

  // Yeni Anket Modalını Aç
  const handleOpenCreateModal = () => {
    setEditingPoll(null);
    setFormQuestion("");
    setFormDescription("");
    setFormCategory("gundem");
    setFormStatus("active");
    setFormIsFeatured(polls.length === 0);
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormEndDate("");
    setFormOptions([
      { text: "", color: "bg-emerald-600" },
      { text: "", color: "bg-blue-600" },
    ]);
    setIsModalOpen(true);
    setFeedback(null);
  };

  // Düzenleme Modalını Aç
  const handleOpenEditModal = (poll: Poll) => {
    setEditingPoll(poll);
    setFormQuestion(poll.question);
    setFormDescription(poll.description || "");
    setFormCategory(poll.category || "gundem");
    setFormStatus(poll.status);
    setFormIsFeatured(poll.isFeatured);
    setFormStartDate(poll.startDate);
    setFormEndDate(poll.endDate || "");
    setFormOptions(
      poll.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        color: opt.color || "bg-emerald-600",
      }))
    );
    setIsModalOpen(true);
    setFeedback(null);
  };

  // Seçenek Ekle
  const handleAddOption = () => {
    if (formOptions.length >= 8) {
      alert("En fazla 8 seçenek ekleyebilirsiniz.");
      return;
    }
    const nextColor = COLOR_OPTIONS[formOptions.length % COLOR_OPTIONS.length].value;
    setFormOptions([...formOptions, { text: "", color: nextColor }]);
  };

  // Seçenek Sil
  const handleRemoveOption = (index: number) => {
    if (formOptions.length <= 2) {
      alert("Bir ankette en az 2 seçenek olmalıdır.");
      return;
    }
    setFormOptions(formOptions.filter((_, i) => i !== index));
  };

  // Seçenek Güncelle
  const handleOptionChange = (index: number, field: "text" | "color", value: string) => {
    const next = [...formOptions];
    next[index] = { ...next[index], [field]: value };
    setFormOptions(next);
  };

  // Form Gönderimi (Create / Edit)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim()) {
      setFeedback({ type: "error", message: "Lütfen anket sorusu giriniz." });
      return;
    }
    const validOptions = formOptions.filter((o) => o.text.trim().length > 0);
    if (validOptions.length < 2) {
      setFeedback({ type: "error", message: "En az 2 geçerli seçenek girmelisiniz." });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      if (editingPoll) {
        // Güncelle
        const res = await fetch("/api/polls", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingPoll.id,
            question: formQuestion.trim(),
            description: formDescription.trim(),
            category: formCategory,
            status: formStatus,
            isFeatured: formIsFeatured,
            startDate: formStartDate,
            endDate: formEndDate,
            options: formOptions.map((opt, i) => ({
              id: opt.id || `opt-${Date.now()}-${i}`,
              text: opt.text.trim(),
              color: opt.color,
              votes: editingPoll.options.find((o) => o.id === opt.id)?.votes || 0,
            })),
          }),
        });

        if (!res.ok) throw new Error("Anket güncellenirken hata oluştu.");
        const updated = await res.json();
        setPolls((prev) =>
          prev.map((p) => {
            if (p.id === updated.id) return updated;
            if (formIsFeatured && updated.isFeatured) return { ...p, isFeatured: false };
            return p;
          })
        );
        setIsModalOpen(false);
      } else {
        // Yeni Oluştur
        const res = await fetch("/api/polls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: formQuestion.trim(),
            description: formDescription.trim(),
            category: formCategory,
            status: formStatus,
            isFeatured: formIsFeatured,
            startDate: formStartDate,
            endDate: formEndDate,
            options: validOptions,
          }),
        });

        if (!res.ok) throw new Error("Anket oluşturulamadı.");
        const created = await res.json();
        setPolls((prev) => [created, ...(formIsFeatured ? prev.map((p) => ({ ...p, isFeatured: false })) : prev)]);
        setIsModalOpen(false);
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "İşlem başarısız oldu." });
    } finally {
      setLoading(false);
    }
  };

  // Anket Silme
  const handleDeletePoll = async (id: string) => {
    if (!confirm("Bu anketi kalıcı olarak silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch(`/api/polls?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silinemedi.");
      setPolls((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Anket silinirken hata oluştu.");
    }
  };

  // Oyları Sıfırla
  const handleResetVotes = async (id: string) => {
    if (!confirm("Bu anketin tüm oylarını sıfırlamak istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch("/api/polls", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "reset" }),
      });
      if (!res.ok) throw new Error("Sıfırlanamadı.");
      const updated = await res.json();
      setPolls((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      alert("Oylar sıfırlanırken hata oluştu.");
    }
  };

  // Hızlı Durum Değiştirme
  const handleToggleStatus = async (poll: Poll) => {
    const nextStatus = poll.status === "active" ? "closed" : "active";
    try {
      const res = await fetch("/api/polls", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: poll.id, status: nextStatus }),
      });
      if (!res.ok) throw new Error("Durum güncellenemedi.");
      const updated = await res.json();
      setPolls((prev) => prev.map((p) => (p.id === poll.id ? updated : p)));
    } catch (err) {
      alert("Durum güncellenemedi.");
    }
  };

  // Hızlı Öne Çıkarma (Featured)
  const handleToggleFeatured = async (poll: Poll) => {
    try {
      const res = await fetch("/api/polls", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: poll.id, isFeatured: !poll.isFeatured }),
      });
      if (!res.ok) throw new Error("Öne çıkarma güncellenemedi.");
      const updated = await res.json();
      setPolls((prev) =>
        prev.map((p) => {
          if (p.id === poll.id) return updated;
          if (updated.isFeatured) return { ...p, isFeatured: false };
          return p;
        })
      );
    } catch (err) {
      alert("Öne çıkan anket güncellenemedi.");
    }
  };

  // İstatistikler
  const totalPolls = polls.length;
  const activePolls = polls.filter((p) => p.status === "active").length;
  const totalVotesCast = polls.reduce((sum, p) => sum + (p.totalVotes || 0), 0);
  const featuredPoll = polls.find((p) => p.isFeatured);

  // Filtreleme
  const filteredPolls = polls.filter((poll) => {
    const matchesSearch =
      poll.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (poll.description && poll.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || poll.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ÜST BAŞLIK & BUTONLAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <Vote className="w-6 h-6 text-red-600" />
              Anket ve Kamuoyu Yönetimi
            </h1>
            <span className="bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-900/50">
              Canlı
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Okuyucu yoklamaları hazırlayın, oyları anlık takip edin ve ana sayfa anket vitrinini yönetin.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-102 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Anket Oluştur</span>
        </button>
      </div>

      {/* METRİK KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Toplam Anket</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 rounded-lg">
              <Vote className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white mt-2">{totalPolls}</div>
          <span className="text-[11px] text-zinc-400">Tüm kategorilerde</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Aktif Anketler</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{activePolls}</div>
          <span className="text-[11px] text-zinc-400">Oylamaya açık</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Toplam Kullanılan Oy</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/60 rounded-lg">
              <BarChart2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
            {totalVotesCast.toLocaleString("tr-TR")}
          </div>
          <span className="text-[11px] text-zinc-400">Tüm anketlerde toplam</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ana Sayfa Anketi</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-lg">
              <Star className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-500/30" />
            </div>
          </div>
          <div className="text-sm font-bold text-zinc-900 dark:text-white mt-2 truncate">
            {featuredPoll ? featuredPoll.question : "Seçilmedi"}
          </div>
          <span className="text-[11px] text-amber-600 font-medium">Vitrinde Yayında</span>
        </div>
      </div>

      {/* ARAMA VE FİLTRELER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Anket sorusu veya metinde ara..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["all", "active", "draft", "closed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition capitalize cursor-pointer ${
                statusFilter === st
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
              }`}
            >
              {st === "all" ? "Tümü" : st === "active" ? "Aktif" : st === "draft" ? "Taslak" : "Kapalı"}
            </button>
          ))}
        </div>
      </div>

      {/* ANKETLER LİSTESİ */}
      <div className="space-y-4">
        {filteredPolls.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
            <Vote className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-300">Henüz anket bulunamadı</h3>
            <p className="text-xs text-zinc-500 mt-1">Arama kriterlerinizi değiştirebilir veya yeni anket oluşturabilirsiniz.</p>
          </div>
        ) : (
          filteredPolls.map((poll) => {
            const isExpanded = expandedPollId === poll.id;

            return (
              <div
                key={poll.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Sol Başlık ve Bilgiler */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Durum Rozeti */}
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          poll.status === "active"
                            ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : poll.status === "draft"
                            ? "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700"
                        }`}
                      >
                        {poll.status === "active" ? "Yayında" : poll.status === "draft" ? "Taslak" : "Kapalı"}
                      </span>

                      {/* Vitrin Rozeti */}
                      {poll.isFeatured && (
                        <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                          <Star className="w-3 h-3 fill-amber-500" />
                          Ana Sayfa Vitrini
                        </span>
                      )}

                      <span className="text-xs text-zinc-400">• {poll.startDate}</span>
                      {poll.endDate && <span className="text-xs text-zinc-400"> - Bitiş: {poll.endDate}</span>}
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-snug">
                      {poll.question}
                    </h2>

                    {poll.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {poll.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 pt-1">
                      <span>{poll.options.length} Seçenek</span>
                      <span>•</span>
                      <span className="text-zinc-700 dark:text-zinc-200 font-bold">
                        {poll.totalVotes.toLocaleString("tr-TR")} Toplam Oy
                      </span>
                    </div>
                  </div>

                  {/* Sağ Aksiyonlar */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
                    <button
                      onClick={() => handleToggleFeatured(poll)}
                      title={poll.isFeatured ? "Ana Sayfadan Kaldır" : "Ana Sayfada Öne Çıkar"}
                      className={`p-2 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        poll.isFeatured
                          ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:text-amber-500"
                      }`}
                    >
                      <Star className={`w-4 h-4 ${poll.isFeatured ? "fill-white" : ""}`} />
                      <span className="hidden sm:inline">{poll.isFeatured ? "Vitrin" : "Vitrini Yap"}</span>
                    </button>

                    <button
                      onClick={() => handleToggleStatus(poll)}
                      title="Durumu Değiştir"
                      className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 text-xs font-semibold cursor-pointer"
                    >
                      {poll.status === "active" ? "Kapat" : "Aktifleştir"}
                    </button>

                    <button
                      onClick={() => toggleExpand(poll.id)}
                      className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <BarChart2 className="w-4 h-4" />
                      <span>{isExpanded ? "Sonuçları Gizle" : "Sonuçlar"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(poll)}
                      className="p-2 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-semibold cursor-pointer"
                      title="Düzenle"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleResetVotes(poll.id)}
                      className="p-2 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 hover:bg-amber-100 text-xs font-semibold cursor-pointer"
                      title="Oyları Sıfırla"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeletePoll(poll.id)}
                      className="p-2 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-semibold cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* CANLI SONUÇ DETAY PANELİ (Açılır/Kapanır) */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-zinc-200 dark:border-zinc-800 space-y-3 bg-zinc-50/70 dark:bg-zinc-950/50 p-4 rounded-xl">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase">
                      <span>Seçenek Dağılımı</span>
                      <span>Oran & Oy</span>
                    </div>

                    {poll.options.map((opt) => {
                      const percentage =
                        poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;

                      return (
                        <div key={opt.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                              {opt.text}
                            </span>
                            <span className="font-bold text-zinc-900 dark:text-white">
                              %{percentage}{" "}
                              <span className="text-zinc-400 font-normal">
                                ({opt.votes.toLocaleString("tr-TR")} oy)
                              </span>
                            </span>
                          </div>
                          {/* İlerleme Çubuğu */}
                          <div className="h-2.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${opt.color || "bg-red-600"}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* YENİ / DÜZENLEME MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            {/* Modal Başlık */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Vote className="w-5 h-5 text-red-600" />
                {editingPoll ? "Anketi Düzenle" : "Yeni Anket Oluştur"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  feedback.type === "error"
                    ? "bg-red-50 dark:bg-red-950/60 text-red-600 border border-red-200 dark:border-red-900"
                    : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-900"
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Soru */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Anket Sorusu *
                </label>
                <input
                  type="text"
                  required
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Örn: Sizce yılın en önemli teknolojik gelişmesi hangisiydi?"
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Açıklama / Alt Metin (Opsiyonel)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Anketin bağlamı veya detayları hakkında okuyucuya kısa bilgi..."
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Kategori ve Durum */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="gundem">Gündem</option>
                    <option value="ekonomi">Ekonomi</option>
                    <option value="teknoloji">Teknoloji</option>
                    <option value="spor">Spor</option>
                    <option value="kultur">Kültür & Yaşam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Yayın Durumu
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="active">Aktif (Oylamaya Açık)</option>
                    <option value="draft">Taslak (Gizli)</option>
                    <option value="closed">Kapalı (Sadece Sonuç)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Ana Sayfa Vitrini
                    </span>
                  </label>
                </div>
              </div>

              {/* SEÇENEKLER LİSTESİ */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Seçenekler (En az 2 adet)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Seçenek Ekle</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 text-center text-xs font-bold text-zinc-400">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={(e) => handleOptionChange(idx, "text", e.target.value)}
                        placeholder={`Seçenek ${idx + 1} metni...`}
                        className="flex-1 px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                      />

                      {/* Renk Seçimi */}
                      <select
                        value={opt.color}
                        onChange={(e) => handleOptionChange(idx, "color", e.target.value)}
                        className="px-2 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white"
                      >
                        {COLOR_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.name}
                          </option>
                        ))}
                      </select>

                      {formOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 cursor-pointer"
                          title="Seçeneği Kaldır"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md shadow-red-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingPoll ? "Değişiklikleri Kaydet" : "Anketi Yayınla"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
