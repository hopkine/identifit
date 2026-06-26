import { useState } from 'react';
import {
  DEFAULT_FILTER_STATE,
  type FilterSortSheetProps,
  type FilterState,
} from '@/components/FilterSortSheet.types';

export function useFilterSortSheetState({
  onClose,
  onApplyFilters,
}: Pick<FilterSortSheetProps, 'onClose' | 'onApplyFilters'>) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTER_STATE);
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  return {
    filters,
    updateFilter,
    handleReset,
    handleApply,
  };
}
