import { Link } from 'react-router-dom';
import { HiBookOpen, HiMusicNote, HiFilm, HiExternalLink, HiStar, HiClock, HiGlobe, HiUser, HiDownload } from 'react-icons/hi';
import { FaQuran, FaTelegramPlane, FaFacebook, FaTwitter, FaWhatsapp, FaGithub } from 'react-icons/fa';

const latestItems = [
  { type: 'video', title: 'Akkaataa Wuduu\'aa', date: '18/4/2026', url: 'https://islamhouse.com/or/videos/2844537/' },
  { type: 'book', title: 'Ergamaa Islaamaa Muhammad Rabbii Nagayaa fi Rahmata isa irratti haa buusu.', date: '6/4/2026', url: 'https://islamhouse.com/or/books/2844891/' },
  { type: 'book', title: 'Ani musliima', date: '6/4/2026', url: 'https://islamhouse.com/or/books/2844883/' },
  { type: 'book', title: 'Akkaataa Salaata Nabiyyii - Rabbiin rahmataa fi nageenya isaan irratti haa buusu', author: 'Abdul aziiz bin abdillah bin baaz', date: '26/10/2025', url: 'https://islamhouse.com/or/books/2841360/' },
  { type: 'video', title: 'Shirkii; Akaakuulee fi Badiinsa Isaa', date: '15/10/2025', url: 'https://islamhouse.com/or/videos/2842754/' },
  { type: 'video', title: 'Muhammad S.A.W Ergamaa tayuu', date: '15/10/2025', url: 'https://islamhouse.com/or/videos/2842753/' },
  { type: 'video', title: 'Jecha Laa ilaaha illaAllaah fi Ulaagaalee isii', date: '14/10/2025', url: 'https://islamhouse.com/or/videos/2842750/' },
  { type: 'video', title: 'Islaamaa fi Baruuduma isaa', date: '14/10/2025', url: 'https://islamhouse.com/or/videos/2842749/' },
];

const books = [
  { title: 'Ergamaa Islaamaa Muhammad Rabbii Nagayaa fi Rahmata isa irratti haa buusu.', date: '6/4/2026', url: 'https://islamhouse.com/or/books/2844891/' },
  { title: 'Ani musliima', date: '6/4/2026', url: 'https://islamhouse.com/or/books/2844883/' },
  { title: 'Akkaataa Salaata Nabiyyii - Rabbiin rahmataa fi nageenya isaan irratti haa buusu', author: 'Abdul aziiz bin abdillah bin baaz', date: '26/10/2025', url: 'https://islamhouse.com/or/books/2841360/' },
  { title: 'Kun kitaaba murtii falfalaafi Raagaa keessatti kaayame.', author: 'Abdul aziiz bin abdillah bin baaz', date: '9/10/2023', url: 'https://islamhouse.com/or/books/2838230/' },
  { title: 'Gabaabfamaa bu\'a qabeessa Muslima haaraaf', date: '4/8/2023', url: 'https://islamhouse.com/or/books/2837236/' },
  { title: 'HADIISA AFURTAMMAN NAWAAWWII', author: 'Abuu zakariyyaa annawaawii', date: '7/1/2020', url: 'https://islamhouse.com/or/books/2828928/' },
  { title: 'Hisnul muslim', date: '23/2/2017', url: 'https://islamhouse.com/or/books/554770/' },
  { title: 'Aqiidaa ahlussunnaa wal jamaa\'ah', author: 'Ibnu Useymiin', date: '10/10/2016', url: 'https://islamhouse.com/or/books/544564/' },
];

