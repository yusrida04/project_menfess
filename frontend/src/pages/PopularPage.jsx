import { MenfessCard } from "../components/menfess/MenfessCard";

export function PopularPage({ menfessList, onVote }) {
  // Urutkan dari likes terbanyak ke terkecil
  const popularList = [...menfessList].sort((a, b) => (b.likes || 0) - (a.likes || 0));

  return (
    <div className="w-full space-y-3">
      <div className="pb-2">
        <h1 className="text-lg font-bold text-[#F3F4F6]">Sedang Populer</h1>
        <p className="text-xs text-[#CFCFCF]">Menfess dengan interaksi paling ramai</p>
      </div>

      {popularList.map((item) => (
        <MenfessCard key={item.id} menfess={item} onVote={onVote} />
      ))}
    </div>
  );
}