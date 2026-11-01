
import { useState } from "react";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CustomerHome from "./pages/CustomerHome";

import { getSession, logout } from "./services/auth";

export default function App() {
  const [user, setUser] = useState(() => getSession());
  const [page, setPage] = useState("login");

  const handleLogout = () => {
    logout();
    setUser(null);
    setPage("login");
  };

  // Jika login sebagai admin
  if (user?.role === "admin") {
    return <Dashboard go={handleLogout} />;
  }

  // Jika login sebagai pelanggan
  if (user?.role === "pelanggan") {
    return (
      <CustomerHome
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // Halaman registrasi pelanggan
  if (page === "register") {
    return <Register go={setPage} />;
  }

  // Halaman login
  return (
    <Login
      go={setPage}
      onLogin={setUser}
    />
  );
}
