import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';

type ProductCardProps = {
  title: string;
  description: string;
  image: string;
};

export const CARD_WIDTH = 160;
export const CARD_HEIGHT = 200;

export function ProductCard({ title, description, image }: ProductCardProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} contentFit="cover" />
      <View style={styles.textContainer}>
        <ThemedText type="small" numberOfLines={1}>
          {title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2} style={styles.desc}>
          {description}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
  },
  textContainer: {
    flex: 1,
    padding: Spacing.two,
    gap: 2,
  },
  desc: {
    fontSize: 12,
    lineHeight: 16,
  },
});
