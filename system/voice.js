import { translations } from './language.js';

export function initVoiceSearch() {
    document.getElementById("voiceSearchBtn").onclick = () => {
        const lang = localStorage.getItem("language") || "tr";
        if (!("webkitSpeechRecognition" in window)) {
            alert(translations[lang].voiceSearchNotSupported);
            return;
        }

        const modal = document.getElementById("voiceSearchModal");
        const transcriptDiv = document.getElementById("voiceTranscript");
        modal.style.display = "block";
        transcriptDiv.textContent = translations[lang].voiceSearch || "Söyledikleriniz burada görünecek...";

        const recognition = new webkitSpeechRecognition();
        const langMap = {
            "tr": "tr-TR",
            "en": "en-US",
            "es": "es-ES",
            "ru": "ru-RU",
            "jp": "ja-JP",
            "zh": "zh-CN",
            "ko": "ko-KR",
            "de": "de-DE",
            "fr": "fr-FR",
            "ar": "ar-SA",
            "az": "az-AZ",
            "tk": "tk-TM",
            "kk": "kk-KZ",
            "ky": "ky-KG",
            "uz": "uz-UZ",
            "tt": "tt-RU",
            "ba": "ba-RU",
            "ug": "ug-CN",
            "sah": "sah-RU",
            "gag": "gag-RU",
            "cv": "cv-RU",
            "he": "he-IL",
            "hi": "hi-IN",
            "it": "it-IT",
            "el": "el-GR",
            "mn": "mn-MN",

        };
        recognition.lang = langMap[lang] || "en-US";
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript = transcript.trim();
                    transcriptDiv.textContent = finalTranscript;
                    document.getElementById("searchInput").value = finalTranscript;
                } else {
                    interimTranscript += transcript;
                    transcriptDiv.textContent = interimTranscript.trim() || translations[lang].voiceSearch;
                }
            }
        };

        recognition.onerror = (event) => {
            console.error("Ses tanıma hatası:", event.error);
            transcriptDiv.textContent = `${translations[lang].voiceSearchNotSupported} (Hata: ${event.error})`;
            recognition.stop();
        };

        recognition.onend = () => {
            console.log("Ses tanıma sona erdi.");
            document.getElementById("voiceIcon").classList.remove("active");
        };

        document.getElementById("confirmVoiceBtn").onclick = () => {
            if (document.getElementById("searchInput").value.trim()) {
                search(); // Import
                modal.style.display = "none";
            }
        };

        const voiceIcon = document.getElementById("voiceIcon");
        recognition.onstart = () => {
            voiceIcon.classList.add("active");
        };

        document.getElementById("cancelVoiceBtn").onclick = () => {
            recognition.stop();
            modal.style.display = "none";
            transcriptDiv.textContent = translations[lang].voiceSearch || "Söyledikleriniz burada görünecek...";
        };

        setTimeout(() => {
            if (recognition && recognition.state === "recording") {
                recognition.stop();
                transcriptDiv.textContent = translations[lang].voiceSearchNotSupported + " (Zaman aşımı)";
                modal.style.display = "none";
            }
        }, 10000);
    };
}