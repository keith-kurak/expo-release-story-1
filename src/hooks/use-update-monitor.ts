import Constants from 'expo-constants';
import {
  useUpdates,
  checkForUpdateAsync,
  fetchUpdateAsync,
  reloadAsync,
} from 'expo-updates';
import type { ExpoUpdatesManifest } from 'expo-manifests';
import { useEffect, useRef, useCallback, useState } from 'react';
import { AppState } from 'react-native';

function getCriticalIndex(manifest: any): number {
  // For downloaded updates: manifest.extra.expoClient.extra.criticalIndex
  const fromManifest =
    (manifest as ExpoUpdatesManifest)?.extra?.expoClient?.extra?.criticalIndex;
  if (typeof fromManifest === 'number') return fromManifest;

  // For embedded launches: Constants.expoConfig.extra.criticalIndex
  const fromConstants = Constants.expoConfig?.extra?.criticalIndex;
  if (typeof fromConstants === 'number') return fromConstants;

  return 0;
}

export type UpdateMonitorState = {
  /** A non-critical update has been downloaded and is waiting for user confirmation to apply */
  pendingNonCritical: boolean;
  /** A critical update is being downloaded */
  downloadingCritical: boolean;
  /** A critical update is pending and about to reload */
  criticalReloadPending: boolean;
  /** Dismiss the non-critical update prompt */
  dismissUpdate: () => void;
  /** Apply the pending non-critical update */
  applyUpdate: () => void;
  /** Manually check for updates */
  checkForUpdate: () => void;
  /** Whether a check is currently in progress */
  isChecking: boolean;
  /** The current update ID */
  currentUpdateId: string | undefined;
  /** Whether the app is running an embedded bundle */
  isEmbeddedLaunch: boolean;
  /** The runtime version */
  runtimeVersion: string | undefined;
  /** The app config version (from Constants.expoConfig) */
  appConfigVersion: string | undefined;
  /** The current critical index */
  criticalIndex: number;
  /** Whether an update is available or pending */
  isUpdateAvailable: boolean;
  /** The incoming update's version */
  incomingVersion: string | undefined;
  /** The incoming update's critical index */
  incomingCriticalIndex: number | undefined;
};

export function useUpdateMonitor(): UpdateMonitorState {
  const updatesSystem = useUpdates();
  const {
    currentlyRunning,
    isUpdateAvailable,
    isUpdatePending,
    availableUpdate,
  } = updatesSystem;

  const [pendingNonCritical, setPendingNonCritical] = useState(false);
  const [downloadingCritical, setDownloadingCritical] = useState(false);
  const [criticalReloadPending, setCriticalReloadPending] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const isHandling = useRef(false);

  const isCritical = (() => {
    if (!availableUpdate?.manifest) return false;
    const currentIndex = getCriticalIndex(currentlyRunning.manifest);
    const availableIndex = getCriticalIndex(availableUpdate.manifest);
    return availableIndex > currentIndex;
  })();

  // Check for updates on foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkForUpdateAsync().catch(() => {});
      }
    });
    return () => subscription.remove();
  }, []);

  // Also check once on mount
  useEffect(() => {
    checkForUpdateAsync().catch(() => {});
  }, []);

  // Handle update available
  useEffect(() => {
    if (!isUpdateAvailable || isHandling.current) return;

    if (isCritical) {
      isHandling.current = true;
      setDownloadingCritical(true);
      fetchUpdateAsync().catch(() => {
        setDownloadingCritical(false);
        isHandling.current = false;
      });
    }
  }, [isUpdateAvailable, isCritical]);

  // Handle critical update downloaded — signal countdown before reload
  useEffect(() => {
    if (isUpdatePending && isCritical) {
      setCriticalReloadPending(true);
    }
  }, [isUpdatePending, isCritical]);

  // Handle non-critical update available — download in background, then prompt
  useEffect(() => {
    if (!isUpdateAvailable || isCritical || isHandling.current) return;
    isHandling.current = true;
    fetchUpdateAsync().catch(() => {
      isHandling.current = false;
    });
  }, [isUpdateAvailable, isCritical]);

  // Show prompt when non-critical update is downloaded
  useEffect(() => {
    if (isUpdatePending && !isCritical && !dismissed) {
      setPendingNonCritical(true);
    }
  }, [isUpdatePending, isCritical, dismissed]);

  const dismissUpdate = useCallback(() => {
    setPendingNonCritical(false);
    setDismissed(true);
  }, []);

  const applyUpdate = useCallback(() => {
    setPendingNonCritical(false);
    reloadAsync().catch(() => {});
  }, []);

  const checkForUpdate = useCallback(() => {
    setIsChecking(true);
    checkForUpdateAsync()
      .catch(() => {})
      .finally(() => setIsChecking(false));
  }, []);

  const runtimeVersion =
    currentlyRunning.runtimeVersion || Constants.expoConfig?.runtimeVersion;
  const appConfigVersion = Constants.expoConfig?.version;

  const availableManifest = availableUpdate?.manifest as ExpoUpdatesManifest | undefined;
  const incomingVersion = availableManifest?.extra?.expoClient?.version;
  const incomingCriticalIndex = availableManifest
    ? getCriticalIndex(availableManifest)
    : undefined;

  return {
    pendingNonCritical,
    downloadingCritical,
    criticalReloadPending,
    dismissUpdate,
    applyUpdate,
    checkForUpdate,
    isChecking,
    currentUpdateId: currentlyRunning.updateId,
    isEmbeddedLaunch: currentlyRunning.isEmbeddedLaunch,
    runtimeVersion: typeof runtimeVersion === 'string' ? runtimeVersion : undefined,
    appConfigVersion,
    criticalIndex: getCriticalIndex(currentlyRunning.manifest),
    isUpdateAvailable: isUpdateAvailable || isUpdatePending,
    incomingVersion,
    incomingCriticalIndex,
  };
}
