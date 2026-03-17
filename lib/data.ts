export type CardData = {
  id: string;
  hook: string;
  content: string;
  type: 'theory' | 'joke' | 'trivia';
  category: string;
  noteId?: string;
  noteTitle?: string;
};

export const MOCK_CARDS: CardData[] = [
  {
    id: '1',
    hook: '90% keputusan lu hari ini bukan lu yang buat.',
    content: 'Illusion of Free Will. Otak lu udah mutusin 7 detik sebelum lu sadar. Lu cuma penonton di kepala lu sendiri.',
    type: 'theory',
    category: 'psikologi'
  },
  {
    id: '2',
    hook: 'Kenapa lu gampang percaya zodiak?',
    content: 'Barnum Effect. Otak lu nyari pola di pernyataan ambigu biar ngerasa spesial. Padahal itu template buat jutaan orang.',
    type: 'theory',
    category: 'bias'
  },
  {
    id: '3',
    hook: 'Satu-satunya alasan lu masih scroll...',
    content: 'Dopamine loop. Sistem ini di-desain persis kayak mesin slot kasino. Selamat, lu resmi jadi tikus lab.',
    type: 'joke',
    category: 'meta'
  },
  {
    id: '4',
    hook: 'Orang pintar lebih gampang ditipu.',
    content: 'Blind Spot Bias. Mereka terlalu yakin sama rasionalitas mereka sendiri, sampai lupa ngecek blind spot kognitif.',
    type: 'theory',
    category: 'bias'
  },
  {
    id: '5',
    hook: 'Fakta receh: Bebek bisa tidur dengan satu mata terbuka.',
    content: 'Unihemispheric slow-wave sleep. Setengah otak tidur, setengah lagi jaga-jaga dari predator. Kayak lu pas dengerin dosen.',
    type: 'trivia',
    category: 'biologi'
  },
  {
    id: '6',
    hook: 'Lu ngerasa ngerti setelah baca ini?',
    content: 'Illusion of Explanatory Depth. Lu ngerasa paham, tapi coba jelasin ulang ke orang lain tanpa baca teks ini. Pasti gagap.',
    type: 'theory',
    category: 'kognitif'
  },
  {
    id: '7',
    hook: 'Kenapa lu benci kehilangan Rp 100rb dibanding seneng dapet Rp 100rb?',
    content: 'Loss Aversion. Otak lu di-program buat lebih takut ancaman daripada ngejar reward. Sisa insting purba.',
    type: 'theory',
    category: 'ekonomi'
  }
];
