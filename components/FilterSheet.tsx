import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  SafeAreaView,
} from 'react-native';
import { X, Filter } from 'lucide-react-native';
import { FilterOptions } from '@/types/occasion';
import { weatherConditions } from '@/data/occasions';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onUpdateFilter: <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => void;
  onClearFilters: () => void;
}

export default function FilterSheet({
  visible,
  onClose,
  filters,
  onUpdateFilter,
  onClearFilters,
}: FilterSheetProps) {
  const temperatureOptions = [
    { id: 'cold', name: 'Cold', range: '< 50°F', icon: '🧊' },
    { id: 'mild', name: 'Mild', range: '50-70°F', icon: '🌤️' },
    { id: 'warm', name: 'Warm', range: '70-80°F', icon: '☀️' },
    { id: 'hot', name: 'Hot', range: '> 80°F', icon: '🔥' },
  ];

  const formalityOptions = [
    { id: 'casual', name: 'Casual', description: 'Relaxed, everyday wear' },
    { id: 'semi-formal', name: 'Semi-Formal', description: 'Business casual, smart casual' },
    { id: 'formal', name: 'Formal', description: 'Dressy, elegant occasions' },
  ];

  const durationOptions = [
    { id: 'short', name: 'Short', description: '1-3 hours' },
    { id: 'medium', name: 'Medium', description: '3-6 hours' },
    { id: 'long', name: 'Long', description: '6+ hours' },
  ];

  const timeOfDayOptions = [
    { id: 'morning', name: 'Morning', description: '6AM - 12PM' },
    { id: 'afternoon', name: 'Afternoon', description: '12PM - 6PM' },
    { id: 'evening', name: 'Evening', description: '6PM - 10PM' },
    { id: 'night', name: 'Night', description: '10PM+' },
  ];

  const hasActiveFilters = Object.values(filters).some(value => value !== null);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Filter size={24} color="#C0D1FF" />
            <Text style={styles.headerTitle}>Filters</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Weather Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weather</Text>
            <View style={styles.optionsGrid}>
              {weatherConditions.map((weather) => (
                <TouchableOpacity
                  key={weather.id}
                  style={[
                    styles.weatherOption,
                    filters.weather === weather.id && styles.selectedOption,
                  ]}
                  onPress={() => onUpdateFilter('weather', 
                    filters.weather === weather.id ? null : weather.id
                  )}
                >
                  <Text style={styles.weatherIcon}>{weather.icon}</Text>
                  <Text style={[
                    styles.optionText,
                    filters.weather === weather.id && styles.selectedOptionText,
                  ]}>
                    {weather.name}
                  </Text>
                  <Text style={[
                    styles.temperatureText,
                    filters.weather === weather.id && styles.selectedTemperatureText,
                  ]}>
                    {weather.temperature}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Temperature Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Temperature Range</Text>
            <View style={styles.optionsRow}>
              {temperatureOptions.map((temp) => (
                <TouchableOpacity
                  key={temp.id}
                  style={[
                    styles.tempOption,
                    filters.temperature === temp.id && styles.selectedOption,
                  ]}
                  onPress={() => onUpdateFilter('temperature', 
                    filters.temperature === temp.id ? null : temp.id as any
                  )}
                >
                  <Text style={styles.tempIcon}>{temp.icon}</Text>
                  <Text style={[
                    styles.optionText,
                    filters.temperature === temp.id && styles.selectedOptionText,
                  ]}>
                    {temp.name}
                  </Text>
                  <Text style={[
                    styles.rangeText,
                    filters.temperature === temp.id && styles.selectedRangeText,
                  ]}>
                    {temp.range}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Formality Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dress Code</Text>
            <View style={styles.optionsColumn}>
              {formalityOptions.map((formality) => (
                <TouchableOpacity
                  key={formality.id}
                  style={[
                    styles.formalityOption,
                    filters.formality === formality.id && styles.selectedOption,
                  ]}
                  onPress={() => onUpdateFilter('formality', 
                    filters.formality === formality.id ? null : formality.id as any
                  )}
                >
                  <Text style={[
                    styles.optionTitle,
                    filters.formality === formality.id && styles.selectedOptionText,
                  ]}>
                    {formality.name}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    filters.formality === formality.id && styles.selectedDescriptionText,
                  ]}>
                    {formality.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Duration Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Duration</Text>
            <View style={styles.optionsRow}>
              {durationOptions.map((duration) => (
                <TouchableOpacity
                  key={duration.id}
                  style={[
                    styles.durationOption,
                    filters.duration === duration.id && styles.selectedOption,
                  ]}
                  onPress={() => onUpdateFilter('duration', 
                    filters.duration === duration.id ? null : duration.id as any
                  )}
                >
                  <Text style={[
                    styles.optionText,
                    filters.duration === duration.id && styles.selectedOptionText,
                  ]}>
                    {duration.name}
                  </Text>
                  <Text style={[
                    styles.durationDescription,
                    filters.duration === duration.id && styles.selectedDescriptionText,
                  ]}>
                    {duration.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time of Day Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time of Day</Text>
            <View style={styles.optionsRow}>
              {timeOfDayOptions.map((time) => (
                <TouchableOpacity
                  key={time.id}
                  style={[
                    styles.timeOption,
                    filters.timeOfDay === time.id && styles.selectedOption,
                  ]}
                  onPress={() => onUpdateFilter('timeOfDay', 
                    filters.timeOfDay === time.id ? null : time.id as any
                  )}
                >
                  <Text style={[
                    styles.optionText,
                    filters.timeOfDay === time.id && styles.selectedOptionText,
                  ]}>
                    {time.name}
                  </Text>
                  <Text style={[
                    styles.timeDescription,
                    filters.timeOfDay === time.id && styles.selectedDescriptionText,
                  ]}>
                    {time.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {hasActiveFilters && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={onClearFilters}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.applyButton}
            onPress={onClose}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Caladea-Bold',
    color: '#C0D1FF',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Caladea-Regular',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionsColumn: {
    gap: 12,
  },
  weatherOption: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  tempOption: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  formalityOption: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  durationOption: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  timeOption: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  selectedOption: {
    backgroundColor: '#A8B3FF',
    borderColor: '#A8B3FF',
  },
  weatherIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  tempIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Default',
    fontWeight: '500',
    color: '#C0D1FF',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#000000',
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Default',
    fontWeight: '600',
    color: '#C0D1FF',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    fontFamily: 'Default',
    color: '#9CA3AF',
    lineHeight: 16,
  },
  selectedDescriptionText: {
    color: '#4A4A4C',
  },
  temperatureText: {
    fontSize: 12,
    fontFamily: 'Default',
    color: '#9CA3AF',
    marginTop: 4,
  },
  selectedTemperatureText: {
    color: '#4A4A4C',
  },
  rangeText: {
    fontSize: 11,
    fontFamily: 'Default',
    color: '#9CA3AF',
    marginTop: 4,
  },
  selectedRangeText: {
    color: '#4A4A4C',
  },
  durationDescription: {
    fontSize: 11,
    fontFamily: 'Default',
    color: '#9CA3AF',
    marginTop: 4,
  },
  timeDescription: {
    fontSize: 11,
    fontFamily: 'Default',
    color: '#9CA3AF',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  clearButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4A4A4C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontFamily: 'Default',
    fontWeight: '500',
    color: '#9CA3AF',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#A8B3FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Default',
    fontWeight: '600',
    color: '#000000',
  },
});