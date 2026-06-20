export const brands = {
  "food-for-me": {
    name: "Food for Me",
    tint: { light: "#208AEF", dark: "#5AABF5" },
  },
  "food-for-my-pet": {
    name: "Food for My Pet",
    tint: { light: "#E8672A", dark: "#F09060" },
  },
} as const;

export type BrandKey = keyof typeof brands;

const key = (process.env.EXPO_PUBLIC_BRAND ?? "food-for-me") as BrandKey;

export const brand = brands[key] ?? brands["food-for-me"];
