import {
  Modal,
  SafeAreaView,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { useFonts, Caladea_700Bold } from '@expo-google-fonts/caladea';
import FilterSortSheetContent from '@/components/FilterSortSheetContent';
import type { FilterSortSheetProps } from '@/components/FilterSortSheet.types';
import { useFilterSortSheetState } from '@/components/useFilterSortSheetState';

export type { FilterState } from '@/components/FilterSortSheet.types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

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
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.sheetContainer}>
          <SafeAreaView style={styles.safeArea}>
            <FilterSortSheetContent
              filters={filters}
              onUpdateFilter={updateFilter}
              onReset={handleReset}
              onApply={handleApply}
              itemCountDefault={itemCountDefault}
              itemCountNearMe={itemCountNearMe}
              showDragHandle
            />
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContainer: {
    height: SHEET_HEIGHT,
    backgroundColor: '#000000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
