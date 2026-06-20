const fs = require('fs');
const files = ['en.ts', 'ar.ts', 'am.ts', 'om.ts'];
const path = 'c:/xampp/htdocs/sh-zabuur-official-app/frontend/src/i18n/locales/';
files.forEach(f => {
  let content = fs.readFileSync(path + f, 'utf8');
  if (f === 'en.ts') {
    content = content.replace(/\"Courses\"/g, '\"Study Series\"');
    content = content.replace(/\"Course\"/g, '\"Series\"');
    content = content.replace(/\"courses\"/g, '\"series\"');
    content = content.replace(/\"course\"/g, '\"series\"');
    content = content.replace(/\"Structured Study Series\"/g, '\"Study Series\"'); // incase of double replacement
    content = content.replace(/\"My Study Series\"/g, '\"My Series\"');
    content = content.replace(/\"Browse Study Series\"/g, '\"Browse Series\"');
    content = content.replace(/\"View Study Series\"/g, '\"View Series\"');
    content = content.replace(/\"Manage your series and students\"/g, '\"Manage series and users\"');
    content = content.replace(/\"Total Study Series\"/g, '\"Total Series\"');
    content = content.replace(/\"Series Analytics\"/g, '\"Series Analytics\"');
    content = content.replace(/\"No series created yet\"/g, '\"No series created yet\"');
    content = content.replace(/\"Create Series\"/g, '\"Create Series\"');
    content = content.replace(/\"View Series\"/g, '\"View Series\"');
    content = content.replace(/\"No series data available yet.\"/g, '\"No series data available yet.\"');
    content = content.replace(/\"Series Popularity\"/g, '\"Series Popularity\"');
    content = content.replace(/\"Lessons & Courses\"/g, '\"Study Series\"');
  } else if (f === 'ar.ts') {
    content = content.replace(/\"الدورات\"/g, '\"السلاسل\"');
    content = content.replace(/\"دورة\"/g, '\"سلسلة\"');
    content = content.replace(/\"الدورة\"/g, '\"السلسلة\"');
    content = content.replace(/\"دوراتي\"/g, '\"سلاسلي\"');
    content = content.replace(/\"تصفح السلاسل\"/g, '\"تصفح السلاسل\"');
    content = content.replace(/\"عرض السلاسل\"/g, '\"عرض السلاسل\"');
    content = content.replace(/\"إجمالي السلاسل\"/g, '\"إجمالي السلاسل\"');
    content = content.replace(/\"تحليلات السلسلة\"/g, '\"تحليلات السلسلة\"');
    content = content.replace(/\"لم يتم إنشاء سلاسل بعد\"/g, '\"لم يتم إنشاء سلاسل بعد\"');
    content = content.replace(/\"إنشاء سلسلة\"/g, '\"إنشاء سلسلة\"');
    content = content.replace(/\"عرض السلسلة\"/g, '\"عرض السلسلة\"');
    content = content.replace(/\"شعبية السلاسل\"/g, '\"شعبية السلاسل\"');
    content = content.replace(/\"دروس ودورات\"/g, '\"سلاسل علمية\"');
  } else if (f === 'am.ts') {
    content = content.replace(/\"ኮርሶች\"/g, '\"ተከታታይ ትምህርቶች\"');
    content = content.replace(/\"ኮርስ\"/g, '\"ተከታታይ\"');
    content = content.replace(/\"ኮርሶቼ\"/g, '\"ተከታታዮቼ\"');
    content = content.replace(/\"ኮርሶችን ያስሱ\"/g, '\"ተከታታዮችን ያስሱ\"');
    content = content.replace(/\"ኮርሶችን ይመልከቱ\"/g, '\"ተከታታዮችን ይመልከቱ\"');
    content = content.replace(/\"ጠቅላላ ኮርሶች\"/g, '\"ጠቅላላ ተከታታዮች\"');
    content = content.replace(/\"የኮርስ ትንታኔ\"/g, '\"የተከታታይ ትንታኔ\"');
    content = content.replace(/\"እስካሁን ምንም ኮርሶች አልተፈጠሩም\"/g, '\"እስካሁን ምንም ተከታታዮች አልተፈጠሩም\"');
    content = content.replace(/\"ኮርስ ይፍጠሩ\"/g, '\"ተከታታይ ይፍጠሩ\"');
    content = content.replace(/\"ኮርሱን ይመልከቱ\"/g, '\"ተከታታዩን ይመልከቱ\"');
    content = content.replace(/\"የኮርስ ታዋቂነት\"/g, '\"የተከታታይ ታዋቂነት\"');
    content = content.replace(/\"ትምህርቶች እና ኮርሶች\"/g, '\"ተከታታይ ትምህርቶች\"');
  } else if (f === 'om.ts') {
    content = content.replace(/\"Koorsiiwwan\"/g, '\"Tartiiba Barumsaa\"');
    content = content.replace(/\"Koorsii\"/g, '\"Tartiiba\"');
    content = content.replace(/\"Koorsiiwwan Koo\"/g, '\"Tartiiba Koo\"');
    content = content.replace(/\"Koorsiiwwan Sakatta'i\"/g, '"Tartiiba Sakatta\'i"');
    content = content.replace(/\"Koorsiiwwan Ilaali\"/g, '\"Tartiiba Ilaali\"');
    content = content.replace(/\"Koorsiiwwan Walii Galtee\"/g, '\"Tartiiba Walii Galtee\"');
    content = content.replace(/\"Xiinxala Koorsii\"/g, '\"Xiinxala Tartiibaa\"');
    content = content.replace(/\"Hanga ammaatti koorsiin hin uumamin\"/g, '\"Hanga ammaatti tartiibni hin uumamin\"');
    content = content.replace(/\"Koorsii Uumi\"/g, '\"Tartiiba Uumi\"');
    content = content.replace(/\"Koorsii Ilaali\"/g, '\"Tartiiba Ilaali\"');
    content = content.replace(/\"Beekamtoommaa Koorsii\"/g, '\"Beekamtoommaa Tartiibaa\"');
    content = content.replace(/\"Barumsaa fi Koorsiiwwan\"/g, '\"Tartiiba Barumsaa\"');
  }
  fs.writeFileSync(path + f, content);
});
console.log('Replaced Courses with Series in locales!');
