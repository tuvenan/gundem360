"use client";

import { useState } from "react";
import { Comment } from "@/types/news";
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Trash2,
  ThumbsUp,
  User,
  Filter,
} from "lucide-react";

interface YorumlarClientProps {
  initialComments: Comment[];
}

export default function YorumlarClient({
  initialComments,
}: YorumlarClientProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [notification, setNotification] = useState<string | null>(null);

  const filteredComments = comments.filter((c) => {
    if (filter === "all") return true;
    return (c.status || "approved") === filter;
  });

  const handleStatusUpdate = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
        setNotification(`Yorum durumu güncellendi: ${newStatus === "approved" ? "Onaylandı" : "Reddedildi"}`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yorumu kalıcı olarak silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
        setNotification("Yorum başarıyla silindi.");
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-red-600" />
            Yorum Moderasyon Merkezi
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Okuyuculardan gelen yorumları inceleyin, onaylayın veya engelleyin.
          </p>
        </div>

        {/* Filtre Butonları */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-md transition ${
              filter === "all"
                ? "bg-zinc-900 dark:bg-zinc-700 text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Tümü ({comments.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1 rounded-md transition ${
              filter === "pending"
                ? "bg-amber-600 text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Onay Bekleyenler ({comments.filter((c) => c.status === "pending").length})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-3 py-1 rounded-md transition ${
              filter === "approved"
                ? "bg-emerald-600 text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Onaylananlar ({comments.filter((c) => c.status === "approved" || !c.status).length})
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Yorumlar Listesi */}
      <div className="space-y-3">
        {filteredComments.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 p-12 text-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs">
            Bu filtreye uygun yorum bulunmuyor.
          </div>
        ) : (
          filteredComments.map((com) => {
            const status = com.status || "approved";

            return (
              <div
                key={com.id}
                className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                          {com.author}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {com.createdAt}
                        </span>
                        {status === "pending" && (
                          <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                            Onay Bekliyor
                          </span>
                        )}
                        {status === "approved" && (
                          <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                            Onaylı
                          </span>
                        )}
                        {status === "rejected" && (
                          <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded">
                            Engellendi
                          </span>
                        )}
                      </div>
                      {com.newsTitle && (
                        <div className="text-[11px] text-red-600 font-medium">
                          Haber: "{com.newsTitle}"
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pl-11">
                    {com.content}
                  </p>

                  <div className="pl-11 flex items-center gap-1 text-[11px] text-zinc-400">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{com.likes} beğeni</span>
                  </div>
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex items-center gap-2 self-end sm:self-center pl-11 sm:pl-0">
                  {status !== "approved" && (
                    <button
                      onClick={() => handleStatusUpdate(com.id, "approved")}
                      className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-lg transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Onayla</span>
                    </button>
                  )}

                  {status !== "rejected" && (
                    <button
                      onClick={() => handleStatusUpdate(com.id, "rejected")}
                      className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 rounded-lg transition"
                    >
                      <XCircle className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Reddet</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(com.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 transition"
                    title="Kalıcı Olarak Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
