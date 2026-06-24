export type WeatherIconKind =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunder';

export type HourlyForecast = {
  time: Date;
  temperatureF: number;
  weatherCode: number;
  icon: WeatherIconKind;
  label: string;
};

export type WeatherForecast = {
  latitude: number;
  longitude: number;
  hourly: HourlyForecast[];
};

/** WMO weather interpretation codes → icon bucket */
export function weatherCodeToIcon(code: number): WeatherIconKind {
  if (code === 0) return 'clear';
  if (code <= 3) return 'partly-cloudy';
  if (code <= 48) return 'fog';
  if (code <= 57) return 'drizzle';
  if (code <= 67) return 'rain';
  if (code <= 77) return 'snow';
  if (code <= 82) return 'rain';
  if (code <= 86) return 'snow';
  return 'thunder';
}

function formatHourLabel(date: Date, isNow: boolean): string {
  if (isNow) return 'Now';
  const h = date.getHours();
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}${suffix}`;
}

export async function fetchHourlyForecast(
  latitude: number,
  longitude: number
): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly: 'temperature_2m,weather_code',
    temperature_unit: 'fahrenheit',
    forecast_days: '2',
    timezone: 'auto',
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Weather request failed (${response.status})`);
  }

  const data = (await response.json()) as {
    hourly?: {
      time?: string[];
      temperature_2m?: number[];
      weather_code?: number[];
    };
  };

  const times = data.hourly?.time ?? [];
  const temps = data.hourly?.temperature_2m ?? [];
  const codes = data.hourly?.weather_code ?? [];

  const now = new Date();
  const currentHourStart = new Date(now);
  currentHourStart.setMinutes(0, 0, 0);

  const hourly: HourlyForecast[] = [];
  for (let i = 0; i < times.length; i++) {
    const time = new Date(times[i]);
    if (time < currentHourStart) continue;
    if (hourly.length >= 12) break;

    const isNow = hourly.length === 0;
    hourly.push({
      time,
      temperatureF: Math.round(temps[i] ?? 0),
      weatherCode: codes[i] ?? 0,
      icon: weatherCodeToIcon(codes[i] ?? 0),
      label: formatHourLabel(time, isNow),
    });
  }

  return { latitude, longitude, hourly };
}
