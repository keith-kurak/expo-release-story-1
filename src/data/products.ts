import foodForMe from "./products.food-for-me.json";
import foodForMyPet from "./products.food-for-my-pet.json";

const datasets: Record<string, typeof foodForMe> = {
  "food-for-me": foodForMe,
  "food-for-my-pet": foodForMyPet,
};

const brand = process.env.EXPO_PUBLIC_BRAND ?? "food-for-me";

export const productsData = datasets[brand] ?? datasets["food-for-me"];
