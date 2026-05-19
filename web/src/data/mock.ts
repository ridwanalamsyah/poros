import type { Article, Author, Category, Edition, Note, Product, Settings, SanityImage } from "../types";

const img = (url: string, alt = ""): SanityImage =>
  ({
    _type: "image",
    alt,
    _placeholderUrl: url,
    asset: { _ref: url, _type: "reference", metadata: { lqip: "" } },
  }) as unknown as SanityImage;

export const mockCategories: Category[] = [
  { _id: "cat-labor", title: "LABOR", slug: "labor", description: "Suara dari ruang kerja Bandung dan sekitarnya — buruh, pekerja platform, hingga organisasi serikat.", sortOrder: 10 },
  { _id: "cat-society", title: "SOCIETY", slug: "society", description: "Kondisi sosial Bandung dan kota-kota Jawa Barat — kebijakan, ruang publik, marjinalisasi.", sortOrder: 20 },
  { _id: "cat-culture", title: "CULTURE", slug: "culture", description: "Esai, kritik, dan reportase soal musik, film, sastra, dan ekspresi populer dari Bandung.", sortOrder: 30 },
];

export const mockAuthors: Author[] = [
  { _id: "auth-tirta", name: "Tirta Anggara", slug: "tirta-anggara", bio: "Jurnalis lepas berbasis Bandung. Menulis soal serikat pekerja dan ekonomi platform.", twitter: "tirtaanggara", image: img("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400") },
  { _id: "auth-rara", name: "Rara Sugiarti", slug: "rara-sugiarti", bio: "Editor POROS. Sebelumnya menulis untuk Magdalene dan Project Multatuli.", twitter: "rarasugiarti", image: img("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400") },
  { _id: "auth-bagas", name: "Bagas Prasetyo", slug: "bagas-prasetyo", bio: "Fotografer dan penulis. Tinggal di Antapani, Bandung Timur.", twitter: "bagasprasetyo", image: img("https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400") },
  { _id: "auth-mira", name: "Mira Wulansari", slug: "mira-wulansari", bio: "Mahasiswa antropologi Unpad yang menulis soal pasar dan ruang kota.", image: img("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400") },
];

export const mockEditions: Edition[] = [
  { _id: "ed-001", title: "Edisi 001 — Kota yang Berhenti Sopan", slug: "001-kota-yang-berhenti-sopan", issueNumber: "001", description: "Edisi perdana POROS. Tentang Bandung yang sedang berdamai dengan dirinya sendiri.", publishedAt: "2026-03-01" },
  { _id: "ed-002", title: "Edisi 002 — Para Pekerja Tanpa Kantor", slug: "002-pekerja-tanpa-kantor", issueNumber: "002", description: "Pekerja gig, freelancer, kurir di seputar Bandung Raya — siapa yang melindungi mereka.", publishedAt: "2026-04-15" },
];

const longBody = (paragraphs: string[]): { _type: "block"; _key: string; style?: string; children: { _type: "span"; text: string }[] }[] =>
  paragraphs.map((p, i) => ({
    _type: "block",
    _key: `b${i}`,
    style: "normal",
    children: [{ _type: "span", text: p }],
  }));

