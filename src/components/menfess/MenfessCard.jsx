import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageCircle,
  Share2,
  Music,
  Play,
  Pause,
} from "lucide-react";

function ReelsMusicBar({ music }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!music || !music.preview_url) return null;

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex flex-1 min-w-0 items-center justify-between gap-2 rounded-full border border-[#1f2a22] bg-[#151b16] px-3 py-1"
    >
      {/* Kiri: Ikon Nada + Judul • Artis memanjang dalam 1 baris */}
      <div className="flex min-w-0 items-center gap-2 text-xs">
        <Music
          className={`size-3.5 shrink-0 ${
            isPlaying ? "text-[#22e07a] animate-pulse" : "text-[#22e07a]"
          }`}
        />
        <p className="truncate text-[#CFCFCF]">
          <span className="font-medium text-[#FCFCFC]">{music.title}</span>
          <span className="mx-1.5 text-[#8E8E8E]">•</span>
          <span className="text-[#8E8E8E]">{music.artist}</span>
        </p>
      </div>

      {/* Kanan: Tombol Play Bulat Kecil */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Jeda lagu" : "Putar lagu"}
        className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#22e07a] text-[#1F1F1F] transition hover:bg-[#86efac] cursor-pointer"
      >
        {isPlaying ? (
          <Pause className="size-2.5 fill-current" />
        ) : (
          <Play className="size-2.5 fill-current ml-0.5" />
        )}
      </button>

      <audio
        ref={audioRef}
        src={music.preview_url}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}

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
          ? "space-y-4"
          : "rounded-2xl bg-[#0d110e] border border-[#1f2a22] hover:border-[#2f4636] p-5 space-y-4 transition-colors cursor-pointer shadow-xl"
      }
    >
      {/* 1. Header: Tag (Kiri) + Kapsul Musik Panjang (Tengah) + Waktu (Kanan) */}
      <div className="flex items-center justify-between gap-3 text-xs text-[#8E8E8E]">
        <span className="shrink-0 rounded-full bg-[#0f3d24] px-3 py-1 font-semibold text-[#22e07a]">
          {menfess.tag}
        </span>

        <ReelsMusicBar music={menfess.music_data} />

        <span className="shrink-0">{menfess.timestamp}</span>
      </div>

      {/* 2. Isi Menfess sebagai Bintang Utama */}
      <div className="py-2">
        <p className="text-2xl sm:text-[30px] font-medium text-[#FCFCFC] leading-snug whitespace-pre-line">
          {menfess.content}
        </p>
      </div>

      {/* 3. Bar Aksi: Vote, Komentar, Bagikan */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="space-y-2 pt-1"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#CFCFCF]">
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
              className="p-1.5 rounded-full hover:bg-[#1f2a22] transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
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
              className="p-1.5 rounded-full hover:bg-[#1f2a22] transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              <ArrowBigDown
                className={`size-4 ${menfess.user_vote === -1 ? "fill-current" : ""}`}
              />
            </button>
          </div>

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