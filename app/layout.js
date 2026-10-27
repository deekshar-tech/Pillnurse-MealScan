// Root layout: loads the global styles, shares the meal state (plate + Today's Meals)
// across pages, and shows the shared Header on every page.
import Header from "@/components/Header";
import MealProvider from "@/components/MealProvider";
import "./style.css";

export const metadata = {
  title: "PillNurse Meal Scan",
  description: "Search, scan and track your meals with PillNurse.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MealProvider>
          <Header />
          {children}
        </MealProvider>
      </body>
    </html>
  );
}
