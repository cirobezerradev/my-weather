const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const elements = {
  form: document.querySelector("#search-form"),
  input: document.querySelector("#city-input"),
  locate: document.querySelector("#locate-button"),
  submit: document.querySelector(".search-button"),
  status: document.querySelector("#status-message"),
  content: document.querySelector("#weather-content"),
  city: document.querySelector("#city-name"),
  detail: document.querySelector("#location-detail"),
  localTime: document.querySelector("#local-time"),
  icon: document.querySelector("#current-icon"),
  temperature: document.querySelector("#current-temperature"),
  description: document.querySelector("#current-description"),
  feelsLike: document.querySelector("#feels-like"),
  wind: document.querySelector("#wind-speed"),
  humidity: document.querySelector("#humidity"),
  precipitation: document.querySelector("#precipitation"),
  forecast: document.querySelector("#forecast-list"),
};

const weatherTypes = [
  { codes: [0], label: "Céu limpo", icon: "sun", mood: "clear" },
  { codes: [1], label: "Predominantemente limpo", icon: "sun", mood: "clear" },
  { codes: [2], label: "Parcialmente nublado", icon: "cloud-sun", mood: "cloudy" },
  { codes: [3], label: "Nublado", icon: "cloud", mood: "cloudy" },
  { codes: [45, 48], label: "Neblina", icon: "fog", mood: "fog" },
  { codes: [51, 53, 55, 56, 57], label: "Garoa", icon: "drizzle", mood: "rain" },
  { codes: [61, 63, 65, 66, 67], label: "Chuva", icon: "rain", mood: "rain" },
  { codes: [71, 73, 75, 77, 85, 86], label: "Neve", icon: "snow", mood: "snow" },
  { codes: [80, 81, 82], label: "Pancadas de chuva", icon: "rain", mood: "rain" },
  { codes: [95, 96, 99], label: "Trovoadas", icon: "storm", mood: "storm" },
];

function getWeatherType(code, isDay = true) {
  const type = weatherTypes.find((item) => item.codes.includes(code)) ?? {
    label: "Condição variável",
    icon: "cloud",
    mood: "cloudy",
  };

  if (code === 0 && !isDay) {
    return { ...type, icon: "moon", mood: "night" };
  }
  return type;
}

function setIcon(element, name) {
  element.innerHTML = `<use href="#icon-${name}"></use>`;
}

function formatNumber(value) {
  return Math.round(value).toLocaleString("pt-BR");
}

function formatDate(dateString, timeZone, options) {
  const date = new Date(`${dateString}T12:00:00Z`);
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", ...options }).format(date);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Não foi possível consultar o serviço do tempo.");
  }
  return response.json();
}

async function findCity(name) {
  const params = new URLSearchParams({ name, count: "5", language: "pt", format: "json" });
  const result = await fetchJson(`${GEOCODING_URL}?${params}`);
  if (!result.results?.length) {
    throw new Error("Não encontramos essa cidade. Confira o nome e tente novamente.");
  }
  return result.results[0];
}

async function fetchForecast(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    forecast_days: "6",
    timezone: "auto",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
  });
  return fetchJson(`${FORECAST_URL}?${params}`);
}

function updateForecast(daily, timeZone) {
  const days = daily.time.slice(1, 6).map((date, index) => ({
    date,
    code: daily.weather_code[index + 1],
    low: daily.temperature_2m_min[index + 1],
    high: daily.temperature_2m_max[index + 1],
  }));
  const lowest = Math.min(...days.map((day) => day.low));
  const highest = Math.max(...days.map((day) => day.high));
  const span = Math.max(highest - lowest, 1);

  elements.forecast.replaceChildren();
  days.forEach((day, index) => {
    const weather = getWeatherType(day.code);
    const row = document.createElement("div");
    row.className = "forecast-day";
    row.innerHTML = `
      <span class="day-name${index === 0 ? " today" : ""}">${formatDate(day.date, timeZone, { weekday: "short" })}</span>
      <svg class="day-icon" aria-hidden="true"><use href="#icon-${weather.icon}"></use></svg>
      <span class="temperature-range">
        <span class="range-low">${formatNumber(day.low)}°</span>
        <span class="range-track"><span class="range-fill" style="left:${((day.low - lowest) / span) * 100}%;width:${Math.max(((day.high - day.low) / span) * 100, 5)}%"></span></span>
        <span class="range-high">${formatNumber(day.high)}°</span>
      </span>
      <span class="day-description">${weather.label}</span>
    `;
    elements.forecast.append(row);
  });
}

