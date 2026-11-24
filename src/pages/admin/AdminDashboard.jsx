import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";

const KATEGORI_LIST = ["Asmara", "Kampus", "Sosial", "Lainnya"];

function CategoryDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex min-w-[145px] items-center justify-between gap-2 rounded-lg border border-neutral-700 bg-[#2A2A2A] px-3 py-1.5 text-xs font-medium text-white transition hover:border-neutral-500 focus:border-emerald-500 focus:outline-none"
      >
        <span>{value}</span>
        <svg
          className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-36 overflow-hidden rounded-xl border border-neutral-700 bg-[#252525] p-1 shadow-xl">
          {KATEGORI_LIST.map((kat) => {
            const isSelected = kat === value;
            return (
              <button
                key={kat}
                type="button"
                onMouseDown={() => {
                  onChange(kat);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                  isSelected
                    ? "bg-emerald-600/20 font-medium text-emerald-400"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <span>{kat}</span>
                {isSelected && <span className="text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") || "");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState("flagged");
  const [items, setItems] = useState([]);
  const [loadedKey, setLoadedKey] = useState("");

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
    } catch (err) {
      setAuthError(err.message || "Gagal terhubung ke server.");
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

  // --- TAMPILAN LOGIN ADMIN (TENGAH LAYAR) ---
  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] w-full items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-neutral-700 bg-[#1E1E1E] p-6 text-[#CFCFCF]">
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
              className="w-full rounded-lg border border-neutral-700 bg-[#2A2A2A] px-3 py-2 text-sm text-white focus:border-[#F59E0B] focus:outline-none"
            />
            {authError && <p className="text-xs text-red-400">{authError}</p>}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full rounded-lg hover:bg-[#86efac] bg-[#22e07a] py-2 text-sm font-medium text-[#1F1F1F] transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? "Memverifikasi..." : "Masuk Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- TAMPILAN DASHBOARD MODERASI ---
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 text-[#CFCFCF]">
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

                  {/* Dropdown Koreksi Kategori (Sudah dirapikan, tidak dobel) */}
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Kategori:</span>
                    <CategoryDropdown
                      value={item.tag}
                      onChange={(newKat) => handleChangeKategori(item.id, newKat)}
                    />
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