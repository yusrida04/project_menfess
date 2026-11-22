import { useState } from "react";
import { CategoryFilter } from "../components/menfess/CategoryFilter";
import { MenfessCard } from "../components/menfess/MenfessCard";

export function HomePage({ menfessList, searchQuery = "", onVote }) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const keyword = searchQuery.trim().toLowerCase();

  // Saring berdasarkan kategori DAN kata kunci pencarian
  const filteredMenfess = menfessList.filter((item) => {
    const kategoriItem = item.category || item.tag || "Lainnya";
    const cocokKategori =
      selectedCategory === "All" || kategoriItem === selectedCategory;
    const cocokKataKunci =
      !keyword || (item.content || "").toLowerCase().includes(keyword);

    return cocokKategori && cocokKataKunci;
  });

  return (
    <div className="space-y-3">
      {/* 5 Kotak Kategori */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="pb-1">
        <h1 className="text-base font-bold text-[#FCFCFC]">
          {keyword
            ? `Hasil pencarian "${searchQuery}"`
            : `Menfess Terbaru (${selectedCategory})`}
        </h1>
      </div>

      {filteredMenfess.length > 0 ? (
        filteredMenfess.map((item) => (
          <MenfessCard key={item.id} menfess={item} onVote={onVote} />
        ))
      ) : (
        <div className="rounded-2xl bg-[#0d110e] p-8 text-center border border-[#1f2a22]">
          <p className="text-sm text-[#8E8E8E]">
            {keyword
              ? `Tidak ditemukan menfess dengan kata kunci "${searchQuery}".`
              : `Belum ada menfess di kategori ${selectedCategory}.`}
          </p>
        </div>
      )}
    </div>
  );
}