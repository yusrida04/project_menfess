import { useState } from "react";
import { apiFetch } from "../../utils/api";


export function AddMenfessModal({ isOpen, onClose, onAddMenfess }) {
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const tag = "Umum";

  async function handleSubmit(event) {
    event.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const newMenfess = await apiFetch("/menfess", {
        method: "POST",
        body: JSON.stringify({ tag, content: content.trim() }),
      });
      onAddMenfess(newMenfess);
      setContent("");
      onClose();
    } catch (err) {
      // Akan menampilkan pesan persis dari FastAPI, misal:
      // "Kamu sudah mencapai batas mengirim menfess (3/jam). Coba lagi dalam 24 menit."
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
            className="rounded-full p-1.5 text-gray-400 hover:bg-[#171f1a] hover:text-[#FCFCFC] focus:outline-none transition-colors"
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
            {errorMsg && <p className="mt-2 text-sm text-red-400">{errorMsg}</p>}
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="rounded-full px-5 py-2 text-sm font-medium text-[#1F1F1F] bg-[#22e07a] hover:bg-[#86efac] disabled:bg-[#121714] disabled:text-[#7D7D7D] disabled:cursor-not-allowed focus:outline-none transition-colors"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Sekarang"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}