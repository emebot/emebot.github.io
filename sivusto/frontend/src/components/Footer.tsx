import { Link } from "@tanstack/react-router";
import LighthouseMark from "./LighthouseMark";

const menu = [
  { label: "Etusivu", hash: "" },
  { label: "Aiheet", hash: "aiheet" },
  { label: "Miksi tämä on tärkeää", hash: "miksi" },
  { label: "Yhteys", hash: "yhteys" },
];

const company = [
  { label: "Kirjaudu", href: "/login" },
  { label: "Rekisteröidy", href: "/login" },
];

const contact = ["+358 12 345 6789", "email@osoite.fi", "Katuosoite 123"];

const linkClass = "text-[#718096] transition-colors hover:text-white";
const headingClass = "text-xl font-light text-white";

export default function Footer() {
  return (
      <footer id="hanke" className="scroll-mt-20 border-t border-white/10 bg-[#0F1724] font-['Inter',sans-serif] text-[#E3E3E3]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="flex flex-col justify-between gap-10">

            <div>
              <div className="flex items-center gap-3">
                <LighthouseMark className="h-9 w-9" />
                <span className="text-3xl font-light text-white">Majakka</span>
              </div>
              <p className="mt-4 max-w-xs text-sm font-light leading-relaxed text-[#A0AEC0]">
                Innovaatioprojekti, joka opettaa veneiden ja majakoiden valoja
                sekä alusten siluetteja pimeän ajan navigointia varten.
              </p>
            </div>
            <div className="flex items-center gap-5 text-white">
              <a href="#" aria-label="Instagram" className="hover:text-[#1D90F4]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-[#1D90F4]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path fill="#0F1724" d="M13.2 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.3-1.3 1.4-1.3h1.4V5.6c-.3 0-1.1-.1-2-.1-2 0-3.300 1.200-3.300 3.400v2.100H8.400V14h2.300v7z" />
                </svg>
              </a>
            </div>
          </div>

          <nav aria-label="Alatunnisteen valikko">
            <h2 className={headingClass}>Valikko</h2>
            <ul className="mt-5 space-y-3">
              {menu.map((item) => (
                  <li key={item.label}>
                    <Link to="/" hash={item.hash} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={headingClass}>Yritys</h2>
            <ul className="mt-5 space-y-3">
              {company.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className={linkClass}>
                      {item.label}
                    </a>
                  </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={headingClass}>Yhteystiedot</h2>
            <ul className="mt-5 space-y-3 text-[#718096]">
              {contact.map((line) => (
                  <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="border-t border-[#2A3548] px-6 py-6 text-center font-light">
          © {new Date().getFullYear()} Majakka. Opiskelijaprojekti. Kaikki oikeudet pidätetään.
        </p>
      </footer>
  );
}