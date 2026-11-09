
import { useEffect, useState } from "react";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CustomerHome from "./pages/CustomerHome";
import OwnerDashboard from "./pages/OwnerDashboard";

import { getSession, logout } from "./services/auth";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getSession();
        setUser(session);
      } catch (error) {
        console.error("Gagal memeriksa sesi:", error);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setPage("login");
    } catch (error) {
      alert("Logout gagal: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat aplikasi...
      </div>
    );
  }

  if (user?.role === "admin") {
    return <Dashboard go={handleLogout} />;
  }

  if (
    user?.role === "customer" ||
    user?.role === "pelanggan"
  ) {
    return (
      <CustomerHome
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  if (user?.role === "owner") {
    return (
      <OwnerDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  if (page === "register") {
    return <Register go={setPage} />;
  }

  return (
    <Login
      go={setPage}
      onLogin={setUser}
    />
  );
}
