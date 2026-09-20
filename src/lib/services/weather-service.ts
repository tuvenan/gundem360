import { WeatherInfo } from "@/types/news";

interface CityCoords {
  name: string;
  lat: number;
  lon: number;
}

const SUPPORTED_CITIES: Record<string, CityCoords> = {
  istanbul: { name: "İstanbul", lat: 41.0082, lon: 28.9784 },
  ankara: { name: "Ankara", lat: 39.9334, lon: 32.8597 },
  izmir: { name: "İzmir", lat: 38.4192, lon: 27.1287 },
  antalya: { name: "Antalya", lat: 36.8969, lon: 30.7133 },
  bursa: { name: "Bursa", lat: 40.1885, lon: 29.061 },
  trabzon: { name: "Trabzon", lat: 41.0027, lon: 39.7178 },
};

function mapWmoCodeToCondition(code: number): string {
  switch (code) {
    case 0:
      return "Güneşli ve Açık";
    case 1:
      return "Çoğunlukla Açık";
    case 2:
      return "Parçalı Bulutlu";
    case 3:
      return "Çok Bulutlu";
    case 45:
    case 48:
      return "Sisli";
    case 51:
    case 53:
    case 55:
      return "Çiseleyen Yağmur";
    case 61:
    case 63:
      return "Yağmurlu";
    case 65:
      return "Kuvvetli Yağmurlu";
    case 71:
    case 73:
    case 75:
    case 77:
      return "Kar Yağışlı";
    case 80:
    case 81:
    case 82:
      return "Sağanak Yağışlı";
    case 85:
    case 86:
      return "Yoğun Kar Yağışlı";
    case 95:
    case 96:
    case 99:
      return "Gök Gürültülü Fırtına";
    default:
      return "Açık ve Güneşli";
  }
}

const cityWeatherCache = new Map<string, { weather: WeatherInfo; timestamp: number }>();
const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000; // 10 dakika

export const FALLBACK_WEATHER: WeatherInfo = {
  city: "İstanbul",
  degree: 21,
  condition: "Parçalı Bulutlu",
};

/**
 * Belirtilen şehir için canlı hava durumu verisi çeker.
 * @param cityKey 'istanbul', 'ankara', 'izmir' vb.
 */
export async function getLiveWeather(cityKey: string = "istanbul"): Promise<WeatherInfo> {
  const normalizedKey = cityKey.toLowerCase().trim();
  const cityData = SUPPORTED_CITIES[normalizedKey] || SUPPORTED_CITIES["istanbul"];

  const now = Date.now();
  const cached = cityWeatherCache.get(normalizedKey);
  if (cached && now - cached.timestamp < WEATHER_CACHE_TTL_MS) {
    return cached.weather;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${cityData.lat}&longitude=${cityData.lon}&current_weather=true`;
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 600 },
      headers: { "User-Agent": "Gundem360-NewsPortal/1.0" },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP ${res.status}`);
    }

    const data = await res.json();
    const currentWeather = data?.current_weather;

    if (!currentWeather || typeof currentWeather.temperature !== "number") {
      throw new Error("Invalid weather payload");
    }

    const weatherInfo: WeatherInfo = {
      city: cityData.name,
      degree: Math.round(currentWeather.temperature),
      condition: mapWmoCodeToCondition(currentWeather.weathercode ?? 0),
    };

    cityWeatherCache.set(normalizedKey, { weather: weatherInfo, timestamp: now });
    return weatherInfo;
  } catch (err) {
    console.error(`getLiveWeather for ${cityKey} failed, using fallback:`, err);
    return (
      cached?.weather || {
        city: cityData.name,
        degree: FALLBACK_WEATHER.degree,
        condition: FALLBACK_WEATHER.condition,
      }
    );
  }
}
