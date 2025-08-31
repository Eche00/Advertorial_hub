"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/Login.css";
import Link from "next/link";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ New State
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://advertorial-backend.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Login failed!");
      }

      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("token", data.token);

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setSocialLoading(true);
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("Social login failed. Please try again.");
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="Loginpage-container">
      <span className="background-pattern">
        <div className="gradient-overlay"></div>
      </span>

      <section className="form-container">
        <div className="head-section" data-aos="fade-up">
          <h1 className="title">Log In</h1>
          <div className="subtitle">
            Log in to your advertorial account or
            <Link href="/authentication/CreateAccount">
              <strong className="create-account"> Create Account</strong>
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form" data-aos="zoom-in">
          <section className="input-section">
            <div className="input-group">
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group password-group">
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="input-field password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // 👁️ Eye with slash (hide)
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a19.48 19.48 0 014.133-5.111m3.746-2.431A9.953 9.953 0 0112 5c7 0 10 7 10 7a19.476 19.476 0 01-4.134 5.111M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18"
                      />
                    </svg>
                  ) : (
                    // 👁️ Normal eye (show)
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 11a4 4 0 100-8 4 4 0 000 8z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </section>

          <div className="forgot-password">
            <a href="/authentication/ForgotPassword">Forgot Password?</a>
          </div>

          {error && <p className="error-text">{error}</p>}

          <section className="auth-other-means">
            <button
              type="submit"
              className="login-button"
              disabled={loading}
              data-aos="zoom-out"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            {/* Social buttons (commented out) */}
            <div className="auth-buttons">
              {/* <button
                type="button"
                className="auth-button"
                disabled={socialLoading}
                onClick={() => handleSocialLogin("google")}
              >
                <span>{icons?.google || "🔵"}</span>{" "}
                {socialLoading ? "Connecting..." : "Sign in with Google"}
              </button> */}
              {/* <button
                type="button"
                className="auth-button"
                disabled={socialLoading}
                onClick={() => handleSocialLogin("facebook")}
              >
                <span>{icons?.facebook || "🔵"}</span>{" "}
                {socialLoading ? "Connecting..." : "Sign in with Facebook"}
              </button> */}
            </div>
          </section>
        </form>
      </section>
    </div>
  );
};

export default Login;
