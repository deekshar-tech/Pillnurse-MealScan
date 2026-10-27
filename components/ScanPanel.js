"use client";

// Interactive body of the Menu page (route /scan): the same search bar as the first page
// (to add the next item from here), the Menu box, an "AI Analysis & Summary" of the plate
// below it, and Today's Meals on the right. After Add Food Item the info card is cleared;
// any other items still on the plate stay listed to pick from.
// The plate is empty until a photo is scanned or a food is added on page 1.
// Menu box: title with Add Menu (back to page 1 to add more), then — when more than one
// item is on the plate — a list of the items (name and − qty +); clicking one shows its info in the card
// below, laid out like a food-database entry: photo, full name, meal type and time added,
// weight / quantity / portion chips, Quantity and Portion size controls, a collapsible
// "See all nutrients" table and Add Food Item, plus nutrient donuts.
// The plate and the selected item come from MealProvider, so items added on page 1
// show up here after the ones already on the plate (and the new one is selected).
// Add Food Item (in the card) moves that item from the plate into Today's Meals only;
// Save meal (at the bottom of Today's Meals) saves the entries not saved yet to the
// History page with the current date and time, and marks them "Saved".
// Clicking a Today's Meals entry shows that item in the card just to review it: the
// plate list, Add Meal, the quantity / portion controls and Add Food Item are hidden,
// and Close review (or clicking the entry again) goes back to the plate.
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { useMeals, formatQty, amountOf } from "@/components/MealProvider";
import {
  foodInfo,
  defaultFoodInfo,
  dailyValues,
  defaultMealImage,
  portions,
} from "@/data/nutrition";

// The four donuts, in order
const nutrientMeta = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
];

// Rows of the "See all nutrients" table, in order
const nutrientRows = [
  { key: "calories", label: "Calories (kcal)" },
  { key: "protein", label: "Protein (g)" },
  { key: "carbs", label: "Carbs (g)" },
  { key: "fat", label: "Fat (g)" },
  { key: "fiber", label: "Fiber (g)" },
  { key: "sugars", label: "Sugars (g)" },
  { key: "satFat", label: "Saturated fat (g)" },
  { key: "cholesterol", label: "Cholesterol (mg)" },
  { key: "sodium", label: "Sodium (mg)" },
  { key: "calcium", label: "Calcium (mg)" },
  { key: "iron", label: "Iron (mg)" },
  { key: "potassium", label: "Potassium (mg)" },
  { key: "vitaminC", label: "Vitamin C (mg)" },
];

// An item's four main nutrients for its quantity and portion, with the % of the daily
// value (fillClass picks a ring size in style.css, rounded to the nearest 5%)
function nutrientsFor(item) {
  return nutrientMeta.map((n) => {
    const amount = Math.round(amountOf(item, n.key));
    const percent = Math.min(100, Math.round((amount / dailyValues[n.key]) * 100));
    return { ...n, amount, percent, fillClass: `fill-${Math.round(percent / 5) * 5}` };
  });
}

// 2–3 sentence "AI Analysis & Summary" of the whole plate. Simple rules on the sample
// nutrition values for now; the real AI analysis will come from the backend.
function plateSummary(plate) {
  if (plate.length === 0) {
    return "Upload a meal photo to get an analysis and summary of your plate.";
  }
  const totals = { calories: 0, carbs: 0, protein: 0, fat: 0 };
  for (const item of plate) {
    for (const n of nutrientsFor(item)) {
      totals[n.key] += n.amount;
    }
  }
  const items = plate.length === 1 ? "1 item" : `${plate.length} items`;
  const protein =
    totals.protein >= 30 ? "high protein" : totals.protein >= 15 ? "moderate protein" : "low protein";
  const carbs = totals.carbs >= 75 ? "heavy carbs" : totals.carbs >= 30 ? "moderate carbs" : "light carbs";
  const tip =
    totals.calories > 800
      ? "A large meal; try a smaller portion."
      : totals.fat >= 30
        ? "Fat is high; pick grilled or steamed sides."
        : totals.protein < 15
          ? "Add eggs, dal or chicken to balance it."
          : "Well balanced; add veggies for fibre.";
  return `${items}, about ${totals.calories} kcal: ${protein}, ${carbs}. ${tip}`;
}

