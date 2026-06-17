type Responder = (msg: string) => string;

interface FallbackGroup {
  patterns: RegExp[];
  responses: Responder[];
}

const FALLBACKS: Record<string, FallbackGroup> = {
  greetings: {
    patterns: [/^(hi|hello|hey|salam|assalam|as-salam|peace|marhaba)/i],
    responses: [
      () => "Wa alaykum assalam wa rahmatullahi wa barakatuh! 👋\n\nI'm the Iman Chercher AI Scholar, currently in offline mode. I can still answer many questions about our platform and Islamic studies. What would you like help with?",
      () => "Hello! 🌙 Welcome to Sheikh Mohammed Zabuur Iman Chercher College. The AI Scholar is operating in offline mode right now, but I'm still here to guide you. Feel free to ask about lessons, teachers, or where to begin your Islamic learning journey.",
    ],
  },
  beginner: {
    patterns: [/beginner|start|new muslim|where (do|should|can) i|how (do|can) i (start|begin|learn)/i],
    responses: [
      () => "**Starting your Islamic learning journey?** Alhamdulillah! Here's a recommended path:\n\n1. **Aqeedah (Creed)** — Start with the fundamentals of faith. Look for our Aqeedah category.\n2. **Tajweed & Quran** — Learn to recite the Quran properly.\n3. **Fiqh (Jurisprudence)** — Understand daily worship.\n4. **Hadith & Seerah** — Study the Prophet's ﷺ life and teachings.\n5. **Tafsir** — Deepen your understanding of the Quran.\n\n💡 Check our **Beginner** section and **Level 1** courses for a structured start.",
      () => "**Welcome to Islamic learning!** 🤲\n\nI recommend starting with:\n- **Level 1** courses — designed for absolute beginners\n- **Beginner-friendly categories** like Basic Aqeedah and Learn Salah\n- Short lessons (5-10 minutes) to build consistency\n\nOur platform has a **Beginner** page with filtered content for new learners.",
    ],
  },
  tafsir: {
    patterns: [/tafsir|tafseer|quran (explanation|interpretation|meaning)|explain (aya|verse|surah)/i],
    responses: [
      () => "**Tafsir lessons** are available on Sheikh Mohammed Zabuur's Platform! 📖\n\nTafsir is the explanation and interpretation of the Quran. We offer lessons covering various surahs and volumes.\n\n🔍 **To find Tafsir lessons:**\n- Go to **Categories** and select **Tafsir**\n- Browse lessons by teacher or book\n- Listen to audio explanations at your own pace",
    ],
  },
  aqeedah: {
    patterns: [/aqeedah|aqida|creed|belief|tawheed|tawhid|monotheism/i],
    responses: [
      () => "**Aqeedah (Islamic Creed)** is the foundation of our faith. 📿\n\nOn our platform, you'll find Aqeedah lessons covering:\n- The six pillars of faith\n- Tawheed (Oneness of Allah)\n- Correct beliefs about Allah's names and attributes\n\n**Recommended teachers** for Aqeedah:\n➤ Browse our **Teachers** page and filter by Aqeedah",
    ],
  },
  hadith: {
    patterns: [/hadith|hadeeth|sunnah|prophet (said|tradition|narration)/i],
    responses: [
      () => "**Hadith lessons** are a key part of our curriculum! 📚\n\nThe study of Hadith helps us understand the Sunnah of the Prophet ﷺ. We offer:\n- Hadith collections\n- Explanation of authentic hadith\n- Mustalah al-Hadith — the science of hadith authentication\n\n🔍 Find them under **Categories → Hadith**",
    ],
  },
  fiqh: {
    patterns: [/fiqh|jurisprudence|ruling|hukm|halal|haram|prayer|salah|fasting|zakat|hajj|wudu|ghusl/i],
    responses: [
      () => "**Fiqh (Islamic Jurisprudence)** lessons are available! ⚖️\n\nTopics covered:\n- **Taharah** (Purification)\n- **Salah** (Prayer)\n- **Zakat** (Charity)\n- **Sawm** (Fasting)\n- **Hajj & Umrah**\n\nOur lessons follow the Quran and authentic Sunnah.",
    ],
  },
  seerah: {
    patterns: [/seerah|seera|prophet.*life|life.*prophet|biography.*prophet|muhammad.*story|sira/i],
    responses: [
      () => "**Seerah (Prophet's Biography)** is one of the most beloved subjects! 🕋\n\nStudying the life of Prophet Muhammad ﷺ builds love for him in your heart and teaches practical lessons from his example.\n\nAllah says: *\"Indeed, in the Messenger of Allah you have an excellent example.\"* (Quran 33:21)",
    ],
  },
  tajweed: {
    patterns: [/tajweed|tajwid|quran.*recit|recitation|qiraat|makharij|tarteel/i],
    responses: [
      () => "**Tajweed lessons** help you recite the Quran beautifully! 🎙️\n\nWe offer:\n- **Makharij** — Correct articulation points\n- **Sifaat** — Characteristics of letters\n- Rules of Noon Sakinah & Meem Sakinah\n- **Madd** (Lengthening) rules\n\nAllah says: *\"And recite the Quran with measured recitation.\"* (Quran 73:4)",
    ],
  },
  teacher: {
    patterns: [/teacher|scholar|sheikh|ustadh|ustadha|professor|who teaches|recommend.*teacher/i],
    responses: [
      () => "**Our teachers** are qualified scholars dedicated to authentic Islamic education. 📚\n\nBrowse all teachers on the **Teachers page** where you'll find:\n- Complete biographies\n- Specializations (Aqeedah, Fiqh, Tafsir, etc.)\n- Lesson counts and popular series\n- Social media and Telegram links",
    ],
  },
  book: {
    patterns: [/book|kitab|pdf|reading|textbook|resource/i],
    responses: [
      () => "**Islamic books** are available on our platform! 📖\n\nWe offer PDF books covering:\n- Aqeedah, Fiqh, Tafsir, Hadith, Arabic language\n\nEach book includes a description, author info, and direct PDF download.\n\n🔍 Visit **Categories → Books** or search for specific titles!",
    ],
  },
  level: {
    patterns: [/level|stage|grade|course|curriculum|structured|learning path/i],
    responses: [
      () => "**Our learning levels** provide a structured path! 📊\n\n- **Level 1** — Foundations: Basic Aqeedah, Salah, Quran reading\n- **Level 2** — Building: Deeper Aqeedah, Fiqh essentials, Hadith\n- **Level 3** — Advanced: Tafsir, advanced Fiqh, Arabic grammar\n- **Level 4** — Specialization: In-depth study\n\nEach level includes lessons, quizzes, and progress tracking.",
    ],
  },
  progress: {
    patterns: [/progress|track|dashboard|my learning|continue|bookmark|saved|history/i],
    responses: [
      () => "**Track your learning journey** from your Dashboard! 📈\n\nThe dashboard shows:\n- Lessons in progress\n- Completed lessons\n- Bookmarks\n- Recent activity\n- Overall learning stats\n\nAuto-saves your position in audio lessons and recommends what's next!",
    ],
  },
  telegram: {
    patterns: [/telegram|community|channel|group|social|connect/i],
    responses: [
      () => "**Join our Telegram community!** 📱\n\nStay connected with daily reminders, new lesson announcements, live Q&A, and community discussions.\n\n🔍 Visit the **Telegram page** on our platform to find all official channels.",
    ],
  },
  daily: {
    patterns: [/daily|reminder|routine|plan|schedule|study plan|learning plan/i],
    responses: [
      () => "**Daily Islamic learning plan** 📅\n\n🌅 **Morning (15 min):** Quran reading + Morning Adhkar\n🌤️ **Afternoon (20 min):** Listen to one lesson\n🌆 **Evening (10 min):** Review + Evening Adhkar\n\n💡 **Consistency over intensity!** The Prophet ﷺ said: *\"The most beloved deeds to Allah are those done consistently, even if small.\"*",
    ],
  },
  recommendation: {
    patterns: [/recommend|suggest|what should|best|popular|favorite|top/i],
    responses: [
      () => "**Here are my top recommendations!** ✨\n\n📌 **For Beginners:** Level 1 courses\n📌 **For Tafsir:** Comprehensive Tafsir series\n📌 **For Hadith:** Riyadh us-Saliheen, 40 Hadith of Nawawi\n📌 **For Arabic:** Nahw lessons from beginner to advanced\n📌 **For daily learning:** Set a 15-minute daily goal!",
    ],
  },
  help: {
    patterns: [/help|support|how.*(use|find|search)|navigation|platform/i],
    responses: [
      () => "**I'm here to help you navigate!** 🧭\n\n🔍 **Search** — Use the search bar or Ctrl+K\n📂 **Categories** — Browse by subject\n👨‍🏫 **Teachers** — Explore scholar profiles\n📊 **Dashboard** — Track your progress\n\nWhat would you like help with specifically?",
    ],
  },
  about: {
    patterns: [/about|what is|sheikh.*mohammed.*zabuur|platform|this (site|website|app)/i],
    responses: [
      () => "**Sheikh Mohammed Zabuur Iman Chercher College** is an Islamic online learning platform. 📚\n\n**What we offer:**\n- Audio lessons from qualified teachers\n- All Islamic sciences\n- Structured levels with quizzes\n- PDF books and resources\n- Progress tracking\n- 4 languages (EN, AR, AM, OM)\n\n*\"Seeking knowledge is an obligation upon every Muslim.\"*",
    ],
  },
  prayer: {
    patterns: [/prayer|salah|namaz|pray|times|prayer times/i],
    responses: [
      () => "**Salah (Prayer)** is the foundation of our faith. 🕌\n\nOur platform has:\n- **Learn Salah** guide for beginners\n- **Prayer Times Widget** with daily times\n- **Fiqh of Salah** detailed lessons\n\n💡 Use our Prayer Times feature on the website!",
    ],
  },
};

