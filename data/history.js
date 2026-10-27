// Hardcoded sample meal history.

// "Today" for the sample data, used by the period filter on the History page
export const historyToday = "2026-10-26";

// ----- History page: one box per day (meals saved on the Menu page are added to these) -----

// Past meals, newest day first and in time order within a day: type, time and nutrients
export const pastMeals = [
  { id: 1, name: "Avocado Toast with Poached Egg", type: "Breakfast", date: "2026-10-26", time: "7:00 AM", kcal: 320, carbs: 30, protein: 14, fat: 18 },
  { id: 2, name: "Grilled Shrimp Tacos with Mango Salsa", type: "Lunch", date: "2026-10-26", time: "3:00 PM", kcal: 400, carbs: 45, protein: 28, fat: 12 },
  { id: 4, name: "Greek Yogurt with Berries", type: "Snack", date: "2026-10-25", time: "11:00 AM", kcal: 180, carbs: 22, protein: 12, fat: 4 },
  { id: 3, name: "Baked Chicken Breast with Quinoa and Kale", type: "Dinner", date: "2026-10-25", time: "8:45 PM", kcal: 480, carbs: 50, protein: 40, fat: 15 },
  { id: 5, name: "Masala Dosa with Coconut Chutney", type: "Breakfast", date: "2026-10-24", time: "7:50 AM", kcal: 390, carbs: 52, protein: 9, fat: 16 },
  { id: 6, name: "Paneer Tikka with Mint Chutney", type: "Dinner", date: "2026-10-24", time: "9:10 PM", kcal: 420, carbs: 18, protein: 26, fat: 26 },
  { id: 7, name: "Lemon Rice with Medu Vada", type: "Lunch", date: "2026-10-22", time: "1:15 PM", kcal: 510, carbs: 78, protein: 11, fat: 17 },
  { id: 8, name: "Fresh Fruit Salad", type: "Snack", date: "2026-10-20", time: "5:00 PM", kcal: 150, carbs: 36, protein: 2, fat: 1 },
  { id: 9, name: "Chicken Biryani with Raita", type: "Lunch", date: "2026-10-15", time: "2:00 PM", kcal: 620, carbs: 70, protein: 32, fat: 22 },
];

