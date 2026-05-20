import { Route, Routes } from "react-router-dom";
import AboutPage from "@/pages/AboutPage";
import GalleryPage from "@/pages/GalleryPage";
import LandingPage from "@/pages/LandingPage";
import TryOnPage from "@/pages/TryOnPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/try-on" element={<TryOnPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  );
}
