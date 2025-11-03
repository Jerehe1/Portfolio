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

  
  const path = window.location.pathname;

  if (path === '/admin') {
    return <Admin />;
  }

  return <Home />;
}

export default App;