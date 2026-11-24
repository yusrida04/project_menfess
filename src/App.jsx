import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "./components/layout/Navbar";
import { AddMenfessModal } from "./components/menfess/AddMenfessModal";
import { HomePage } from "./pages/HomePage";
import { PopularPage } from "./pages/PopularPage";
import { AboutPage } from "./pages/AboutPage";
import { AdminPage } from "./pages/admin/AdminDashboard"; // <-- Tambahkan ini
import { ModeratorPage } from "./pages/ModeratorPage";
import { apiFetch } from "./utils/api";
import { MenfessDetailPage } from "./pages/MenfessDetailPage";

export function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menfessList, setMenfessList] = useState([]);
  const [isLoadingMenfess, setIsLoadingMenfess] = useState(true);
  const [menfessError, setMenfessError] = useState("");
  const [submitNotice, setSubmitNotice] = useState(""); // <-- Notifikasi moderasi

  useEffect(() => {
    async function loadMenfess() {
      try {
        setMenfessList(await apiFetch("/menfess"));
      } catch (err) {
        setMenfessError(err.message);
      } finally {
        setIsLoadingMenfess(false);
      }
    }

    loadMenfess();
  }, []);

  const handleAddMenfess = (newMenfess) => {
    // Jika confidence < 0.799545, statusnya 'flagged' (ditahan moderator)
    if (newMenfess.status === "flagged") {
      setSubmitNotice(
        "Menfess terkirim dan sedang ditinjau moderator sebelum ditayangkan."
      );
      setTimeout(() => setSubmitNotice(""), 6000);
      return;
    }

    // Jika status 'published', langsung tampilkan di beranda
    setMenfessList([newMenfess, ...menfessList]);
  };

  const handleVote = async (id, value, onVoteSuccess) => {
    const updated = await apiFetch(`/menfess/${id}/vote`, {
      method: "POST",
      body: JSON.stringify({ value }),
    });

    setMenfessList((prev) =>
      prev.map((item) =>
        String(item.id) === String(id) ? { ...item, ...updated } : item
      )
    );
    if (onVoteSuccess) onVoteSuccess(updated);
  };

  const feedStatus = isLoadingMenfess ? (
    <p className="text-center text-sm text-[#CFCFCF]">Memuat menfess...</p>
  ) : menfessError ? (
    <p role="alert" className="text-center text-sm text-red-400">
      Gagal memuat menfess: {menfessError}
    </p>
  ) : null;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#050705]">
      {/* 1. Navbar */}
      <Navbar
        onOpenModal={() => setIsModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Banner Info jika menfess masuk antrean moderasi */}
      {submitNotice && (
        <div className="mx-auto mt-3 max-w-xl rounded-lg border border-amber-700 bg-amber-950/80 px-4 py-2.5 text-center text-xs text-amber-200">
          {submitNotice}
        </div>
      )}

      {/* 2. Konten halaman berdasarkan URL */}
      <main className="w-full px-4 py-6 space-y-3">
        <Routes>
          <Route
            path="/"
            element={
              feedStatus || (
                <HomePage
                  menfessList={menfessList}
                  searchQuery={searchQuery}
                  onVote={handleVote}
                />
              )
            }
          />
          <Route
            path="/populer"
            element={
              feedStatus || (
                <PopularPage
                  menfessList={menfessList}
                  searchQuery={searchQuery}
                  onVote={handleVote}
                />
              )
            }
          />
          <Route
            path="/menfess/:id"
            element={
              <MenfessDetailPage
                menfessList={menfessList}
                onVote={handleVote}
              />
            }
          />
          <Route path="/tentang" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/moderator" element={<ModeratorPage />} />
        </Routes>
      </main>

      {/* 3. Modal Tambah Menfess */}
      <AddMenfessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMenfess={handleAddMenfess}
      />
    </div>
  );
}

export default App;