import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
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

function compressImageToDataUrl(file, maxWidth = 900, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Gambar tidak dapat dibaca."));
        return;
      }

      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxWidth / image.naturalWidth);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.naturalWidth * scale);
        canvas.height = Math.round(image.naturalHeight * scale);

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas tidak tersedia."));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.onerror = () => reject(new Error("Gambar tidak dapat diproses."));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Gambar tidak dapat dibaca."));
    reader.readAsDataURL(file);
  });
}

const MEME_TEXT_STYLE = {
  textShadow:
    "-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000",
};

export function AddMenfessModal({ isOpen, onClose, onAddMenfess }) {
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [musicData, setMusicData] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const tag = "Umum";

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("File harus berupa gambar.");
        return;
      }

      setErrorMsg("");
      setImageUrl(await compressImageToDataUrl(file));
    } catch (error) {
      setErrorMsg(error.message || "Gagal memproses gambar.");
    } finally {
      event.target.value = "";
    }
  };

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
          image_url: imageUrl,
        }),
      });
      onAddMenfess(newMenfess);
      setContent("");
      setMusicData(null);
      setImageUrl(null);
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

          <div className="space-y-2">
            {!imageUrl ? (
              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#2f4636] bg-[#151b16] py-2.5 text-xs font-medium text-[#CFCFCF] transition hover:border-[#22e07a] hover:text-[#22e07a]">
                <ImagePlus className="size-4" />
                <span>Tambah Background Gambar (Opsional)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[260px] overflow-hidden rounded-xl border border-[#22e07a]/50 bg-black">
                <img
                  src={imageUrl}
                  alt="Preview background"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                  <p
                    style={MEME_TEXT_STYLE}
                    className="break-words whitespace-pre-line text-lg font-bold leading-snug text-white"
                  >
                    {content.trim() || "Pratinjau teksmu di sini..."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute right-2 top-2 cursor-pointer rounded-full bg-black/70 p-1 text-white transition hover:bg-red-600"
                  aria-label="Hapus gambar"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
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