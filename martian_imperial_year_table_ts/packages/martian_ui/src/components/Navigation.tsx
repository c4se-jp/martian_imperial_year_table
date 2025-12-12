import { NavLink } from "react-router-dom";

export default function Navigation() {
  return (
    <nav className="navbar is-spaced" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          <div className="navbar-item">
            <img src="/img/martian_empire.png" alt="帝國火星曆" style={{ width: "48px", marginRight: "0.75rem" }} />
            <div>
              <p className="title is-5">帝國火星曆</p>
              <p className="subtitle is-7">Martian Imperial Year Table</p>
            </div>
          </div>
        </div>
        <div className="navbar-menu">
          <div className="navbar-start">
            <NavLink className={({ isActive }) => `navbar-item ${isActive ? "is-active" : ""}`} to="/">
              變換
            </NavLink>
            <NavLink className={({ isActive }) => `navbar-item ${isActive ? "is-active" : ""}`} to="/description">
              解説
            </NavLink>
            <NavLink className={({ isActive }) => `navbar-item ${isActive ? "is-active" : ""}`} to="/calendar">
              七曜表
            </NavLink>
          </div>
          <div className="navbar-end">
            <a
              className="navbar-item"
              href="https://github.com/c4se-jp/martian_imperial_year_table"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/img/GitHub-Mark-120px-plus.png" alt="GitHub" style={{ width: "28px" }} />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
