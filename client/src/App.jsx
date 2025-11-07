import { useState, useEffect } from "react";
import Home from "./pages/Home.jsx";
import Admin from "./pages/Admin.jsx";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAdmin(true);
    }
  }, []);

  // Handle Vite base path (e.g. '/Portfolio/') so both dev and GitHub Pages work
  const rawPath = window.location.pathname; // e.g. '/Portfolio/admin'
  const base = import.meta.env.BASE_URL || '/'; // Vite injects trailing slash
  // Normalize: strip base if present at start
  const normalizedPath = rawPath.startsWith(base) ? '/' + rawPath.slice(base.length) : rawPath;

  if (normalizedPath === '/admin') {
    return <Admin />;
  }

  return <Home />;
}

export default App;