export const mockArticles: Article[] = [
  {
    _id: "art-1",
    title: "Para Kurir yang Tidur di Trotoar Asia-Afrika",
    slug: "kurir-tidur-trotoar",
    excerpt: "Selama belasan jam mereka menunggu pesanan. POROS menelusuri ekonomi platform di jam-jam paling sepi di pusat Kota Bandung.",
    coverImage: img("https://images.unsplash.com/photo-1542013936693-884638332954?w=1600", "Kurir motor menunggu pesanan di trotoar Bandung"),
    category: mockCategories[0],
    author: mockAuthors[0],
    edition: mockEditions[1],
    tags: ["ojol", "kurir", "platform"],
    publishedAt: "2026-04-20",
    editorsPick: true,
    views: 4280,
    body: longBody([
      "Di sebuah trotoar di Jalan Asia-Afrika, Yono — bukan nama sebenarnya — menggelar jaket hujannya. Ini bukan tempat tidur ideal, tetapi sudah pukul dua dini hari dan ia belum mendapat orderan sejak pukul sebelas malam. Trotoar ini lebih dekat ke titik penjemputan ketimbang rumah kontrakannya di Antapani.",
      "Yono adalah satu dari sekitar 2,5 juta pekerja platform di Indonesia. Angka itu hanya estimasi — tidak ada data resmi karena status mereka memang sengaja dibuat ambigu. \"Mitra,\" begitu sebutannya. Bukan karyawan, bukan pula pekerja lepas yang punya kontrak. Sesuatu di antaranya.",
      "Dalam sehari yang baik, ia bisa membawa pulang Rp 150 ribu. Dalam sehari yang buruk — dan beberapa minggu ini sebagian besar terasa buruk — ia pulang dengan kurang dari Rp 50 ribu. Bensin yang habis tidak dihitung perusahaan. Begitu juga waktu tunggu, kerusakan motor, atau air mineral yang ia teguk di sela-sela orderan.",
      "Kebijakan algoritma yang berubah-ubah membuat penghasilan harian para kurir sulit diprediksi. Bulan lalu, salah satu aplikasi menurunkan tarif minimum tanpa pemberitahuan. Para kurir baru menyadari dari saling bertukar tangkapan layar di grup WhatsApp.",
      "Saya bertemu Yono melalui grup itu — sebuah komunitas tidak resmi berisi lebih dari empat ratus kurir yang saling menyimpan informasi tentang lokasi macet, kantor polisi yang ramah, dan mana saja pelanggan yang sering memberi bintang satu tanpa alasan. Grup ini juga, secara perlahan, mulai berubah menjadi sesuatu yang menyerupai serikat.",
    ]),
  },
  {
    _id: "art-2",
    title: "Kopi, Bohemia, dan Politik Sewa Ruko di Dago",
    slug: "kopi-bohemia-sewa-ruang",
    excerpt: "Bagaimana sebuah kedai kopi di Dago Atas bertahan empat tahun di tengah gentrifikasi yang terus merangsek ke utara.",
    coverImage: img("https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=1600", "Interior kedai kopi independen di Bandung"),
    category: mockCategories[2],
    author: mockAuthors[2],
    edition: mockEditions[0],
    tags: ["kopi", "gentrifikasi", "dago"],
    publishedAt: "2026-04-12",
    editorsPick: true,
    views: 3120,
    body: longBody([
      "Ketika Boen memilih ruko sempit ini empat tahun lalu, sewa setahunnya Rp 38 juta. Tahun ini, pemilik tanah menaikkannya ke Rp 78 juta. \"Untungnya saya pikirkan kontrak lima tahun dari awal,\" katanya, sambil menuang V60 di belakang counter yang terbuat dari kayu palet.",
      "Kedai-kedai kopi independen di Dago dan Cigadung — yang dulu jadi alasan banyak orang nongkrong di kawasan ini — kini terancam pola yang sama seperti yang sudah terjadi di Setiabudi dan Cihampelas: ruang yang menarik komunitas, lalu menarik investor, lalu menarik harga sewa yang tidak bisa lagi dijangkau oleh komunitas yang menciptakannya.",
      "Tetapi cerita Boen sedikit berbeda. Kedainya bertahan bukan karena ia kebetulan menabung. Ia bertahan karena ia tidak membayangkan tempat ini hanya sebagai bisnis kopi. \"Kopi cuma alasan supaya orang datang dan ngomong,\" katanya. Sejak tahun pertama, ia rutin menggelar acara: bedah buku, screening film pendek, sesekali konser akustik.",
    ]),
  },
  {
    _id: "art-3",
    title: "Trotoar yang Tidak Pernah Selesai",
    slug: "trotoar-tidak-pernah-selesai",
    excerpt: "Sebuah catatan tentang proyek-proyek pejalan kaki di kawasan Braga yang selalu kembali ke titik nol.",
    coverImage: img("https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600", "Trotoar berbatu di Bandung"),
    category: mockCategories[1],
    author: mockAuthors[1],
    edition: mockEditions[0],
    tags: ["bandung", "trotoar", "ruang-publik"],
    publishedAt: "2026-04-08",
    editorsPick: false,
    views: 2050,
    body: longBody([
      "Pada bulan April lalu, untuk ketiga kalinya dalam dua tahun, trotoar di Jalan Braga dibongkar kembali. Kali ini alasannya adalah pelebaran jalur sepeda. Dua tahun lalu alasannya pemasangan kabel optik. Dua tahun sebelumnya — sebuah upacara peletakan batu pertama yang sekarang sudah hampir terlupakan.",
      "Saya berdiri di depan ruko-ruko tua yang sedang menyaksikan ini terjadi. Pemilik warung kopi sebelah berkata pelan, \"Setiap kali dibongkar, pelanggan menghilang sebulan, kembali lagi setengah saja.\" Ia tidak marah. Ia hanya capek.",
    ]),
  },
  {
    _id: "art-4",
    title: "Buku-buku Kiri di Pasar Cikapundung",
    slug: "buku-kiri-pasar-cikapundung",
    excerpt: "Pedagang buku bekas di Pasar Cikapundung tetap menjaga koleksi yang membuat polisi pernah mengetuk pintu mereka.",
    coverImage: img("https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=1600", "Tumpukan buku bekas"),
    category: mockCategories[2],
    author: mockAuthors[3],
    edition: mockEditions[1],
    tags: ["buku", "cikapundung", "sejarah"],
    publishedAt: "2026-03-29",
    views: 1880,
    body: longBody([
      "Di lapak nomor dua belas, lemari kaca milik Pak Asmara dipenuhi sampul-sampul yang sudah lecek: Pramoedya, Multatuli, Tan Malaka. Sebagian sudah ia foto kopi sendiri ketika edisi aslinya sulit dicari.",
      "\"Sekarang nggak ada yang gerebek-gerebek,\" katanya. \"Tapi anak-anak SMP yang dulu beli komik, sekarang sudah jadi dosen, mereka yang balik ke sini ngajakin mahasiswanya.\"",
    ]),
  },
  {
    _id: "art-5",
    title: "Sopir Angkot yang Belajar Mandarin",
    slug: "sopir-angkot-mandarin",
    excerpt: "Demi mengantar pelanggan-pelanggan baru, Pak Eko meluangkan dua jam sehari untuk belajar bahasa.",
    coverImage: img("https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1600", "Angkot dan jalanan Bandung"),
    category: mockCategories[1],
    author: mockAuthors[0],
    tags: ["angkot", "informal", "bandung"],
    publishedAt: "2026-03-20",
    views: 1640,
    body: longBody([
      "Pukul tujuh pagi, Pak Eko sudah menghidupkan mesin angkotnya — sekaligus sebuah aplikasi pelajaran bahasa Mandarin di hape Android-nya.",
      "Setahun terakhir, sebagian besar pelanggannya adalah pekerja konstruksi dari Tiongkok yang tinggal di apartemen sewa dekat Tegallega. \"Kalau ngerti dua kata, mereka bayar lebih banyak,\" katanya.",
    ]),
  },
  {
    _id: "art-6",
    title: "Manifesto Editorial: Mengapa POROS",
    slug: "manifesto-editorial",
    excerpt: "Sebuah surat dari redaksi tentang mengapa kami memilih menerbitkan POROS sekarang — dari Bandung.",
    coverImage: img("https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600", "Mesin tik bekas"),
    category: mockCategories[2],
    author: mockAuthors[1],
    edition: mockEditions[0],
    tags: ["editorial", "manifesto"],
    publishedAt: "2026-03-01",
    editorsPick: true,
    views: 6200,
    body: longBody([
      "Sebuah majalah, terutama yang kecil, biasanya lahir dari ketidaksabaran. Pendiri POROS bukan pengecualian: kami muak dengan reportase yang membicarakan pekerja sebagai data, sebagai statistik, sebagai \"komponen\" — dan jarang sebagai manusia yang berpikir dan punya cara sendiri menyatakan kebenaran.",
      "POROS — yang berarti pusat, juga sumbu — dipilih karena kami ingin menggeser pusat percakapan. Selama ini suara dari Jakarta sudah cukup keras. Edisi ini mencoba mendengar yang lain, mulai dari kota yang sehari-hari kami tinggali: Bandung.",
    ]),
  },
  {
    _id: "art-7",
    title: "Anak Muda dan Politik Iklim di Tepi Cikapundung",
    slug: "anak-muda-iklim-cikapundung",
    excerpt: "Sekelompok mahasiswa membangun bank sampah komunitas di bantaran Cikapundung — bukan untuk Instagram.",
    coverImage: img("https://images.unsplash.com/photo-1530519729491-c7fe5ee23ff8?w=1600", "Sungai Cikapundung dan pemukiman bantarannya"),
    category: mockCategories[1],
    author: mockAuthors[3],
    tags: ["lingkungan", "anak-muda", "cikapundung"],
    publishedAt: "2026-02-18",
    views: 1240,
    body: longBody([
      "Setiap Sabtu pagi, di tepi bantaran Cikapundung dekat Babakan Siliwangi, sekitar dua belas anak muda berkumpul. Mereka membawa karung dan timbangan.",
      "Kelompok ini menyebut diri \"Aksara Sampah.\" Mereka membayar warga sekitar Rp 1.500 per kilogram untuk plastik PET — angka di atas pengepul resmi, yang dibiayai dari iuran anggota dan donasi kecil.",
    ]),
  },
  {
    _id: "art-8",
    title: "Pekerja Rumahan dan Patungan Mesin Jahit di Cibaduyut",
    slug: "pekerja-rumahan-jahit-cibaduyut",
    excerpt: "Para penjahit rumahan di Cibaduyut berbagi rekening untuk membayar sewa mesin jahit kolektif.",
    coverImage: img("https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1600", "Mesin jahit dan pekerja garmen"),
    category: mockCategories[0],
    author: mockAuthors[0],
    edition: mockEditions[1],
    tags: ["garmen", "koperasi", "cibaduyut"],
    publishedAt: "2026-04-30",
    views: 980,
    body: longBody([
      "Bu Ratna baru saja transfer Rp 250 ribu ke rekening kolektif kelompok jahitnya. Itu setoran sewa bulanan untuk mesin obras yang mereka beli patungan setahun lalu.",
      "\"Kalau sendiri-sendiri, nggak ada yang kuat beli mesin obras industri,\" katanya. \"Sekarang ada empat kelompok dengan sembilan mesin.\"",
    ]),
  },
  {
    _id: "art-9",
    title: "Antara Warkop dan Wifi: Tempat Kerja Baru Kelas Pekerja",
    slug: "warkop-wifi-tempat-kerja-baru",
    excerpt: "Sejumlah warung kopi di Pasar Baru Bandung berubah jadi co-working space tidak resmi untuk pedagang online.",
    coverImage: img("https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1600", "Warkop dengan pelanggan menggunakan laptop"),
    category: mockCategories[0],
    author: mockAuthors[2],
    tags: ["warkop", "pedagang", "pasar-baru"],
    publishedAt: "2026-02-02",
    views: 720,
    body: longBody([
      "Pak Hasan membuka warkopnya pukul enam pagi. Pukul tujuh, sudah ada empat pedagang online Pasar Baru yang membuka laptop, men-screenshot stok, dan mulai live di TikTok.",
      "\"Saya tidak charge wifi. Tapi mereka beli kopi tiga gelas, mi rebus, gorengan. Saya yang untung,\" katanya.",
    ]),
  },
];

