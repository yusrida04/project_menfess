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

const TEXT_OUTLINE_STYLE = {
  textShadow:
    "-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 3px 10px rgba(0,0,0,0.85)",
};

function FloatingMusicPill({ music }) {
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
      className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 backdrop-blur-md"
    >
      {/* Ikon Nada + Judul • Artis */}
      <button
        type="button"
        onClick={togglePlay}
        className="flex min-w-0 items-center gap-1.5 text-left text-xs cursor-pointer"
      >
        <Music
          className={`size-3.5 shrink-0 text-[#22e07a] ${
            isPlaying ? "animate-bounce" : ""
          }`}
        />
        <span className="truncate">
          <span className="font-semibold text-[#FCFCFC]">{music.title}</span>
          <span className="mx-1.5 text-[#8E8E8E]">•</span>
          <span className="text-[#CFCFCF]">{music.artist}</span>
        </span>
      </button>

      {/* Tombol Play Bulat Kecil di Kanan */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Jeda lagu" : "Putar lagu"}
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-[#FCFCFC] hover:bg-[#22e07a] hover:text-[#1F1F1F] transition cursor-pointer"
      >
        {isPlaying ? (
          <Pause className="size-3 fill-current" />
        ) : (
          <Play className="size-3 fill-current ml-0.5" />
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
    /* max-w-[440px] mx-auto agar kartu tidak melebar full layar */
    <article
      onClick={openDetail}
      className={
        isDetail
          ? "mx-auto w-full max-w-[460px] space-y-3"
          : "mx-auto w-full max-w-[440px] rounded-2xl bg-[#0d110e] border border-[#1f2a22] hover:border-[#2f4636] p-3 space-y-3 transition-colors cursor-pointer shadow-xl"
      }
    >
      {/* 1. Kanvas Rasio 4:5 (Foto User ATAU Background Hijau Gelap Default) */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-[#1f2a22] bg-gradient-to-br from-[#0e1711] via-[#0a120d] to-[#112418]">
        {menfess.image_url ? (
          <>
            <img
              src={menfess.image_url}
              alt="Background menfess"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/25" />
          </>
        ) : (
          /* Dekorasi lingkaran samar hijau gelap seperti di mockup jika tanpa foto */
          <>
            <div className="pointer-events-none absolute -left-12 top-6 size-64 rounded-full bg-[#15241a]/45 blur-sm" />
            <div className="pointer-events-none absolute -right-10 bottom-10 size-72 rounded-full bg-[#172b1e]/45 blur-sm" />
          </>
        )}

        {/* Overlay Atas: Tag Kategori (Kiri) & Waktu (Kanan) */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 p-3.5 text-xs">
          <span className="rounded-full border border-white/10 bg-black/65 px-3 py-1 font-semibold text-[#22e07a] backdrop-blur-md">
            {menfess.tag}
          </span>
          <span className="rounded-full border border-white/10 bg-black/65 px-3 py-1 text-[#CFCFCF] backdrop-blur-md">
            {menfess.timestamp}
          </span>
        </div>

        {/* Overlay Tengah: Teks Menfess Putih dengan Pinggiran Hitam */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6 py-14 text-center">
          <p
            style={TEXT_OUTLINE_STYLE}
            className="break-words whitespace-pre-line text-2xl sm:text-[30px] font-bold leading-snug text-white"
          >
            {menfess.content}
          </p>
        </div>

        {/* Overlay Bawah Kiri: Kapsul Musik Mengambang */}
        {menfess.music_data && (
          <div className="absolute inset-x-3.5 bottom-3.5 z-10 flex items-center">
            <FloatingMusicPill music={menfess.music_data} />
          </div>
        )}
      </div>

      {/* 2. Bar Aksi di Bawah Kanvas: Vote, Komentar, Bagikan */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="space-y-2 px-0.5"
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
            className="inline-flex items-center px-3 py-1.5 gap-1.5 rounded-full border border-[#1f2a22] bg-[#151b16] text-[#CFCFCF] text-xs font-medium hover:bg-[#1f2a22] transition cursor-pointer"
          >
            <MessageCircle className="size-4" />
            <span className="tabular-nums">{menfess.comment_count ?? 0}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(`${window.location.origin}/menfess/${menfess.id}`);
            }}
            className="inline-flex items-center px-3 py-1.5 gap-1.5 rounded-full border border-[#1f2a22] bg-[#151b16] text-[#CFCFCF] text-xs font-medium hover:bg-[#1f2a22] transition cursor-pointer"
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