"use client";

import React, { useState, useEffect } from "react";
import { Comment, VoteType } from "@/types/news";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  CornerDownRight,
  Send,
  User,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface CommentSectionProps {
  newsId: string;
  initialComments: Comment[];
}

export default function CommentSection({
  newsId,
  initialComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);

  // Ana Yorum Formu State
  const [mainAuthor, setMainAuthor] = useState("");
  const [mainContent, setMainContent] = useState("");
  const [isSubmittingMain, setIsSubmittingMain] = useState(false);

  // Yanıt (Reply) Formu State
  const [replyTarget, setReplyTarget] = useState<{
    parentId: string;
    rootCommentId: string;
    replyToAuthor: string;
  } | null>(null);
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Yanıtları gizle/göster (collapse)
  const [collapsedThreads, setCollapsedThreads] = useState<Record<string, boolean>>({});

  // Kullanıcının verdiği oylar: { [commentId]: "up" | "down" }
  const [userVotes, setUserVotes] = useState<Record<string, VoteType>>({});

  // Geri bildirim mesajı
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // localStorage'dan kayıtlı oy ve yazar adını al
  useEffect(() => {
    try {
      const savedVotes = localStorage.getItem("gundem360_comment_votes");
      if (savedVotes) {
        setUserVotes(JSON.parse(savedVotes));
      }
      const savedAuthor = localStorage.getItem("gundem360_comment_author");
      if (savedAuthor) {
        setMainAuthor(savedAuthor);
        setReplyAuthor(savedAuthor);
      }
    } catch {}
  }, []);

  const saveAuthorToStorage = (name: string) => {
    try {
      localStorage.setItem("gundem360_comment_author", name);
    } catch {}
  };

  const saveVoteToStorage = (updatedVotes: Record<string, VoteType>) => {
    try {
      localStorage.setItem("gundem360_comment_votes", JSON.stringify(updatedVotes));
    } catch {}
  };

  // ===================== OYLAMA (UPVOTE / DOWNVOTE) MEKANİZMASI =====================
  const handleVote = async (commentId: string, type: VoteType) => {
    const currentVote = userVotes[commentId];
    let newVote: VoteType | null = type;
    let voteAction: "add" | "remove" | "switch" = "add";

    if (currentVote === type) {
      // Aynı butona tekrar tıklandı: oyu geri al (unvote)
      newVote = null;
      voteAction = "remove";
    } else if (currentVote && currentVote !== type) {
      // Zıt butona tıklandı: oyu değiştir (switch)
      newVote = type;
      voteAction = "switch";
    }

    // 1. İyimser Arayüz Güncellemesi (Optimistic UI)
    const prevComments = [...comments];
    const prevUserVotes = { ...userVotes };

    const nextUserVotes = { ...userVotes };
    if (newVote) {
      nextUserVotes[commentId] = newVote;
    } else {
      delete nextUserVotes[commentId];
    }
    setUserVotes(nextUserVotes);
    saveVoteToStorage(nextUserVotes);

    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const likes = typeof c.likes === "number" ? c.likes : 0;
        const dislikes = typeof c.dislikes === "number" ? c.dislikes : 0;

        if (voteAction === "add") {
          return {
            ...c,
            likes: type === "up" ? likes + 1 : likes,
            dislikes: type === "down" ? dislikes + 1 : dislikes,
          };
        } else if (voteAction === "remove") {
          return {
            ...c,
            likes: type === "up" ? Math.max(0, likes - 1) : likes,
            dislikes: type === "down" ? Math.max(0, dislikes - 1) : dislikes,
          };
        } else {
          // switch
          return {
            ...c,
            likes: type === "up" ? likes + 1 : Math.max(0, likes - 1),
            dislikes: type === "down" ? dislikes + 1 : Math.max(0, dislikes - 1),
          };
        }
      })
    );

    // 2. API Çağrısı
    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "vote",
          id: commentId,
          voteType: type,
          voteAction,
        }),
      });

      if (!res.ok) {
        throw new Error("Oylama sunucuya kaydedilemedi.");
      }
    } catch (err) {
      console.error("Oylama hatası:", err);
      // Hata durumunda state'i geri al
      setUserVotes(prevUserVotes);
      setComments(prevComments);
    }
  };

  // ===================== ANA YORUM GÖNDERME =====================
  const handleMainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainAuthor.trim() || !mainContent.trim()) return;

    setIsSubmittingMain(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsId,
          author: mainAuthor.trim(),
          content: mainContent.trim(),
        }),
      });

      if (!res.ok) throw new Error("Yorum gönderilemedi.");

      const newComment: Comment = await res.json();
      setComments([newComment, ...comments]);
      setMainContent("");
      saveAuthorToStorage(mainAuthor.trim());
      setFeedback({ type: "success", text: "Yorumunuz başarıyla yayınlandı!" });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error("Yorum gönderme hatası:", err);
      setFeedback({ type: "error", text: "Yorum gönderilirken bir hata oluştu." });
    } finally {
      setIsSubmittingMain(false);
    }
  };

  // ===================== YANIT (REPLY) GÖNDERME =====================
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTarget || !replyAuthor.trim() || !replyContent.trim()) return;

    setIsSubmittingReply(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsId,
          author: replyAuthor.trim(),
          content: replyContent.trim(),
          parentId: replyTarget.rootCommentId, // Hiyerarşiyi ana yorum altında topluyoruz
          replyToAuthor: replyTarget.replyToAuthor,
        }),
      });

      if (!res.ok) throw new Error("Yanıt gönderilemedi.");

      const newReply: Comment = await res.json();
      setComments([...comments, newReply]);
      setReplyContent("");
      setReplyTarget(null);
      saveAuthorToStorage(replyAuthor.trim());
      setFeedback({ type: "success", text: "Yanıtınız başarıyla eklendi!" });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error("Yanıt gönderme hatası:", err);
      setFeedback({ type: "error", text: "Yanıt iletilirken bir hata oluştu." });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const toggleThreadCollapse = (rootId: string) => {
    setCollapsedThreads((prev) => ({ ...prev, [rootId]: !prev[rootId] }));
  };

  // Ana Yorumlar ve Yanıtlar Ayrımı
  const rootComments = comments.filter((c) => !c.parentId);
  const replies = comments.filter((c) => Boolean(c.parentId));

  const getRepliesForRoot = (rootId: string) => {
    return replies.filter((r) => r.parentId === rootId);
  };

  return (
    <section id="yorumlar-alani" className="mt-10 pt-8 border-t border-zinc-200 dark:border-zinc-800">
      {/* Başlık ve Metrikler */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-600 text-white rounded-lg shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              Okur Yorumları ({comments.length})
            </h3>
            <p className="text-xs text-zinc-500">
              {rootComments.length} ana görüş, {replies.length} yanıt
            </p>
          </div>
        </div>

        <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1 rounded-full border border-zinc-200/60 dark:border-zinc-700/50">
          Topluluk İlkeleri Kapsamında
        </span>
      </div>

      {/* Geri Bildirim Bildirimi */}
      {feedback && (
        <div
          className={`mb-6 flex items-center gap-2.5 p-3.5 rounded-xl text-xs font-semibold border transition ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 1. ANA YORUM YAPMA FORMU */}
      <form
        onSubmit={handleMainSubmit}
        className="bg-zinc-50 dark:bg-zinc-900/70 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs mb-8 transition focus-within:border-red-500/50"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-red-600" />
          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
            Fikrini ve Görüşünü Paylaş
          </h4>
        </div>

        <div className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Adınız Soyadınız"
              value={mainAuthor}
              onChange={(e) => setMainAuthor(e.target.value)}
              required
              className="w-full sm:w-80 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition"
            />
          </div>

          <div>
            <textarea
              placeholder="Haber hakkındaki düşünceleriniz ve analizinizi yazın..."
              value={mainContent}
              onChange={(e) => setMainContent(e.target.value)}
              required
              rows={3}
              maxLength={1000}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl p-3.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-zinc-400">
              {mainContent.length} / 1000 karakter
            </span>

            <button
              type="submit"
              disabled={isSubmittingMain || !mainAuthor.trim() || !mainContent.trim()}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmittingMain ? "Yayınlanıyor..." : "Yorumu Yayınla"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* 2. YORUMLAR LİSTESİ (HİYERARŞİK) */}
      <div className="space-y-5">
        {rootComments.length === 0 ? (
          <div className="text-center py-10 px-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
            <MessageSquare className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-60" />
            <p className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              Bu habere henüz bir yorum yazılmamış.
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              Görüş ve düşüncelerinizi ilk paylaşan siz olun!
            </p>
          </div>
        ) : (
          rootComments.map((comment) => {
            const threadReplies = getRepliesForRoot(comment.id);
            const isCollapsed = collapsedThreads[comment.id];
            const myVote = userVotes[comment.id];
            const upvotes = typeof comment.likes === "number" ? comment.likes : 0;
            const dislikes = typeof comment.dislikes === "number" ? comment.dislikes : 0;
            const isReplyingToThisRoot =
              replyTarget?.rootCommentId === comment.id &&
              replyTarget?.parentId === comment.id;

            return (
              <div
                key={comment.id}
                className="p-4 sm:p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3 transition hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                {/* Ana Yorum Başlığı: Yazar & Tarih */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
                      {comment.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        {comment.author}
                      </h5>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {comment.createdAt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Yorum İçeriği */}
                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed pl-1 sm:pl-2 whitespace-pre-line">
                  {comment.content}
                </p>

                {/* Butonlar Barı: Upvote, Downvote, Yanıtla */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* UPVOTE */}
                    <button
                      type="button"
                      onClick={() => handleVote(comment.id, "up")}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-xs transition active:scale-95 ${
                        myVote === "up"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                          : "text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                      }`}
                      title="Faydalı / Beğendim"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{upvotes}</span>
                    </button>

                    {/* DOWNVOTE */}
                    <button
                      type="button"
                      onClick={() => handleVote(comment.id, "down")}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-xs transition active:scale-95 ${
                        myVote === "down"
                          ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800"
                          : "text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                      }`}
                      title="Katılmıyorum / Beğenmedim"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>{dislikes}</span>
                    </button>

                    <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

                    {/* YANITLA BUTONU */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isReplyingToThisRoot) {
                          setReplyTarget(null);
                        } else {
                          setReplyTarget({
                            parentId: comment.id,
                            rootCommentId: comment.id,
                            replyToAuthor: comment.author,
                          });
                        }
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-xs transition ${
                        isReplyingToThisRoot
                          ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>{isReplyingToThisRoot ? "Vazgeç" : "Yanıtla"}</span>
                    </button>
                  </div>

                  {/* Yanıtları Genişlet/Daralt */}
                  {threadReplies.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleThreadCollapse(comment.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline"
                    >
                      <span>
                        {threadReplies.length} {threadReplies.length === 1 ? "Yanıt" : "Yanıt"}
                      </span>
                      {isCollapsed ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronUp className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* INLINE YANIT FORMU (Ana Yoruma Yanıt Verirken) */}
                {isReplyingToThisRoot && (
                  <form
                    onSubmit={handleReplySubmit}
                    className="mt-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-red-500/40 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                        <CornerDownRight className="w-3.5 h-3.5" />
                        @{comment.author} kullanıcısına yanıt veriyorsunuz
                      </span>
                      <button
                        type="button"
                        onClick={() => setReplyTarget(null)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Adınız Soyadınız"
                        value={replyAuthor}
                        onChange={(e) => setReplyAuthor(e.target.value)}
                        required
                        className="w-full sm:w-64 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <textarea
                        placeholder="Yanıtınızı buraya yazın..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        required
                        rows={2}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyTarget(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingReply || !replyAuthor.trim() || !replyContent.trim()}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" />
                        <span>{isSubmittingReply ? "İletiliyor..." : "Yanıtı Gönder"}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* 3. İÇ İÇE YANITLAR (NESTED REPLIES THREAD) */}
                {threadReplies.length > 0 && !isCollapsed && (
                  <div className="mt-3 pt-3 border-l-2 border-red-500/30 dark:border-red-600/30 pl-3 sm:pl-4 space-y-3">
                    {threadReplies.map((reply) => {
                      const replyVote = userVotes[reply.id];
                      const rUpvotes = typeof reply.likes === "number" ? reply.likes : 0;
                      const rDislikes = typeof reply.dislikes === "number" ? reply.dislikes : 0;
                      const isReplyingToThisChild =
                        replyTarget?.parentId === reply.id;

                      return (
                        <div
                          key={reply.id}
                          className="p-3 bg-zinc-50/90 dark:bg-zinc-950/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-bold text-[10px] shrink-0">
                                {reply.author.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                  {reply.author}
                                </span>
                                {reply.replyToAuthor && (
                                  <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded">
                                    @{reply.replyToAuthor}
                                  </span>
                                )}
                              </div>
                            </div>

                            <span className="text-[10px] text-zinc-400">
                              {reply.createdAt}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pl-1">
                            {reply.content}
                          </p>

                          {/* Yanıt İçin Upvote, Downvote, Yanıtla Butonları */}
                          <div className="flex items-center justify-between pt-1.5 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              {/* Reply UPVOTE */}
                              <button
                                type="button"
                                onClick={() => handleVote(reply.id, "up")}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition ${
                                  replyVote === "up"
                                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold"
                                    : "text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>{rUpvotes}</span>
                              </button>

                              {/* Reply DOWNVOTE */}
                              <button
                                type="button"
                                onClick={() => handleVote(reply.id, "down")}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition ${
                                  replyVote === "down"
                                    ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold"
                                    : "text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                                }`}
                              >
                                <ThumbsDown className="w-3 h-3" />
                                <span>{rDislikes}</span>
                              </button>
                            </div>

                            {/* Bu yanıta da yanıt ver */}
                            <button
                              type="button"
                              onClick={() => {
                                if (isReplyingToThisChild) {
                                  setReplyTarget(null);
                                } else {
                                  setReplyTarget({
                                    parentId: reply.id,
                                    rootCommentId: comment.id,
                                    replyToAuthor: reply.author,
                                  });
                                }
                              }}
                              className="text-[11px] font-semibold text-zinc-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1"
                            >
                              <CornerDownRight className="w-3 h-3" />
                              <span>{isReplyingToThisChild ? "Vazgeç" : "Yanıtla"}</span>
                            </button>
                          </div>

                          {/* Yanıta Yanıt Formu */}
                          {isReplyingToThisChild && (
                            <form
                              onSubmit={handleReplySubmit}
                              className="mt-2 p-3 rounded-lg bg-white dark:bg-zinc-900 border border-red-500/40 space-y-2"
                            >
                              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                                <span className="font-semibold text-red-600">
                                  @{reply.author} kullanıcısına yanıt yazıyorsunuz
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setReplyTarget(null)}
                                  className="text-zinc-400 hover:text-zinc-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>

                              <input
                                type="text"
                                placeholder="Adınız Soyadınız"
                                value={replyAuthor}
                                onChange={(e) => setReplyAuthor(e.target.value)}
                                required
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md px-2.5 py-1 text-xs text-zinc-900 dark:text-zinc-100"
                              />

                              <textarea
                                placeholder="Yanıtınız..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                required
                                rows={2}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-xs text-zinc-900 dark:text-zinc-100 resize-none"
                              />

                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setReplyTarget(null)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-zinc-500"
                                >
                                  İptal
                                </button>
                                <button
                                  type="submit"
                                  disabled={isSubmittingReply || !replyAuthor.trim() || !replyContent.trim()}
                                  className="px-3 py-1 text-[11px] font-bold bg-red-600 hover:bg-red-700 text-white rounded shadow-xs disabled:opacity-50"
                                >
                                  {isSubmittingReply ? "İletiliyor..." : "Yanıtla"}
                                </button>
                              </div>
                            </form>
                          )}
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
    </section>
  );
}
