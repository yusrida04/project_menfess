const KATEGORI = [
  { nama: "Kampus", isi: "Tugas, nilai, dosen, fasilitas, dan layanan kampus" },
  { nama: "Asmara", isi: "Perasaan dan hubungan romantis" },
  { nama: "Sosial", isi: "Pertemanan, organisasi, terima kasih, dan ajakan kegiatan" },
  { nama: "Lainnya", isi: "Jual-beli, kehilangan, pertanyaan umum, dan candaan" },
];

const LANGKAH = [
  "Tulis menfess (maksimal 280 karakter) dan kirim secara anonim.",
  "Sistem menyensor data pribadi dan memeriksa keamanan isi kiriman.",
  "Model mengelompokkan kiriman ke salah satu kategori secara otomatis.",
  "Kiriman yang aman dan meyakinkan langsung tayang. Yang diragukan ditinjau admin lebih dulu.",
];

const MODERASI_PRIVASI = [
  "Kiriman yang mengandung SARA tidak ditayangkan.",
  "Kata kasar disensor atau ditinjau admin sebelum tayang.",
  "Kiriman dan komentar tampil anonim bagi pengguna lain. Tidak ada nama, foto, atau akun yang ditampilkan.",
  "Sistem tidak menyimpan nama atau alamat IP pengirim. Untuk mencegah vote ganda, peramban memakai pengenal acak yang disimpan dalam bentuk hash.",
  "Pengelompokan otomatis bisa keliru. Admin dapat mengoreksi kategori jika diperlukan.",
];

const ATURAN = [
  "Dilarang menyebarkan ujaran kebencian, SARA, atau fitnah.",
  "Jangan mencantumkan nama lengkap, NIM, nomor HP, atau akun media sosial orang lain tanpa izin.",
  "Sampaikan kritik tentang dosen, fasilitas, atau layanan dengan sopan dan jelas, tanpa menyerang pribadi.",
  "Tulis komentar dengan empati. Hindari komentar yang menyudutkan atau menyalahkan.",
  "Gunakan tombol Laporkan jika menemukan kiriman atau komentar yang melanggar aturan.",
];

export function AboutPage() {
  return (
    <div className="rounded-2xl border border-[#1f2a22] bg-[#0d110e] p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <span className="inline-block rounded-full bg-[#0f3d24] px-3 py-1 text-xs font-semibold text-[#22e07a]">
            Tentang UNIMED Menfess
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-[#22e07a]">
            Cerita yang tak perlu bernama.
          </h1>
          <p className="text-sm sm:text-base text-[#CFCFCF] leading-relaxed">
            Ruang anonim mahasiswa Universitas Negeri Medan untuk berbagi cerita dan aspirasi, dengan pengelompokan kategori otomatis serta penyaringan keamanan sebelum tayang.
          </p>
        </div>

        {/* Cara Kerja */}
        <div className="rounded-xl border border-[#1f2a22] bg-[#151b16] p-5 space-y-3">
          <h2 className="text-lg font-semibold text-[#FCFCFC]">Cara Kerja</h2>
          <ol className="list-decimal list-outside pl-5 text-sm sm:text-base text-[#CFCFCF] space-y-2 leading-relaxed">
            {LANGKAH.map((teks) => (
              <li key={teks}>{teks}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* Kategori */}
      <div className="rounded-xl border border-[#1f2a22] bg-[#151b16] p-5 space-y-3.5">
        <h2 className="text-lg font-semibold text-[#FCFCFC]">Kategori Otomatis</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {KATEGORI.map((k) => (
            <div
              key={k.nama}
              className="rounded-xl border border-[#1f2a22] bg-[#171f1a] hover:border-[#2f4636] p-4 space-y-1.5 transition-colors"
            >
              <p className="font-semibold text-lg text-[#22e07a]">{k.nama}</p>
              <p className="text-sm text-[#CFCFCF] leading-relaxed">{k.isi}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Moderasi dan Privasi */}
      <div className="rounded-xl border border-[#1f2a22] bg-[#151b16] p-5 space-y-3">
        <h2 className="text-lg font-semibold text-[#FCFCFC]">Moderasi dan Privasi</h2>
        <ul className="list-disc list-outside pl-5 text-sm sm:text-base text-[#CFCFCF] space-y-2 leading-relaxed">
          {MODERASI_PRIVASI.map((teks) => (
            <li key={teks}>{teks}</li>
          ))}
        </ul>
      </div>

      {/* Aturan Komunitas */}
      <div className="rounded-xl border border-[#1f2a22] bg-[#151b16] p-5 space-y-3">
        <h2 className="text-lg font-semibold text-[#FCFCFC]">Aturan Komunitas</h2>
        <ul className="list-disc list-outside pl-5 text-sm sm:text-base text-[#CFCFCF] space-y-2 leading-relaxed">
          {ATURAN.map((teks) => (
            <li key={teks}>{teks}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}