function findBestResponse(message: string): string | null {
  const msg = message.toLowerCase().trim();
  for (const [, group] of Object.entries(FALLBACKS)) {
    for (const pattern of group.patterns) {
      if (pattern.test(msg)) {
        const idx = Math.floor(Math.random() * group.responses.length);
        return group.responses[idx](msg);
      }
    }
  }
  return null;
}

const LANGUAGE_GENERICS: Record<string, string> = {
  ar: "شكراً لسؤالك! 😊 أنا حالياً في وضع عدم الاتصال، لكن لا يزال بإمكاني مساعدتك في:\n\n📌 العثور على الدروس والفئات\n📌 معلومات عن المدرسين\n📌 إرشادات المبتدئين ومسارات التعلم\n📌 التنقل في المنصة\n📌 توصيات الكتب\n\nالرجاء إعادة صياغة سؤالك أو السؤال عن موضوع محدد كالعقيدة والتفسير والحديث والفقه.",
  am: "ለጥያቄዎ እናመሰግናለን! 😊 በአሁኑ ጊዜ ከመስመር ውጪ ሁነታ ላይ ነኝ፣ ግን አሁንም በሚከተሉት ሊረዳዎ እችላለሁ:\n\n📌 ትምህርቶችን እና ምድቦችን መፈለግ\n📌 ስለ አስተማሪዎች መረጃ\n📌 ለጀማሪዎች መመሪያ\n📌 የመድረክ ዳሰሳ\n\nእባክዎ እንደ አቅዳ፣ ተፍሲር፣ ሐዲስ፣ ፊቅህ ባሉ ርዕሶች ላይ ይጠይቁ።",
  om: "Galatoomi gaaffii keessiif! 😊 Amma haala offline keessan jira, garuu amma iyyuu waan armaan gadii keessan isin gargaaruu danda'a:\n\n📌 Barumsa fi ramaddii argachuu\n📌 Oduu waa'ee barsiistotaa\n📌 Qajeelfama jalqabdotaa\n📌 Naviikeeshinii platfoormaa\n\nMee waa'ee Aqeedah, Tafsir, Hadith, Fiqh, ykn Afaan Arabaa gaafadhaa!",
};

