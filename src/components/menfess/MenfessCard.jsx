import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowBigUp, ArrowBigDown, MessageCircle, Share2 } from "lucide-react";

export function MenfessCard({ menfess, isDetail = false, onVote, onVoteSuccess }) {
  const navigate = useNavigate();
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState("");

  const handleVote = async (value) => {
    if (!onVote || isVoting) return;

    setIsVoting(true);
    setVoteError("");
    try {
      const nextVote = menfess.user_vote === value ? 0 : value;
      await onVote(menfess.id, nextVote, onVoteSuccess);
    } catch (error) {
      setVoteError(
        error instanceof Error ? error.message : "Vote gagal. Silakan coba lagi."
      );
    } finally {
      setIsVoting(false);
    }
  };

  const openDetail = () => {
    if (!isDetail) {
      navigate(`/menfess/${menfess.id}`);
    }
  };

  const displayLikes = Math.max(0, menfess.likes ?? 0);

  return (
    <article
      onClick={openDetail}
      className={
        isDetail
          ? "space-y-3"
          : "rounded-2xl bg-[#0d110e] border border-[#1f2a22] hover:border-[#2f4636] p-5 space-y-3 transition-colors cursor-pointer shadow-xl"
      }
    >
      {/* Header Kategori & Waktu */}
      <div className="flex items-center justify-between text-xs text-[#8E8E8E]">
        <span className="rounded-full bg-[#0f3d24] px-3 py-1 font-semibold text-[#22e07a]">
          {menfess.tag}
        </span>
        <span>{menfess.timestamp}</span>
      </div>

      {/* Isi Menfess */}
      <p className="text-sm sm:text-base text-[#EAEAEA] leading-relaxed whitespace-pre-line">
        {menfess.content}
      </p>

      {/* Bar Aksi: Vote (1 Kapsul Reddit), Komentar, Bagikan */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="space-y-2 pt-1"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#CFCFCF]">
          {/* Satu Kapsul Pill Vote ala Reddit */}
          <div
            className={`inline-flex items-center rounded-full border px-1 py-0.5 transition-colors ${
              menfess.user_vote === 1
                ? "border-[#F59E0B]/40 bg-[#4A3A2A] text-[#F59E0B]"
                : menfess.user_vote === -1
                ? "border-blue-400/40 bg-[#2D394A] text-blue-400"
                : "border-[#2f4636] bg-[#151b16] text-[#CFCFCF]"
            }`}
          >
            <button
              type="button"
              onClick={() => handleVote(1)}
              disabled={!onVote || isVoting}
              aria-pressed={menfess.user_vote === 1}
              aria-label="Upvote"
              className="p-1.5 rounded-full hover:bg-[#1f2a22]  transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              <ArrowBigUp
                className={`size-4 ${menfess.user_vote === 1 ? "fill-current" : ""}`}
              />
            </button>

            <span
              className="px-1 font-semibold tabular-nums"
              aria-label={`${displayLikes} suara`}
            >
              {displayLikes}
            </span>

            <button
              type="button"
              onClick={() => handleVote(-1)}
              disabled={!onVote || isVoting}
              aria-pressed={menfess.user_vote === -1}
              aria-label="Downvote"
              className="p-1.5 rounded-full hover:bg-[#1f2a22]  transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              <ArrowBigDown
                className={`size-4 ${menfess.user_vote === -1 ? "fill-current" : ""}`}
              />
            </button>
          </div>

          {/* Tombol Komentar -> Beralih ke Halaman Detail */}
          <button
            type="button"
            onClick={() => {
              if (!isDetail) navigate(`/menfess/${menfess.id}`);
            }}
            aria-label={`${menfess.comment_count ?? 0} komentar`}
            className="inline-flex items-center px-3 py-1.5 gap-1.5 rounded-full bg-[#151b16] text-[#CFCFCF] text-xs font-medium hover:bg-[#1f2a22] transition cursor-pointer"
          >
            <MessageCircle className="size-4" />
            <span className="tabular-nums">{menfess.comment_count ?? 0}</span>
          </button>

          {/* Tombol Bagikan */}
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(`${window.location.origin}/menfess/${menfess.id}`);
            }}
            className="inline-flex items-center px-3 py-1.5 gap-1.5 rounded-full bg-[#151b16] text-[#CFCFCF] text-xs font-medium hover:bg-[#1f2a22] transition cursor-pointer"
          >
            <Share2 className="size-4" />
            <span>Bagikan</span>
          </button>
        </div>

        {voteError && (
          <p role="alert" className="text-xs text-amber-400">
            Gagal mengirim vote: {voteError}
          </p>
        )}
      </div>
    </article>
  );
}