import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigationType } from "react-router-dom";
import Navigation from "./components/Navigation";
import HomePage from "./pages/Home";
import TransformPage from "./pages/Transform";
import DescriptionPage from "./pages/Description";
import CalendarPage from "./pages/Calendar";
import { applyThemePreference, readThemePreference, THEME_STORAGE_KEY, type ThemePreference } from "./lib/theme";
import ApiPage from "./pages/Api";
import McpPage from "./pages/Mcp";
import { trackRouteTransition } from "./lib/telemetry";

function RouteChangeTracker() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    trackRouteTransition(`${location.pathname}${location.search}${location.hash}`, navigationType);
  }, [location.hash, location.pathname, location.search, navigationType]);

  return null;
}

function AppShell({
  themePreference,
  onThemePreferenceChange,
}: {
  themePreference: ThemePreference;
  onThemePreferenceChange: (preference: ThemePreference) => void;
}) {
  return (
    <>
      <RouteChangeTracker />
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
    <BrowserRouter>
      <AppShell themePreference={themePreference} onThemePreferenceChange={setThemePreference} />
    </BrowserRouter>
  );
}