function generateGenericFallback(message: string, language: string): string {
  if (language !== 'en') {
    return LANGUAGE_GENERICS[language] || LANGUAGE_GENERICS.en;
  }

  const msg = message.toLowerCase();

  if (msg.includes('how') || msg.includes('what') || msg.includes('where')) {
    return "That's a great question! Unfortunately, I'm currently in offline mode and don't have the specific information to answer it fully. Here's what I can suggest:\n\n1. **Browse our categories** for related lessons\n2. **Use the search bar** (Ctrl+K) to find specific topics\n3. **Check the Teachers page** to find scholars specializing in this area\n4. **Ask again later** when I'm back online for a detailed answer\n\nJazakallah khair for your understanding!";
  }

  return "Thank you for your question! I'm currently operating in offline mode, but I can still help with:\n\n📌 Finding lessons and categories\n📌 Information about teachers\n📌 Beginner guidance and learning paths\n📌 Navigation and platform features\n📌 Book recommendations\n\nCould you please rephrase your question or ask about a specific topic like Aqeedah, Tafsir, Hadith, Fiqh, or Arabic? I'll do my best to assist you! 🤲";
}

export function getOfflineResponse(message: string, language: string): string {
  const safeLang = ['en', 'ar', 'am', 'om'].includes(language) ? language : 'en';

  if (safeLang === 'ar' && /[\u0600-\u06FF]/.test(message)) {
    return LANGUAGE_GENERICS.ar;
  }
  if (safeLang === 'am' && /[\u1200-\u137F]/.test(message)) {
    return LANGUAGE_GENERICS.am;
  }
  if (safeLang === 'om' && /[\u1200-\u137F]/.test(message)) {
    return LANGUAGE_GENERICS.om;
  }

  const response = findBestResponse(message);
  if (response) return response;

  return generateGenericFallback(message, safeLang);
}
