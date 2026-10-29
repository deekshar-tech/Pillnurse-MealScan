"use client";

// Search form on page 1 and above the Menu box on /scan: pill-shaped input with a camera
// button and a live suggestions dropdown. Typing shows matching foods from the hardcoded
// list, each with a photo (the default photo), name and kcal per serving; if nothing
// matches, the typed text itself is suggested. Clicking a suggestion (or pressing Enter)
// adds that food and opens /scan with its full info, then clears the box.
// The camera button opens the photo picker; once a photo is chosen it is shown with a
// short "Scanning your meal…" animation, then the scanned item is added and /scan opens.
// The mic button uses the browser's built-in speech recognition (Chrome / Edge; no keys
// or network calls in this code): the words appear in the box while speaking, then the
// sentence is split into foods ("burger and french fries" → Burger, French Fries), each
// is added, and /scan opens with the first one shown.
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import foods from "@/data/foods";
import { foodInfo, defaultFoodInfo, defaultMealImage } from "@/data/nutrition";
import { useMeals } from "@/components/MealProvider";

// How long the "Scanning your meal…" view shows before the Menu page opens
const scanDelay = 1500;

// Split a spoken sentence into food names and match each to the food list:
// "a burger and some fries" → ["Burger", "French Fries"]; unknown foods are kept as said
function spokenFoods(text) {
  return text
    .toLowerCase()
    .split(/\s*(?:,|&|\band\b|\bwith\b|\bplus\b)\s*/)
    .map((part) => part.replace(/^(a|an|some|the|one)\s+/, "").trim())
    .filter(Boolean)
    .map(
      (part) =>
        foods.find((food) => food.toLowerCase() === part) ||
        foods.find((food) => part.includes(food.toLowerCase())) ||
        foods.find((food) => food.toLowerCase().includes(part)) ||
        part.replace(/\b\w/g, (letter) => letter.toUpperCase())
    );
}

export default function SearchBar() {
  const router = useRouter();
  const { addFood, addScanned, setSelected } = useMeals();
  const fileInput = useRef(null);
  const recognition = useRef(null);
  // True while the mic is listening; voiceMessage explains problems (no support, blocked)
  const [listening, setListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");

  // Stop listening if the page changes while the mic is on
  useEffect(() => () => recognition.current?.abort(), []);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Photo URL while the "Scanning your meal…" view is showing
  const [scanning, setScanning] = useState(null);

  // Case-insensitive match anywhere in the food name
  const term = query.trim().toLowerCase();
  const matches = term
    ? foods.filter((food) => food.toLowerCase().includes(term))
    : [];
  // Always suggest something while typing: the matches, or the typed text itself
  const suggestions = matches.length > 0 ? matches : term ? [query.trim()] : [];

  function handleChange(event) {
    setQuery(event.target.value);
    setShowSuggestions(true);
  }

  // Clicking a suggestion adds that food and opens /scan with its full info
  function handleSelect(food) {
    setShowSuggestions(false);
    setQuery("");
    addFood(food);
    router.push("/scan");
  }

  // Enter: add the exact or first matching food (or the typed text), then open /scan
  function handleSubmit(event) {
    event.preventDefault();
    if (term) {
      const exact = foods.find((food) => food.toLowerCase() === term);
      addFood(exact || matches[0] || query.trim());
    }
    setQuery("");
    setShowSuggestions(false);
    router.push("/scan");
  }

  // Mic button: start listening (or stop if already listening)
  function toggleVoice() {
    if (listening) {
      recognition.current.stop();
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceMessage("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }

    let finalText = "";
    const voice = new Recognition();
    voice.lang = "en-US";
    voice.interimResults = true;
    // Show the words in the box as they are recognised
    voice.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setQuery(text);
      if (event.results[event.results.length - 1].isFinal) {
        finalText = text;
      }
    };
    voice.onerror = (event) => {
      setVoiceMessage(
        event.error === "not-allowed"
          ? "Microphone access is blocked. Allow it in the browser to use voice."
          : "Didn't catch that. Tap the mic and try again."
      );
    };
    // When speaking ends: add every food that was said, show the first one on /scan
    voice.onend = () => {
      setListening(false);
      const names = spokenFoods(finalText);
      if (names.length === 0) return;
      names.forEach((name) => addFood(name));
      setSelected(names[0]);
      setQuery("");
      router.push("/scan");
    };

    recognition.current = voice;
    setVoiceMessage("");
    setShowSuggestions(false);
    setQuery("");
    setListening(true);
    voice.start();
  }

  // Camera button: open the photo picker
  function openPhotoPicker() {
    setShowSuggestions(false);
    fileInput.current.click();
  }

  // Show the scanning view briefly, then add the scanned item and open /scan
  // (the photo is only shown, not analysed yet)
  function startScan(imageUrl) {
    setScanning(imageUrl);
    setTimeout(() => {
      addScanned(imageUrl);
      setScanning(null);
      router.push("/scan");
    }, scanDelay);
  }

  // Keep a temporary browser URL of the chosen photo so it can be shown as the item image
  function handleUpload(event) {
    const file = event.target.files[0];
    if (file) {
      startScan(URL.createObjectURL(file));
    }
    event.target.value = "";
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-field">
        <input
          id="meal-search"
          type="text"
          className="search-input"
          placeholder={listening ? "Listening… e.g. burger and french fries" : "Search a meal or food"}
          aria-label="Search a meal or food"
          value={query}
          onChange={handleChange}
        />

        {/* Mic button: speak the foods instead of typing (pulses while listening) */}
        <button
          type="button"
          className={listening ? "icon-button listening" : "icon-button"}
          aria-label={listening ? "Stop listening" : "Speak a meal"}
          aria-pressed={listening}
          disabled={scanning !== null}
          onClick={toggleVoice}
        >
          <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0" />
            <line x1="12" y1="18" x2="12" y2="21" />
          </svg>
        </button>

        {/* Camera button: opens the photo picker straight away */}
        <button
          type="button"
          className="icon-button"
          aria-label="Upload a meal photo"
          disabled={scanning !== null}
          onClick={openPhotoPicker}
        >
          <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
        </button>
      </div>

      {/* Why voice did not work (unsupported browser, blocked mic, nothing heard) */}
      {voiceMessage && <p className="voice-hint">{voiceMessage}</p>}

      {/* Hidden photo picker, opened by the camera button */}
      <input
        ref={fileInput}
        id="meal-photo"
        type="file"
        accept="image/*"
        hidden
        onChange={handleUpload}
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((food) => (
            <li key={food}>
              <button
                type="button"
                className="suggestion-item"
                onClick={() => handleSelect(food)}
              >
                <Image
                  className="suggestion-image"
                  src={defaultMealImage}
                  alt=""
                  width={840}
                  height={1200}
                  loading="eager"
                />
                <span className="suggestion-name">{food}</span>
                <span className="suggestion-kcal">
                  {(foodInfo[food] || defaultFoodInfo).calories} kcal
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Scanning view: the chosen photo with the moving scan line */}
      {scanning && (
        <section className="scanner-panel" aria-live="polite">
          <div className="scanner-view">
            <img className="scanning-image" src={scanning} alt="Your meal photo" />
            <p className="scanning-text">Scanning your meal…</p>
          </div>
        </section>
      )}
    </form>
  );
}