const audios = [
  { title: 'Barnoota adda addaa', author: 'Ahmad yaasiin yuusuf', date: '20/4/2014', url: 'https://islamhouse.com/or/audios/529771/' },
  { title: 'Hiikkaa garii suuraalee gaggabaabaa qur\'aanaa irraa', author: 'Muhammad waadoo', date: '3/9/2013', url: 'https://islamhouse.com/or/audios/488360/' },
  { title: 'Kitaaba towhiidaa (tokkummaa Rabbii)', author: 'Muhammad waadoo', date: '1/9/2013', url: 'https://islamhouse.com/or/audios/488357/' },
  { title: 'Aqiidaa waasixiyyaa', author: 'Muhammad waadoo', date: '1/9/2013', url: 'https://islamhouse.com/or/audios/488355/' },
  { title: 'Hundeelee sadeen', author: 'Muhammad waadoo', date: '1/9/2013', url: 'https://islamhouse.com/or/audios/488353/' },
  { title: 'Barnoota xahaaraa (Qulqullinaa)', author: 'Jamaaal Muhammad ahmad', date: '25/7/2013', url: 'https://islamhouse.com/or/audios/477043/' },
  { title: 'Aqiidaa sirroytuu', author: 'Jamaaal Muhammad ahmad', date: '25/7/2013', url: 'https://islamhouse.com/or/audios/477042/' },
  { title: 'Barnoota salaataa', author: 'Jamaaal Muhammad ahmad', date: '25/7/2013', url: 'https://islamhouse.com/or/audios/477041/' },
];

const videos = [
  { title: 'Akkaataa Wuduu\'aa', date: '18/4/2026', thumbnail: '2844537.jpg', url: 'https://islamhouse.com/or/videos/2844537/' },
  { title: 'Shirkii; Akaakuulee fi Badiinsa Isaa', date: '15/10/2025', thumbnail: '2842754.jpg', url: 'https://islamhouse.com/or/videos/2842754/' },
  { title: 'Muhammad S.A.W Ergamaa tayuu', date: '15/10/2025', thumbnail: '2842753.jpg', url: 'https://islamhouse.com/or/videos/2842753/' },
  { title: 'Jecha Laa ilaaha illaAllaah fi Ulaagaalee isii', date: '14/10/2025', thumbnail: '2842750.jpg', url: 'https://islamhouse.com/or/videos/2842750/' },
  { title: 'Islaamaa fi Baruuduma isaa', date: '14/10/2025', thumbnail: '2842749.jpg', url: 'https://islamhouse.com/or/videos/2842749/' },
  { title: 'Waan haraam ta namni laaffise - Qarxaasaa fii asmaa', author: 'Jamaaal Muhammad ahmad', date: '19/4/2016', thumbnail: '2802238.jpg', url: 'https://islamhouse.com/or/videos/2802238/' },
  { title: 'Waan haraam ta namni laaffise - Raaga godhuu', author: 'Jamaaal Muhammad ahmad', date: '19/4/2016', thumbnail: '2802236.jpg', url: 'https://islamhouse.com/or/videos/2802236/' },
  { title: 'Waan haraam ta namni laaffise - Rabbi malee waan birootiif qaluu', author: 'Jamaaal Muhammad ahmad', date: '19/4/2016', thumbnail: '2802234.jpg', url: 'https://islamhouse.com/or/videos/2802234/' },
  { title: 'Waan haraam ta namni laaffise - Rabbitti qindeessuu', author: 'Jamaaal Muhammad ahmad', date: '19/4/2016', thumbnail: '2802232.jpg', url: 'https://islamhouse.com/or/videos/2802232/' },
  { title: 'Waan haraam ta namni laaffise - Urjiin nifayyaddii yaaduu', author: 'Jamaaal Muhammad ahmad', date: '19/4/2016', thumbnail: '2802230.jpg', url: 'https://islamhouse.com/or/videos/2802230/' },
  { title: 'Waan haraam ta namni laaffise - Waan Rabbi malee jiruun kakachuu', author: 'Jamaaal Muhammad ahmad', date: '18/4/2016', thumbnail: '2802095.jpg', url: 'https://islamhouse.com/or/videos/2802095/' },
  { title: 'Waan haraam ta namni laaffise - Rakkinaan maletti kadhachuu', author: 'Jamaaal Muhammad ahmad', date: '28/3/2016', thumbnail: '2799609.jpg', url: 'https://islamhouse.com/or/videos/2799609/' },
];

const typeIcon: Record<string, React.ReactNode> = {
  book: <HiBookOpen className="w-5 h-5" />,
  video: <HiFilm className="w-5 h-5" />,
  audio: <HiMusicNote className="w-5 h-5" />,
};

