import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import {
  fetchHourlyForecast,
  type HourlyForecast,
  type WeatherForecast,
} from '@/lib/weatherApi';

const FALLBACK_COORDS = { latitude: 40.7128, longitude: -74.006 };

type WeatherStatus = 'loading' | 'ready' | 'error';

export function useWeather() {
  const [status, setStatus] = useState<WeatherStatus>('loading');
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadForecast = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      let latitude = FALLBACK_COORDS.latitude;
      let longitude = FALLBACK_COORDS.longitude;

      const existing = await Location.getForegroundPermissionsAsync();
      let permission = existing.status;

      if (permission === 'undetermined') {
        const requested = await Location.requestForegroundPermissionsAsync();
        permission = requested.status;
      }

      if (permission === 'granted') {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }

      const result = await fetchHourlyForecast(latitude, longitude);
      setForecast(result);
      setSelectedIndex(0);
      setStatus('ready');
    } catch (error) {
      console.error('Weather load failed:', error);
      setErrorMessage('Could not load weather');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void loadForecast();
  }, [loadForecast]);

  const selectHour = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const visibleHours: HourlyForecast[] =
    forecast?.hourly.slice(0, 7) ?? [];

  const selectedHour = visibleHours[selectedIndex] ?? visibleHours[0] ?? null;

  return {
    status,
    errorMessage,
    visibleHours,
    selectedHour,
    selectedIndex,
    selectHour,
    refresh: loadForecast,
  };
}