function updateWeather(city, forecast) {
  const current = forecast.current;
  const weather = getWeatherType(current.weather_code, Boolean(current.is_day));
  const administrativeArea = city.admin1 && city.admin1 !== city.name ? city.admin1 : "";
  const country = city.country ?? "";
  const detail = [administrativeArea, country].filter(Boolean).join(", ");

  elements.city.textContent = city.name;
  elements.detail.textContent = detail;
  elements.localTime.textContent = `Atualizado às ${current.time.slice(11, 16)} · ${formatDate(current.time.slice(0, 10), forecast.timezone, { dateStyle: "full" })}`;
  elements.temperature.innerHTML = `${formatNumber(current.temperature_2m)}<span>°</span>`;
  elements.description.textContent = weather.label;
  elements.feelsLike.textContent = `${formatNumber(current.apparent_temperature)}°`;
  elements.wind.innerHTML = `${formatNumber(current.wind_speed_10m)} <small>km/h</small>`;
  elements.humidity.innerHTML = `${formatNumber(current.relative_humidity_2m)}<small>%</small>`;
  elements.precipitation.innerHTML = `${Number(current.precipitation).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}<small>mm</small>`;
  setIcon(elements.icon, weather.icon);
  document.body.dataset.weather = current.is_day ? weather.mood : "night";
  updateForecast(forecast.daily, forecast.timezone);
}

async function loadCity(name) {
  const cityName = name.trim();
  if (!cityName) {
    elements.input.focus();
    elements.status.textContent = "Digite o nome de uma cidade para buscar.";
    return;
  }

  elements.status.textContent = "Buscando as condições do céu...";
  elements.content.setAttribute("aria-busy", "true");
  elements.submit.disabled = true;
  elements.locate.disabled = true;

  try {
    const city = await findCity(cityName);
    const forecast = await fetchForecast(city.latitude, city.longitude);
    updateWeather(city, forecast);
    elements.input.value = city.name;
    elements.status.textContent = "";
  } catch (error) {
    elements.status.textContent = error instanceof Error
      ? error.message
      : "Algo deu errado. Tente novamente em instantes.";
  } finally {
    elements.content.setAttribute("aria-busy", "false");
    elements.submit.disabled = false;
    elements.locate.disabled = false;
  }
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadCity(elements.input.value);
});

elements.locate.addEventListener("click", () => {
  if (!navigator.geolocation) {
    elements.status.textContent = "Seu navegador não oferece acesso à localização.";
    return;
  }

  elements.status.textContent = "Aguardando sua localização...";
  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    elements.content.setAttribute("aria-busy", "true");
    elements.submit.disabled = true;
    elements.locate.disabled = true;
    try {
      const forecast = await fetchForecast(coords.latitude, coords.longitude);
      const city = {
        name: "Sua localização",
        country: "",
        admin1: "",
      };
      updateWeather(city, forecast);
      elements.input.value = "";
      elements.status.textContent = "";
    } catch (error) {
      elements.status.textContent = error instanceof Error
        ? error.message
        : "Não foi possível consultar sua localização.";
    } finally {
      elements.content.setAttribute("aria-busy", "false");
      elements.submit.disabled = false;
      elements.locate.disabled = false;
    }
  }, () => {
    elements.status.textContent = "Não foi possível acessar sua localização. Você pode buscar uma cidade.";
  }, { enableHighAccuracy: false, timeout: 10000 });
});

loadCity("São Paulo");