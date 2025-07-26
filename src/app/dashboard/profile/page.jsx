"use client";
import React, { useEffect, useState } from "react";
import "../../../styles/Profile.css";
import { icons } from "@/lib/Icons";
import { toast } from "react-hot-toast";
function page() {
  const [profileImage, setProfileImage] = useState(null);
  const [user, setUser] = useState(null);
  const [selectImg, setSelectImg] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [images, setImages] = useState([]);
  const [isEdited, setIsEdited] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [originalData, setOriginalData] = useState({});
  const [userLoaded, setUserLoaded] = useState(false);

  //  Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const getUser = async () => {
    const userIdOrEmail = localStorage.getItem("userId");
    const userToken = localStorage.getItem("token");
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

      // ✅ Update input states
      setFirstName(userData.firstName || "");
      setLastName(userData.lastName || "");
      setPhoneNumber(userData.phoneNumber || "");

      setUser(userData);
      setOriginalData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phoneNumber: userData.phoneNumber || "",
        profilePicture: userData.profilePicture || "",
      });
      setUserLoaded(true);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const detectChanges = () => {
    const imageChanged = images.length > 0;

    return (
      firstName !== originalData.firstName ||
      lastName !== originalData.lastName ||
      phoneNumber !== originalData.phoneNumber ||
      imageChanged
    );
  };

  const handleUpdateProfile = async () => {
    setLoadingUpdate(true);
    setSuccessMessage("");

    const userIdOrEmail = localStorage.getItem("userId");
    const userToken = localStorage.getItem("token");
    if (!userIdOrEmail || !userToken) return alert("User not logged in");

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("phoneNumber", phoneNumber);
    if (images.length > 0) {
      formData.append("profilePicture", images[0]);
    }

    try {
      const res = await fetch(
        `https://advertorial-backend.onrender.com/api/auth/user/${userIdOrEmail}`,
        {
          method: "PUT",
          headers: {
            Authorization: `${userToken}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        setUser(data);
        setOriginalData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phoneNumber: data.phoneNumber || "",
          profilePicture: data.profilePicture || "",
        });
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setPhoneNumber(data.phoneNumber || "");
        setProfileImage(data.profilePicture);
        setImagePreviews([]);
        setImages([]);
        setIsEdited(false);
        setSuccessMessage("Profile updated successfully");

        toast.success("Profile updated successfully");

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        console.log("Failed to update profile");
        toast.error("Failed to update profile.");
      }
    } catch (err) {
      console.log("An error occurred");
      toast.error("An error occurred while updating your profile.");
    } finally {
      getUser();
      setLoadingUpdate(false);
    }
  };

  useEffect(() => {
    if (!userLoaded) return;
    setIsEdited(detectChanges());
  }, [firstName, lastName, phoneNumber, images, userLoaded]);

  const handleRemoveImage = () => {
    setImagePreviews([]);
  };

  const handleCancelEdit = () => {
    setFirstName(originalData.firstName);
    setLastName(originalData.lastName);
    setPhoneNumber(originalData.phoneNumber);
    setImages([]);
    setImagePreviews([]);
    setIsEdited(false);
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <>
      <h1 className="heading-text " data-aos="fade-down">
        Profile
      </h1>

      <div
        className="profile-container mild-zoom"
        data-aos="zoom-in"
        data-aos-delay="400"
        data-aos-duration="2000">
        <h2 className="profile-title">Profile Image</h2>

        <div className="image-section">
          <div className="avatar-box">
            {user?.profilePicture || imagePreviews.length > 0 ? (
              <>
                {imagePreviews.length > 0 ? (
                  <div>
                    {imagePreviews.map((src, index) => (
                      <img
                        key={index}
                        src={src}
                        alt={`preview-${index}`}
                        className="avatar-img "
                      />
                    ))}
                  </div>
                ) : (
                  <img
                    src={user?.profilePicture}
                    alt="Profile"
                    className="avatar-img"
                  />
                )}
              </>
            ) : (
              <div className="avatar-placeholder">
                {(user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")}
              </div>
            )}
            <div className="upload-controls">
              <h2 className="image-headt">Upload Image</h2>
              <p className="image-note">PNG, JPEG: 500 x 500 px</p>
              <div>
                <label
                  className="upload-btn"
                  onClick={() => setSelectImg(true)}>
                  Upload
                </label>
                {imagePreviews.length > 0 && (
                  <button className="remove-btn" onClick={handleRemoveImage}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="counts">
            <div>
              <p className="count-label">Post Counts</p>
              <p className="count-value">{user?.postsCount}</p>
            </div>
            <div>
              <p className="count-label">Ads Counts</p>
              <p className="count-value">{user?.adsCount}</p>
            </div>
          </div>
        </div>

        <form className="form-section">
          <div className="input-row">
            <div className="input-group">
              <label>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              className="disabled-emailbox"
              type="email"
              value={user?.email}
              disabled
            />
          </div>

          <div className="input-group">
            <label>
              Phone Number <p className="location-link">(DIGITS)</p>
            </label>
            <input
              type="number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </form>

        {isEdited && (
          <div className="action-row">
            <button className="overlay-link-cancel" onClick={handleCancelEdit}>
              Cancel
            </button>
            <button
              className="overlay-link-button"
              onClick={handleUpdateProfile}
              disabled={loadingUpdate}>
              {loadingUpdate ? "Updating..." : "Update"}
            </button>
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            <p>{successMessage}</p>
          </div>
        )}
      </div>
      {/*  SELECT IMAGE MODAL */}
      {selectImg && (
        <section className="addLink-overlay mild-zoom">
          <div
            className="overlay-container"
            data-aos="zoom-in"
            data-aos-delay="100"
            data-aos-duration="500">
            <section>
              <p className="pc" onClick={() => setSelectImg(false)}>
                {icons.arrowback} Back
              </p>
              <h4 className=" overlay-header">
                Upload Image
                <button
                  type="button"
                  className=" cp "
                  onClick={() => setSelectImg(false)}>
                  {icons.exit}
                </button>
              </h4>
              <div
                className="image-select-card"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedFiles = Array.from(e.dataTransfer.files).slice(
                    0,
                    5
                  ); // limit to 5
                  if (droppedFiles.length > 0) {
                    setImages(droppedFiles);
                    const previews = droppedFiles.map((file) =>
                      URL.createObjectURL(file)
                    );
                    setImagePreviews(previews);
                  }
                }}>
                {/* icon */}
                <span>{icons.upload}</span>

                {/* hidden input for manual select */}
                <input
                  type="file"
                  className="hidden"
                  name="imgselect"
                  id="imgselect"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files).slice(0, 5);
                    if (files.length > 0) {
                      setImages(files);
                      const previews = files.map((file) =>
                        URL.createObjectURL(file)
                      );
                      setImagePreviews(previews);
                      setSelectImg(false);
                    }
                  }}
                />
                <p style={{ color: "black" }}>
                  Drag and drop images or{" "}
                  <label htmlFor="imgselect">browse </label>
                  to choose a file
                </p>

                <h5>JPEG, PNG, PDF, and MP4 formats, up to 50 MB. </h5>
              </div>
            </section>

            <div className=" link-buttons-container">
              <button
                className="overlay-link-cancel "
                id="cancel"
                onClick={() => setSelectImg(false)}>
                Cancel
              </button>{" "}
              <button
                className=" overlay-link-button "
                id="save-link"
                onClick={() => setSelectImg(false)}>
                Upload
              </button>
            </div>
          </div>
        </section>
      )}
      <footer className="dashFooter">
        <p>&copy; 2025 Advertorial Hub. All Rights Reserved.</p>
        <a href="/Policy">Privacy Policy</a> | <a href="/AboutUs">About Us</a>
      </footer>
    </>
  );
}

export default page;
