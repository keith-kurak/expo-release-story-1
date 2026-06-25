# Release Story

A demo Expo app showcasing production release workflows with EAS.

## Release model

This project uses trunk-based development with release branches. Releases are tracked on branches named `release-x.y.0`. The patch version distinguishes native builds from OTA updates:

- `1.2.0` — native/store build
- `1.2.1`, `1.2.2`, ... — OTA updates to that build

A flag in `app.json` (`expo.extra.isReleased`) controls which workflow path runs:

- **`isReleased: false`** — the app hasn't shipped yet, so push native builds to the stores
- **`isReleased: true`** — the app is live, so publish OTA updates

Both workflows trigger on pushes to `release-*.*.0` branches. Only one path runs per push, based on the flag.

### Note about isReleased flag

The `isReleased` flag is a contrivance in order to make it easy to demonstrate the workflow. Realisticially, we would query some other source to determine if a build was actually "released"- for instance status in App Store Connect. However, even this probably isn't sufficient. You may want to consider code "released" once it's waiting for review, for instance. 

## Workflows

### Production build (`.eas/workflows/production-build.yaml`)

Runs when `isReleased` is `false`. Builds and submits native binaries.

```
check_release ─→ fingerprint ─→ get_android_build ─→ build_android ──→ submit_android
                               │                   └→ repack_android ─┘
                               └→ get_ios_build ───→ build_ios ──→ submit_ios
                                                   └→ repack_ios
```

1. **check_release** — reads `isReleased` from `app.json`; gates the rest of the workflow
2. **fingerprint** — computes native fingerprints for both platforms
3. **get_android_build / get_ios_build** — checks if a build already exists for this fingerprint and runtime version
4. **build or repack** — if no existing build, runs a full build; if one exists, repacks it with the current JS bundle
5. **submit_ios** — submits the iOS build to the App Store
6. **submit_android** — placeholder (Google Play service account not yet configured)

If `isReleased` is `true`, the workflow shows a "skipped" message instead.

### Production update (`.eas/workflows/production-update.yaml`)

Runs when `isReleased` is `true`. Publishes an OTA update after verifying build compatibility and running a smoke test.

```
check_release ─→ fingerprint ─→ get_android_build ──→ verify_builds ──→ smoke_test ──→ resolve_version ──→ publish_update
                               ├→ get_ios_build ─────┘                  ↑
                               ├→ get_ios_simulator_build ──────────────┤
                               └→ build_ios_simulator ──────────────────┘
```

1. **check_release** — reads `isReleased` from `app.json`; gates the rest of the workflow
2. **fingerprint** — computes native fingerprints
3. **get_android_build / get_ios_build** — finds existing store builds matching the fingerprint and runtime version
4. **verify_builds** — fails the workflow if either platform build is missing (native code changed and needs a new build first)
5. **get_ios_simulator_build / build_ios_simulator** — finds or creates a simulator build for testing
6. **smoke_test** — runs a Maestro test against the simulator build
7. **resolve_version** — queries existing updates on the `production` branch, finds the latest patch version for this major.minor, and increments it
8. **publish_update** — publishes the OTA update to the `production` channel with the resolved version as the message

If `isReleased` is `false`, the workflow shows a "skipped" message instead.

## Version resolution

The update version is auto-incremented. For branch `release-1.2.0`:

- Queries `eas update:list --branch production` for existing updates
- Finds the highest patch matching `1.2.*` (e.g., `1.2.3`)
- Publishes the next patch (`1.2.4`)
- Falls back to `1.2.1` if no updates exist yet

## Maestro smoke test

A minimal Maestro test (`maestro/smoke-test.yaml`) launches the app and waits for animations to finish. This gates OTA updates — the update won't publish if the app can't start.
