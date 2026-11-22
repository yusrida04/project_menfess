import { useState, useEffect } from "react";
import { Send, Search } from "lucide-react";
import { apiFetch } from "../../utils/api";

export function Komentar({ menfessId, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

  const loadComments = async () => {
    setIsLoading(true);
      try {
        const data = await apiFetch(`/menfess/${menfessId}/comments`);
        if (isMounted) setComments(data);
      } catch (err) {
        if (isMounted) setErrorMsg(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (menfessId) {
      loadComments();
    }

    return () => {
      isMounted = false;
    };
  }, [menfessId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSending) return;

    setIsSending(true);
    setErrorMsg("");

    try {
      const created = await apiFetch(`/menfess/${menfessId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: newComment.trim() }),
      });

      setComments((prev) => [...prev, created]);
      setNewComment("");
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const filteredComments = comments.filter(
    (c) =>
      c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.alias.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-3 mt-3 border-t border-[#1f2a22] space-y-4">
      {/* 1. Input Kapsul "Gabung dalam percakapan" ala Reddit */}
      <form onSubmit={handleSend} className="relative flex items-center">
        <input
          type="text"
          maxLength={250}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Gabung dalam percakapan..."
          className="w-full rounded-full border border-[#1f2a22] bg-[#171f1a] pl-4 pr-11 py-2.5 text-sm text-[#FCFCFC] placeholder:text-[#8E8E8E] focus:border-[#1f2a22] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || isSending}
          className="absolute right-1.5 inline-flex items-center justify-center size-8 rounded-full bg-[#22e07a] text-[#1F1F1F] hover:bg-[#86efac] disabled:bg-transparent disabled:text-[#6E6E6E] disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Kirim Komentar"
        >
          <Send className="size-4" />
        </button>
      </form>

      {errorMsg && (
        <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5">
          {errorMsg}
        </p>
      )}

      {/* 2. Bar Pencarian Komentar (Muncul jika sudah ada komentar) */}
      {comments.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex items-center w-full">
            <Search className="size-3.5 text-[#8E8E8E] absolute left-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Telusuri komentar"
              className="w-full rounded-full bg-[#171f1a] border border-[#1f2a22] pl-8 pr-3 py-1 text-xs text-[#CFCFCF] placeholder:text-[#8E8E8E] focus:border-[#1f2a22] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* 3. Daftar Thread Komentar */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-xs text-[#8E8E8E]">Memuat percakapan...</p>
        ) : filteredComments.length === 0 ? (
          <p className="text-xs text-[#8E8E8E]">
            {comments.length === 0
              ? "Belum ada komentar. Mulai percakapan pertama!"
              : "Komentar tidak ditemukan."}
          </p>
        ) : (
          filteredComments.map((item) => {
            const badge = item.alias?.split("#")[1] || "A";
            return (
              <div key={item.id} className="flex items-start gap-2.5">
                {/* Avatar Bulat */}
                <div className="shrink-0 size-7 rounded-full bg-[#3A3A3A] border border-[#4A4A4A] flex items-center justify-center text-[11px] font-bold text-[#F59E0B] mt-0.5">
                  {badge}
                </div>

                {/* Isi Komentar */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-[#EAEAEA]">
                      {item.alias}
                    </span>
                    <span className="text-[#8E8E8E]">•</span>
                    <span className="text-[#8E8E8E]">{item.timestamp}</span>
                  </div>
                  <p className="text-sm text-[#D6D6D6] leading-relaxed whitespace-pre-line wrap-break-word">
                    {item.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}