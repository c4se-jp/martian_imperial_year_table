import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import HomePage from "./pages/Home";
import TransformPage from "./pages/Transform";
import DescriptionPage from "./pages/Description";
import CalendarPage from "./pages/Calendar";
import WidgetStorybookPage from "./pages/WidgetStorybook";

function AppShell() {
  return (
    <>
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/transform" element={<TransformPage />} />
          <Route path="/description" element={<DescriptionPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/storybook/widget" element={<WidgetStorybookPage />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  // Vite の BASE_URL は開発時は "/"、GitHub Pages ではリポジトリ名を含む。
  // "./" のような相対指定でも実行時のフルパスに解決されるよう URL で補正する。
  const basename = new URL(import.meta.env.BASE_URL, window.location.href).pathname;

  return (
    <BrowserRouter basename={basename}>
      <AppShell />
    </BrowserRouter>
  );
}
