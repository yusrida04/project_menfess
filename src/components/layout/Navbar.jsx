import { Link } from "react-router-dom";
import { SquarePlus, ArrowUpRight, X } from "lucide-react";
import { useCurtain } from "../ui/CurtainTransition";



export function Navbar({ onOpenModal, searchQuery = "", setSearchQuery }) {
  const { triggerCurtain } = useCurtain();
  return (
    <header className="sticky top-0 z-40 w-full bg-[#121512] border-b border-[#1f2a22]">
      {/* 1. Ubah max-w-6xl mx-auto menjadi w-full dan padding px-4 agar sejajar persis dengan <main> */}
      <nav className="w-full flex items-center justify-between gap-4 py-3 px-4">
        
        {/* 1. KIRI: Brand */}
        <div className="flex items-center shrink-0">
          <Link
            className="font-amarante text-2xl tracking-wide text-[#FCFCFC] whitespace-nowrap focus:outline-none"
            to="/"
            onClick={(event) => {
              event.preventDefault();
              triggerCurtain("/", { color: "#050705" });
            }}
            aria-label="Beranda"
          >
            UNIMED Menfess
          </Link>
        </div>

        {/* 2. TENGAH: Search Bar Lebar Penuh (hapus max-w-xl agar memanjang penuh) */}
        <div className="flex-1 flex items-center justify-end md:justify-center">
          {/* Tombol ikon search khusus layar HP kecil */}
          <button
            type="button"
            className="flex md:hidden size-8 sm:size-9 justify-center items-center rounded-full border border-[#1f2a22] bg-[#0d110e] text-[#FCFCFC] hover:bg-[#525252] focus:outline-none"
            aria-label="Cari"
          >
            <svg className="size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Input Search Lebar untuk Tablet & Desktop */}
          <div className="hidden md:block relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              placeholder="Cari menfess"
              className="w-full rounded-full border border-[#1f2a22] bg-[#0d110e] py-1.5 pl-9 pr-8 text-xs sm:text-sm text-[#CFCFCF] placeholder-[#8E8E8E] hover:bg-[#151b16] focus:bg-[#171f1a] focus:border-[#7D7D7D] focus:outline-none transition-colors"
            />
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            {/* Tombol X Custom (Kanan - muncul saat teks diketik) */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery?.("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-[#8E8E8E] hover:bg-[#3A3A3A] hover:text-[#FCFCFC] transition-colors cursor-pointer"
                aria-label="Hapus pencarian"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3. KANAN: Menu Tombol */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            className="py-1.5 px-2.5 sm:px-3 gap-1.5 flex items-center text-xs sm:text-sm font-medium text-[#1F1F1F] hover:bg-[#86efac] bg-[#22e07a] rounded-full focus:outline-none whitespace-nowrap cursor-pointer"
            onClick={() => onOpenModal?.()}
            aria-label="Kirim Menfess"
          >
            <SquarePlus className="size-4 text-[#1F1F1F] shrink-0" />
            <span className="hidden sm:inline">Kirim Menfess</span>
          </button>

          <Link
            className="py-1.5 px-2 sm:px-3 gap-1 flex items-center text-xs sm:text-sm text-[#CFCFCF] hover:bg-[#1f2a22] rounded-full focus:outline-none whitespace-nowrap"
            to="/populer"
            onClick={(event) => {
              event.preventDefault();
              triggerCurtain("/populer", { color: "#050705" });
            }}
            aria-label="Populer"
          >
            <ArrowUpRight className="size-4 text-[#CFCFCF] shrink-0" />
            <span className="hidden sm:inline">Populer</span>
          </Link>

          <Link
            className="py-1.5 px-2 sm:px-3 flex items-center text-xs sm:text-sm text-[#CFCFCF] hover:bg-[#1f2a22] rounded-full focus:outline-none whitespace-nowrap"
            to="/tentang"
            onClick={(event) => {
              event.preventDefault();
              triggerCurtain("/tentang", { color: "#050705" });
            }}
          >
            Tentang
          </Link>
        </div>

      </nav>
    </header>
  );
}