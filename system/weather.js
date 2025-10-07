// 🌦️ --- HAVA DURUMU MODÜLÜ (Geliştirilmiş Sürüm) ---

// 🔹 Konum tespiti (IP tabanlı)
async function getLocationByIP() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("Konum alınamadı");
    const data = await res.json();
    return { city: data.city || "Istanbul", lat: data.latitude, lon: data.longitude };
  } catch {
    return { city: "Istanbul", lat: 41.0082, lon: 28.9784 };
  }
}

// 🔹 Koordinatları şehirden al (Nominatim API)
async function getCoordsByCity(city) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

// 🔹 Dil bazlı hava durumu metni (OpenMeteo için)
function getConditionText(code, lang = "tr") {
  const maps = {
    tr: { 0: "Açık", 1: "Parçalı bulutlu", 2: "Bulutlu", 3: "Kapalı", 45: "Sis", 48: "Sis", 51: "Çiseleme", 53: "Yağmur", 55: "Şiddetli yağmur", 61: "Hafif yağmur", 63: "Yağmur", 65: "Şiddetli yağmur", 71: "Hafif kar", 73: "Kar", 75: "Şiddetli kar", 80: "Saçma yağmur", 81: "Hafif saçma yağmur", 82: "Şiddetli saçma yağmur", 95: "Fırtına", 96: "Yıldırımlı fırtına", 99: "Şiddetli fırtına" },
    az: { 0: "Açıq", 1: "Qismən buludlu", 2: "Buludlu", 3: "Buludlu", 45: "Duman", 48: "Duman", 51: "Çilək", 53: "Yağış", 55: "Güclü yağış", 61: "Zəif yağış", 63: "Yağış", 65: "Güclü yağış", 71: "Zəif qar", 73: "Qar", 75: "Güclü qar", 80: "Dəbədə yağış", 81: "Zəif dəbədə yağış", 82: "Güclü dəbədə yağış", 95: "Fırtına", 96: "Yıldırımlı fırtına", 99: "Güclü fırtına" },
    tk: { 0: "Açyk", 1: "Bölünip bulutly", 2: "Bulutly", 3: "Bulutly", 45: "Duman", 48: "Duman", 51: "Çilek", 53: "Ýagyş", 55: "Güýçli ýagyş", 61: "Hafif ýagyş", 63: "Ýagyş", 65: "Güýçli ýagyş", 71: "Hafif gar", 73: "Gar", 75: "Güýçli gar", 80: "Saçma ýagyş", 81: "Hafif saçma ýagyş", 82: "Güýçli saçma ýagyş", 95: "Furtına", 96: "Ýyldyrymlı furtına", 99: "Güýçli furtına" },
    kk: { 0: "Ашық", 1: "Бөліп бұлтты", 2: "Бұлтты", 3: "Бұлтты", 45: "Тұман", 48: "Тұман", 51: "Шашыраңқы жаңбыр", 53: "Жаңбыр", 55: "Күшті жаңбыр", 61: "Жеңіл жаңбыр", 63: "Жаңбыр", 65: "Күшті жаңбыр", 71: "Жеңіл қар", 73: "Қар", 75: "Күшті қар", 80: "Шағын жаңбыр", 81: "Жеңіл шағын жаңбыр", 82: "Күшті шағын жаңбыр", 95: "Дауыл", 96: "Мамырмен дауыл", 99: "Күшті дауыл" },
    ky: { 0: "Ачык", 1: "Бөлүнүп булуттуу", 2: "Булуттуу", 3: "Булуттуу", 45: "Туман", 48: "Туман", 51: "Чийки", 53: "Жамгыр", 55: "Күчтүү жамгыр", 61: "Айыл жамгыр", 63: "Жамгыр", 65: "Күчтүү жамгыр", 71: "Айыл кар", 73: "Кар", 75: "Күчтүү кар", 80: "Жамгыр", 81: "Айыл жамгыр", 82: "Күчтүү жамгыр", 95: "Бороон", 96: "Чагылдырылган бороон", 99: "Күчтүү бороон" },
    uz: { 0: "Ochiq", 1: "Qisman bulutli", 2: "Bulutli", 3: "Bulutli", 45: "Tuman", 48: "Tuman", 51: "Chillak", 53: "Yomg'ir", 55: "Kuchli yomg'ir", 61: "Yengil yomg'ir", 63: "Yomg'ir", 65: "Kuchli yomg'ir", 71: "Yengil qor", 73: "Qor", 75: "Kuchli qor", 80: "Shovqinli yomg'ir", 81: "Yengil shovqinli yomg'ir", 82: "Kuchli shovqinli yomg'ir", 95: "Bo'ron", 96: "Momukli bo'ron", 99: "Kuchli bo'ron" },
    tt: { 0: "Асылу", 1: "Бүлектән бөткөн", 2: "Бөткөн", 3: "Бөткөн", 45: "Туман", 48: "Туман", 51: "Чиләк", 53: "Яңын", 55: "Күчле яңын", 61: "Әйлән яңын", 63: "Яңын", 65: "Күчле яңын", 71: "Әйлән кар", 73: "Кар", 75: "Күчле кар", 80: "Шашма яңын", 81: "Әйлән шашма яңын", 82: "Күчле шашма яңын", 95: "Фүртлә", 96: "Ялтсыз фүртлә", 99: "Күчле фүртлә" },
    ba: { 0: "Асылу", 1: "Бүлектән бөткөн", 2: "Бөткөн", 3: "Бөткөн", 45: "Туман", 48: "Туман", 51: "Чиләк", 53: "Яңын", 55: "Күчле яңын", 61: "Әйлән яңын", 63: "Яңын", 65: "Күчле яңын", 71: "Әйлән кар", 73: "Кар", 75: "Күчле кар", 80: "Шашма яңын", 81: "Әйлән шашма яңын", 82: "Күчле шашма яңын", 95: "Фүртлә", 96: "Ялтсыз фүртлә", 99: "Күчле фүртлә" },
    ug: { 0: "ئېچىق", 1: "ئاياللىق بۇلۇتلۇق", 2: "بۇلۇتلۇق", 3: "بۇلۇتلۇق", 45: "ئۈلكە", 48: "ئۈلكە", 51: "ئاز ئۆسلەتكەن يامغۇر", 53: "يامغۇر", 55: "كۈچلۈك يامغۇر", 61: "ئاز يامغۇر", 63: "يامغۇر", 65: "كۈچلۈك يامغۇر", 71: "ئاز قار", 73: "قار", 75: "كۈچلۈك قار", 80: "ئۆسلەتكەن يامغۇر", 81: "ئاز ئۆسلەتكەن يامغۇر", 82: "كۈچلۈك ئۆسلەتكەن يامغۇر", 95: "ئۈرۈل", 96: "قاچىلما ئۈرۈل", 99: "كۈچلۈك ئۈرۈل" },
    sah: { 0: "Ачык", 1: "Бөлүнүп булуттуу", 2: "Булуттуу", 3: "Булуттуу", 45: "Туман", 48: "Туман", 51: "Чийки", 53: "Жамгыр", 55: "Күчтүү жамгыр", 61: "Айыл жамгыр", 63: "Жамгыр", 65: "Күчтүү жамгыр", 71: "Айыл кар", 73: "Кар", 75: "Күчтүү кар", 80: "Жамгыр", 81: "Айыл жамгыр", 82: "Күчтүү жамгыр", 95: "Бороон", 96: "Чагылдырылган бороон", 99: "Күчтүү бороон" },
    cv: { 0: "Аçык", 1: "Пӑр-ҫӑк", 2: "Ҫӑк", 3: "Ҫӑк", 45: "Туман", 48: "Туман", 51: "Чилӗк", 53: "Яҫ", 55: "Кӑлӑш яҫ", 61: "Ҫӑк яҫ", 63: "Яҫ", 65: "Кӑлӑш яҫ", 71: "Ҫӑк кар", 73: "Кар", 75: "Кӑлӑш кар", 80: "Шашма яҫ", 81: "Ҫӑк шашма яҫ", 82: "Кӑлӑш шашма яҫ", 95: "Фӗр", 96: "Ялтсыз фӗр", 99: "Кӑлӑш фӗр" },
    en: { 0: "Clear", 1: "Partly cloudy", 2: "Cloudy", 3: "Overcast", 45: "Fog", 48: "Fog", 51: "Drizzle", 53: "Rain", 55: "Heavy rain", 61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Showers", 81: "Light showers", 82: "Heavy showers", 95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Severe thunderstorm" },
    es: { 0: "Despejado", 1: "Parcialmente nublado", 2: "Nublado", 3: "Cubierta", 45: "Niebla", 48: "Niebla", 51: "Llovizna", 53: "Lluvia", 55: "Lluvia fuerte", 61: "Lluvia ligera", 63: "Lluvia", 65: "Lluvia fuerte", 71: "Nieve ligera", 73: "Nieve", 75: "Nieve fuerte", 80: "Chubascos", 81: "Chubascos ligeros", 82: "Chubascos fuertes", 95: "Tormenta", 96: "Tormenta con granizo", 99: "Tormenta severa" },
    jp: { 0: "晴れ", 1: "部分的に曇り", 2: "曇り", 3: "どんより", 45: "霧", 48: "霧", 51: "霧雨", 53: "雨", 55: "強い雨", 61: "小雨", 63: "雨", 65: "強い雨", 71: "小雪", 73: "雪", 75: "強い雪", 80: "にわか雨", 81: "小にわか雨", 82: "強いにわか雨", 95: "雷雨", 96: "雹の雷雨", 99: "激しい雷雨" },
    zh: { 0: "晴朗", 1: "部分多云", 2: "多云", 3: "阴天", 45: "雾", 48: "雾", 51: "毛毛雨", 53: "雨", 55: "大雨", 61: "小雨", 63: "雨", 65: "大雨", 71: "小雪", 73: "雪", 75: "大雪", 80: "阵雨", 81: "小阵雨", 82: "大阵雨", 95: "雷暴", 96: "冰雹雷暴", 99: "严重雷暴" },
    ko: { 0: "맑음", 1: "부분적으로 흐림", 2: "흐림", 3: "구름 많음", 45: "안개", 48: "안개", 51: "이슬비", 53: "비", 55: "강한 비", 61: "약한 비", 63: "비", 65: "강한 비", 71: "약한 눈", 73: "눈", 75: "강한 눈", 80: "소나기", 81: "약한 소나기", 82: "강한 소나기", 95: "뇌우", 96: "우박 뇌우", 99: "심한 뇌우" },
    de: { 0: "Klar", 1: "Teilweise bewölkt", 2: "Bewölkt", 3: "Bedeckt", 45: "Nebel", 48: "Nebel", 51: "Nieselregen", 53: "Regen", 55: "Starker Regen", 61: "Leichter Regen", 63: "Regen", 65: "Starker Regen", 71: "Leichter Schnee", 73: "Schnee", 75: "Starker Schnee", 80: "Schauer", 81: "Leichte Schauer", 82: "Starke Schauer", 95: "Gewitter", 96: "Gewitter mit Hagel", 99: "Schweres Gewitter" },
    fr: { 0: "Soleil", 1: "Partiellement nuageux", 2: "Nuageux", 3: "Couvert", 45: "Brouillard", 48: "Brouillard", 51: "Bruine", 53: "Pluie", 55: "Pluie forte", 61: "Pluie légère", 63: "Pluie", 65: "Pluie forte", 71: "Neige légère", 73: "Neige", 75: "Neige forte", 80: "Averses", 81: "Averses légères", 82: "Averses fortes", 95: "Orage", 96: "Orage de grêle", 99: "Orage violent" },
    ar: { 0: "صافي", 1: "غائم جزئيًا", 2: "غائم", 3: "مغطى", 45: "ضباب", 48: "ضباب", 51: "رذاذ", 53: "مطر", 55: "مطر غزير", 61: "مطر خفيف", 63: "مطر", 65: "مطر غزير", 71: "ثلج خفيف", 73: "ثلج", 75: "ثلج غزير", 80: "زخات", 81: "زخات خفيف", 82: "زخات غزير", 95: "عاصفة رعدية", 96: "عاصفة رعدية بحلق", 99: "عاصفة رعدية شديدة" },
    ru: { 0: "Ясно", 1: "Переменная облачность", 2: "Облачно", 3: "Пасмурно", 45: "Туман", 48: "Туман", 51: "Морось", 53: "Дождь", 55: "Сильный дождь", 61: "Слабый дождь", 63: "Дождь", 65: "Сильный дождь", 71: "Слабый снег", 73: "Снег", 75: "Сильный снег", 80: "Ливень", 81: "Слабый ливень", 82: "Сильный ливень", 95: "Гроза", 96: "Гроза с градом", 99: "Сильная гроза" },
    mn: { 0: "Цэлмэг", 1: "Хагас үүлтэй", 2: "Үүлтэй", 3: "Үүлтэй", 45: "Манан", 48: "Манан", 51: "Чийглэг бороо", 53: "Бороо", 55: "Хүчтэй бороо", 61: "Сул бороо", 63: "Бороо", 65: "Хүчтэй бороо", 71: "Сул цас", 73: "Цас", 75: "Хүчтэй цас", 80: "Борооны шуурга", 81: "Сул борооны шуурга", 82: "Хүчтэй борооны шуурга", 95: "Шуурга", 96: "Элэгдэлтэй шуурга", 99: "Хүчтэй шуурга" },
    he: { 0: "בהיר", 1: "חלקית מעונן", 2: "מעונן", 3: "עננים כבדים", 45: "ערפל", 48: "ערפל", 51: "גשם קל", 53: "גשם", 55: "גשם כבד", 61: "גשם קל", 63: "גשם", 65: "גשם כבד", 71: "שלג קל", 73: "שלג", 75: "שלג כבד", 80: "ממטרים", 81: "ממטרים קלים", 82: "ממטרים כבדים", 95: "סופה", 96: "סופה עם ברד", 99: "סופה חזקה" },
    hi: { 0: "साफ़", 1: "आंशिक बादल", 2: "बादल", 3: "बादल", 45: "कोहरा", 48: "कोहरा", 51: "हल्की बारिश", 53: "बारिश", 55: "भारी बारिश", 61: "हल्की बारिश", 63: "बारिश", 65: "भारी बारिश", 71: "हल्का बर्फ", 73: "बर्फ", 75: "भारी बर्फ", 80: "बरसात", 81: "हल्की बरसात", 82: "भारी बरसात", 95: "तूफान", 96: "ओले के साथ तूफान", 99: "भारी तूफान" },
    el: { 0: "Καθαρός", 1: "Μερικώς συννεφιασμένος", 2: "Συννεφιασμένος", 3: "Συννεφιά", 45: "Ομίχλη", 48: "Ομίχλη", 51: "Ψιλόβροχο", 53: "Βροχή", 55: "Ισχυρή βροχή", 61: "Ασθενής βροχή", 63: "Βροχή", 65: "Ισχυρή βροχή", 71: "Ασθενής χιόνι", 73: "Χιόνι", 75: "Ισχυρό χιόνι", 80: "Πρόσκαιρες βροχές", 81: "Ασθενείς βροχές", 82: "Ισχυρές βροχές", 95: "Καταιγίδα", 96: "Καταιγίδα με χαλάζι", 99: "Έντονη καταιγίδα" },
    it: { 0: "Sereno", 1: "Parzialmente nuvoloso", 2: "Nuvoloso", 3: "Coperto", 45: "Nebbia", 48: "Nebbia", 51: "Pioggerella", 53: "Pioggia", 55: "Pioggia forte", 61: "Pioggia leggera", 63: "Pioggia", 65: "Pioggia forte", 71: "Neve leggera", 73: "Neve", 75: "Neve forte", 80: "Rovesci", 81: "Rovesci leggeri", 82: "Rovesci forti", 95: "Tempesta", 96: "Tempesta con grandine", 99: "Tempesta forte" },
    gag: { 0: "Açık", 1: "Parçalı bulutlu", 2: "Bulutlu", 3: "Kapalı", 45: "Sis", 48: "Sis", 51: "Çiseleme", 53: "Yağmur", 55: "Şiddetli yağmur", 61: "Hafif yağmur", 63: "Yağmur", 65: "Şiddetli yağmur", 71: "Hafif kar", 73: "Kar", 75: "Şiddetli kar", 80: "Saçma yağmur", 81: "Hafif saçma yağmur", 82: "Şiddetli saçma yağmur", 95: "Fırtına", 96: "Yıldırımlı fırtına", 99: "Şiddetli fırtına" }
  };
  return maps[lang]?.[code] || "Bilinmeyen";
}

