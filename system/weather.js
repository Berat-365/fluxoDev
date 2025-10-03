export async function fetchWeather() {
  const api = localStorage.getItem("weatherAPI") || "wttr.in";
  const location = localStorage.getItem("weatherLocation") || "Istanbul";
  const widget = document.getElementById("weatherWidget");
  if (!widget || localStorage.getItem("showWeather") === "false") return;

  try {
    let url;
    const validApis = ["wttr.in", "openweathermap", "weatherapi", "openmeteo", "visualcrossing"];
    if (!validApis.includes(api)) {
      throw new Error(`Geçersiz hava durumu API'si: ${api}`);
    }

    if (api === "wttr.in") {
      url = `https://wttr.in/${encodeURIComponent(location)}?format=j1&lang=tr`;
    } else if (api === "openweathermap") {
      const key = localStorage.getItem("openWeatherMapApiKey");
      if (!key) throw new Error("OpenWeatherMap API anahtarı eksik");
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${key}&units=metric&lang=tr`;
    } else if (api === "weatherapi") {
      const key = localStorage.getItem("weatherApiKey");
      if (!key) throw new Error("WeatherAPI anahtarı eksik");
      url = `https://api.weatherapi.com/v1/current.json?key=${key}&q=${encodeURIComponent(location)}&lang=tr`;
    } else if (api === "openmeteo") {
      // OpenMeteo için konum koordinatlarını al (örnek: İstanbul)
      const coords = { lat: 41.0082, lon: 28.9784 }; // Sabit koordinatlar, dinamik çözüm için API kullanılabilir
      url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&timezone=Europe/Istanbul`;
    } else if (api === "visualcrossing") {
      const key = localStorage.getItem("visualCrossingApiKey");
      if (!key) throw new Error("VisualCrossing API anahtarı eksik");
      url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=metric&key=${key}&contentType=json`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Hava durumu alınamadı: ${response.statusText}`);

    const data = await response.json();
    let temp, condition, emoji;

    // Emoji eşleştirme fonksiyonu
    const getWeatherEmoji = (conditionText) => {
      const lowerCondition = conditionText.toLowerCase();
      if (lowerCondition.includes("yağmur") || lowerCondition.includes("rain")) return "🌧️";
      if (lowerCondition.includes("kar") || lowerCondition.includes("snow")) return "❄️";
      if (lowerCondition.includes("güneş") || lowerCondition.includes("sun")) return "☀️";
      if (lowerCondition.includes("bulut") || lowerCondition.includes("cloud")) return "☁️";
      if (lowerCondition.includes("fırtına") || lowerCondition.includes("storm")) return "⛈️";
      if (lowerCondition.includes("sis") || lowerCondition.includes("fog")) return "🌫️";
      return "🌡️"; // Varsayılan emoji
    };

    if (api === "wttr.in") {
      if (!data.current_condition?.[0]) throw new Error("wttr.in veri formatı hatalı");
      temp = data.current_condition[0].temp_C;
      condition = data.current_condition[0].weatherDesc[0].value;
      emoji = getWeatherEmoji(condition);
    } else if (api === "openweathermap") {
      if (!data.main || !data.weather?.[0]) throw new Error("OpenWeatherMap veri formatı hatalı");
      temp = Math.round(data.main.temp);
      condition = data.weather[0].description;
      emoji = getWeatherEmoji(condition);
    } else if (api === "weatherapi") {
      if (!data.current) throw new Error("WeatherAPI veri formatı hatalı");
      temp = Math.round(data.current.temp_c);
      condition = data.current.condition.text;
      emoji = getWeatherEmoji(condition);
    } else if (api === "openmeteo") {
      if (!data.current_weather) throw new Error("OpenMeteo veri formatı hatalı");
      temp = Math.round(data.current_weather.temperature);
      condition = "Genel hava durumu";
      emoji = "🌡️"; // Openmeteo için varsayılan emoji
    } else if (api === "visualcrossing") {
      if (!data.current_conditions) throw new Error("VisualCrossing veri formatı hatalı");
      temp = Math.round(data.current_conditions.temp);
      condition = data.current_conditions.conditions;
      emoji = getWeatherEmoji(condition);
    }

    widget.innerHTML = `
      <div class="weather-info">
        <span>${location}: ${temp}°C | ${emoji} ${condition}</span>
      </div>
    `;
  } catch (error) {
    console.error("Weather error:", error.message);
    widget.innerHTML = `<span class="weather-error">Hava durumu alınamadı: ${error.message} 🚫</span>`;
  }
}

export function startWeatherUpdate() {
  const interval = parseInt(localStorage.getItem("weatherUpdateInterval") || "0");
  if (interval === 0) return;

  setInterval(fetchWeather, interval * 60 * 1000);
  fetchWeather();
}

document.addEventListener("DOMContentLoaded", () => {
  const weatherApiSelect = document.getElementById("weatherAPI");
  if (weatherApiSelect) {
    weatherApiSelect.addEventListener("change", (e) => {
      localStorage.setItem("weatherAPI", e.target.value);
      const api = e.target.value;
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
});