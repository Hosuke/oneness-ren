// oneness.ren · 詞條
// 紅線：每條必有出處、關係如實。relation: 'self' 本字 | 'translation' 對譯（史上真用以譯「仁」，或以「仁」譯之）| 'neighbour' 近義（相鄰而不同）
// 查證於 2026-09-26；未能核實者見 data/pending.md。

export const WORDS = [
  // ── 本字 ──────────────────────────────────────────────
  {
    id: 'ren', text: '仁', dir: 'ltr', lang: 'zh-Hant', roman: 'rén',
    langName: { zh: '漢語', en: 'Chinese' },
    gloss: { zh: '親也。从人从二——仁在兩人之間。孔子答樊遲：「愛人。」', en: 'Closeness; from “person” and “two” — it lives between two people. Confucius: “Love others.”' },
    relation: 'self', weight: 3,
    sources: [
      { title: '許慎《說文解字》卷八·人部（維基文庫）', url: 'https://zh.wikisource.org/wiki/說文解字/08', quote: '仁：親也。从人从二。' },
      { title: '《論語·顏淵》12.22（維基文庫）', url: 'https://zh.wikisource.org/wiki/論語/顏淵第十二', quote: '樊遲問仁。子曰：「愛人。」' },
    ],
  },

  // ── 對譯：漢字文化圈 ───────────────────────────────────
  {
    id: 'jin-ja', text: '仁', dir: 'ltr', lang: 'ja', roman: 'jin',
    langName: { zh: '日語', en: 'Japanese' },
    gloss: { zh: '日語讀「じん」，儒教最高德目：以體恤之心與人共生。', en: 'Read jin in Japanese: the highest Confucian virtue, living with others in care and affection.' },
    relation: 'translation', weight: 2,
    sources: [
      { title: '『デジタル大辞泉』「仁」（Weblio）', url: 'https://www.weblio.jp/content/仁', quote: '特に、儒教における最高徳目で、他人と親しみ、思いやりの心をもって共生を実現しようとする実践倫理。' },
    ],
    note: { zh: '吳音讀「にん」，如「仁王（におう）」。', en: 'Also read nin (go-on), as in 仁王 Niō.' },
  },
  {
    id: 'in-ko', text: '인', dir: 'ltr', lang: 'ko', roman: 'in',
    langName: { zh: '韓語', en: 'Korean' },
    gloss: { zh: '韓國儒學之「仁」，義為「어짊」（仁厚），儒學最根本的道德理念。', en: 'The Korean reading of 仁, meaning eojim (goodness): the most fundamental moral idea of Confucianism.' },
    relation: 'translation', weight: 2,
    sources: [
      { title: '한국민족문화대백과사전「인(仁)」', url: 'https://encykorea.aks.ac.kr/Article/E0046818', quote: '유학의 가장 근본적인 도덕 이념으로 어짊을 뜻하는 유교 용어.' },
    ],
  },
  {
    id: 'nhan-vi', text: 'nhân', dir: 'ltr', lang: 'vi', roman: 'nhân',
    langName: { zh: '越南語（漢越音）', en: 'Vietnamese (Sino-Vietnamese)' },
    gloss: { zh: '「仁」的漢越音。為人之道；愛人而不利己。', en: 'The Sino-Vietnamese reading of 仁: the way of being human; loving others without self-interest.' },
    relation: 'translation', weight: 2,
    sources: [
      { title: 'Từ điển Hán Nôm – 仁（引 Thiều Chửu《漢越字典》）', url: 'https://hvdic.thivien.net/whv/仁', quote: 'Nhân là cái đạo lí làm người, phải thế mới gọi là người. Yêu người không lợi riêng mình gọi là nhân.' },
    ],
    note: { zh: '南部亦讀 nhơn。', en: 'Southern variant reading: nhơn.' },
  },
  {
    id: 'nengren', text: '能仁', dir: 'ltr', lang: 'zh-Hant', roman: 'néngrén',
    langName: { zh: '漢語（佛典）', en: 'Chinese (Buddhist)' },
    gloss: { zh: '漢譯佛典以「能仁」意譯梵語 Śākya（釋迦），以「寂默」譯 Muni（牟尼）——「仁」被用來譯一個梵語名字。', en: 'Chinese Buddhist rendering of Sanskrit Śākya as “able in benevolence”, paired with 寂默 for Muni — 仁 used to translate an Indian name.' },
    relation: 'translation', weight: 1,
    sources: [
      { title: '宋·法雲《翻譯名義集》卷一「釋迦牟尼」（CBETA 香港鏡像）', url: 'http://cbeta.buddhism.org.hk/fymyj/1', quote: '本起經翻釋迦為能仁。本行經譯牟尼為寂默。能仁是姓，寂默是字。' },
      { title: 'Soothill & Hodous, A Dictionary of Chinese Buddhist Terms (1937), s.v. 能仁', url: 'https://mahajana.net/texts/soothill-hodous.html', quote: 'Mighty in lovingkindness, an incorrect interpretation of Śākyamuni, but probably indicating his character.' },
    ],
    note: { zh: '此為意譯的民間詞源，非梵語本義；Soothill 明言其「不確」。', en: 'A folk interpretation rather than the Sanskrit etymology, as Soothill notes.' },
  },

  // ── 對譯：西文 ─────────────────────────────────────────
  {
    id: 'benevolence', text: 'benevolence', dir: 'ltr', lang: 'en', roman: 'benevolence',
    langName: { zh: '英語', en: 'English' },
    gloss: { zh: '劉殿爵（D. C. Lau, 1979）通譯「仁」為 benevolence；理雅各偶用之（12.22）。', en: 'D. C. Lau’s standard rendering of 仁 (1979); Legge uses it only occasionally, as at 12.22.' },
    relation: 'translation', weight: 3,
    sources: [
      { title: 'D. C. Lau, The Analects (Penguin, 1979), 12.22', url: 'https://www.penguinrandomhouse.com/books/260950/the-analects-by-confucius-translated-with-an-introduction-by-d-c-lau/', quote: 'Fan Ch’ih asked about benevolence. The Master said, ‘Love your fellow men.’' },
      { title: 'James Legge, The Chinese Classics vol. 1 (1861), 12.22 (Project Gutenberg #4094)', url: 'https://www.gutenberg.org/ebooks/4094', quote: 'Fan Ch’ih asked about benevolence. The Master said, ‘It is to love all men.’' },
    ],
    note: { zh: '理雅各通常譯「仁」為 perfect virtue（如 12.1）。', en: 'Legge’s usual rendering is “perfect virtue” (e.g. 12.1).' },
  },
  {
    id: 'humaneness', text: 'humaneness', dir: 'ltr', lang: 'en', roman: 'humaneness',
    langName: { zh: '英語', en: 'English' },
    gloss: { zh: '狄百瑞、卜愛蓮編《中國傳統資料選編》（第二版，1999）譯「仁」為 humaneness。', en: 'The rendering of 仁 in de Bary & Bloom, Sources of Chinese Tradition (2nd ed., 1999).' },
    relation: 'translation', weight: 2,
    sources: [
      { title: 'Columbia · Asia for Educators, from Sources of Chinese Tradition vol. 1 (1999)', url: 'https://afe.easia.columbia.edu/ps/cup/confucius_humaneness.pdf', quote: '12:22 Fan Chi asked about humaneness. The Master said, “It is loving people.”' },
    ],
  },
  {
    id: 'humanity', text: 'humanity', dir: 'ltr', lang: 'en', roman: 'humanity',
    langName: { zh: '英語', en: 'English' },
    gloss: { zh: '陳榮捷《中國哲學文獻選編》（1963）譯「仁」為 humanity。', en: 'Wing-tsit Chan’s rendering in A Source Book in Chinese Philosophy (1963).' },
    relation: 'translation', weight: 1,
    sources: [
      { title: 'Wing-tsit Chan, A Source Book in Chinese Philosophy (1963) (Internet Archive)', url: 'https://archive.org/details/wing-tsit-chan-a-source-book-in-chinese-philosophy', quote: '12:22. Fan Ch’ih asked about humanity. Confucius said, “It is to love men.”' },
    ],
  },
  {
    id: 'co-humanity', text: 'co-humanity', dir: 'ltr', lang: 'en', roman: 'co-humanity',
    langName: { zh: '英語', en: 'English' },
    gloss: { zh: '卜弼德（Peter A. Boodberg）據字形「从人从二」所擬之譯名。', en: 'Peter A. Boodberg’s coinage, built on the graph’s “person + two”.' },
    relation: 'translation', weight: 2,
    sources: [
      { title: 'Internet Encyclopedia of Philosophy, “Confucius”', url: 'https://iep.utm.edu/confucius/', quote: 'Peter Boodberg suggested an evocative translation of ren as “co-humanity.”' },
      { title: 'P. A. Boodberg, “The Semasiology of Some Primary Confucian Concepts,” Philosophy East and West 2.4 (1953): 317–332', url: 'https://philpapers.org/rec/BOOTSO', quote: '' },
    ],
    note: { zh: '原文在付費庫，未親見其頁；歸屬據 IEP。', en: 'Original article paywalled; attribution via IEP.' },
  },
  {
    id: 'authoritative', text: 'authoritative conduct', dir: 'ltr', lang: 'en', roman: 'authoritative conduct',
    langName: { zh: '英語', en: 'English' },
    gloss: { zh: '安樂哲、羅思文《論語》哲學譯本（1998）譯「仁」為 authoritative；羅思文後改用 consummate conduct。', en: 'Ames & Rosemont’s rendering (1998); Rosemont later preferred “consummate conduct”.' },
    relation: 'translation', weight: 1,
    sources: [
      { title: 'Henry Rosemont Jr., A Reader’s Companion to the Confucian Analects', url: 'https://mccglobaleducation.org/wp-content/uploads/2015/08/rosemont-analects-companion-final.pdf', quote: '“authoritative” seemed the closest in English meaning for ren, but more recently we have come to believe “consummate conduct” more nearly captures the sense of the Chinese' },
    ],
  },
  {
    id: 'humana-charitas', text: 'humana charitas', dir: 'ltr', lang: 'la', roman: 'humana charitas',
    langName: { zh: '拉丁語', en: 'Latin' },
    gloss: { zh: '「人間之愛」。耶穌會士《中國哲學家孔子》（1687）以之釋「仁」（拼作 Gin）。', en: '“Human charity”: how the Jesuit Confucius Sinarum Philosophus (1687) explains 仁, spelled Gin.' },
    relation: 'translation', weight: 2,
    sources: [
      { title: 'Confucius Sinarum Philosophus (Paris, 1687) (Internet Archive)', url: 'https://archive.org/details/confuciussinarum00conf', quote: 'de communi quadam, sed mere humana charitate, Gin dicta, quae ad totius generis hominum conciliationem & consociationem colendam tuendamque spectat' },
    ],
    note: { zh: '同書亦以 pietas 稱之。引文據掃描本 OCR，頁碼待核。', en: 'The same work also calls it pietas. Quoted from the scan’s OCR; page not yet pinned.' },
  },
  {
    id: 'menschlichkeit', text: 'Menschlichkeit', dir: 'ltr', lang: 'de', roman: 'Menschlichkeit',
    langName: { zh: '德語', en: 'German' },
    gloss: { zh: '人性、人道之心。衛禮賢（Richard Wilhelm, 1910）譯《論語》12.22，於 Sittlichkeit 後括注之。', en: 'Humaneness. Richard Wilhelm (1910) adds it in parentheses after his main term Sittlichkeit at Analects 12.22.' },
    relation: 'translation', weight: 2,
    sources: [
      { title: 'Richard Wilhelm, Kungfutse: Gespräche (1910), XII.22 (Zeno.org)', url: 'http://www.zeno.org/Philosophie/M/Kong%20Fu%20Zi%20%28Konfuzius%29/Lunyu%20-%20Gespr%C3%A4che/Buch%20XII/22.%20Sittlichkeit%20und%20Weisheit', quote: 'Fan Tschï fragte nach (dem Wesen) der Sittlichkeit (Menschlichkeit). Der Meister sprach: »Menschenliebe.«' },
      { title: 'Duden, Menschlichkeit', url: 'https://www.duden.de/rechtschreibung/Menschlichkeit', quote: 'menschliche Haltung und Gesinnung' },
    ],
  },
  {
    id: 'chelovekolyubie', text: 'человеколюбие', dir: 'ltr', lang: 'ru', roman: 'chelovekolyubiye',
    langName: { zh: '俄語', en: 'Russian' },
    gloss: { zh: '「愛人」之德。俄國漢學家 Л. С. Переломов譯《論語》以之譯「仁」，自注為「約定譯名」。', en: 'Love of humankind: L. S. Perelomov’s rendering of 仁 in his Analects, which he calls a conventional translation.' },
    relation: 'translation', weight: 2,
    sources: [
      { title: 'Л. С. Переломов, Конфуций: «Лунь юй»', url: 'https://opentextnn.ru/old/data/files/konfut.pdf', quote: 'Человеколюбие (условный перевод термина жэнь) — важнейшая этико-философская категория конфуцианства.' },
      { title: 'Новая философская энциклопедия, «Жэнь» (А. И. Кобзев)', url: 'https://iphlib.ru/library/collection/newphilenc/document/HASH1a1f1a995c20707f9b541a', quote: 'ЖЭНЬ (кит., букв. – гуманность, человечность, милосердие, доброта)' },
    ],
    note: { zh: '俄國漢學亦譯作 гуманность、человечность，未歸一。', en: 'Russian sinology also uses гуманность or человечность; there is no single standard.' },
  },
  {
    id: 'rahman', text: 'ٱلرَّحْمَٰن', dir: 'rtl', lang: 'ar', roman: 'ar-Raḥmān',
    langName: { zh: '阿拉伯語', en: 'Arabic' },
    gloss: { zh: '真主之名「至仁者」，源自 r-ḥ-m（慈憫）字根。馬堅譯《古蘭經》，以「至仁」譯之。', en: 'A divine name, “the Most Merciful”, from the root r-ḥ-m. Ma Jian’s Chinese Qur’an renders it 至仁.' },
    relation: 'translation', weight: 3,
    sources: [
      { title: '《古蘭經》1:1，馬堅譯（Quran.com）', url: 'https://quran.com/1?translations=56', quote: '奉至仁至慈的真主之名' },
      { title: '《古蘭經》2:163，馬堅譯（1981）', url: 'http://alhassanain.org/chinese/?com=book&id=13', quote: '他是至仁的，是至慈的。' },
    ],
    note: { zh: '「至仁」對 ar-Raḥmān，「至慈」對 ar-Raḥīm；名詞 raḥma 本身馬堅另譯作「慈恩」「憐憫」。', en: '至仁 renders ar-Raḥmān and 至慈 ar-Raḥīm; the bare noun raḥma Ma Jian renders otherwise (慈恩, 憐憫).' },
  },

  // ── 近義 ───────────────────────────────────────────────
  {
    id: 'dogyo-ninin', text: '同行二人', dir: 'ltr', lang: 'ja', roman: 'dōgyō ninin',
    langName: { zh: '日語', en: 'Japanese' },
    gloss: { zh: '四國遍路者笠上所書：看似獨行，實與弘法大師空海同行。一人上路，從來是兩個人。', en: 'Written on Shikoku pilgrims’ hats: walking alone, one always walks with Kōbō Daishi, Kūkai.' },
    relation: 'neighbour', weight: 3,
    sources: [
      { title: 'ウィクショナリー日本語版「同行二人」', url: 'https://ja.wiktionary.org/wiki/同行二人', quote: '「二人」とは本人と弘法大師の二人を意味し、常に弘法大師と共にある、の意。' },
      { title: 'Wikipedia「四国八十八箇所」', url: 'https://ja.wikipedia.org/wiki/四国八十八箇所', quote: '仮に一人で四国八十八箇所を巡っても、同行二人と言って常に「お大師さん」（弘法大師）と一緒にいる想いで巡礼している。' },
      { title: '四国八十八ヶ所霊場会 · Pilgrimage', url: 'https://88shikokuhenro.jp/en/pilgrimage/', quote: 'When you are practicing pilgrimage, you are always with the master (Kobo Daishi).' },
    ],
    note: { zh: '本站立意之源；非「仁」之譯。', en: 'The source of this site’s idea — not a translation of 仁.' },
  },
  {
    id: 'maitri', text: 'मैत्री', dir: 'ltr', lang: 'sa', roman: 'maitrī',
    langName: { zh: '梵語', en: 'Sanskrit' },
    gloss: { zh: '友愛、慈心，願眾生得樂。漢譯佛典作「慈」，四無量心之首——是「慈」，不是「仁」。', en: 'Friendliness, goodwill wishing others happiness; rendered 慈 in Chinese Buddhist texts — kindness, not 仁.' },
    relation: 'neighbour', weight: 3,
    sources: [
      { title: 'Monier-Williams, Sanskrit-English Dictionary (1899), p. 834', url: 'https://www.sanskrit-lexicon.uni-koeln.de/scans/MWScan/2020/web/webtc/getword.php?key=mEtrI&filter=roman&accent=no&transLit=slp1', quote: 'friendship, friendliness, benevolence, good will (one of the 4 perfect states with Buddhists)' },
      { title: 'Soothill & Hodous, A Dictionary of Chinese Buddhist Terms, s.v. 四無量心', url: 'https://mahajana.net/texts/soothill-hodous.html', quote: '慈無量心 boundless kindness, maitrī, or bestowing of joy or happiness' },
    ],
  },
  {
    id: 'karuna', text: 'करुणा', dir: 'ltr', lang: 'sa', roman: 'karuṇā',
    langName: { zh: '梵語', en: 'Sanskrit' },
    gloss: { zh: '悲憫，欲拔他人之苦。漢譯佛典作「悲」，四無量心之二。', en: 'Compassion, the wish to remove others’ suffering; rendered 悲 in Chinese Buddhist texts.' },
    relation: 'neighbour', weight: 3,
    sources: [
      { title: 'Monier-Williams, Sanskrit-English Dictionary (1899), p. 255', url: 'https://www.sanskrit-lexicon.uni-koeln.de/scans/MWScan/2020/web/webtc/getword.php?key=karuRA&filter=roman&accent=no&transLit=slp1', quote: 'pity, compassion … one of the four Brahma-vihāras (Buddh.)' },
      { title: 'Soothill & Hodous, s.v. 悲', url: 'https://mahajana.net/texts/soothill-hodous.html', quote: '悲 karuṇā; kṛpā. Sympathy, pity for another in distress and the desire to help him, sad.' },
    ],
  },
  {
    id: 'metta', text: 'mettā', dir: 'ltr', lang: 'pi', roman: 'mettā',
    langName: { zh: '巴利語', en: 'Pali' },
    gloss: { zh: '慈心、友愛，對眾生之善意；即梵語 maitrī，漢譯「慈」。《慈經》以之為題。', en: 'Loving-kindness toward all beings; the Pali form of maitrī, rendered 慈; the theme of the Mettā Sutta.' },
    relation: 'neighbour', weight: 2,
    sources: [
      { title: 'Sutta Nipāta 1.8, Mettasutta (SuttaCentral)', url: 'https://suttacentral.net/snp1.8/pli/ms', quote: 'Mettañca sabbalokasmi, mānasaṁ bhāvaye aparimāṇaṁ' },
      { title: 'PTS Pali-English Dictionary, s.v. Mettā (DSAL)', url: 'https://dsal.uchicago.edu/cgi-bin/app/pali_query.py?qs=mettā&searchhws=yes', quote: 'love, amity, sympathy, friendliness, active interest in others.' },
    ],
  },
  {
    id: 'byams-pa', text: 'བྱམས་པ', dir: 'ltr', lang: 'bo', roman: 'byams pa',
    langName: { zh: '藏語', en: 'Tibetan' },
    gloss: { zh: '慈愛，願他人安樂。《翻譯名義大集》以之對譯梵語 maitrī；亦為彌勒之藏名。', en: 'Loving-kindness; the Tibetan rendering of Sanskrit maitrī in the Mahāvyutpatti, and the Tibetan name of Maitreya.' },
    relation: 'neighbour', weight: 2,
    sources: [
      { title: 'Rangjung Yeshe Tibetan-English Dictionary (data, via Steinert)', url: 'https://raw.githubusercontent.com/christiansteinert/tibetan-dictionary/master/_input/dictionaries/public/02-RangjungYeshe', quote: 'byams pa|1) Maitreya, the Loving One. 2) love, loving-kindness, benevolent love' },
      { title: 'Mahāvyutpatti, Tibetan–Sanskrit (data, via Steinert)', url: 'https://raw.githubusercontent.com/christiansteinert/tibetan-dictionary/master/_input/dictionaries/public/21-Mahavyutpatti-Skt', quote: 'byams pa|maitrī' },
    ],
  },
  {
    id: 'daya', text: 'दया', dir: 'ltr', lang: 'hi', roman: 'dayā',
    langName: { zh: '印地語', en: 'Hindi' },
    gloss: { zh: '憐憫、慈悲、寬恕、仁厚；源自梵語 dayā。', en: 'Compassion, pity, mercy, kindness; from Sanskrit dayā.' },
    relation: 'neighbour', weight: 2,
    sources: [
      { title: 'McGregor, Oxford Hindi-English Dictionary, p. 479 (DSAL)', url: 'https://dsal.uchicago.edu/cgi-bin/app/mcgregor_query.py?qs=दया&searchhws=yes', quote: 'compassion, pity; sympathy. 2. mercy; clemency. 3. kindness.' },
    ],
  },
  {
    id: 'mehr', text: 'مهر', dir: 'rtl', lang: 'fa', roman: 'mehr',
    langName: { zh: '波斯語', en: 'Persian' },
    gloss: { zh: '愛、友情、慈愛、憐憫；同字亦指太陽。', en: 'Love, friendship, affection, kindness; the same word also means the sun.' },
    relation: 'neighbour', weight: 2,
    sources: [
      { title: 'Steingass, A Comprehensive Persian-English Dictionary (1892), p. 1353 (DSAL)', url: 'https://dsal.uchicago.edu/cgi-bin/app/steingass_query.py?page=1353', quote: 'mihr, The sun; love, friendship, affection, kindness; mercy, pity' },
    ],
    note: { zh: '古讀 mihr。同形亦讀 muhr，義為「印」，是另一字。', en: 'Classical reading mihr. The same spelling read muhr means “seal” — a different word.' },
  },
  {
    id: 'agape', text: 'ἀγάπη', dir: 'ltr', lang: 'grc', roman: 'agápē',
    langName: { zh: '古希臘語', en: 'Ancient Greek' },
    gloss: { zh: '愛；新約中尤指神對人之愛、人對神之愛與弟兄之愛。', en: 'Love; in the New Testament, the love of God for people, of people for God, and brotherly love.' },
    relation: 'neighbour', weight: 2,
    sources: [
      { title: 'LSJ, ἀγάπη (Perseus)', url: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.04.0057:entry=a)ga/ph', quote: 'esp. love of God for man and of man for God … also brotherly love, charity' },
      { title: '1 John 4:8 (SBLGNT)', url: 'https://www.biblegateway.com/passage/?search=1+John+4%3A8&version=SBLGNT', quote: 'ὁ θεὸς ἀγάπη ἐστίν.' },
    ],
  },
  {
    id: 'philanthropia', text: 'φιλανθρωπία', dir: 'ltr', lang: 'grc', roman: 'philanthrōpía',
    langName: { zh: '古希臘語', en: 'Ancient Greek' },
    gloss: { zh: '字面「愛人」：人道、仁厚、溫和之情；亦指神對人類之愛。', en: 'Literally “love of humankind”: humanity, kind-heartedness; also God’s love toward humankind.' },
    relation: 'neighbour', weight: 3,
    sources: [
      { title: 'LSJ, φιλανθρωπία (Perseus)', url: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.04.0057:entry=filanqrwpi/a', quote: 'humanity, benevolence, kind-heartedness, humane feeling … of God, love to man, Ep. Tit.3.4' },
    ],
  },
  {
    id: 'humanitas', text: 'humanitas', dir: 'ltr', lang: 'la', roman: 'hūmānitās',
    langName: { zh: '拉丁語', en: 'Latin' },
    gloss: { zh: '人性；待人溫厚；在西塞羅筆下亦兼教養與文雅。', en: 'Human nature; humane, gentle conduct toward others; in Cicero, also culture and refinement.' },
    relation: 'neighbour', weight: 3,
    sources: [
      { title: 'Lewis & Short, humanitas (Perseus)', url: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.04.0059:entry=humanitas', quote: 'Humane or gentle conduct towards others, humanity, philanthropy, gentleness, kindness' },
      { title: 'Cicero, Pro Archia 1.2 (The Latin Library)', url: 'https://www.thelatinlibrary.com/cicero/arch.shtml', quote: 'Etenim omnes artes, quae ad humanitatem pertinent, habent quoddam commune vinculum' },
    ],
  },
  {
    id: 'hesed', text: 'חֶסֶד', dir: 'rtl', lang: 'he', roman: 'ḥesed',
    langName: { zh: '希伯來語', en: 'Biblical Hebrew' },
    gloss: { zh: '慈愛、恩慈；希伯來聖經中多指立約之堅定慈愛。', en: 'Lovingkindness; in the Hebrew Bible often steadfast, covenant love.' },
    relation: 'neighbour', weight: 2,
    sources: [
      { title: 'Strong’s H2617 / BDB (Blue Letter Bible)', url: 'https://www.blueletterbible.org/lexicon/h2617/kjv/wlc/0-1/', quote: 'Kindness; by implication (towards God) piety' },
      { title: 'Micah 6:8 (WLC, Bible Hub)', url: 'https://biblehub.com/text/micah/6-8.htm', quote: 'וְאַהֲבַת חֶסֶד' },
    ],
  },
  {
    id: 'ubuntu', text: 'ubuntu', dir: 'ltr', lang: 'zu', roman: 'ubuntu',
    langName: { zh: '祖魯語', en: 'isiZulu' },
    gloss: { zh: '人之為人的品質。諺曰 umuntu ngumuntu ngabantu：人因他人而成其為人。', en: 'Humanness. Umuntu ngumuntu ngabantu: a person is a person through other persons.' },
    relation: 'neighbour', weight: 3,
    sources: [
      { title: 'C. Gade, “The Historical Development of the Written Discourses on Ubuntu,” S. Afr. J. Philos. 30(3), 2011', url: 'https://pure.au.dk/ws/files/40165256/The_Historical_Development_of_the_Written_Discourses_on_Ubuntu.pdf', quote: 'the Nguni proverb ‘umuntu ngumuntu ngabantu’ (often translated as ‘a person is a person through other persons’)' },
      { title: 'Desmond Tutu, No Future Without Forgiveness (1999), via Tutu Foundation UK', url: 'https://tutufoundationuk.org/2023/04/21/ubuntu-is-international-and-its-growing/', quote: 'A person is a person through other persons.' },
    ],
    note: { zh: '科薩語作 umntu ngumntu ngabantu。以此諺釋 ubuntu，始於 1990 年代。', en: 'Xhosa: umntu ngumntu ngabantu. The proverb was tied to “ubuntu” in writing only from the 1990s.' },
  },
  {
    id: 'utu', text: 'utu', dir: 'ltr', lang: 'sw', roman: 'utu',
    langName: { zh: '斯瓦希里語', en: 'Swahili' },
    gloss: { zh: '人性、人道；由 mtu「人」派生，與 ubuntu 同源。', en: 'Humanity, humaneness; from mtu “person”, cognate with ubuntu.' },
    relation: 'neighbour', weight: 2,
    sources: [
      { title: 'A. Rettová, “Cognates of ubuntu: Humanity/personhood in the Swahili philosophy of utu,” Decolonial Subversions (2020)', url: 'http://decolonialsubversions.org/docs/pdfs/5_2020.03.29_Rettova.pdf', quote: 'mtu ni utu (“[to be] a human being is [to have] humanity”) emphasizes the moral content of utu' },
      { title: 'Wiktionary, utu (Swahili)', url: 'https://en.wiktionary.org/wiki/utu', quote: 'humanity, human nature, ubuntu' },
    ],
  },
  {
    id: 'humaneco', text: 'humaneco', dir: 'ltr', lang: 'eo', roman: 'humaneco',
    langName: { zh: '世界語', en: 'Esperanto' },
    gloss: { zh: '仁厚：「humana」之性——憐憫、助人、愛人。世界語本為破巴別之語。', en: 'Humaneness: the quality of being humana — compassionate, helpful, loving to people.' },
    relation: 'neighbour', weight: 1,
    sources: [
      { title: 'Reta Vortaro, human/humaneco', url: 'https://reta-vortaro.de/revo/art/human.html', quote: 'humana: Posedanta la kompatemon, helpemon, homamon, kiuj estas la plej noblaj kvalitoj de la homo' },
    ],
    note: { zh: 'Reta Vortaro 以「人道、仁」為其中文對應，屬辭典對照而非譯者用例，故列近義。', en: 'Reta Vortaro gives 人道, 仁 as Chinese equivalents — a dictionary pairing, not a translator’s usage, so listed as neighbour.' },
  },
];
