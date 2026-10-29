"use client";

// Shared meal state for every page, so it survives moving between pages
// (it resets on a full page reload until a backend stores it):
// the items on the plate (empty until something is scanned or added), which one is
// selected, Today's Meals (items moved there with Add to Meal Plan), and the meals
// saved from Today's Meals to the History page this session (Save meal).
// Built on React context (no library).
// Used by SearchBar (adds items on page 1) and ScanPanel (shows and saves them).
import { createContext, useContext, useState } from "react";
import { detectedItems, foodInfo, defaultFoodInfo, portions } from "@/data/nutrition";

const MealContext = createContext(null);

// Read the shared state and actions from any client component
export function useMeals() {
  return useContext(MealContext);
}

// e.g. "2 pieces", "1 bowl"
export function formatQty(item) {
  return `${item.qty} ${item.qty === 1 ? item.unit : `${item.unit}s`}`;
}

// How much of one nutrient an item on the plate has, for its quantity and portion size
// (key is a foodInfo field such as "calories", "protein" or "sodium")
export function amountOf(item, key) {
  const info = foodInfo[item.name] || defaultFoodInfo;
  return info[key] * item.qty * portions[item.portion];
}

// Current time, e.g. "4:33 PM"
function timeNow() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function MealProvider({ children }) {
  const [plate, setPlate] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState([]);
  // Meals saved this session, in the same shape as the sample History meals
  const [historyMeals, setHistoryMeals] = useState([]);
  const [scanCount, setScanCount] = useState(0);

  // Add an item to the end of the plate (or raise its quantity if it's already there)
  // and select it, so the Menu page shows its info
  function addItem(item) {
    setPlate((current) =>
      current.some((i) => i.name === item.name)
        ? current.map((i) =>
            i.name === item.name
              ? { ...i, qty: i.qty + item.qty, image: item.image || i.image }
              : i
          )
        : [...current, { ...item, portion: "regular", mealTime: "Now", addedAt: timeNow() }]
    );
    setSelected(item.name);
  }

  // A food typed or chosen in the search bar is added as 1 serving
  function addFood(name) {
    addItem({ name, qty: 1, unit: "serving", image: null });
  }

  // Each scan/upload "finds" the next sample group of items (cycling through them);
  // the uploaded photo is kept as their image and the first one found is selected
  function addScanned(imageUrl) {
    const found = detectedItems[scanCount % detectedItems.length];
    setScanCount(scanCount + 1);
    found.forEach((item) => addItem({ ...item, image: imageUrl }));
    setSelected(found[0].name);
  }

  // − / + buttons; going below 1 removes the item from the plate
  function changeQty(name, change) {
    setPlate(
      plate
        .map((i) => (i.name === name ? { ...i, qty: i.qty + change } : i))
        .filter((i) => i.qty > 0)
    );
  }

  // Portion size dropdown in the card (small / regular / large)
  function setPortion(name, portion) {
    setPlate(plate.map((i) => (i.name === name ? { ...i, portion } : i)));
  }

  // Meal dropdown in the card (Now / Breakfast / Lunch / Dinner / Snack)
  function setMealTime(name, mealTime) {
    setPlate(plate.map((i) => (i.name === name ? { ...i, mealTime } : i)));
  }

  // Add to Meal Plan (in the card): move that one item from the plate into Today's Meals
  // (not into History yet; that happens with Save meal)
  function addToMealPlan(name) {
    const item = plate.find((i) => i.name === name);
    const now = new Date();
    setSaved([
      {
        id: now.getTime(),
        day: now.toLocaleDateString("en-GB", { weekday: "long" }),
        date: now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        time: timeNow(),
        items: [`${item.name} (${formatQty(item)})`],
        item,
        savedToHistory: false,
      },
      ...saved,
    ]);
    setPlate(plate.filter((i) => i.name !== name));
    // Nothing selected, so the info card is cleared for the next item
    setSelected(null);
  }

  // Save meal (in Today's Meals): add every entry not saved yet to the History page with
  // the current date and time, then mark them as saved. The meal type is the one picked in
  // the card, or for "Now" the one that fits the time of day
  function saveToHistory() {
    const now = new Date();
    const hour = now.getHours();
    const mealNow = hour < 11 ? "Breakfast" : hour < 16 ? "Lunch" : hour < 18 ? "Snack" : "Dinner";
    const toSave = saved.filter((entry) => !entry.savedToHistory).reverse();

    setHistoryMeals([
      ...historyMeals,
      ...toSave.map(({ item }, index) => ({
        id: `saved-${now.getTime()}-${index}`,
        name: foodInfo[item.name]?.fullName || item.name,
        type: item.mealTime === "Now" ? mealNow : item.mealTime,
        // Local date as "YYYY-MM-DD"
        date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
        time: timeNow(),
        image: item.image,
        kcal: Math.round(amountOf(item, "calories")),
        carbs: Math.round(amountOf(item, "carbs")),
        protein: Math.round(amountOf(item, "protein")),
        fat: Math.round(amountOf(item, "fat")),
      })),
    ]);
    setSaved(saved.map((entry) => ({ ...entry, savedToHistory: true })));
  }

  return (
    <MealContext.Provider
      value={{
        plate,
        selected,
        setSelected,
        saved,
        historyMeals,
        addFood,
        addScanned,
        changeQty,
        setPortion,
        setMealTime,
        addToMealPlan,
        saveToHistory,
      }}
    >
      {children}
    </MealContext.Provider>
  );
}
