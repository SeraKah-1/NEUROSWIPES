# Terminal Kognitif

Terminal Kognitif adalah aplikasi pembelajaran berbasis AI yang dirancang untuk membantu pengguna memahami konsep-konsep kompleks dengan cepat melalui pendekatan psikologi kognitif dan desain antarmuka yang modern.

## Fitur Utama

- **AI Note Generator**: Buat catatan mendalam dari topik atau dokumen (PDF/Text) menggunakan Gemini atau Groq.
- **Cognitive Card Stack**: Ubah catatan menjadi kartu belajar interaktif dengan sistem swipe (Paham, Lupa, Ragu).
- **Mind Palace**: Visualisasikan hubungan antar konsep dalam ruang memori digital.
- **Profile Receipt**: Dapatkan analisis gaya belajar Anda dalam format struk belanja yang unik, lengkap dengan "roast" tajam tentang kebiasaan kognitif Anda.
- **Space Repetition**: Algoritma cerdas yang memunculkan kembali kartu yang Anda lupakan.

## Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/)
- **AI Models**: 
  - [Google Gemini API](https://ai.google.dev/)
  - [Groq AI](https://groq.com/)
- **Animations**: [Motion](https://motion.dev/) (Framer Motion)
- **Icons**: [Lucide React](https://lucide.dev/)

## Setup Instruksi

### Prasyarat

- Node.js 18+
- Akun Supabase
- API Key Gemini dan/atau Groq

### Instalasi

1. Clone repositori ini.
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Buat file `.env.local` dan tambahkan variabel berikut:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   GROQ_API_KEY=your_groq_api_key
   ```
4. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
