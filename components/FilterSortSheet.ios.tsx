import { Modal, SafeAreaView, StyleSheet } from 'react-native';
import { useFonts, Caladea_700Bold } from '@expo-google-fonts/caladea';
import FilterSortSheetContent from '@/components/FilterSortSheetContent';
import type { FilterSortSheetProps } from '@/components/FilterSortSheet.types';
import { useFilterSortSheetState } from '@/components/useFilterSortSheetState';

export type { FilterState } from '@/components/FilterSortSheet.types';

export default function FilterSortSheet({
  visible,
  onClose,
  onApplyFilters,
  itemCountDefault = 7,
  itemCountNearMe = 4,
}: FilterSortSheetProps) {
  const [fontsLoaded] = useFonts({
    'Caladea-Bold': Caladea_700Bold,
  });
  const { filters, updateFilter, handleReset, handleApply } = useFilterSortSheetState({
    onClose,
    onApplyFilters,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <FilterSortSheetContent
          filters={filters}
          onUpdateFilter={updateFilter}
          onReset={handleReset}
          onApply={handleApply}
          itemCountDefault={itemCountDefault}
          itemCountNearMe={itemCountNearMe}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
