import { MenfessCard } from "../components/menfess/MenfessCard";

export function PopularPage({ menfessList, searchQuery = "", onVote }) {
  const keyword = searchQuery.trim().toLowerCase();

  // Saring berdasarkan kata kunci terlebih dahulu, lalu urutkan dari likes terbanyak ke terkecil
  const popularList = menfessList
    .filter(
      (item) =>
        !keyword || (item.content || "").toLowerCase().includes(keyword)
    )
    .sort((a, b) => (b.likes || 0) - (a.likes || 0));

  return (
    <div className="w-full space-y-3">
      <div className="pb-2">
        <h1 className="text-lg font-bold text-[#F3F4F6]">
          {keyword ? `Hasil pencarian "${searchQuery}"` : "Sedang Populer"}
        </h1>
        <p className="text-xs text-[#CFCFCF]">
          Menfess dengan interaksi paling ramai
        </p>
      </div>

      {popularList.length > 0 ? (
        popularList.map((item) => (
          <MenfessCard key={item.id} menfess={item} onVote={onVote} />
        ))
      ) : (
        <div className="rounded-2xl bg-[#0d110e] p-8 text-center border border-[#1f2a22]">
          <p className="text-sm text-[#8E8E8E]">
            {keyword
              ? `Tidak ditemukan menfess dengan kata kunci "${searchQuery}".`
              : "Belum ada menfess populer."}
          </p>
        </div>
      )}
    </div>
  );
}