"use client";
import { useState, useEffect } from "react";
import { icons } from "@/lib/Icons";
import "@/styles/Pricing.css";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";

const publicKey = "pk_test_f0190a4895e6aa1d75d8f0d8aaab22bceecf0931"; // My own paystack public key
const PaystackButton = dynamic(
  () => import("react-paystack").then((mod) => mod.PaystackButton),
  { ssr: false }
);

export default function Pricing() {
  const [billing, setBilling] = useState("monthly");
  const [user, setUser] = useState({ email: "", plan: "PERSONAL" });
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const userIdOrEmail = localStorage.getItem("userId");
      setToken(localStorage.getItem("token"));

      if (!userIdOrEmail) return router.push("/authentication/Login");

      try {
        const res = await fetch(
          `https://advertorial-backend.onrender.com/api/auth/user/${userIdOrEmail}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const userData = await res.json();
        setUser(userData);
        console.log(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    getUser();
  }, []);

  const prices = {
    personal: "Free",
    business: billing === "monthly" ? "$400" : "$4,000",
    team: billing === "monthly" ? "$700" : "$7,000",
  };

  const amountsInKobo = {
    business: billing === "monthly" ? 400 * 100 : 4000 * 100,
    team: billing === "monthly" ? 700 * 100 : 7000 * 100,
  };

  const changeUserPlan = async ({ reference, planName }) => {
    console.log(token, reference, planName);

    const res = await fetch(
      "https://advertorial-backend.onrender.com/api/v1/plan/change-plan",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ reference, planName }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Something went wrong");
    return data;
  };

  const handlePaymentSuccess = async (reference, planName) => {
    try {
      const res = await changeUserPlan({ reference, planName });
      console.log(res.message);
      toast.success("Payment successful. Plan updated!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      console.log(err.message);
      toast.error("Payment succeeded, but plan update failed.");
    }
  };

  const getPaystackButton = (planName) => {
    // if (!user?.email) {
    //   router.push("/authentication/Login");
    // }

    if (user.plan === "PERSONAL" && planName === "TEAM") {
      return (
        <button className="get-started-btn" disabled>
          Upgrade to Business First
        </button>
      );
    }

    const amount = amountsInKobo[planName.toLowerCase()];

    const componentProps = {
      email: user.email,
      amount,
      publicKey,
      metadata: { planName },
      text: "Get Started",
      onSuccess: (ref) => handlePaymentSuccess(ref.reference, planName),
      onClose: () => console.log("Payment closed"),
      className: "get-started-btn",
    };

    return <PaystackButton {...componentProps} />;
  };

  const freePlan = [
    "10 posts per month",
    "Only 1 image per post",
    " No ads",
    " No social media support",
    "Ideal for personal projects, testing, and casual use.",
  ];

  const businessPlan = [
    "Post Limit: 100 per month",
    "Media: Unlimited images",
    "Ads: 3 ads per month",
    "Social Sharing: Instagram, Facebook",
    "Ideal For: Growing businesses and entrepreneurs",
  ];
  const teamPlan = [
    "Post Limit: Unlimited",
    "Media: Unlimited images + videos",
    "Ads: 5 ads per month",
    "Social Sharing: Instagram, Facebook, TikTok, Twitter",
    "Ideal For: Brands, agencies, and teams managing content at scale",
  ];
  const features = [
    { title: "All plans include 24/7 email support!", desc: "" },
    {
      title: "Analytics Dashboard",
      desc: "helps track post performance over time.",
    },
    { title: "Upgrade anytime", desc: "as your needs grow!" },
  ];
  return (
    <div>
      <div className="Pricepage-container ">
        <main className="PriceMainContent">
          <section className="PriceHeadSection" data-aos="fade-down">
            <h1 className="Pricemain-heading">
              We’ve got a plan that’s perfect <br /> for you
            </h1>

            <div className="billing-buttons">
              <button
                className={`monthly-billing ${
                  billing === "monthly" ? "active" : ""
                }`}
                onClick={() => setBilling("monthly")}>
                Monthly Billing
              </button>
              <button
                className={`annual-billing ${
                  billing === "annual" ? "active" : ""
                }`}
                onClick={() => setBilling("annual")}>
                Annual Billing
              </button>
            </div>
          </section>

          <section
            className="pricing-section mild-zoom"
            data-aos="zoom-in"
            data-aos-delay="400"
            data-aos-duration="2000">
            {/* Personal Plan */}
            <div className="pricing-card">
              <section className="Priceplan-details">
                <div className="Priceplan-header">
                  <h2 className="Priceplan-title">
                    Personal Plan
                    <span className="Priceplan-subtitle">
                      Perfect plan for starters
                    </span>
                  </h2>
                  <h1 className="plan-price">
                    {prices.personal}
                    <span className="Priceplan-subtitle">For a Lifetime</span>
                  </h1>
                </div>
                {user.plan === "PERSONAL" ? (
                  <button className="current-plan-btn">Current Plan</button>
                ) : (
                  <button className="get-started-btn" disabled>
                    Free Plan
                  </button>
                )}
              </section>
              <section className="Priceplan-features">
                {freePlan.map((feature, i) => (
                  <p className="Pricefeature" key={i}>
                    <span>{icons.greencheck}</span> {feature}
                  </p>
                ))}
              </section>
            </div>

            {/* Business Plan */}
            <div className="pricing-card business-plan">
              <section className="Priceplan-details">
                <div className="Priceplan-header">
                  <h2 className="Priceplan-titlelight">
                    Business Plan
                    <br />
                    <span className="plan-subtitlelight">
                      For users who want to do more
                    </span>
                  </h2>
                  <h1 className="plan-pricelight">
                    {prices.business}
                    <span className="plan-subtitlelight">
                      {billing === "monthly" ? "per month" : "per year"}
                    </span>
                  </h1>
                </div>
                {user.plan === "BUSINESS" ? (
                  <button className="get-started-btn">Current Plan</button>
                ) : (
                  // getPaystackButton("BUSINESS")
                  <button className="current-plan-btn" disabled>
                    Coming soon
                  </button>
                )}
              </section>
              <section className="Priceplan-features">
                {businessPlan.map((feature, i) => (
                  <p className="Pricefeature" key={i}>
                    <span>{icons.greencheck}</span> {feature}
                  </p>
                ))}
              </section>
            </div>

            {/* Team Plan */}
            <div className="pricing-card">
              <section className="Priceplan-details">
                <div className="Priceplan-header">
                  <h2 className="Priceplan-title">
                    Team Plan
                    <span className="Priceplan-subtitle">
                      Run your company on your terms
                    </span>
                  </h2>
                  <h1 className="plan-price">
                    {prices.team}
                    <span className="Priceplan-subtitle">
                      {billing === "monthly" ? "per month" : "per year"}
                    </span>
                  </h1>
                </div>
                {user.plan === "TEAM" ? (
                  <button className="current-plan-btn">Current Plan</button>
                ) : (
                  // getPaystackButton("TEAM")
                  <button className="current-plan-btn" disabled>
                    Coming soon
                  </button>
                )}
              </section>
              <section className="Priceplan-features">
                {teamPlan.map((feature, i) => (
                  <p className="Pricefeature" key={i}>
                    <span>{icons.greencheck}</span> {feature}
                  </p>
                ))}
              </section>
            </div>
          </section>
          {/* <!-- Pricing-features-section.html --> */}
          <section
            className="features-section"
            aria-labelledby="features-heading"
            data-aos="fade-up"
            data-aos-duration="800">
            <div className="features-inner">
              <h3
                id="features-heading"
                className="features-title"
                data-aos="fade-right"
                data-aos-delay="100">
                What’s included
              </h3>

              <ul className="features-list">
                {features.map((f, i) => (
                  <li
                    className="feature-item"
                    key={i}
                    data-aos="fade-up"
                    data-aos-delay={i * 150} // stagger effect
                    data-aos-duration="700">
                    <span className="feature-icon" aria-hidden="true">
                      🔹
                    </span>
                    <span className="feature-text">
                      <strong>{f.title}</strong>
                      {f.desc ? ` ${f.desc}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>
      </div>
      <footer className="dashFooter">
        <p>&copy; 2025 Advertorial Hub. All Rights Reserved.</p>
        <a href="/Policy">Privacy Policy</a> | <a href="/AboutUs">About Us</a>
      </footer>
    </div>
  );
}
