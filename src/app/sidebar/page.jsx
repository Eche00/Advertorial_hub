"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { icons } from "../../lib/Icons";
import "../../styles/Sidebar.css";
import toast from "react-hot-toast";
import { useState } from "react";

function Sidebar({ setMenuOpen }) {
  const [logOut, setLogOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // HANDLING LOG OUT
  const handleLogOut = () => {
    // Clear user session data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userId");

    // Show logout toast
    toast.success("Logged out successfully.");

    // Redirect to login page after short delay
    router.push("/authentication/Login");
  };
  const navPages = [
    { name: "Home", path: "/dashboard", icon: icons.home },
    { name: "Posts", path: "/dashboard/mypost", icon: icons.postimg },
    { name: "My Ads", path: "/dashboard/myads", icon: icons.ads },
    { name: "Pricing", path: "/dashboard/pricing", icon: icons.pricing },
    { name: "Profile", path: "/dashboard/profile", icon: icons.profile },
    { name: "Settings", path: "/dashboard/setting", icon: icons.setting },
    { name: "Post", path: "/dashboard/posts/:id", icon: icons.post },
  ];

  return (
    <div>
      {/* container */}
      <aside className="sidebar">
        {/* head section */}
        <section className="sidebar-header">
          <img
            src="/images/logo.png"
            className="sidebar-logo"
            alt="Advertorial Hub Logo"
          />
          <h4 className="sidebar-title">Advertorial Hub</h4>
        </section>

        {/* nav */}
        <nav>
          <ul className="sidebar-nav" onClick={() => setMenuOpen(false)}>
            {navPages.map((page) => (
              <li key={page.path}>
                {page.name === "Post" ? (
                  // Render as a non-clickable span
                  <span
                    className="sidebar-link inactive-link"
                    style={{ cursor: "default" }}></span>
                ) : (
                  <Link
                    href={page.path}
                    className={`sidebar-link ${
                      pathname === page.path ? "active-link" : "inactive-link"
                    }`}>
                    {page.icon}
                    <span>{page.name}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <button className="logout-button" onClick={() => setLogOut(true)}>
          {icons.logout} Logout
        </button>
      </aside>
      {/* LOG OUT  */}
      {logOut && (
        <section className="addLink-overlay">
          <div
            className="overlay-delete-container mild-zoom"
            data-aos="zoom-in"
            data-aos-delay="100"
            data-aos-duration="500">
            <section className=" current-delete-container">
              <div className="current-delete-info">
                <span>{icons.deletefill}</span>
                <h2>
                  Logout
                  <span>Are you sure you want to logout of this app ?</span>
                </h2>
              </div>
              <span className="line-through"></span>
              <div className="current-delete-btns">
                <button
                  className="current-cancel-btn"
                  onClick={() => setLogOut(false)}>
                  Cancel
                </button>
                <button className="current-delete-btn" onClick={handleLogOut}>
                  Yes, Logout
                </button>
              </div>
            </section>
          </div>
        </section>
      )}
    </div>
  );
}

export default Sidebar;
