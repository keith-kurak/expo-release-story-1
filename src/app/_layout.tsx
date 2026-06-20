import { Observe, ObserveRoot } from "expo-observe";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";

import { CriticalUpdateOverlay } from "@/components/critical-update-overlay";
import { UpdateAlert } from "@/components/update-alert";
import { useUpdateMonitor } from "@/hooks/use-update-monitor";

Observe.configure({
  integrations: { "expo-router": true },
  dispatchInDebug: true,
});

function RootLayout() {
  const colorScheme = useColorScheme();
  const { pendingNonCritical, downloadingCritical, criticalReloadPending, dismissUpdate, applyUpdate } =
    useUpdateMonitor();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" />
      </Stack>
      <UpdateAlert
        visible={pendingNonCritical}
        onDismiss={dismissUpdate}
        onUpdate={applyUpdate}
      />
      <CriticalUpdateOverlay visible={downloadingCritical} reloadPending={criticalReloadPending} />
    </ThemeProvider>
  );
}

export default ObserveRoot.wrap(RootLayout);
