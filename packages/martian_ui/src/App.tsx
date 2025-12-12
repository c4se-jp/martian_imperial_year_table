import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import HomePage from "./pages/Home";
import DescriptionPage from "./pages/Description";
import CalendarPage from "./pages/Calendar";

export default function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/description" element={<DescriptionPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