// The item's uploaded photo, or a mint tile with its first letter
function Thumb({ item }) {
  return item.image ? (
    <img className="plate-thumb" src={item.image} alt={item.name} />
  ) : (
    <span className="plate-thumb" aria-hidden="true">
      {item.name[0]}
    </span>
  );
}

// "− 1 piece +" control (going below 1 removes the item); used in the list rows and the card
function QtyControl({ item, changeQty }) {
  return (
    <span className="serving-control">
      <button
        type="button"
        aria-label={item.qty === 1 ? `Remove ${item.name}` : `Decrease ${item.name}`}
        onClick={() => changeQty(item.name, -1)}
      >
        −
      </button>
      <span>{formatQty(item)}</span>
      <button
        type="button"
        aria-label={`Increase ${item.name}`}
        onClick={() => changeQty(item.name, 1)}
      >
        +
      </button>
    </span>
  );
}

export default function ScanPanel() {
  const { plate, selected, setSelected, saved, changeQty, setPortion, addToMealPlan, saveToHistory } =
    useMeals();
  // Today's Meals entries that Save meal has not added to History yet
  const unsaved = saved.filter((entry) => !entry.savedToHistory).length;

  // Today's Meals entry being reviewed in the card (null = show the plate)
  const [reviewId, setReviewId] = useState(null);
  const reviewEntry = saved.find((entry) => entry.id === reviewId);

  // The selected plate item (none right after Add Food Item, so the card is cleared)
  const plateCurrent = plate.find((item) => item.name === selected);
  // The item shown in the card: the reviewed one, otherwise the selected plate item
  const current = reviewEntry ? reviewEntry.item : plateCurrent;
  const nutrients = current ? nutrientsFor(current) : [];
  const info = current ? foodInfo[current.name] || defaultFoodInfo : null;
  // Complete dish name for the card (falls back to the short name for unknown foods)
  const fullName = current ? info.fullName || current.name : "";

  return (
    <main className="scan-page">
      <section className="scan-main">
        {/* Same search bar as the first page, so the next item can be added from here */}
        <SearchBar />

        {/* Menu box: title + Add Menu, list of items (2+), then the selected item's card */}
        <div className="info-box">
          <div className="info-head">
            <h1 className="panel-title">Menu</h1>
            {reviewEntry ? (
              // Reviewing a Today's Meals item: go back to the plate
              <button type="button" className="pill-button" onClick={() => setReviewId(null)}>
                Close review
              </button>
            ) : (
              // Back to page 1 to search or scan another item
              <Link href="/" className="pill-button">
                + Add Meal
              </Link>
            )}
          </div>

          {reviewEntry && (
            <p className="review-note">
              Reviewing an item from Today&apos;s Meals ({reviewEntry.time})
            </p>
          )}

          {!current && plate.length === 0 ? (
            <p className="plate-empty">
              Nothing to show yet. Search for a food above or use the camera to scan a meal photo.
            </p>
          ) : (
            <div className="scan-result">
              {/* Items on the plate (when there is more than one, or none is selected):
                  click one to view it */}
              {!reviewEntry && (plate.length > 1 || !current) && (
                <section>
                  <h2 className="section-label">On your plate</h2>
                  <ul className="plate-list" aria-live="polite">
                    {plate.map((item) => (
                      <li
                        key={item.name}
                        className={item === plateCurrent ? "plate-item selected" : "plate-item"}
                      >
                        {/* Image and name: click to show this item in the card */}
                        <button
                          type="button"
                          className="plate-select"
                          aria-pressed={item === plateCurrent}
                          onClick={() => setSelected(item.name)}
                        >
                          <Thumb item={item} />
                          <span className="plate-name">{item.name}</span>
                        </button>

                        {/* Quantity on the right */}
                        <QtyControl item={item} changeQty={changeQty} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Card cleared (e.g. right after Add Food Item): prompt for the next step */}
              {!current && (
                <p className="plate-empty">
                  Pick an item from your plate to see its info, or search for the next food above.
                </p>
              )}

              {/* Selected item: photo + details card on the left, nutrient donuts on the right */}
              {current && (
                <section className="result">
                  <div className="result-card">
                    {current.image ? (
                      <img className="result-image" src={current.image} alt={fullName} />
                    ) : (
                      <Image
                        className="result-image"
                        src={defaultMealImage}
                        alt={fullName}
                        width={840}
                        height={1200}
                      />
                    )}

                    <div className="result-details">
                      <h2 className="result-name">{fullName}</h2>
                      <p className="result-source">
                        {info.mealType} · added at {current.addedAt}
                      </p>

                      {/* Weight, quantity and portion for what is on the plate (blue badges) */}
                      <p className="nutrient-chips detail-chips">
                        <span className="chip">
                          {Math.round(info.weight * current.qty * portions[current.portion])} g
                        </span>
                        <span className="chip">
                          {current.qty} x {current.unit}
                        </span>
                        <span className="chip">{current.portion} portion</span>
                      </p>

                      {/* Quantity and portion size scale every nutrient below (not when reviewing) */}
                      {!reviewEntry && (
                        <div className="portion-row">
                          <span className="portion-field">
                            Quantity:
                            <QtyControl item={current} changeQty={changeQty} />
                          </span>
                          <label className="portion-field">
                            Portion size:
                            <select
                              className="select"
                              value={current.portion}
                              onChange={(e) => setPortion(current.name, e.target.value)}
                            >
                              {Object.keys(portions).map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      )}

                      {/* Full nutrient table, open by default; click to hide */}
                      <details className="all-nutrients" open>
                        <summary>See all nutrients</summary>
                        <table className="nutrient-table">
                          <tbody>
                            {nutrientRows.map((row) => (
                              <tr key={row.key}>
                                <th scope="row">{row.label}</th>
                                <td>{Math.round(amountOf(current, row.key) * 10) / 10}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </details>

                      {!reviewEntry && (
                        <div className="result-actions">
                          {/* Moves this item into Today's Meals */}
                          <button
                            type="button"
                            className="pill-button"
                            onClick={() => addToMealPlan(current.name)}
                          >
                            Add Food Item
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* One small donut per nutrient: ring = % of daily value (sizes in style.css) */}
                  <ul className="nutrient-list">
                    {nutrients.map((n) => (
                      <li key={n.key} className={`nutrient-tile ${n.key}`}>
                        <span className="mini-donut">
                          <svg viewBox="0 0 42 42" aria-hidden="true">
                            <circle className="mini-donut-track" cx="21" cy="21" r="15.915" />
                            <circle
                              className={`mini-donut-fill ${n.fillClass}`}
                              cx="21"
                              cy="21"
                              r="15.915"
                              pathLength="100"
                            />
                          </svg>
                          <span className="mini-donut-percent">{n.percent}%</span>
                        </span>
                        <span className="nutrient-text">
                          <span className="nutrient-label">{n.label}</span>
                          <span className="nutrient-value">
                            {n.amount} <small>{n.unit}</small>
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>

        {/* AI Analysis & Summary of the current plate (2–3 lines), where History used to be */}
        <section className="ai-summary" aria-live="polite">
          <h2 className="ai-summary-title">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
              <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
            </svg>
            AI Analysis &amp; Summary
          </h2>
          <p className="ai-summary-text">{plateSummary(plate)}</p>
        </section>
      </section>

      {/* Today's Meals: meals saved on this page (day, date, time, items), Save meal at the bottom */}
      <aside className="listing">
        <h2 className="panel-title">Today's Meals</h2>

        <ul className="saved-list" aria-live="polite">
          {saved.length === 0 && (
            <li className="saved-empty">No food added yet. Use Add Food Item to add one.</li>
          )}
          {saved.map((meal) => (
            <li key={meal.id}>
              {/* Click to review this item in the card; click again to close */}
              <button
                type="button"
                className={meal.id === reviewId ? "saved-item selected" : "saved-item"}
                aria-pressed={meal.id === reviewId}
                onClick={() => setReviewId(meal.id === reviewId ? null : meal.id)}
              >
                <span className="saved-when">
                  <strong>{meal.day}</strong> · {meal.date} · {meal.time}
                  {meal.savedToHistory && <span className="saved-tag">Saved</span>}
                </span>
                <span className="saved-items">{meal.items.join(", ")}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Saves the entries above that are not saved yet to the History page */}
        <button
          type="button"
          className="pill-button"
          onClick={saveToHistory}
          disabled={unsaved === 0}
        >
          Save meal
        </button>
        {/* Explains why Save meal is greyed out */}
        {unsaved === 0 && (
          <p className="save-hint">
            {saved.length === 0
              ? "Add a food with Add Food Item first, then save it here."
              : "Everything here is saved to History."}
          </p>
        )}
      </aside>
    </main>
  );
}
