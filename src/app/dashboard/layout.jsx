"use client";

import { useEffect, useState } from "react";
import Sidebar from "../sidebar/page";
import "../../styles/Dashboardlayout.css";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // HANDLING IF THERE IS A USER LOGGED IN
  useEffect(() => {
    const userToken = localStorage.getItem("token");

    if (!userToken) {
      toast.error("No token found. Please log in again.");
      router.push("/authentication/Login");
      return;
    }
  }, [router]);
  return (
    <div className="layout-container">
      <section className="sidebar-container">
        <Sidebar />
      </section>
      <main className="main-content ">
        <section className="main-section-container">
          <section className="mobile-sidebar-header">
            <img
              src="/images/logo.png"
              className="mobile-sidebar-logo"
              alt="Advertorial Hub Logo"
            />
            <h4 className="mobile-sidebar-title">Advertorial Hub</h4>
          </section>
          <div
            className={`hamburger sideHeader ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </section>
        {menuOpen && <Sidebar setMenuOpen={setMenuOpen} />}
        {children}
      </main>
    </div>
  );
}