const typeLabel: Record<string, string> = {
  video: 'vidiyoo',
  book: 'kitaaba',
  audio: 'sagalee',
};

export default function IslamHouse() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl">
              <FaQuran className="w-10 h-10 md:w-14 md:h-14 text-emerald-300" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold mb-2">IslamHouse.com</h1>
              <p className="text-emerald-200/80 text-lg md:text-xl">afaan oromoo &mdash; fuula hangafaa</p>
              <p className="text-emerald-300/60 text-sm mt-2 max-w-xl">
                Qabeenya Islaamichaa &mdash; kitaabota, sagalee, fi vidiyoolee afaan Oromoo
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-8 justify-center md:justify-start">
            <a href="https://islamhouse.com/or" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold transition-all backdrop-blur-sm">
              <HiGlobe className="w-4 h-4" /> Afaanoowwan hunda
            </a>
            <a href="https://islamhouse.com/or/books/or/1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold transition-all backdrop-blur-sm">
              <HiBookOpen className="w-4 h-4" /> Kitaabban
            </a>
            <a href="https://islamhouse.com/or/audios/or/1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold transition-all backdrop-blur-sm">
              <HiMusicNote className="w-4 h-4" /> Sagaloota
            </a>
            <a href="https://islamhouse.com/or/videos/or/1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold transition-all backdrop-blur-sm">
              <HiFilm className="w-4 h-4" /> Vidiyoo
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <HiStar className="w-5 h-5 text-amber-500" />
          <HiStar className="w-5 h-5 text-amber-500" />
          <HiStar className="w-5 h-5 text-amber-500" />
          <HiStar className="w-5 h-5 text-amber-500" />
          <HiStar className="w-5 h-5 text-amber-500" />
          <span className="text-sm text-gray-500 ml-2">Featured Content</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-10">
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <HiClock className="w-5 h-5 text-primary-600" />
                  Kan boodarra eda'ame.
                </h2>
                <a href="https://islamhouse.com/or/showall/or/1/?sort=date" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  Dabalata <HiExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="space-y-1">
                {latestItems.map((item, i) => (
                  <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${item.type === 'book' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : item.type === 'video' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                      {typeIcon[item.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">{item.title}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="capitalize">{typeLabel[item.type]}</span>
                        {'author' in item && item.author && <span>{item.author}</span>}
                        <span>{item.date}</span>
                      </div>
                    </div>
                    <HiExternalLink className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 transition-colors shrink-0 mt-1" />
                  </a>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <HiBookOpen className="w-5 h-5 text-primary-600" />
                  Kitaabban
                  <span className="text-xs font-normal text-gray-400">afaan oromoo</span>
                </h2>
                <a href="https://islamhouse.com/or/books/or/1" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  Dabalata <HiExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {books.map((book, i) => (
                  <a key={i} href={book.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-gradient-to-r hover:from-primary-50/50 dark:hover:from-primary-900/10 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 shrink-0">
                      <HiBookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">{book.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{book.author ? `${book.author} · ` : ''}{book.date}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <HiMusicNote className="w-5 h-5 text-amber-600" />
                  Sagaloota
                  <span className="text-xs font-normal text-gray-400">afaan oromoo</span>
                </h2>
                <a href="https://islamhouse.com/or/audios/or/1" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  Dabalata <HiExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {audios.map((audio, i) => (
                  <a key={i} href={audio.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800 hover:bg-gradient-to-r hover:from-amber-50/50 dark:hover:from-amber-900/10 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
                      <HiMusicNote className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">{audio.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{audio.author} · {audio.date}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <HiFilm className="w-5 h-5 text-purple-600" />
                  Vidiyoo
                  <span className="text-xs font-normal text-gray-400">afaan oromoo</span>
                </h2>
                <a href="https://islamhouse.com/or/videos/or/1" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  Dabalata <HiExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {videos.map((video, i) => (
                  <a key={i} href={video.url} target="_blank" rel="noopener noreferrer" className="group rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-lg transition-all">
                    <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 flex items-center justify-center relative">
                      <HiFilm className="w-8 h-8 text-purple-400/60" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-100 scale-75">
                          <svg className="w-4 h-4 text-purple-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 leading-relaxed">{video.title}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{video.date}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1 space-y-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-950/50">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <HiExternalLink className="w-4 h-4 text-primary-600" />
                  Liinkii barbaachisaa.
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <a href="https://quranenc.com" target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 transition-all group">
                  <div className="flex items-center gap-3">
                    <FaQuran className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold group-hover:text-primary-600 transition-colors">QuranEnc.com</p>
                      <p className="text-[10px] text-gray-500">Qur'aana marsarittii</p>
                    </div>
                  </div>
                </a>
                <a href="https://hadeethenc.com" target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 text-xs font-bold">ح</div>
                    <div>
                      <p className="text-xs font-semibold group-hover:text-primary-600 transition-colors">HadeethEnc.com</p>
                      <p className="text-[10px] text-gray-500">Hadiisa marsarittii</p>
                    </div>
                  </div>
                </a>
                <a href="https://islamhouse.com/read/or" target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 transition-all group">
                  <div className="flex items-center gap-3">
                    <HiBookOpen className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-xs font-semibold group-hover:text-primary-600 transition-colors">Dubbisaa IslamHouse</p>
                      <p className="text-[10px] text-gray-500">Kitaabota online dubbisuu</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <HiGlobe className="w-4 h-4 text-primary-600" />
                  Nu hordofi
                </h3>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  <a href="https://r.islamhouse.com/ih/or/fb" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"><FaFacebook className="w-4 h-4" /></a>
                  <a href="https://r.islamhouse.com/ih/or/x" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"><FaTwitter className="w-4 h-4" /></a>
                  <a href="https://r.islamhouse.com/ih/or/wa" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all"><FaWhatsapp className="w-4 h-4" /></a>
                  <a href="https://r.islamhouse.com/ih/or/t" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all"><FaTelegramPlane className="w-4 h-4" /></a>
                  <a href="https://r.islamhouse.com/ih/or/g" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"><FaGithub className="w-4 h-4" /></a>
                </div>
                <a href="https://islamhouse.com/or/subscribe" target="_blank" rel="noopener noreferrer" className="mt-3 block w-full text-center px-3 py-2 rounded-lg text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all">
                  Email tti maxxanfama
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <HiDownload className="w-4 h-4 text-primary-600" />
                  App kasaaluu
                </h3>
              </div>
              <div className="p-4 space-y-2">
                <a href="https://play.google.com/store/apps/details?id=com.islamhouse" target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Android</a>
                <a href="https://apps.apple.com/app/id1108360407" target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">iOS</a>
                <a href="https://islamhouse.com/get-app/windows.php" target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Windows</a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Liinkii barbaachisaa.</h4>
              <div className="space-y-2">
                <a href="https://islamhouse.com/read/or" target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Dubbisaa IslamHouse</a>
                <a href="https://kids.islamenc.com" target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">What Muslim Children Must Know</a>
                <a href="https://saadi.islamenc.com" target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Tafsir Saadi</a>
                <a href="https://riyadh.islamenc.com" target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Riyadh Al-Salheen</a>
                <a href="https://islamhouse.com/or/tawasal" target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Nu qunnami</a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Gosa qabeenyaa</h4>
              <div className="space-y-2">
                <a href="https://islamhouse.com/or/showall/or/1" target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Etema hunda.</a>
                <a href="https://islamhouse.com/or/books/or/1" target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Kitaabban</a>
                <a href="https://islamhouse.com/or/articles/or/1" target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Jechoota</a>
                <a href="https://islamhouse.com/or/videos/or/1" target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Vidiyoo</a>
                <a href="https://islamhouse.com/or/audios/or/1" target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Sagaloota</a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Dabalata</h4>
              <div className="space-y-2">
                <a href="https://islamhouse.com/or/authors/showall/countdesc/or/1" target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Namoota bekkamtoota.</a>
                <a href="https://islamhouse.com/or/sources/showall/countdesc/or/1" target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">Wabii</a>
                <a href="https://documenter.getpostman.com/view/7929737/TzkyMfPc" target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">API</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-500">&copy; weebsayita islamhouse.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
