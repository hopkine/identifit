import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Cloud, CloudFog, CloudRain, CloudSnow, Sun } from 'lucide-react-native';
import type { HourlyForecast, WeatherIconKind } from '@/lib/weatherApi';

type HomeWeatherWidgetProps = {
  status: 'loading' | 'ready' | 'error';
  hours: HourlyForecast[];
  selectedIndex: number;
  onSelectHour: (index: number) => void;
  onRetry?: () => void;
};

function WeatherGlyph({
  kind,
  size = 22,
}: {
  kind: WeatherIconKind;
  size?: number;
}) {
  const sunColor = '#F5B942';
  const cloudColor = '#8BA4C7';

  if (kind === 'clear') {
    return <Sun size={size} color={sunColor} fill={sunColor} strokeWidth={1.5} />;
  }

  if (kind === 'partly-cloudy') {
    return (
      <View style={styles.partlyCloudy}>
        <View style={styles.partlyCloudySun}>
          <Sun
            size={size - 5}
            color={sunColor}
            fill={sunColor}
            strokeWidth={1.5}
          />
        </View>
        <Cloud
          size={size}
          color={cloudColor}
          fill="rgba(255,255,255,0.85)"
          strokeWidth={1.5}
        />
      </View>
    );
  }

  if (kind === 'fog') {
    return <CloudFog size={size} color={cloudColor} strokeWidth={1.75} />;
  }
  if (kind === 'rain' || kind === 'drizzle' || kind === 'thunder') {
    return <CloudRain size={size} color={cloudColor} strokeWidth={1.75} />;
  }
  if (kind === 'snow') {
    return <CloudSnow size={size} color={cloudColor} strokeWidth={1.75} />;
  }

  return <Cloud size={size} color={cloudColor} strokeWidth={1.75} />;
}

export default function HomeWeatherWidget({
  status,
  hours,
  selectedIndex,
  onSelectHour,
  onRetry,
}: HomeWeatherWidgetProps) {
  if (status === 'loading') {
    return (
      <LinearGradient
        colors={['#D8E8FF', '#F4F8FF', '#FFFFFF']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.card}
      >
        <ActivityIndicator color="#4B5E7A" />
      </LinearGradient>
    );
  }

  if (status === 'error' || hours.length === 0) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onRetry}
        style={styles.cardFallback}
      >
        <Text style={styles.fallbackText}>Tap to load weather</Text>
      </TouchableOpacity>
    );
  }

  return (
    <LinearGradient
      colors={['#D8E8FF', '#F0F6FF', '#FFFFFF']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.card}
    >
      <View style={styles.row}>
        {hours.map((hour, index) => {
          const isSelected = index === selectedIndex;
          return (
            <TouchableOpacity
              key={hour.time.toISOString()}
              style={[styles.slot, isSelected && styles.slotSelected]}
              onPress={() => onSelectHour(index)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${hour.label}, ${hour.temperatureF} degrees`}
            >
              <Text style={[styles.slotLabel, isSelected && styles.slotLabelSelected]}>
                {hour.label}
              </Text>
              <WeatherGlyph kind={hour.icon} />
              <Text style={[styles.slotTemp, isSelected && styles.slotTempSelected]}>
                {hour.temperatureF}°
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 10,
    minHeight: 108,
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  cardFallback: {
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(216, 232, 255, 0.35)',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fallbackText: {
    fontSize: 13,
    color: 'rgba(235, 235, 245, 0.75)',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 12,
  },
  slotSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  slotLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(30, 41, 59, 0.72)',
    marginBottom: 8,
    letterSpacing: 0.15,
  },
  slotLabelSelected: {
    color: '#1E293B',
    fontWeight: '700',
  },
  slotTemp: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(30, 41, 59, 0.82)',
  },
  slotTempSelected: {
    color: '#0F172A',
    fontWeight: '700',
  },
  partlyCloudy: {
    width: 26,
    height: 22,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  partlyCloudySun: {
    position: 'absolute',
    top: -3,
    left: -4,
  },
});
