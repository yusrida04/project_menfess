import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "../utils/api";
import { MenfessCard } from "../components/menfess/MenfessCard";
import { Komentar } from "../components/layout/Komentar";

export function MenfessDetailPage({ menfessList = [], onVote }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Cari dulu di state yang sudah ada agar instan, kalau belum ada ambil dari API
  const existing = menfessList.find((m) => String(m.id) === String(id));
  const [menfess, setMenfess] = useState(existing || null);
  const [isLoading, setIsLoading] = useState(!existing);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await apiFetch(`/menfess/${id}`);
        setMenfess(data);
      } catch (err) {
        if (!existing) setErrorMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleBack = () => {
    // Jika ada riwayat navigasi di dalam web, kembali ke halaman sebelumnya (Beranda/Populer)
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="px-4 space-y-4">
      {/* Tombol Left Arrow Kembali */}
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-2 rounded-full bg-[#0d110e] hover:bg-[#141c17] border border-[#1f2a22] px-4 py-2 text-sm font-medium text-[#EAEAEA] transition-colors cursor-pointer"
      >
        <ArrowLeft className="size-4" />
        <span>Kembali</span>
      </button>

      {isLoading ? (
        <div className="rounded-2xl bg-[#0d110e] border border-[#1f2a22] p-6 text-center text-sm text-[#8E8E8E]">
          Memuat postingan...
        </div>
      ) : errorMsg || !menfess ? (
        <div className="rounded-2xl bg-[#0d110e] border border-[#1f2a22] p-6 text-center text-sm text-amber-400">
          {errorMsg || "Menfess tidak ditemukan."}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0d110e] border border-[#1f2a22] p-5 space-y-2 shadow-lg">
          {/* Kartu Menfess Utama (mode detail: tidak bisa diklik navigasi ulang) */}
          <MenfessCard
            menfess={menfess}
            isDetail={true}
            onVote={onVote}
            onVoteSuccess={(updated) => {
              setMenfess((prev) => ({ ...prev, ...updated }));
            }}
          />

          {/* Thread Komentar */}
          <Komentar
            menfessId={menfess.id}
            onCommentAdded={() =>
              setMenfess((prev) => ({
                ...prev,
                comment_count: (prev.comment_count || 0) + 1,
              }))
            }
          />
        </div>
      )}
    </div>
  );
}