import { useEffect, useState } from "react";
import { Check, Pencil, Trash2, ShieldAlert, X, Save } from "lucide-react";
import { apiFetch } from "../utils/api";

const CATEGORIES = ["Asmara", "Kampus", "Sosial", "Lainnya"];

export function ModeratorPage() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem("admin_key") || "");
  const [isUnlocked, setIsUnlocked] = useState(() => Boolean(sessionStorage.getItem("admin_key")));
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State untuk mode Edit
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editTag, setEditTag] = useState("Lainnya");

  const loadQueue = async (key = adminKey) => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/menfess/moderator/queue", {
        headers: { "X-Admin-Key": key },
      });
      setQueue(data);
      setIsUnlocked(true);
      sessionStorage.setItem("admin_key", key);
    } catch (err) {
      setError(err.message || "Kode akses moderator salah.");
      setIsUnlocked(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isUnlocked) loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (id) => {
    try {
      await apiFetch(`/menfess/moderator/${id}/approve`, {
        method: "PATCH",
        headers: { "X-Admin-Key": adminKey },
      });
      setQueue((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditContent(item.content);
    setEditTag(item.tag || "Lainnya");
  };

  const handleSaveEdit = async (id, approve = true) => {
    if (!editContent.trim()) return;
    try {
      await apiFetch(`/menfess/moderator/${id}`, {
        method: "PUT",
        headers: { "X-Admin-Key": adminKey },
        body: JSON.stringify({
          content: editContent.trim(),
          tag: editTag,
          approve,
        }),
      });
      if (approve) {
        setQueue((prev) => prev.filter((item) => item.id !== id));
      } else {
        setQueue((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, content: editContent.trim(), tag: editTag } : item
          )
        );
      }
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus permanen menfess ini?")) return;
    try {
      await apiFetch(`/menfess/moderator/${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Key": adminKey },
      });
      setQueue((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Form Login Kunci Moderator
  if (!isUnlocked) {
    return (
      <div className="mx-auto mt-16 max-w-sm rounded-2xl border border-[#1f2a22] bg-[#0d110e] p-6 space-y-4">
        <div className="flex items-center gap-2 text-[#22e07a]">
          <ShieldAlert className="size-5" />
          <h1 className="text-lg font-bold text-[#FCFCFC]">Panel Moderator</h1>
        </div>
        <p className="text-xs text-[#8E8E8E]">
          Masukkan kunci akses admin untuk meninjau antrean menfess yang ter-flag AI.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadQueue(adminKey);
          }}
          className="space-y-3"
        >
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Kunci akses moderator..."
            className="w-full rounded-xl border border-[#1f2a22] bg-[#151b16] px-3 py-2 text-sm text-[#FCFCFC] focus:border-[#22e07a] focus:outline-none"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-full bg-[#22e07a] py-2 text-sm font-semibold text-[#1F1F1F] hover:bg-[#86efac] transition cursor-pointer"
          >
            Masuk Panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#FCFCFC]">Antrean Moderasi</h1>
          <p className="text-xs text-[#8E8E8E]">
            {queue.length} menfess menunggu peninjauan sebelum tayang
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadQueue()}
          className="rounded-full border border-[#1f2a22] bg-[#151b16] px-3 py-1.5 text-xs text-[#CFCFCF] hover:bg-[#1f2a22] cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#8E8E8E]">Memuat antrean...</p>
      ) : queue.length === 0 ? (
        <div className="rounded-2xl border border-[#1f2a22] bg-[#0d110e] p-8 text-center text-sm text-[#8E8E8E]">
          Tidak ada menfess dalam antrean moderasi.
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => {
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-amber-500/30 bg-[#0d110e] p-4 space-y-3"
              >
                {/* Header: Tag & Alasan Flag */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="rounded-full bg-[#0f3d24] px-2.5 py-0.5 font-semibold text-[#22e07a]">
                    {item.tag}
                  </span>
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-amber-300">
                    {item.flag_reason || "Flagged oleh sistem"}
                  </span>
                </div>

                {/* Preview Gambar jika ada */}
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt="Lampiran menfess"
                    className="max-h-56 rounded-xl border border-[#1f2a22] object-cover"
                  />
                )}

                {/* Isi Teks ATAU Form Edit */}
                {isEditing ? (
                  <div className="space-y-3 rounded-xl border border-[#2f4636] bg-[#151b16] p-3">
                    <div>
                      <label className="mb-1 block text-xs text-[#8E8E8E]">Kategori</label>
                      <select
                        value={editTag}
                        onChange={(e) => setEditTag(e.target.value)}
                        className="rounded-lg border border-[#1f2a22] bg-[#0d110e] px-3 py-1.5 text-xs text-[#FCFCFC] focus:outline-none"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-[#8E8E8E]">Edit Isi Menfess</label>
                      <textarea
                        rows={3}
                        maxLength={280}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full rounded-lg border border-[#1f2a22] bg-[#0d110e] p-2.5 text-sm text-[#FCFCFC] focus:border-[#22e07a] focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="inline-flex items-center gap-1 rounded-full bg-[#1f2a22] px-3 py-1.5 text-xs text-[#CFCFCF] hover:bg-[#2a382e] cursor-pointer"
                      >
                        <X className="size-3.5" />
                        <span>Batal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(item.id, true)}
                        className="inline-flex items-center gap-1 rounded-full bg-[#22e07a] px-3.5 py-1.5 text-xs font-semibold text-[#1F1F1F] hover:bg-[#86efac] cursor-pointer"
                      >
                        <Save className="size-3.5" />
                        <span>Simpan & Tayangkan</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-line text-sm text-[#FCFCFC]">
                    {item.content}
                  </p>
                )}

                {/* Bar Tombol Aksi Moderator: Setujui, Edit, Hapus */}
                {!isEditing && (
                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#1f2a22] pt-3">
                    <button
                      type="button"
                      onClick={() => handleApprove(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#22e07a] px-3.5 py-1.5 text-xs font-semibold text-[#1F1F1F] hover:bg-[#86efac] transition cursor-pointer"
                    >
                      <Check className="size-3.5" />
                      <span>Setujui</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#2f4636] bg-[#151b16] px-3.5 py-1.5 text-xs font-medium text-[#FCFCFC] hover:bg-[#1f2a22] transition cursor-pointer"
                    >
                      <Pencil className="size-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/25 transition cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}