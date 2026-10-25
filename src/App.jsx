import { useState } from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CustomerHome from "./pages/CustomerHome";
import { getSession, logout } from "./services/auth";

export default function App() {
  const [user, setUser] = useState(() => getSession());
  const [page, setPage] = useState("login"); // login | register

  const handleLogout = () => {
    logout();
    setUser(null);
    setPage("login");
  };

  // Sudah login: tampilkan halaman sesuai role
  if (user?.role === "admin") return <Dashboard go={handleLogout} />;
  if (user) return <CustomerHome user={user} onLogout={handleLogout} />;

  // Belum login
  if (page === "register") return <Register go={setPage} />;
  return <Login go={setPage} onLogin={setUser} />;
}