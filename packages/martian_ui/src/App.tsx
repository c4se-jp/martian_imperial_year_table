import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import HomePage from "./pages/Home";
import TransformPage from "./pages/Transform";
import DescriptionPage from "./pages/Description";
import CalendarPage from "./pages/Calendar";
import { applyThemePreference, readThemePreference, THEME_STORAGE_KEY, type ThemePreference } from "./lib/theme";
import ApiPage from "./pages/Api";
import McpPage from "./pages/Mcp";

function AppShell({
  themePreference,
  onThemePreferenceChange,
}: {
  themePreference: ThemePreference;
  onThemePreferenceChange: (preference: ThemePreference) => void;
}) {
  return (
    <>
      <Navigation themePreference={themePreference} onThemePreferenceChange={onThemePreferenceChange} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/transform" element={<TransformPage />} />
          <Route path="/description" element={<DescriptionPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/docs/api" element={<ApiPage />} />
          <Route path="/docs/mcp" element={<McpPage />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  // Vite の BASE_URL は開発時は "/"、GitHub Pages ではリポジトリ名を含む。
  // "./" のような相対指定でも実行時のフルパスに解決されるよう URL で補正する。
  const basename = new URL(import.meta.env.BASE_URL, window.location.href).pathname;
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => readThemePreference());

  useEffect(() => {
    applyThemePreference(themePreference);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
    } catch {
      // localStorage が使へない環境では永續化を諦める。
    }
  }, [themePreference]);

  return (
    <BrowserRouter basename={basename}>
      <AppShell themePreference={themePreference} onThemePreferenceChange={setThemePreference} />
    </BrowserRouter>
  );
}
