import { useState } from "react";
import { CategoryFilter } from "../components/menfess/CategoryFilter";
import { MenfessCard } from "../components/menfess/MenfessCard";

export function HomePage({ menfessList, searchQuery, onVote }) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Saring berdasarkan 5 kotak kategori (cek field category atau tag)
  const filteredByCategory = menfessList.filter((item) => {
    const kategoriItem = item.category || item.tag || "Lainnya";
    return selectedCategory === "All" || kategoriItem === selectedCategory;
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
          {searchQuery
            ? `Hasil pencarian "${searchQuery}"`
            : `Menfess Terbaru (${selectedCategory})`}
        </h1>
      </div>

      {filteredByCategory.length > 0 ? (
        filteredByCategory.map((item) => (
          <MenfessCard key={item.id} menfess={item} onVote={onVote} />
        ))
      ) : (
        <div className="rounded-2xl bg-[#252525] p-8 text-center border border-[#333333]">
          <p className="text-sm text-[#8E8E8E]">
            Belum ada menfess di kategori {selectedCategory}.
          </p>
        </div>
      )}
    </div>
  );
}