"use client";

import React, { useState, useEffect } from "react";
import { Poll, PollOption } from "@/types/news";
import {
  Vote,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  TrendingUp,
  Flame,
  ArrowRight,
  Eye,
  RotateCcw
} from "lucide-react";

interface PollWidgetProps {
  initialPoll: Poll | null;
}

export default function PollWidget({ initialPoll }: PollWidgetProps) {
  const [poll, setPoll] = useState<Poll | null>(initialPoll);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  // Check localStorage on mount
  useEffect(() => {
    setMounted(true);
    if (!initialPoll) return;

    try {
      const storedVote = localStorage.getItem(`voted_poll_${initialPoll.id}`);
      const storedOptionId = localStorage.getItem(`voted_option_${initialPoll.id}`);
      if (storedVote === "true") {
        setHasVoted(true);
        setVotedOptionId(storedOptionId || null);
        setShowResults(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [initialPoll]);

  if (!poll) return null;

  const totalVotes = poll.totalVotes || 0;

  // Identify leading option
  const leaderOptionId =
    totalVotes > 0
      ? poll.options.reduce((max, opt) => (opt.votes > max.votes ? opt : max), poll.options[0])
          ?.id
      : null;

  const handleVote = async () => {
    if (!selectedOptionId || submitting || hasVoted) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollId: poll.id,
          optionId: selectedOptionId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Oy kullanırken bir hata oluştu.");
      }

      setPoll(data.poll);
      setHasVoted(true);
      setVotedOptionId(selectedOptionId);
      setShowResults(true);
      setSuccessMsg("Oyunuz başarıyla kaydedildi. Katkınız için teşekkürler!");

      try {
        localStorage.setItem(`voted_poll_${poll.id}`, "true");
        localStorage.setItem(`voted_option_${poll.id}`, selectedOptionId);
      } catch {
        // localStorage not available
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Oy iletilirken bağlantı hatası oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const getOptionBgColor = (colorClass?: string) => {
    if (!colorClass) return "bg-red-600";
    return colorClass.split(" ")[0] || "bg-red-600";
  };

  return (
    <section
      id="kamuoyu-anketi"
      className="my-10 relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-white via-zinc-50 to-zinc-100/70 dark:from-zinc-950 dark:via-zinc-900/90 dark:to-zinc-900 shadow-sm"
    >
      {/* Decorative accent top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-600" />

      <div className="p-6 sm:p-8">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
              <Vote className="w-3.5 h-3.5 text-red-600" />
              KAMUOYU YOKLAMASI
            </span>
            {poll.category && (
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {poll.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Oylama Açık
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {totalVotes.toLocaleString("tr-TR")} Oy
            </span>
          </div>
        </div>

        {/* Question Title & Description */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 leading-snug tracking-tight">
            {poll.question}
          </h2>
          {poll.description && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              {poll.description}
            </p>
          )}
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-5 flex items-center gap-2 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Interactive Area: Vote Form vs Results View */}
        <div className="space-y-3">
          {(!showResults && !hasVoted) ? (
            // ================== VOTING MODE ==================
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {poll.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`group relative text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? "border-red-600 bg-red-50/50 dark:bg-red-950/30 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 pr-4">
                      {/* Radio Circle */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                          isSelected
                            ? "border-red-600 bg-red-600"
                            : "border-zinc-300 dark:border-zinc-600 group-hover:border-zinc-400"
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span
                        className={`text-sm sm:text-base font-semibold transition ${
                          isSelected
                            ? "text-red-950 dark:text-red-200"
                            : "text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white"
                        }`}
                      >
                        {opt.text}
                      </span>
                    </div>

                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${getOptionBgColor(opt.color)} opacity-80`}
                      title="Seçenek Rengi"
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            // ================== RESULTS MODE ==================
            <div className="space-y-3.5">
              {poll.options.map((opt) => {
                const percent =
                  totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                const isLeader = leaderOptionId === opt.id && opt.votes > 0;
                const isUserPick = votedOptionId === opt.id;
                const barColor = getOptionBgColor(opt.color);

                return (
                  <div
                    key={opt.id}
                    className={`relative p-3.5 sm:p-4 rounded-xl border transition-all ${
                      isUserPick
                        ? "border-red-500/50 bg-red-50/30 dark:bg-red-950/20"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70"
                    }`}
                  >
                    {/* Background Progress Bar Fill */}
                    <div
                      className={`absolute inset-y-0 left-0 rounded-xl opacity-10 dark:opacity-15 transition-all duration-700 ease-out ${barColor}`}
                      style={{ width: `${percent}%` }}
                    />

                    <div className="relative z-10 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                            {opt.text}
                          </span>
                          {isUserPick && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs">
                              <CheckCircle2 className="w-3 h-3" />
                              Oyunuz
                            </span>
                          )}
                          {isLeader && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-zinc-950 shadow-xs">
                              <Flame className="w-3 h-3 text-amber-950" />
                              Lider
                            </span>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                            %{percent}
                          </span>
                          <span className="ml-1.5 text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline font-medium">
                            ({opt.votes.toLocaleString("tr-TR")} oy)
                          </span>
                        </div>
                      </div>

                      {/* Explicit Linear Meter Bar */}
                      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions & Controls */}
        <div className="mt-6 pt-5 border-t border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {!showResults && !hasVoted ? (
              <>
                <button
                  type="button"
                  onClick={handleVote}
                  disabled={!selectedOptionId || submitting}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all ${
                    selectedOptionId && !submitting
                      ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer active:scale-95"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                  }`}
                >
                  <Vote className="w-4 h-4" />
                  {submitting ? "Gönderiliyor..." : "Oyumu Kullan"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowResults(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Sonuçları Gör
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {hasVoted ? (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                    <CheckCircle2 className="w-4 h-4" />
                    Katılımınız için teşekkürler. Anket sonuçları anlık güncellenir.
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowResults(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-200/80 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Oy Kullanımına Dön
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Gündem360 Tarafsız Kamuoyu ve Araştırma Servisi</span>
          </div>
        </div>
      </div>
    </section>
  );
}
