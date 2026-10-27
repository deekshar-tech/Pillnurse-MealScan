// Hardcoded sample nutrition data for the Search suggestions and the Menu (Scan) page.

// Photo used for any food without an uploaded photo (also used by the History cards
// and the search suggestions)
export const defaultMealImage = "/assets/sample.webp";

// Daily values that turn an amount into the % shown in each donut
export const dailyValues = { calories: 2000, carbs: 275, protein: 50, fat: 78 };

// Portion size choices in the card: how much of a standard portion each one is
export const portions = { small: 0.75, regular: 1, large: 1.5 };

// Each known food: the complete dish name shown in the card (the short name is used
// in the plate list), its meal type, the weight of 1 unit in grams, and nutrition for
// 1 unit (kcal; g for macros, fiber, sugars, saturated fat; mg for the rest)
export const foodInfo = {
  "Grilled Chicken": {
    fullName: "Grilled Chicken Breast with Herb Seasoning",
    mealType: "Dinner",
    weight: 150,
    calories: 280, protein: 38, carbs: 0, fat: 13, fiber: 0, sugars: 0, satFat: 3.7,
    cholesterol: 125, sodium: 110, calcium: 22, iron: 1.6, potassium: 390, vitaminC: 0,
  },
  "Mashed Potatoes": {
    fullName: "Creamy Mashed Potatoes with Butter",
    mealType: "Dinner",
    weight: 200,
    calories: 180, protein: 4, carbs: 30, fat: 6, fiber: 3, sugars: 2.5, satFat: 3.8,
    cholesterol: 15, sodium: 330, calcium: 40, iron: 0.5, potassium: 600, vitaminC: 13,
  },
  "Green Beans": {
    fullName: "Sautéed Green Beans with Garlic",
    mealType: "Dinner",
    weight: 100,
    calories: 60, protein: 2, carbs: 8, fat: 3, fiber: 3.4, sugars: 3.3, satFat: 0.5,
    cholesterol: 0, sodium: 6, calcium: 37, iron: 1, potassium: 210, vitaminC: 12,
  },
  "Garden Salad": {
    fullName: "Garden Salad with Lemon Vinaigrette",
    mealType: "Lunch",
    weight: 150,
    calories: 90, protein: 3, carbs: 10, fat: 5, fiber: 2.5, sugars: 4, satFat: 0.7,
    cholesterol: 0, sodium: 120, calcium: 45, iron: 1, potassium: 300, vitaminC: 20,
  },
  "Garlic Bread": {
    fullName: "Toasted Garlic Bread with Herb Butter",
    mealType: "Snack",
    weight: 40,
    calories: 150, protein: 4, carbs: 20, fat: 6, fiber: 1, sugars: 1.5, satFat: 3,
    cholesterol: 10, sodium: 220, calcium: 30, iron: 1.2, potassium: 50, vitaminC: 0,
  },
  "Lemonade": {
    fullName: "Fresh Lemonade with Mint",
    mealType: "Snack",
    weight: 250,
    calories: 110, protein: 0, carbs: 28, fat: 0, fiber: 0.2, sugars: 26, satFat: 0,
    cholesterol: 0, sodium: 10, calcium: 10, iron: 0.1, potassium: 50, vitaminC: 12,
  },
};

// Estimate used for foods not listed above (e.g. ones typed or picked in the search bar)
export const defaultFoodInfo = {
  mealType: "Meal",
  weight: 150,
  calories: 200, protein: 6, carbs: 25, fat: 8, fiber: 2, sugars: 4, satFat: 2,
  cholesterol: 20, sodium: 300, calcium: 50, iron: 1.5, potassium: 250, vitaminC: 5,
};

// What each scan or upload on the Search page "detects", one group per scan (cycling):
// the first scan finds the plate in the sample photo, later scans add single extras.
// The plate starts empty, so the Menu page shows no food until something is added.
export const detectedItems = [
  [
    { name: "Grilled Chicken", qty: 1, unit: "piece" },
    { name: "Mashed Potatoes", qty: 1, unit: "bowl" },
    { name: "Green Beans", qty: 1, unit: "serving" },
  ],
  [{ name: "Garden Salad", qty: 1, unit: "bowl" }],
  [{ name: "Garlic Bread", qty: 2, unit: "piece" }],
  [{ name: "Lemonade", qty: 1, unit: "glass" }],
];
