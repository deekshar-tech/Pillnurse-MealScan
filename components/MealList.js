"use client";

// Meal history on the History page: title with a 7 / 30 / 60 Day filter, meal-type tabs
// with "Sort by", then one box per day.
// Each box holds one day's complete meal info and can be minimised / expanded by
// clicking its date row (newest starts open): the date and the day's totals, then
// every meal that day (photo, type, time, name and nutrient chips).
// Meals saved on the Menu page (Add to Meal Plan / Save meal) show up here too.
// Props: titleTag → heading element for "History" ("h1" on the History page).
import { useState } from "react";
import Image from "next/image";
import { useMeals } from "@/components/MealProvider";
import { pastMeals, historyToday } from "@/data/history";
import { defaultMealImage } from "@/data/nutrition";

// Period filter options: show meals less than this many days before "today"
const periods = [
  { label: "7 Day", days: 7 },
  { label: "30 Day", days: 30 },
  { label: "60 Day", days: 60 },
];

const mealTypes = ["All", "Breakfast", "Lunch", "Snack", "Dinner"];

// "Sort by" options: Newest puts the latest day first, the others sort days by their totals
const sortOptions = [
  { label: "Newest", key: null },
  { label: "Calories", key: "kcal" },
  { label: "Protein", key: "protein" },
];

// Totals shown at the top of each day box
const totalChips = [
  { key: "kcal", unit: " kcal" },
  { key: "carbs", unit: "g carbs" },
  { key: "protein", unit: "g protein" },
  { key: "fat", unit: "g fats" },
];

// Whole days between a "YYYY-MM-DD" date and the sample "today"
function daysAgo(date) {
  return (new Date(historyToday) - new Date(date)) / 86400000;
}

// "2026-10-26" → "Monday 26 Oct"
function dayLabel(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

// Group meals by date (keeping their order) and add each day's totals
function groupByDay(meals) {
  const days = [];
  for (const meal of meals) {
    let day = days.find((d) => d.date === meal.date);
    if (!day) {
      day = { date: meal.date, meals: [], kcal: 0, carbs: 0, protein: 0, fat: 0 };
      days.push(day);
    }
    day.meals.push(meal);
    for (const chip of totalChips) {
      day[chip.key] += meal[chip.key];
    }
  }
  return days;
}

export default function MealList({ titleTag: Title = "h2" }) {
  const [period, setPeriod] = useState(periods[0]);
  const [type, setType] = useState("All");
  const [sort, setSort] = useState(sortOptions[0]);
  const { historyMeals } = useMeals();

  // Sample meals plus the ones saved this session (added after them, so within a day
  // they come after the earlier sample meals)
  const days = groupByDay(
    [...pastMeals, ...historyMeals]
      .filter((meal) => daysAgo(meal.date) < period.days)
      .filter((meal) => type === "All" || meal.type === type)
  );
  if (sort.key) {
    days.sort((a, b) => b[sort.key] - a[sort.key]);
  } else {
    days.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }

  return (
    <section>
      {/* Title on the left, period filter on the right */}
      <div className="meal-list-head">
        <Title className="page-title">History</Title>
        <div className="meal-list-tools">
          <select
            className="select"
            aria-label="Filter by period"
            value={period.label}
            onChange={(e) => setPeriod(periods.find((p) => p.label === e.target.value))}
          >
            {periods.map((p) => (
              <option key={p.label}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Meal-type tabs on the left, Sort by on the right */}
      <div className="meal-list-bar">
        <div className="type-tabs">
          {mealTypes.map((t) => (
            <button
              key={t}
              type="button"
              className={t === type ? "type-tab active" : "type-tab"}
              aria-pressed={t === type}
              onClick={() => setType(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <label className="sort-by">
          Sort by:
          <select
            className="select"
            value={sort.label}
            onChange={(e) => setSort(sortOptions.find((s) => s.label === e.target.value))}
          >
            {sortOptions.map((s) => (
              <option key={s.label}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>

      {days.length > 0 ? (
        <ul className="day-boxes">
          {days.map((day, index) => (
            <li key={day.date}>
              {/* Collapsible day: click the date row to minimise / expand (newest starts open) */}
              <details className="day-box" open={index === 0}>
                <summary className="day-box-head">
                  <h3 className="day-box-title">{dayLabel(day.date)}</h3>
                  <span className="nutrient-chips">
                    {totalChips.map((chip) => (
                      <span key={chip.key} className="chip">
                        <strong>{day[chip.key]}</strong>
                        {chip.unit}
                      </span>
                    ))}
                  </span>
                  <svg className="chevron" viewBox="0 0 24 24" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>

                {/* Every meal that day */}
                <ul className="day-meals">
                  {day.meals.map((meal) => (
                    <li key={meal.id} className="meal-card">
                      {/* The uploaded photo for saved meals, otherwise the default photo */}
                      {meal.image ? (
                        <img className="meal-card-image" src={meal.image} alt={meal.name} />
                      ) : (
                        <Image
                          className="meal-card-image"
                          src={defaultMealImage}
                          alt={meal.name}
                          width={840}
                          height={1200}
                        />
                      )}

                      <div className="meal-card-body">
                        <p className="meal-card-tags">
                          <span className="meal-type">{meal.type}</span>
                          <span className="chip">{meal.time}</span>
                        </p>
                        <h4 className="meal-card-name">{meal.name}</h4>
                        <p className="nutrient-chips">
                          {totalChips.map((chip) => (
                            <span key={chip.key} className="chip">
                              <strong>{meal[chip.key]}</strong>
                              {chip.unit}
                            </span>
                          ))}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      ) : (
        <p className="history-empty">No meals match these filters.</p>
      )}
    </section>
  );
}
