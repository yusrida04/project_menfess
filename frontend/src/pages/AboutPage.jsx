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
    <div className="rounded-2xl bg-[#252525] p-6 border border-[#333333] shadow-xs space-y-5">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold text-[#EFEFEF]">Tentang UNIMED Menfess</h1>
        <p className="text-sm text-[#CFCFCF] leading-relaxed">
          Ruang bagi mahasiswa Universitas Negeri Medan untuk berbagi cerita, bertanya, dan menyampaikan
          aspirasi secara anonim. Kiriman dikelompokkan otomatis ke dalam kategori agar mudah ditemukan,
          dan kiriman yang berisiko disaring sebelum tayang.
        </p>
      </div>

      {/* Cara Kerja */}
      <div className="rounded-xl bg-[#2B2B2B] p-4 border border-[#3A3A3A] space-y-2.5">
        <h2 className="text-sm font-semibold text-[#EFEFEF]">Cara Kerja:</h2>
        <ol className="list-decimal list-inside text-xs sm:text-sm text-[#CFCFCF] space-y-1.5 leading-relaxed">
          {LANGKAH.map((teks) => (
            <li key={teks}>{teks}</li>
          ))}
        </ol>
      </div>

      {/* Kategori */}
      <div className="rounded-xl bg-[#2B2B2B] p-4 border border-[#3A3A3A] space-y-3">
        <h2 className="text-sm font-semibold text-[#EFEFEF]">Kategori Otomatis:</h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {KATEGORI.map((k) => (
            <div
              key={k.nama}
              className="rounded-lg bg-[#252525] p-3 border border-[#333333] space-y-0.5"
            >
              <p className="text-xs sm:text-sm font-semibold text-[#EFEFEF]">{k.nama}</p>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">{k.isi}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Moderasi dan Privasi */}
      <div className="rounded-xl bg-[#2B2B2B] p-4 border border-[#3A3A3A] space-y-2.5">
        <h2 className="text-sm font-semibold text-[#EFEFEF]">Moderasi dan Privasi:</h2>
        <ul className="list-disc list-inside text-xs sm:text-sm text-[#CFCFCF] space-y-1.5 leading-relaxed">
          {MODERASI_PRIVASI.map((teks) => (
            <li key={teks}>{teks}</li>
          ))}
        </ul>
      </div>

      {/* Aturan Komunitas */}
      <div className="rounded-xl bg-[#2B2B2B] p-4 border border-[#3A3A3A] space-y-2.5">
        <h2 className="text-sm font-semibold text-[#EFEFEF]">Aturan Komunitas:</h2>
        <ul className="list-disc list-inside text-xs sm:text-sm text-[#CFCFCF] space-y-1.5 leading-relaxed">
          {ATURAN.map((teks) => (
            <li key={teks}>{teks}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}