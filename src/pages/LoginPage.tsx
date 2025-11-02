import type { FormEvent } from "react";
import { useState, useEffect } from "react";

interface LoginProps {
  onLoginSuccess?: (token: string, user: { name: string; email: string }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyMUVY_bvw7uthYKGtLOJJso2fjKx4PPanocvSVsM8VbSF1vddhiimzis4KhJ-aXrVRCA/exec"; 

  // Auto-restore session if token exists
  useEffect(() => {
    const savedToken = localStorage.getItem("session_token");
    const savedUser = localStorage.getItem("session_user");
    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
      if (onLoginSuccess) onLoginSuccess(savedToken, JSON.parse(savedUser));
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Email and password are required");

    setLoading(true);
    try {
      const res = await fetch(
        `${SCRIPT_URL}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      );
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("session_token", data.token);
        localStorage.setItem("session_user", JSON.stringify(data.user));
        setUser(data.user);
        if (onLoginSuccess) onLoginSuccess(data.token, data.user);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("session_token");
    localStorage.removeItem("session_user");
    setUser(null);
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Welcome, {user.name}</h2>
          <p className="text-sm text-slate-500 mb-6">{user.email}</p>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-8">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-800">Welcome Back</h1>
          <p className="text-sm text-slate-500">Sign in to continue</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-xs text-indigo-600 hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? (
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <footer className="mt-6 text-center text-sm text-slate-500">
          Don’t have an account?{" "}
          <a
            href="https://forms.gle/nQmSmy88L1p9LCT66"
            className="text-indigo-600 hover:underline"
          >
            Sign up
          </a>
        </footer>
      </div>
    </div>
  );
}
