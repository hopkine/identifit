import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { LAYOUT } from '@/constants/layout';

export type HomeActionCard = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
};

type HomeActionCardsProps = {
  cards: HomeActionCard[];
};

const CARD_GAP = 10;
const CARD_COUNT = 3;

export default function HomeActionCards({ cards }: HomeActionCardsProps) {
  const { width: windowWidth } = useWindowDimensions();

  const contentWidth = Math.min(LAYOUT.contentMaxWidth, windowWidth);
  const horizontalInset = LAYOUT.paddingHorizontal * 2;
  const pageWidth = contentWidth - horizontalInset;
  const cardWidth =
    (pageWidth - CARD_GAP * (CARD_COUNT - 1)) / CARD_COUNT;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[styles.card, { width: cardWidth }]}
            onPress={card.onPress}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={card.label.replace('\n', ' ')}
          >
            <View style={styles.iconWrap}>{card.icon}</View>
            <Text style={styles.label}>{card.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  card: {
    backgroundColor: 'rgba(45, 45, 45, 0.55)',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 132,
  },
  iconWrap: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: 'rgba(235, 235, 245, 0.88)',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
