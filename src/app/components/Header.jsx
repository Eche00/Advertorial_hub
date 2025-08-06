"use client";
import React, { useEffect, useState } from "react";
import "@/styles/Header.css";
import { useRouter } from "next/navigation";

const Header = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const navigateTo = (path) => {
    setMenuOpen(false);
    router.push(path);
  };
  // Getting user
  const getUser = async () => {
    const userIdOrEmail = localStorage.getItem("userId");
    if (!userIdOrEmail) return router.push("/authentication/Login");

    try {
      const res = await fetch(
        `https://advertorial-backend.onrender.com/api/auth/user/${userIdOrEmail}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const userData = await res.json();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);
  return (
    <header className="header logHeader">
      <div className="header-logo-container" onClick={() => navigateTo("/")}>
        <img src="/images/logo.png" alt="Logo" className="header-logo" />
        <h3 className="header-title my-link hubHeader">Advertorial Hub</h3>
      </div>

      <div
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      <nav className={`header-nav ${menuOpen ? "show" : ""}`}>
        <button
          className="my-link navbtn"
          onClick={() => navigateTo("/AboutUs")}>
          About Us
        </button>
        <button className="my-link navbtn" onClick={() => navigateTo("/Blog")}>
          Blog
        </button>
        <button
          className="my-link navbtn"
          onClick={() => navigateTo("/Pricing")}>
          Pricing
        </button>

        <div className="mobile-buttons">
          <button
            className="login-btn"
            onClick={() => navigateTo("/authentication/Login")}>
            Log In
          </button>
          <button
            className="btnStart"
            onClick={() => navigateTo("/authentication/CreateAccount")}>
            Start Now
          </button>
        </div>
      </nav>

      {user ? (
        <div className="h-user-container">
          <p className="h-user-name">
            {user?.firstName + " " + user?.lastName}
          </p>
          <img
            src={user.profilePicture}
            alt={user.profilePicture}
            className="h-user-profile"
            onClick={() => navigateTo("/dashboard")}
          />
        </div>
      ) : (
        <div className="header-buttons">
          <button
            className="login-btn"
            onClick={() => navigateTo("/authentication/Login")}>
            Log In
          </button>
          <button
            className="btnStart"
            onClick={() => navigateTo("/authentication/CreateAccount")}>
            Start Now
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