// 🔹 Gelişmiş Emoji eşleştirme (daha fazla dil desteği)
function getWeatherEmoji(conditionText = "") {
  const t = conditionText.toLowerCase();
  const lang = localStorage.getItem("language") || "tr";
  const terms = {
    tr: { rain: "yağmur", snow: "kar", sun: "güneş", clear: "açık", cloud: "bulut", overcast: "kapalı", storm: "fırtına", thunder: "yıldırım", fog: "sis", mist: "pus", haze: "pus", drizzle: "çiseleme", sleet: "karla yağmur", partly: "parçalı", sunny: "güneşli", cloudy: "bulutlu" },
    az: { rain: "yağış", snow: "qar", sun: "günəş", clear: "açıq", cloud: "bulud", overcast: "buludlu", storm: "firtına", thunder: "yıldırım", fog: "duman", mist: "duman", haze: "duman", drizzle: "çilək", sleet: "qarlı yağış", partly: "qismən", sunny: "günəşli", cloudy: "buludlu" },
    tk: { rain: "ýagyş", snow: "gar", sun: "güneş", clear: "açyk", cloud: "bulut", overcast: "bulutly", storm: "furtına", thunder: "ýyldyrym", fog: "duman", mist: "duman", haze: "duman", drizzle: "çilek", sleet: "garly ýagyş", partly: "bölünip", sunny: "güneşli", cloudy: "bulutly" },
    kk: { rain: "жаңбыр", snow: "қар", sun: "күн", clear: "ашық", cloud: "бұлт", overcast: "бұлтты", storm: "дауыл", thunder: "күкірт", fog: "тұман", mist: "тұман", haze: "тұман", drizzle: "шашыраңқы жаңбыр", sleet: "қар жаңбыр", partly: "бөліп", sunny: "күнді", cloudy: "бұлтты" },
    ky: { rain: "жаан", snow: "кар", sun: "күн", clear: "ачык", cloud: "булут", overcast: "булуттуу", storm: "борoon", thunder: "күкүрт", fog: "туман", mist: "туман", haze: "туман", drizzle: "чийки", sleet: "кар жаан", partly: "бөлүнүп", sunny: "күнүлүү", cloudy: "булуттуу" },
    uz: { rain: "yomg'ir", snow: "qor", sun: "quyosh", clear: "ochiq", cloud: "bulut", overcast: "bulutli", storm: "bo'ron", thunder: "momaq", fog: "tuman", mist: "tuman", haze: "tuman", drizzle: "chillak", sleet: "qor yomg'ir", partly: "qisman", sunny: "quyoshli", cloudy: "bulutli" },
    tt: { rain: "яҫын", snow: "кар", sun: "киңәш", clear: "асылу", cloud: "бөткөн", overcast: "бөткөн", storm: "фүртлә", thunder: "ялтыртау", fog: "туман", mist: "туман", haze: "туман", drizzle: "чиләк", sleet: "карлы яҫын", partly: "бүлектән", sunny: "киңәшле", cloudy: "бөткөн" },
    ba: { rain: "яҫын", snow: "кар", sun: "киңәш", clear: "асылу", cloud: "бөткөн", overcast: "бөткөн", storm: "фүртлә", thunder: "ялтыртау", fog: "туман", mist: "туман", haze: "туман", drizzle: "чиләк", sleet: "карлы яҫын", partly: "бүлектән", sunny: "киңәшле", cloudy: "бөткөн" },
    ug: { rain: "يامغۇر", snow: "قار", sun: "قۇياش", clear: "ئېچىق", cloud: "بۇلۇت", overcast: "بۇلۇتلۇق", storm: "ئۈرۈل", thunder: "موقا", fog: "ئۈلكە", mist: "ئۈلكە", haze: "ئۈلكە", drizzle: "ئاز ئۆسلەتكەن يامغۇر", sleet: "قار يامغۇر", partly: "ئاياللىق", sunny: "قۇياشلىق", cloudy: "بۇلۇتلۇق" },
    sah: { rain: "суорут", snow: "суох", sun: "күн", clear: "аас", cloud: "булут", overcast: "булут", storm: "буор", thunder: "күрүк", fog: "тумус", mist: "тумус", haze: "тумус", drizzle: "суорут", sleet: "суох суорут", partly: "бөлүнүп", sunny: "күннүк", cloudy: "булуттук" },
    cv: { rain: "яҫ", snow: "кар", sun: "кӑн", clear: "аҫы", cloud: "ҫӑк", overcast: "ҫӑк", storm: "фӗр", thunder: "ялт", fog: "туман", mist: "туман", haze: "туман", drizzle: "чилӗк", sleet: "кар яҫ", partly: "пӑр-ҫӑк", sunny: "кӑнле", cloudy: "ҫӑк" },
    en: { rain: "rain", snow: "snow", sun: "sun", clear: "clear", cloud: "cloud", overcast: "overcast", storm: "storm", thunder: "thunder", fog: "fog", mist: "mist", haze: "haze", drizzle: "drizzle", sleet: "sleet", partly: "partly", sunny: "sunny", cloudy: "cloudy" },
    es: { rain: "lluvia", snow: "nieve", sun: "sol", clear: "despejado", cloud: "nube", overcast: "cubierto", storm: "tormenta", thunder: "trueno", fog: "niebla", mist: "niebla", haze: "neblina", drizzle: "llovizna", sleet: "aguanieve", partly: "parcialmente", sunny: "soleado", cloudy: "nublado" },
    jp: { rain: "雨", snow: "雪", sun: "太陽", clear: "晴れ", cloud: "雲", overcast: "どんより", storm: "嵐", thunder: "雷", fog: "霧", mist: "霧", haze: "霞", drizzle: "霧雨", sleet: "みぞれ", partly: "部分的に", sunny: "晴れ", cloudy: "曇り" },
    zh: { rain: "雨", snow: "雪", sun: "太阳", clear: "晴朗", cloud: "云", overcast: "阴天", storm: "风暴", thunder: "雷", fog: "雾", mist: "雾", haze: "雾霾", drizzle: "毛毛雨", sleet: "霰", partly: "部分", sunny: "晴朗", cloudy: "多云" },
    ko: { rain: "비", snow: "눈", sun: "태양", clear: "맑음", cloud: "구름", overcast: "흐림", storm: "폭풍", thunder: "천둥", fog: "안개", mist: "안개", haze: "연무", drizzle: "이슬비", sleet: "진눈깨비", partly: "부분적", sunny: "맑음", cloudy: "구름 많음" },
    de: { rain: "Regen", snow: "Schnee", sun: "Sonne", clear: "klar", cloud: "Wolke", overcast: "bedeckt", storm: "Sturm", thunder: "Gewitter", fog: "Nebel", mist: "Nebel", haze: "Dunst", drizzle: "Nieselregen", sleet: "Schneeregen", partly: "teilweise", sunny: "sonnig", cloudy: "bewölkt" },
    fr: { rain: "pluie", snow: "neige", sun: "soleil", clear: "dégagé", cloud: "nuage", overcast: "couvert", storm: "tempête", thunder: "tonnerre", fog: "brouillard", mist: "brume", haze: "brume", drizzle: "bruine", sleet: "neige fondue", partly: "partiellement", sunny: "ensoleillé", cloudy: "nuageux" },
    ar: { rain: "مطر", snow: "ثلج", sun: "شمس", clear: "صافي", cloud: "سحابة", overcast: "مغطى", storm: "عاصفة", thunder: "رعد", fog: "ضباب", mist: "ضباب", haze: "ضباب", drizzle: "رذاذ", sleet: "ثلج ممطر", partly: "جزئيًا", sunny: "مشمس", cloudy: "غائم" },
    ru: { rain: "дождь", snow: "снег", sun: "солнце", clear: "ясно", cloud: "облако", overcast: "пасмурно", storm: "буря", thunder: "гром", fog: "туман", mist: "морось", haze: "дымка", drizzle: "морось", sleet: "мокрый снег", partly: "переменная", sunny: "солнечно", cloudy: "облачно" },
    mn: { rain: "бороо", snow: "цас", sun: "нар", clear: "цэлмэг", cloud: "үүл", overcast: "үүлтэй", storm: "шуурга", thunder: "цөмөөр", fog: "манан", mist: "манан", haze: "манан", drizzle: "чийглэг бороо", sleet: "цасан бороо", partly: "хагас", sunny: "нартай", cloudy: "үүлтэй" },
    he: { rain: "גשם", snow: "שלג", sun: "שמש", clear: "בהיר", cloud: "ענן", overcast: "מעונן", storm: "סערה", thunder: "רעם", fog: "ערפל", mist: "ערפל", haze: "ערפל", drizzle: "טפטוף", sleet: "גשם קל", partly: "חלקי", sunny: "שמשי", cloudy: "מעונן" },
    hi: { rain: "बारिश", snow: "बर्फ", sun: "सूरज", clear: "साफ़", cloud: "बादल", overcast: "बादल", storm: "तूफान", thunder: "बज्रपात", fog: "कोहरा", mist: "कोहरा", haze: "कोहरा", drizzle: "हल्की बारिश", sleet: "हिमपात", partly: "आंशिक", sunny: "धूपी", cloudy: "बादली" },
    el: { rain: "βροχή", snow: "χιόνι", sun: "ήλιος", clear: "καθαρός", cloud: "σύννεφο", overcast: "συννεφιά", storm: "καταιγίδα", thunder: "βροντή", fog: "ομίχλη", mist: "ομίχλη", haze: "θολούρα", drizzle: "ψιλόβροχο", sleet: "χιονοθυέλλα", partly: "μερικώς", sunny: "ηλιόλουστος", cloudy: "συννεφιασμένος" },
    it: { rain: "pioggia", snow: "neve", sun: "sole", clear: "sereno", cloud: "nuvola", overcast: "coperto", storm: "tempesta", thunder: "tuono", fog: "nebbia", mist: "nebbia", haze: "nebbia", drizzle: "pioggerella", sleet: "nevischio", partly: "parzialmente", sunny: "soleggiato", cloudy: "nuvoloso" },
    gag: { rain: "yağmur", snow: "kar", sun: "güneş", clear: "açık", cloud: "bulut", overcast: "kapalı", storm: "fırtına", thunder: "yıldırım", fog: "sis", mist: "pus", haze: "pus", drizzle: "çiseleme", sleet: "karla yağmur", partly: "parçalı", sunny: "güneşli", cloudy: "bulutlu" }
  };
  const emojis = { rain: "🌧️", snow: "❄️", sun: "☀️", clear: "☀️", cloud: "☁️", overcast: "☁️", storm: "⛈️", thunder: "⛈️", fog: "🌫️", mist: "🌫️", haze: "🌫️", drizzle: "🌦️", sleet: "🌨️", partly: "⛅", sunny: "🌤️", cloudy: "🌥️" };
  const langTerms = terms[lang] || terms.tr;
  for (const [key, emoji] of Object.entries(emojis)) {
    if (t.includes(key) || t.includes(langTerms[key])) return emoji;
  }
  return "🌡️";
}

