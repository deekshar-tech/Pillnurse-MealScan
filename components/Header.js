"use client";

// Shared top navigation: on the inner pages (Menu, History) a small PillNurse logo on
// the left links back to the first page; the first page already shows the big logo, so
// the header logo is hidden there. Links to the three pages sit on the right.
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const isFirstPage = usePathname() === "/";

  return (
    <header className="site-header">
      {!isFirstPage && (
        <Link href="/" className="header-logo" aria-label="PillNurse home">
          <Image src="/assets/logo.png" alt="PillNurse" width={236} height={102} loading="eager" />
        </Link>
      )}

      <nav className="site-nav">
        <ul className="nav-links">
          <li>
            <Link href="/">Search</Link>
          </li>
          <li>
            <Link href="/scan">Menu</Link>
          </li>
          <li>
            <Link href="/history">History</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
