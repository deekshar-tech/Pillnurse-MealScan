// Page 1 – Search: Google Images–style centered logo, then the search bar (typing shows
// suggestions with photos; the camera button opens the photo picker to scan a meal).
import Image from "next/image";
import SearchBar from "@/components/SearchBar";

export default function SearchPage() {
  return (
    <main className="search-page">
      <section className="search-hero">
        <div className="brand">
          <Image
            src="/assets/logo.png"
            alt="PillNurse"
            width={236}
            height={102}
            className="brand-logo"
            loading="eager"
          />
          <span className="brand-subtitle">Meal Scan</span>
        </div>

        <SearchBar />
      </section>
    </main>
  );
}
