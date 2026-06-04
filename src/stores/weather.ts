import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import useAppFetch from '~/services';

const WEATHER_CACHE_MS = 30 * 60 * 1000;
const defaultLatitude = 11.5564;
const defaultLongitude = 104.9282;

interface WeatherCurrent {
  temperature_2m?: number;
  weather_code?: number;
  apparent_temperature?: number;
  relative_humidity_2m?: number;
  wind_speed_10m?: number;
  cloud_cover?: number;
  precipitation?: number;
  is_day?: number;
}

interface WeatherResponse {
  current?: WeatherCurrent;
}

interface LocationResponse {
  city?: string;
  latitude?: number;
  longitude?: number;
}

export const weatherCodeMap: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export const useWeather = defineStore('weather', () => {
  const city = ref('Phnom Penh');
  const weatherCode = ref(0);
  const temperature = ref(30);
  const apparentTemperature = ref(30);
  const humidity = ref(0);
  const windSpeed = ref(0);
  const cloudCover = ref(0);
  const precipitation = ref(0);
  const isDay = ref(true);
  const lastWeatherFetchedAt = ref(0);
  const isWeatherLoading = ref(false);

  let weatherRequestInFlight: Promise<void> | null = null;

  const weatherDescription = computed(() => weatherCodeMap[weatherCode.value] ?? 'Unknown weather');
  const weatherEmoji = computed(() => {
    if ([0, 1].includes(weatherCode.value)) return '☀️';
    if ([2, 3].includes(weatherCode.value)) return '☁️';
    if ([45, 48].includes(weatherCode.value)) return '🌫️';
    if ([51, 53, 55, 56, 57].includes(weatherCode.value)) return '🌦️';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode.value)) return '🌧️';
    if ([71, 73, 75, 77, 85, 86].includes(weatherCode.value)) return '❄️';
    if ([95, 96, 99].includes(weatherCode.value)) return '⛈️';
    return '🌤️';
  });

  const shouldFetchWeather = () => {
    if (!lastWeatherFetchedAt.value) return true;
    return Date.now() - lastWeatherFetchedAt.value >= WEATHER_CACHE_MS;
  };

  const refreshWeather = async (force = false) => {
    if (!force && !shouldFetchWeather()) return;

    if (weatherRequestInFlight) {
      await weatherRequestInFlight;
      return;
    }

    weatherRequestInFlight = (async () => {
      isWeatherLoading.value = true;
      let latitude = defaultLatitude;
      let longitude = defaultLongitude;

      try {
        const location = await useAppFetch('https://ipapi.co/json/').json();
        const locationData = location.data.value as LocationResponse | null;

        if (locationData?.city) {
          city.value = locationData.city;
        }

        if (locationData?.latitude != null && locationData.longitude != null) {
          latitude = locationData.latitude;
          longitude = locationData.longitude;
        }
      } catch {
        // Keep current fallback values.
      }

      try {
        const weatherRequest = await useAppFetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,apparent_temperature,relative_humidity_2m,wind_speed_10m,cloud_cover,precipitation,is_day`,
        ).json();

        const weatherData = weatherRequest.data.value as WeatherResponse | null;

        if (weatherData?.current?.temperature_2m != null) {
          temperature.value = weatherData.current.temperature_2m;
        }

        if (weatherData?.current?.weather_code != null) {
          weatherCode.value = weatherData.current.weather_code;
        }

        if (weatherData?.current?.apparent_temperature != null) {
          apparentTemperature.value = weatherData.current.apparent_temperature;
        }

        if (weatherData?.current?.relative_humidity_2m != null) {
          humidity.value = weatherData.current.relative_humidity_2m;
        }

        if (weatherData?.current?.wind_speed_10m != null) {
          windSpeed.value = weatherData.current.wind_speed_10m;
        }

        if (weatherData?.current?.cloud_cover != null) {
          cloudCover.value = weatherData.current.cloud_cover;
        }

        if (weatherData?.current?.precipitation != null) {
          precipitation.value = weatherData.current.precipitation;
        }

        if (weatherData?.current?.is_day != null) {
          isDay.value = weatherData.current.is_day === 1;
        }

        lastWeatherFetchedAt.value = Date.now();
      } catch {
        // Keep previous weather values if request fails.
      } finally {
        isWeatherLoading.value = false;
        weatherRequestInFlight = null;
      }
    })();

    await weatherRequestInFlight;
  };

  const initWeather = async () => {
    await refreshWeather(false);
  };

  return {
    city,
    weatherCode,
    weatherDescription,
    weatherEmoji,
    temperature,
    apparentTemperature,
    humidity,
    windSpeed,
    cloudCover,
    precipitation,
    isDay,
    lastWeatherFetchedAt,
    isWeatherLoading,
    initWeather,
    refreshWeather,
  };
});
