import * as Application from 'expo-application';
import { useObserve } from 'expo-observe';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useUpdateMonitor } from '@/hooks/use-update-monitor';

function InfoRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <View style={styles.row}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <ThemedText type="code">{value ?? '—'}</ThemedText>
    </View>
  );
}

export default function SettingsScreen() {
  const { markInteractive } = useObserve();
  const {
    checkForUpdate,
    isChecking,
    currentUpdateId,
    isEmbeddedLaunch,
    runtimeVersion,
    appConfigVersion,
    pendingNonCritical,
    downloadingCritical,
    criticalIndex,
    isUpdateAvailable,
    incomingVersion,
    incomingCriticalIndex,
  } = useUpdateMonitor();

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);

  const appVersion = Application.nativeApplicationVersion;
  const buildVersion = Application.nativeBuildVersion;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Settings</ThemedText>

          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              APP VERSION
            </ThemedText>
            <InfoRow label="Native version" value={appVersion ?? undefined} />
            <InfoRow label="Native build" value={buildVersion ?? undefined} />
            <InfoRow label="App config version" value={appConfigVersion} />
            <InfoRow label="Runtime version" value={runtimeVersion} />
            <InfoRow label="Critical index" value={String(criticalIndex)} />
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              UPDATE STATUS
            </ThemedText>
            <InfoRow label="Update ID" value={currentUpdateId ?? 'embedded'} />
            <InfoRow label="Embedded launch" value={isEmbeddedLaunch ? 'Yes' : 'No'} />
            <InfoRow
              label="Status"
              value={
                downloadingCritical
                  ? 'Downloading critical update...'
                  : pendingNonCritical
                    ? 'Update ready to install'
                    : isUpdateAvailable
                      ? 'Update found'
                      : 'Up to date'
              }
            />
            {isUpdateAvailable && (
              <>
                <InfoRow label="Incoming version" value={incomingVersion} />
                <InfoRow
                  label="Incoming critical index"
                  value={incomingCriticalIndex != null ? String(incomingCriticalIndex) : undefined}
                />
              </>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              isChecking && styles.buttonDisabled,
            ]}
            onPress={checkForUpdate}
            disabled={isChecking}
          >
            {isChecking ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Check for Updates</ThemedText>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  button: {
    backgroundColor: '#208AEF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
