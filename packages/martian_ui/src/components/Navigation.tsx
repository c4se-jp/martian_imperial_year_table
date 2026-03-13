import { NavLink, Link } from "react-router-dom";
import type { ThemePreference } from "../lib/theme";

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
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
                  >
                    {option.label}
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
