"use client";
import { useState, useEffect } from "react";
import { PaystackButton } from "react-paystack";
import { icons } from "@/lib/Icons";
import "@/styles/Pricing.css";

const publicKey = "pk_test_f0190a4895e6aa1d75d8f0d8aaab22bceecf0931"; // My own paystack public key
const Pricing = () => {
  const [billing, setBilling] = useState("monthly");
  const [user, setUser] = useState({ email: "", plan: "PERSONAL" });
  const [token, setToken] = useState(null);

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
      window.location.reload();
    } catch (err) {
      console.error(err);
      console.log(err.message);
    }
  };

  const getPaystackButton = (planName) => {
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

  return (
    <div>
      <div className="Pricepage-container">
        <main className="PriceMainContent">
          <section className="PriceHeadSection">
            <h1 className="Pricemain-heading">
              We’ve got a plan that’s <br /> perfect for you
            </h1>

            <div className="billing-buttons">
              <button
                className={`monthly-billing ${
                  billing === "monthly" ? "active" : ""
                }`}
                onClick={() => setBilling("monthly")}
              >
                Monthly Billing
              </button>
              <button
                className={`annual-billing ${
                  billing === "annual" ? "active" : ""
                }`}
                onClick={() => setBilling("annual")}
              >
                Annual Billing
              </button>
            </div>
          </section>

          <section className="pricing-section">
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
                {[...Array(5)].map((_, i) => (
                  <p className="Pricefeature" key={i}>
                    <span>{icons.greencheck}</span> Unlimited Post
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
                  getPaystackButton("BUSINESS")
                )}
              </section>
              <section className="Priceplan-features">
                {[...Array(5)].map((_, i) => (
                  <p className="Pricefeaturelight" key={i}>
                    <span>{icons.whitecheck}</span> Unlimited Post
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
                  getPaystackButton("TEAM")
                )}
              </section>
              <section className="Priceplan-features">
                {[...Array(5)].map((_, i) => (
                  <p className="Pricefeature" key={i}>
                    <span>{icons.greencheck}</span> Unlimited Post
                  </p>
                ))}
              </section>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Pricing;
