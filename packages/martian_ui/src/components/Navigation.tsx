import { NavLink, Link } from "react-router-dom";
import type { ThemePreference } from "../lib/theme";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2.5v3" />
        <path d="M12 18.5v3" />
        <path d="M2.5 12h3" />
        <path d="M18.5 12h3" />
        <path d="M5.3 5.3l2.1 2.1" />
        <path d="M16.6 16.6l2.1 2.1" />
        <path d="M18.7 5.3l-2.1 2.1" />
        <path d="M7.4 16.6l-2.1 2.1" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15.5 2.8a8.9 8.9 0 1 0 5.7 15.8A9.6 9.6 0 0 1 15.5 2.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9 19h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 16v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string; icon: JSX.Element }> = [
  { value: "light", label: "ライトテーマ", icon: <SunIcon /> },
  { value: "dark", label: "ダークテーマ", icon: <MoonIcon /> },
  { value: "system", label: "システム設定に追隨", icon: <SystemIcon /> },
];

export default function Navigation({
  themePreference,
  onThemePreferenceChange,
}: {
  themePreference: ThemePreference;
  onThemePreferenceChange: (preference: ThemePreference) => void;
}) {
  return (
    <nav className="navbar is-spaced" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          <Link className="navbar-item" to="/">
            <img src="./img/martian_empire.png" alt="帝國火星曆" style={{ width: "38px", marginRight: "0.75rem" }} />
            <div>
              <p className="title is-5">帝國火星曆</p>
              <p className="subtitle is-7">Martian Imperial Year Table</p>
            </div>
          </Link>
        </div>
        <div className="navbar-menu">
          <div className="navbar-start">
            <NavLink className={({ isActive }) => `navbar-item ${isActive ? "is-active" : ""}`} to="/description">
              解説
            </NavLink>
            <NavLink className={({ isActive }) => `navbar-item ${isActive ? "is-active" : ""}`} to="/transform">
              變換
            </NavLink>
            <NavLink className={({ isActive }) => `navbar-item ${isActive ? "is-active" : ""}`} to="/calendar">
              七曜表
            </NavLink>
          </div>
          <div className="navbar-end">
            <div className="navbar-item">
              <div className="theme-switcher buttons has-addons are-small" role="group" aria-label="テーマ切り替へ">
                {THEME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`button ${themePreference === option.value ? "is-link is-selected" : ""}`}
                    type="button"
                    onClick={() => onThemePreferenceChange(option.value)}
                    aria-pressed={themePreference === option.value}
                    aria-label={option.label}
                    title={option.label}
                  >
                    <span className="theme-switcher__icon">{option.icon}</span>
                  </button>
                ))}
              </div>
            </div>
            <a
              className="navbar-item"
              href="https://github.com/c4se-jp/martian_imperial_year_table"
              target="_blank"
              rel="noreferrer"
            >
              <img src="./img/GitHub-Mark-120px-plus.png" alt="GitHub" style={{ width: "28px" }} />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
