import { Image } from "expo-image";
import { AppMetrics, useObserve } from "expo-observe";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function ProductDetailScreen() {
  const { markInteractive } = useObserve();
  const { id, title, description, image } = useLocalSearchParams<{
    id: string;
    title: string;
    description: string;
    image: string;
  }>();
  const theme = useTheme();

  useEffect(() => {
    AppMetrics.logEvent("product.viewed", {
      attributes: { productId: id, title },
    });
    markInteractive();
  }, [id, title, markInteractive]);

  return (
    <>
      <Stack.Screen options={{ title: title ?? "" }} />
      <ScrollView style={{ backgroundColor: theme.background }}>
        <ThemedView style={styles.container}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.image}
              contentFit="cover"
            />
          ) : null}
          <ThemedView style={styles.content}>
            <ThemedText type="subtitle">{title}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.description}>
              {description}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: "100%",
    aspectRatio: 4 / 3,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  description: {
    lineHeight: 22,
  },
});
