import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

const KATEGORI_LIST = ["Asmara", "Kampus", "Sosial", "Lainnya"];

export function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") || "");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState("flagged"); // 'flagged' | 'published'
  const [items, setItems] = useState([]);
  const [loadedKey, setLoadedKey] = useState(""); // Penanda data yang sudah selesai dimuat

  const currentKey = token ? `${token}:${activeTab}` : "";
  const loading = Boolean(token) && loadedKey !== currentKey;

  useEffect(() => {
    if (!token) return;

    let isCancelled = false;

    async function fetchAdminMenfess() {
      try {
        const res = await apiFetch(`/admin/menfess?status=${activeTab}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!isCancelled) {
          setItems(res.data || []);
          setLoadedKey(`${token}:${activeTab}`);
        }
      } catch (err) {
        if (!isCancelled) {
          if (err.message.includes("401") || err.message.toLowerCase().includes("ditolak")) {
            localStorage.removeItem("admin_token");
            setToken("");
          }
          setLoadedKey(`${token}:${activeTab}`);
        }
      }
    }

    fetchAdminMenfess();

    return () => {
      isCancelled = true;
    };
  }, [token, activeTab]);

const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setIsLoggingIn(true);
    try {
      const res = await apiFetch("/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      localStorage.setItem("admin_token", res.token);
      setToken(res.token);
      setPassword("");
    } catch {
      setAuthError("Password admin salah atau server tidak merespons.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken("");
    setItems([]);
    setLoadedKey("");
  };

  const handleApprove = async (id) => {
    await apiFetch(`/admin/menfess/${id}/approve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReject = async (id) => {
    if (!window.confirm("Yakin ingin menolak dan menghapus menfess ini permanen?")) return;
    await apiFetch(`/admin/menfess/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleChangeKategori = async (id, newKategori) => {
    await apiFetch(`/admin/menfess/${id}/kategori`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ kategori: newKategori }),
    });
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, tag: newKategori, is_corrected: true } : item
      )
    );
  };

  // --- TAMPILAN LOGIN ADMIN ---
  if (!token) {
    return (
      <div className="mx-auto mt-10 max-w-md rounded-xl border border-neutral-700 bg-[#1E1E1E] p-6 text-[#CFCFCF]">
        <h1 className="mb-1 text-lg font-semibold text-white">Login Moderator UNIMED Menfess</h1>
        <p className="mb-4 text-xs text-neutral-400">
          Masuk untuk meninjau menfess dengan confidence IndoBERT &lt; 80%.
        </p>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            placeholder="Masukkan password admin..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-700 bg-[#2A2A2A] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
          {authError && <p className="text-xs text-red-400">{authError}</p>}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {isLoggingIn ? "Memverifikasi..." : "Masuk Dashboard"}
          </button>
        </form>
      </div>
    );
  }

  // --- TAMPILAN DASHBOARD MODERASI ---
  return (
    <div className="mx-auto max-w-3xl space-y-4 text-[#CFCFCF]">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-700 bg-[#1E1E1E] p-4">
        <div>
          <h1 className="text-lg font-semibold text-white">Panel Moderasi Human-in-the-Loop</h1>
          <p className="text-xs text-neutral-400">
            Threshold Otomatis IndoBERT: <span className="font-mono text-emerald-400">0.799545</span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-neutral-600 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
        >
          Keluar
        </button>
      </div>

      {/* Tab Navigasi */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("flagged")}
          className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
            activeTab === "flagged"
              ? "bg-amber-600 text-white"
              : "bg-[#1E1E1E] text-neutral-400 hover:text-white"
          }`}
        >
          Antrean Moderasi (Flagged)
        </button>
        <button
          onClick={() => setActiveTab("published")}
          className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
            activeTab === "published"
              ? "bg-emerald-600 text-white"
              : "bg-[#1E1E1E] text-neutral-400 hover:text-white"
          }`}
        >
          Sudah Tayang & Koreksi Label
        </button>
      </div>

      {/* Daftar Menfess */}
      {loading ? (
        <p className="py-8 text-center text-sm text-neutral-400">Memuat data...</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-[#1E1E1E] p-8 text-center text-sm text-neutral-400">
          {activeTab === "flagged"
            ? "Tidak ada menfess yang tertahan di antrean moderasi."
            : "Belum ada menfess yang tayang."}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const persenConf = item.confidence ? (item.confidence * 100).toFixed(1) : "100.0";
            return (
              <div
                key={item.id}
                className="space-y-3 rounded-xl border border-neutral-700 bg-[#1E1E1E] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-neutral-400">
                      #{item.id}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 font-medium ${
                        item.confidence >= 0.799545
                          ? "bg-emerald-950 text-emerald-400"
                          : "bg-amber-950 text-amber-400"
                      }`}
                    >
                      AI: {item.tag} ({persenConf}%)
                    </span>
                    {item.is_corrected && (
                      <span className="rounded bg-sky-950 px-2 py-0.5 text-sky-400">
                        Dikoreksi Admin
                      </span>
                    )}
                  </div>

                  {/* Dropdown Koreksi Kategori */}
                  <div className="flex items-center gap-1.5">
                    <label className="text-neutral-400">Kategori:</label>
                    <select
                      value={item.tag}
                      onChange={(e) => handleChangeKategori(item.id, e.target.value)}
                      className="rounded border border-neutral-600 bg-[#2A2A2A] px-2 py-1 text-xs text-white focus:outline-none"
                    >
                      {KATEGORI_LIST.map((kat) => (
                        <option key={kat} value={kat}>
                          {kat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="whitespace-pre-line text-sm text-white">{item.content}</p>

                {activeTab === "flagged" && (
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleReject(item.id)}
                      className="rounded-lg bg-red-900/60 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-800"
                    >
                      Tolak & Hapus
                    </button>
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                    >
                      Setujui & Tayangkan
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