"use client";

import React, { useEffect, useState } from "react";
import "../../../styles/Myads.css";
import { icons } from "@/lib/Icons";
import Loader from "../loading";
import { toast } from "react-hot-toast";

function page() {
  const [ads, setAds] = useState([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [all, setAll] = useState(true);
  const [approved, setApproved] = useState(false);
  const [pending, setPending] = useState(false);

  const [filterAds, setFilterAds] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [viewAdsInsight, setViewAdsInsights] = useState(false);
  const [editAds, setEditAds] = useState(false);
  const [deleteAds, setDeleteAds] = useState(false);
  const [adToRemoveId, setAdToRemoveId] = useState(null);
  const [status, setStatus] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedAdId, setSelectedAdId] = useState(null);
  const [adInsightData, setAdInsightData] = useState(null);

  // FETCHING ADS
  useEffect(() => {
    const fetchUserAds = async () => {
      const userToken = localStorage.getItem("token");
      const userIdOrEmail = localStorage.getItem("userId");

      if (!userToken || !userIdOrEmail) {
        console.warn("Missing user token or ID/email");
        return;
      }

      setLoadingAds(true);

      try {
        const res = await fetch(
          `https://advertorial-backend.onrender.com/api/ads/user/${userIdOrEmail}`,
          {
            headers: {
              Authorization: `${userToken}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setAds(data);
          console.log(" Ads fetched:", data);
        } else {
          console.error("Failed to fetch ads:", data);
        }
      } catch (error) {
        console.error("Network error:", error);
      } finally {
        setLoadingAds(false);
      }
    };

    fetchUserAds();
  }, []);

  const handleApplyFilter = () => {
    setFilterAds(false); // close modal
  };

  // HANDLE SWITCHING DISPLAY
  const handleSwith = (e) => {
    setStatus(e.target.id); // "all", "approved", "pending"
  };

  // VIEW SPECIFIC ADS
  const handleViewAdsInsight = async (adId) => {
    setViewAdsInsights(true);
    setSelectedAdId(adId);

    try {
      const res = await fetch(
        `https://advertorial-backend.onrender.com/api/ads/${adId}`
      );
      const data = await res.json();
      setAdInsightData(data);
      console.log("ADS DATA:" + data);
      console.log("Keys:", Object.keys(data));
    } catch (err) {
      console.error("Error fetching ad insight:", err.message);
    }
  };

  // DELETE AD
  const handleDeleteAd = async () => {
    const userIdOrEmail = localStorage.getItem("userId");
    const userToken = localStorage.getItem("token");

    console.log(adToRemoveId);
    console.log(userIdOrEmail);

    try {
      const res = await fetch(
        `https://advertorial-backend.onrender.com/api/ads/${userIdOrEmail}/${adToRemoveId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${userToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete ad.");
      }

      setAds((prevAds) =>
        prevAds.filter((ad) => ad.postId._id !== adToRemoveId)
      );
      setDropDown(null);
      toast.success("Ad deleted successfully.");
    } catch (error) {
      console.error("Error deleting ad:", error.message);
      toast.error("Failed to delete ad.");
    }
  };

  // FILTERING ADS ON SEARCHED,STATUS ON FILTER, FILTER ON DATE AND FILTER ON BUTTON
  const filteredAds = ads
    .filter((ad) => {
      if (status === "approved") return ad.status === "approved";
      if (status === "pending") return ad.status === "pending";
      return true; // all
    })
    .filter((ad) => {
      if (fromDate && new Date(ad.createdAt) < new Date(fromDate)) return false;
      if (toDate && new Date(ad.createdAt) > new Date(toDate)) return false;
      return true;
    })
    .filter((ad) =>
      ad?.postId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loadingAds) return <Loader />;
  return (
    <div>
      <h1 className="heading-text " data-aos="fade-down">
        My Ads
      </h1>

      {/* CONTAINER  */}
      <main
        className="myads-container mild-zoom"
        data-aos="zoom-in"
        data-aos-delay="400"
        data-aos-duration="2000">
        {/* HEADER  */}
        <section className="myads-header">
          {/* BUTTONS  */}
          <div className="ads-button-container">
            <button
              id="all"
              onClick={handleSwith}
              className={`adsbtn ${status === "all" && "active"}`}>
              All Ads{" "}
            </button>
            <button
              id="approved"
              onClick={handleSwith}
              className={`adsbtn ${status === "approved" && "active"}`}>
              Approved Ads
            </button>
            <button
              id="pending"
              onClick={handleSwith}
              className={`adsbtn ${status === "pending" && "active"}`}>
              Pending Ads
            </button>
          </div>
          {/* SEARCH  */}
          <div className="ads-search-container">
            <div>
              <span>{icons.search}</span>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={() => setFilterAds(true)}>
              {icons.filter} Filter
            </button>
          </div>
        </section>
        {/* CARD CONTAINER  */}
        {filteredAds.length === 0 ? (
          <div className="empty-state">
            <p
              style={{
                textAlign: "center",
                padding: "2rem",
                fontSize: "1.2rem",
                color: "#888",
                fontStyle: "italic",
              }}>
              No ads found.
            </p>
          </div>
        ) : (
          <section className="myads-card-container">
            {filteredAds.map((ad) => (
              <div key={ad._id} className="myads-card">
                {/* top  */}
                <section className="ads-image">
                  <img src={ad?.postId?.images[0]} alt="Ad banner" />
                  <span
                    className={
                      ad.status === "pending" ? "adspending" : "adsapproved"
                    }>
                    {ad.status}
                  </span>
                </section>
                {/* middle  */}
                <section className="myads-info">
                  <h4>{ad?.postId?.title || "No title"}</h4>
                  <p>{ad?.postId?.content}</p>
                </section>
                <hr />
                {/* bottom  */}
                <section className="myads-extra">
                  <p>
                    Date Posted{" "}
                    <span>{new Date(ad.createdAt).toLocaleDateString()}</span>
                  </p>
                  <span
                    onClick={(e) => {
                      e.stopPropagation(),
                        setDropDown((prev) =>
                          prev === ad._id ? null : ad._id
                        );
                    }}>
                    {icons.options}

                    {dropDown === ad._id && (
                      <ul className="myads-menu">
                        <li onClick={() => handleViewAdsInsight(ad._id)}>
                          View Ads Insight
                        </li>

                        <li onClick={() => setEditAds(!editAds)}>Edit Ads</li>
                        <li
                          className="d"
                          onClick={() => {
                            setAdToRemoveId(ad?.postId?._id); // save which ad
                            setDeleteAds(true); // show modal
                          }}>
                          Delete Ads
                        </li>
                      </ul>
                    )}
                  </span>
                </section>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* ADS FILTERING  */}
      {filterAds && (
        <section className="filterads-overlay">
          <div className="filterads-overlay-container">
            <div className="filter-modal-header">
              <h2>Filter by</h2>
              <p className="pc" onClick={() => setFilterAds(false)}>
                {icons.arrowback} Back
              </p>
              <button
                className="close-button"
                onClick={() => setFilterAds(false)}>
                &times;
              </button>
            </div>
            <div className="ads-filter">
              <div className="filter-section">
                <h4 className="filter-label">Ads Status</h4>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="all"
                    checked={status === "all"}
                    onChange={() => setStatus("all")}
                  />
                  All
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="approved"
                    checked={status === "approved"}
                    onChange={() => setStatus("approved")}
                  />
                  Approved
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="pending"
                    checked={status === "pending"}
                    onChange={() => setStatus("pending")}
                  />
                  Pending
                </label>
              </div>

              <div className="filter-section">
                <h4 className="filter-label">Date Range</h4>
                <div className="date-range">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                  <span className="dash">—</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="apply-btn-container">
                <button className="apply-button" onClick={handleApplyFilter}>
                  Apply Filter ({filteredAds.length} results)
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
      {/* ADS INSIGHT  */}
      {viewAdsInsight && (
        <section className="addLink-overlay">
          <div className="overlay-container">
            {/* <div className="modal"> */}
            <div className="modal-header">
              <h2>Ads Insight</h2>
              <button
                className="close-button"
                onClick={() => setViewAdsInsights(false)}>
                &times;
              </button>
            </div>

            <div className="metrics-grid">
              <div className="card">
                <h3 className="insight-title">
                  {icons.checkfill} Ads Overview
                </h3>
                <ul>
                  <li>
                    ID <span>{adInsightData?._id}</span>
                  </li>
                  <li>
                    Status <span>{adInsightData?.status}</span>
                  </li>

                  <li>
                    Age Min <span>{adInsightData?.target?.ageRange?.min}</span>
                  </li>
                  <li>
                    Age Max <span>{adInsightData?.target?.ageRange?.max}</span>
                  </li>
                  <li>
                    Gender <span>{adInsightData?.target?.gender}</span>
                  </li>
                  <li>
                    Locations <span>{adInsightData?.target?.location}</span>
                  </li>
                </ul>
              </div>

              <section>
                <div className="card">
                  <h3 className="insight-title">
                    {icons.checkfill} Creator Details
                  </h3>
                  <ul>
                    <li>
                      First Name <span>{adInsightData?.userId?.firstName}</span>
                    </li>
                    <li>
                      Last Name <span>{adInsightData?.userId?.lastName}</span>
                    </li>
                    <li className="br">
                      Email
                      <span>{adInsightData?.userId?.email}</span>
                    </li>
                  </ul>
                </div>

                <div className="card">
                  <h3 className="insight-title">
                    {icons.checkfill} Post Details
                  </h3>
                  <ul>
                    <li className="br">
                      ID
                      <span>{adInsightData?.postId?._id}</span>
                    </li>
                    <li className="br">
                      Title
                      <span>{adInsightData?.postId?.title}</span>
                    </li>
                    {/* <li>
                      Top Locations <span>Lagos</span>
                    </li>
                    <li>
                      Devices <span>80% Mobile</span>
                    </li> */}
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </section>
      )}
      {/* EDIT ADS  */}
      {editAds && (
        <section className="addLink-overlay">
          <div className="overlay-container">
            {/* <div className="modal"> */}
            <div className="modal-header">
              <h2>Edit Ads</h2>
              <button
                className="close-button"
                onClick={() => setEditAds(false)}>
                &times;
              </button>
            </div>

            <div className="metrics-grid">Nothing here on ui</div>
          </div>
        </section>
      )}
      {/* Delete ADS  */}
      {deleteAds && (
        <section className="addLink-overlay">
          <div className="overlay-delete-container">
            <section className=" current-delete-container">
              <div className="current-delete-info">
                <span>{icons.deletefill}</span>
                <h2>
                  Delete Ads
                  <span>
                    Are you sure you want to delete this Ads? Action <br /> can
                    not be reversed.
                  </span>
                </h2>
              </div>
              <hr />
              <div className="current-delete-btns">
                <button
                  className="current-cancel-btn"
                  onClick={() => {
                    setDeleteAds(false);
                    setAdToRemoveId(null);
                  }}>
                  Cancel
                </button>
                <button
                  className="current-delete-btn"
                  onClick={() => {
                    handleDeleteAd(adToRemoveId);
                    setDeleteAds(false);
                    setAdToRemoveId(null);
                  }}>
                  Yes, Delete Ads
                </button>
              </div>
            </section>
          </div>
        </section>
      )}

      <footer className="dashFooter">
        <p>&copy; 2025 Advertorial Hub. All Rights Reserved.</p>
        <a href="/Policy">Privacy Policy</a> | <a href="/AboutUs">About Us</a>
      </footer>
    </div>
  );
}

export default page;
