export interface FilterSortSheetProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  /** Result counts for the primary button label (grid size when near me on vs off) */
  itemCountDefault?: number;
  itemCountNearMe?: number;
}

export interface FilterState {
  season: 'spring' | 'summer' | 'fall' | 'winter' | null;
  bodyType: 'hourglass' | 'triangle' | 'rectangle' | 'oval' | 'heart' | null;
  showNearMe: boolean;
  comfortability: number;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  season: null,
  bodyType: null,
  showNearMe: false,
  comfortability: 0.5,
};
