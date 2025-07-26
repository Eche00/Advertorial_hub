"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Toaster } from "react-hot-toast";

export default function LayoutClient({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      easing: "ease-in-out",
    });
    AOS.refresh();
  }, [pathname]);

  const noFooterPages = [
    "/dashboard",
    "/dashboard/mypost",
    "/dashboard/myads",
    "/dashboard/pricing",
    "/dashboard/profile",
    "/dashboard/setting",
    "/dashboard/posts/:id",
  ];

  const noHeaderPages = [
    "/dashboard",
    "/dashboard/mypost",
    "/dashboard/myads",
    "/dashboard/pricing",
    "/dashboard/profile",
    "/dashboard/setting",
    "/dashboard/posts/:id",
  ];

  function isNoHeaderPage(path) {
    return noHeaderPages.includes(path) || path.startsWith("/dashboard/posts/");
  }

  function isNoFooterPage(path) {
    return noFooterPages.includes(path) || path.startsWith("/dashboard/posts/");
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            zIndex: 9999, // Ensuring this is above modals, headers and more.
          },
        }}
      />
      {!isNoHeaderPage(pathname) && <Header />}
      <main>{children}</main>
      {!isNoFooterPage(pathname) && <Footer />}
    </>
  );
}