export async function fetchWeather() {
  const apiRaw = localStorage.getItem("weatherAPI") || "wttr.in";
  const lang = localStorage.getItem("language") || "tr";
  const api = apiRaw.replace("wttr.in", "wttr");
  let location = localStorage.getItem("weatherLocation") || "Istanbul";
  const widget = document.getElementById("weatherWidget");
  if (!widget || localStorage.getItem("showWeather") === "false") return;

  widget.innerHTML = `<span class="weather-loading">☁️ Yükleniyor...</span>`;

  try {
    if (!localStorage.getItem("weatherLocation")) {
      const locData = await getLocationByIP();
      location = locData.city;
      localStorage.setItem("weatherLocation", location);
    }

    let url, coords;
    const keys = {
      openweathermap: localStorage.getItem("openWeatherMapApiKey"),
      weatherapi: localStorage.getItem("weatherApiKey"),
      visualcrossing: localStorage.getItem("visualCrossingApiKey")
    };

    if (api === "wttr") {
      url = `https://wttr.in/${encodeURIComponent(location)}?format=j1&lang=${lang}`;
    } else if (api === "openweathermap") {
      if (!keys.openweathermap) throw new Error("OpenWeatherMap API anahtarı eksik");
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${keys.openweathermap}&units=metric&lang=${lang}`;
    } else if (api === "weatherapi") {
      if (!keys.weatherapi) throw new Error("WeatherAPI anahtarı eksik");
      url = `https://api.weatherapi.com/v1/current.json?key=${keys.weatherapi}&q=${encodeURIComponent(location)}&lang=${lang}`;
    } else if (api === "openmeteo") {
      coords = await getCoordsByCity(location) || await getLocationByIP();
      url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&hourly=temperature_2m&timezone=Europe/Istanbul`;
    } else if (api === "visualcrossing") {
      if (!keys.visualcrossing) throw new Error("VisualCrossing API anahtarı eksik");
      url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=metric&key=${keys.visualcrossing}&contentType=json&lang=${lang}`;
    } else {
      throw new Error(`Geçersiz API: ${apiRaw}`);
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Hata: ${response.status}`);

    const data = await response.json();
    let temp, condition, emoji = "🌡️";

    if (api === "wttr") {
      if (!data.current_condition?.[0]) throw new Error("wttr.in veri hatası");
      temp = data.current_condition[0].temp_C;
      condition = data.current_condition[0].weatherDesc[0].value;
      emoji = getWeatherEmoji(condition);
    } else if (api === "openweathermap") {
      if (!data.main || !data.weather?.[0]) throw new Error("OpenWeatherMap veri hatası");
      temp = Math.round(data.main.temp);
      condition = data.weather[0].description;
      emoji = getWeatherEmoji(condition);
    } else if (api === "weatherapi") {
      if (!data.current) throw new Error("WeatherAPI veri hatası");
      temp = Math.round(data.current.temp_c);
      condition = data.current.condition.text;
      emoji = getWeatherEmoji(condition);
    } else if (api === "openmeteo") {
      if (!data.current_weather) throw new Error("OpenMeteo veri hatası");
      temp = Math.round(data.current_weather.temperature);
      condition = getConditionText(data.current_weather.weathercode, lang);
      emoji = getWeatherEmojiFromCode(data.current_weather.weathercode);
    } else if (api === "visualcrossing") {
      const cc = data.currentConditions || data.current_conditions;
      if (!cc) throw new Error("VisualCrossing veri hatası");
      temp = Math.round(cc.temp);
      condition = cc.conditions || "Genel hava";
      emoji = getWeatherEmoji(condition);
    }

    widget.innerHTML = `<div class="weather-info"><span>${location}: ${temp}°C | ${emoji} ${condition}</span></div>`;
  } catch (error) {
    console.error("Hava durumu hatası:", error.message);
    widget.innerHTML = `<span class="weather-error">Alınamadı: ${error.message} 🚫</span>`;
  }
}

let weatherTimer;
export function startWeatherUpdate() {
  if (weatherTimer) clearInterval(weatherTimer);
  let intervalStr = localStorage.getItem("weatherUpdateInterval") || "0";
  let interval = parseInt(intervalStr, 10) || 0;
  fetchWeather();
  if (interval > 0) {
    weatherTimer = setInterval(fetchWeather, interval * 60 * 1000);
  }
}

// Storage değişikliği dinle (aynı sekmede ayar değişikliklerini yakala)
window.addEventListener('storage', (e) => {
  if (e.key === 'weatherLocation' || e.key === 'weatherAPI' || e.key === 'weatherUpdateInterval' || e.key === 'showWeather') {
    fetchWeather();
    startWeatherUpdate();
  }
});

// Ayar değişikliklerini yakalamak için custom event dinle (settings.js'den dispatch et)
window.addEventListener('settingsChanged', () => {
  fetchWeather();
  startWeatherUpdate();
});

document.addEventListener("DOMContentLoaded", () => {
  const weatherApiSelect = document.getElementById("weatherAPI");
  if (weatherApiSelect) {
    weatherApiSelect.addEventListener("change", (e) => {
      localStorage.setItem("weatherAPI", e.target.value);
      const api = e.target.value.replace("wttr.in", "wttr");
      const inputs = {
        openweathermap: "openWeatherMapKeyInput",
        weatherapi: "weatherApiKeyInput",
        visualcrossing: "visualCrossingKeyInput"
      };
      Object.entries(inputs).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle("active", api === key);
      });
      if (localStorage.getItem("showWeather") === "true" && localStorage.getItem("weatherLocation")?.trim()) {
        fetchWeather();
      }
    });
  }
  startWeatherUpdate();
});

// JS'te fetch5DayForecast fonksiyonunu güncelle ve openWeatherWidget'i değiştir
async function fetch5DayForecast() {
    const lang = localStorage.getItem("language") || "tr";
    const apiRaw = localStorage.getItem("weatherAPI") || "wttr.in";
    const location = localStorage.getItem("weatherLocation") || "Istanbul";
    const listEl = document.getElementById("forecastList");
    const popupLoc = document.getElementById("popupLocation");
    if (!listEl) return;

    listEl.innerHTML = '<div class="forecast-day"><span class="weather-loading">☁️ Yükleniyor...</span></div>';
    popupLoc.textContent = `${location} - 5 Günlük Tahmin`;

    try {
        const coords = await getCoordsByCity(location) || await getLocationByIP();

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max&timezone=Europe/Istanbul&forecast_days=6`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Tahmin alınamadı");

        const data = await response.json();
        const daily = data.daily;
        const dayNames = {
          tr: ["Paz", "Pzt", "Sal", "Çrş", "Prş", "Cum", "Cmt"],
          az: ["Bz", "BE", "ÇA", "ÇŞ", "CA", "CÜ", "ŞN"],
          tk: ["Yok", "Duş", "Siş", "Çar", "Pen", "Ann", "Şen"],
          kk: ["Жек", "Дүй", "Сей", "Сәр", "Бей", "Жұм", "Сен"],
          ky: ["Жек", "Дүй", "Шей", "Шар", "Бей", "Жум", "Иш"],
          uz: ["Yak", "Dush", "Sesh", "Chor", "Pays", "Jum", "Shan"],
          tt: ["Kün", "Düş", "Siş", "Çär", "Pen", "Cum", "Cöm"],
          ba: ["Kün", "Düş", "Siş", "Çör", "Pen", "Cum", "Çöm"],
          ug: ["يەك", "دۈ", "سەي", "چار", "پەي", "جۈ", "شەن"],
          sah: ["Бэ", "Бэ", "Оп", "Сэ", "Бэ", "Су", "Бэ"],
          cv: ["Puş", "Puş", "Ar", "Yup", "Pir", "Pyat", "Şăt"],
          en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
          jp: ["日", "月", "火", "水", "木", "金", "土"],
          zh: ["日", "一", "二", "三", "四", "五", "六"],
          ko: ["일", "월", "화", "수", "목", "금", "토"],
          de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
          fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
          ar: ["أحد", "اثن", "ثلاث", "أرب", "خميس", "جمعة", "سبت"],
          ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
          mn: ["Ням", "Дав", "Мяг", "Лха", "Пүр", "Баа", "Бяа"],
          he: ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"],
          hi: ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"],
          el: ["Κυρ", "Δευ", "Τρι", "Τετ", "Πέμ", "Παρ", "Σάβ"],
          it: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
          gag: ["Paz", "Pzt", "Sal", "Çrş", "Prş", "Cum", "Cmt"]
        };
        const days = dayNames[lang] || ["Pzt", "Sal", "Çrş", "Prş", "Cum", "Cmt", "Paz"];
        let html = "";

        for (let i = 1; i <= 5; i++) {
            const date = new Date(daily.time[i]);
            const dayName = days[date.getDay()];
            const dayStr = `${dayName} ${date.getDate()}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const maxTemp = Math.round(daily.temperature_2m_max[i]);
            const minTemp = Math.round(daily.temperature_2m_min[i]);
            const precip = daily.precipitation_probability_max[i];
            const code = daily.weathercode[i];
            const emoji = getWeatherEmojiFromCode(code);
            const cond = getConditionText(code, lang);

            html += `
                <div class="forecast-day">
                    <span class="forecast-icon">${emoji}</span>
                    <div class="forecast-details">
                        <span>${dayStr}</span>
                        <span>${minTemp}° / ${maxTemp}°</span>
                        <span>${precip}% ${cond}</span>
                    </div>
                </div>
            `;
        }

        listEl.innerHTML = html;
    } catch (error) {
        console.error("Tahmin hatası:", error);
        listEl.innerHTML = `<div class="forecast-day"><span class="weather-error">${error.message} 🚫</span></div>`;
    }
}

// Weather widget onclick'i güncelle (HTML'de onclick="openWeatherWidget()" var, JS'te tanımla)
window.openWeatherWidget = function() {
    const popup = document.getElementById("weatherPopup");
    const widget = document.getElementById("weatherWidget");
    if (popup.style.display === "block") {
        closeWeatherPopup();
    } else {
        const rect = widget.getBoundingClientRect();
        popup.style.top = `${rect.height + 5}px`;
        popup.style.left = '0';
        popup.style.display = "block";
        fetch5DayForecast();
    }
};

window.closeWeatherPopup = function() {
    document.getElementById("weatherPopup").style.display = "none";
};

// OpenMeteo weather code to emoji mapping
function getWeatherEmojiFromCode(code) {
  const emojiMap = {
    0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
    45: "🌫️", 48: "🌫️", 51: "🌦️", 53: "🌦️", 55: "🌧️",
    61: "🌧️", 63: "🌧️", 65: "🌧️", 71: "🌨️", 73: "🌨️", 75: "🌨️",
    80: "🌦️", 81: "🌦️", 82: "🌧️", 95: "⛈️", 96: "⛈️", 99: "⛈️"
  };
  return emojiMap[code] || "🌡️";
}

// Dışarı tıklamada kapat
document.addEventListener("click", (e) => {
    const popup = document.getElementById("weatherPopup");
    const widget = document.getElementById("weatherWidget");
    if (popup.style.display === "block" && !widget.contains(e.target) && !popup.contains(e.target)) {
        closeWeatherPopup();
    }
});
