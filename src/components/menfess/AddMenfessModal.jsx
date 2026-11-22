import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";

function MusicPicker({ selectedMusic, onSelectMusic }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (val.trim().length < 2) {
      setResults([]);
      setSearching(false);
    }
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    let isCancelled = false;
    const delay = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&entity=song&limit=5`
        );
        const data = await res.json();
        if (!isCancelled) {
          setResults(data.results || []);
        }
      } catch {
        if (!isCancelled) {
          setResults([]);
        }
      } finally {
        if (!isCancelled) {
          setSearching(false);
        }
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(delay);
    };
  }, [query]);

  // Tampilan saat lagu sudah dipilih
  if (selectedMusic) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-[#22e07a]/50 bg-[#151b16] p-2.5">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={selectedMusic.cover}
            alt={selectedMusic.title}
            className="h-10 w-10 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[#FCFCFC]">
              {selectedMusic.title}
            </p>
            <p className="truncate text-[11px] text-[#8E8E8E]">
              {selectedMusic.artist}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelectMusic(null)}
          className="ml-2 shrink-0 rounded-full px-2.5 py-1 text-xs text-red-400 hover:bg-[#1f2a22] transition-colors cursor-pointer"
        >
          Hapus
        </button>
      </div>
    );
  }

  // Tampilan kolom pencarian lagu
  return (
    <div className="relative space-y-1.5">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Lampirkan lagu... (ketik judul atau penyanyi)"
          className="w-full rounded-xl border border-[#1f2a22] bg-[#171f1a] py-2.5 pl-9 pr-3 text-xs text-[#FCFCFC] placeholder:text-[#8E8E8E] focus:border-[#2f4636] focus:outline-none"
        />
        <svg
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8E8E8E]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      </div>

      {searching && (
        <p className="px-1 text-[11px] text-[#8E8E8E]">Mencari lagu...</p>
      )}

      {results.length > 0 && (
        <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-[#1f2a22] bg-[#121714] p-1.5 shadow-lg">
          {results.map((track) => (
            <button
              key={track.trackId}
              type="button"
              onClick={() => {
                onSelectMusic({
                  title: track.trackName,
                  artist: track.artistName,
                  cover: track.artworkUrl100,
                  preview_url: track.previewUrl,
                });
                setQuery("");
                setResults([]);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-[#1f2a22] cursor-pointer"
            >
              <img
                src={track.artworkUrl60}
                alt={track.trackName}
                className="h-9 w-9 shrink-0 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-[#FCFCFC]">
                  {track.trackName}
                </p>
                <p className="truncate text-[11px] text-[#8E8E8E]">
                  {track.artistName}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AddMenfessModal({ isOpen, onClose, onAddMenfess }) {
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [musicData, setMusicData] = useState(null);
  const tag = "Umum";

  async function handleSubmit(event) {
    event.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const newMenfess = await apiFetch("/menfess", {
        method: "POST",
        body: JSON.stringify({
          tag,
          content: content.trim(),
          music_data: musicData,
        }),
      });
      onAddMenfess(newMenfess);
      setContent("");
      setMusicData(null);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#0d110e] p-6 shadow-xl border border-[#1f2a22] animate-fadeIn">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-[#1f2a22]">
          <h3 className="text-lg font-bold text-[#FCFCFC]">Kirim Menfess Baru</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-[#171f1a] hover:text-[#FCFCFC] focus:outline-none transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">

          {/* Kolom Teks Menfess */}
          <div>
            <textarea
              rows="4"
              maxLength={280}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis pesan rahasiamu di sini... (Identitasmu 100% anonim)"
              className="w-full resize-none rounded-xl border border-[#1f2a22] bg-[#171f1a] p-3 text-sm text-[#FCFCFC] placeholder:text-[#8E8E8E] focus:border-[#2f4636] focus:outline-none"
              autoFocus
            />
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>Tetap sopan dan patuhi aturan komunitas.</span>
              <span>{content.length}/280</span>
            </div>
          </div>

          {/* Kolom Pencari & Lampiran Lagu */}
          <MusicPicker
            selectedMusic={musicData}
            onSelectMusic={setMusicData}
          />

          {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}

          {/* Tombol Aksi */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="rounded-full px-5 py-2 text-sm font-medium text-[#1F1F1F] bg-[#22e07a] hover:bg-[#86efac] disabled:bg-[#121714] disabled:text-[#7D7D7D] disabled:cursor-not-allowed focus:outline-none transition-colors cursor-pointer"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Sekarang"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}