export const mockNotes: Note[] = [
  { _id: "n1", body: "Sedang menyiapkan reportase tentang penutupan SDN di Antapani. Kalau ada warga yang anaknya kena dampak, DM kami.", author: mockAuthors[1], publishedAt: "2026-05-10" },
  { _id: "n2", body: "Membaca ulang Pramoedya. Setiap kali balik, selalu menemukan kalimat yang sebelumnya seperti tidak ada.", author: mockAuthors[0], publishedAt: "2026-05-08" },
  { _id: "n3", body: "Edisi 003 sudah masuk tahap editing. Tema: ruang-ruang yang menghilang di Bandung Utara.", author: mockAuthors[1], publishedAt: "2026-05-05" },
];

export const mockProducts: Product[] = [
  { _id: "p1", title: "POROS — Edisi 001", slug: "edisi-001", description: "Cetakan terbatas. 96 halaman, kertas matte 100gsm.", price: 85000, inStock: true, image: img("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800", "POROS Edisi 001") },
  { _id: "p2", title: "POROS — Edisi 002", slug: "edisi-002", description: "Edisi tema pekerja platform. 104 halaman.", price: 85000, inStock: true, image: img("https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800", "POROS Edisi 002") },
  { _id: "p3", title: "Tote Bag POROS", slug: "tote-bag", description: "Kanvas 12 oz, sablon manual di Bandung.", price: 95000, inStock: true, image: img("https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800", "POROS tote bag") },
  { _id: "p4", title: "Bundle Edisi 001 + 002", slug: "bundle-001-002", description: "Hemat Rp 25.000. Termasuk ongkir Bandung Raya.", price: 145000, inStock: true, image: img("https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=800", "POROS bundle") },
];

export const mockSettings: Settings = {
  siteTitle: "POROS",
  siteDescription: "POROS — majalah online dari Bandung. Labor · society · culture.",
  tipJarSaweria: "https://saweria.co/porosmagazine",
  tipJarTrakteer: "https://trakteer.id/porosmagazine",
  tipJarPatreon: "",
  cusdisAppId: "",
  newsletterEndpoint: "",
};
