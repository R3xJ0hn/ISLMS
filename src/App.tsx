import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState} from "react";
import Login from "./pages/LoginPage";
import Grades from "./pages/StudentGradesViewPage";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("session_token"));
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    JSON.parse(localStorage.getItem("session_user") || "null")
  );

  function handleLoginSuccess(newToken: string, newUser: { name: string; email: string }) {
    setToken(newToken);
    setUser(newUser);
  }

  function handleLogout() {
    localStorage.clear();
    setToken(null);
    setUser(null);
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/grades" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route
          path="/grades"
          element={
            token ? (
              <Grades token={token!} user={user!} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}
