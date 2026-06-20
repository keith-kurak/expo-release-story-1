const brands = {
  "food-for-me": {
    name: "Release Story 1",
    slug: "expo-release-story-1",
    scheme: "releasestory1",
    bundleIdentifier: "com.keith-kurak.release-story-1",
    package: "com.keithkurak.releasestory1",
    assets: "./assets/brands/food-for-me",
    easProjectId: "99fffa03-c324-4031-842a-146c10a18374",
  },
  "food-for-my-pet": {
    name: "Food for My Pet",
    slug: "food-for-my-pet",
    scheme: "foodformypet",
    bundleIdentifier: "com.keith-kurak.food-for-my-pet",
    package: "com.keithkurak.foodformypet",
    assets: "./assets/brands/food-for-my-pet",
    easProjectId: "7b29b5e4-1ac9-41b8-b9d9-09e59f05a146",
  },
};

const brand = process.env.EXPO_PUBLIC_BRAND || "food-for-me";
const brandConfig = brands[brand] ?? brands["food-for-me"];

/** Derive runtime version from major.minor (patch is for OTA updates). */
function runtimeVersion(version) {
  const [major, minor] = version.split(".");
  return `${major}.${minor}.0`;
}

const version = process.env.APP_VERSION || undefined;
const criticalIndex = process.env.CRITICAL_INDEX
  ? parseInt(process.env.CRITICAL_INDEX, 10)
  : undefined;
const isDev = process.env.IS_DEV === "true";

export default ({ config }) => ({
  ...config,
  ...(version && { version }),
  name: isDev ? `Dev: ${brandConfig.name}` : brandConfig.name,
  slug: brandConfig.slug,
  scheme: isDev ? `${brandConfig.scheme}-dev` : brandConfig.scheme,
  icon: `${brandConfig.assets}/icon.png`,
  ios: {
    icon: `${brandConfig.assets}/expo.icon`,
    bundleIdentifier: isDev
      ? `${brandConfig.bundleIdentifier}.dev`
      : brandConfig.bundleIdentifier,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: isDev ? `${brandConfig.package}.dev` : brandConfig.package,
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: `${brandConfig.assets}/android-icon-foreground.png`,
      backgroundImage: `${brandConfig.assets}/android-icon-background.png`,
      monochromeImage: `${brandConfig.assets}/android-icon-monochrome.png`,
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    ...config.web,
    favicon: `${brandConfig.assets}/favicon.png`,
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#208AEF",
        android: {
          image: `${brandConfig.assets}/splash-icon.png`,
          imageWidth: 76,
        },
      },
    ],
    [
      "expo-dev-client",
      {
        addGeneratedScheme: isDev,
      },
    ],
  ],
  extra: {
    ...config.extra,
    ...(criticalIndex != null && { criticalIndex }),
    eas: {
      projectId: brandConfig.easProjectId,
    },
  },
  runtimeVersion: runtimeVersion(version || config.version),
  updates: {
    ...config.updates,
    url: `https://u.expo.dev/${brandConfig.easProjectId}`,
  },
});
