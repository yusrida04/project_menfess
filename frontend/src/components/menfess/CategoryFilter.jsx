const CATEGORIES = [
  { id: "All", label: "All", desc: "Semua cerita & info kampus" },
  { id: "Asmara", label: "Asmara", desc: "Curhat hati, crush & hubungan" },
  { id: "Kampus", label: "Kampus", desc: "Akademik, dosen, UKT & fasilitas" },
  { id: "Sosial", label: "Sosial", desc: "Pertemanan, organisasi & event" },
  { id: "Lainnya", label: "Lainnya", desc: "Topik random & hiburan" },
];

export function CategoryFilter({ selectedCategory, onSelectCategory }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pb-4">
      {CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`text-left rounded-xl p-3 border transition-all cursor-pointer ${
              isActive
                ? "bg-[#3A3A3A] border-[#7f7e7e] shadow-sm"
                : "border-[#4A4A4A] bg-[#3A3A3A] text-[#FCFCFC] hover:bg-[#525252] focus:outline-none inset-shadow-sm"
            }`}
          >
            <div
              className={`text-sm font-bold ${
                isActive ? "text-[#FCFCFC]" : "text-[#CFCFCF]"
              }`}
            >
              {cat.label}
            </div>
            <p className="text-[11px] text-[#8E8E8E] leading-snug mt-1 line-clamp-2">
              {cat.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
}