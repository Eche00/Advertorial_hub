"use client";

import { icons } from "@/lib/Icons";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../../../styles/Settings.css";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  //  UI State
  const [changePassword, setChangePassoword] = useState(false);
  const [secureAccount, setSecureAccount] = useState(false);
  const [deleteAccount, setDeleteAccount] = useState(false);

  const [multiF, setMultiF] = useState(false);

  // Handling Backend Integeration
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [firstNameLoading, setFirstNameLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);

  // Get the logged in user's ID from localStorage
  const userIdOrEmail =
    typeof window !== "undefined" && localStorage.getItem("userId");

  // handling name update
  const handleNameUpdate = async (e) => {
    e.preventDefault();
    setFirstNameLoading(true);

    try {
      const res = await fetch(
        `https://advertorial-backend.onrender.com/api/auth/user/${userIdOrEmail}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ firstName }), // Only updating first name
        }
      );

      const data = await res.json();

      if (res.ok) {
        console.log("First name updated successfully:", data);
        toast.success("First name updated");
        setFirstName("");
      } else {
        console.error("Failed to update first name:", data.message || data);
        toast.error(data.message || "Failed to update first name");
      }
    } catch (error) {
      console.error("Error updating first name:", error);
      toast.error("An error occurred while updating your name");
    } finally {
      setFirstNameLoading(false);
    }
  };
  // handling forgotten password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError(false);

    const forgottenPasswordEmail = user?.email;

    try {
      const res = await fetch(
        `https://advertorial-backend.onrender.com/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: forgottenPasswordEmail }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        console.log("Password reset email sent:", data);
        toast.success("Password reset email sent successfully");
        setChangePassoword(false);
        setSecureAccount(true);
        setEmailError(false);
      } else {
        console.error("Failed to send reset email:", data.message || data);
        toast.error(data.message || "Failed to send password reset email");
        setEmailError(true);
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast.error("An error occurred while sending reset email");
      setEmailError(true);
    } finally {
      setEmailLoading(false);
    }
  };

  // handle name change
  const [state, setState] = useState(false);
  const handleChange = (e) => {
    const value = e.target.value;
    setFirstName(value); // Store input
    setState(value.length >= 5);
  };

  // Handle account deletion
  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (!userIdOrEmail) {
      console.log("No user ID found!");
      return; //  router.push("/auth/Login")
    }

    try {
      const res = await fetch(
        `https://advertorial-backend.onrender.com/api/auth/user/${userIdOrEmail}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage || "Error deleting account!");
      }

      console.log("Account deleted successfully!");

      // Clear user data and redirect
      localStorage.removeItem("userId");
      router.push("/authentication/Login");
    } catch (error) {
      console.error("Delete error:", error.message);
      console.log("Failed to delete account.");
    }
  };

  useEffect(() => {
    const getUser = async () => {
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

        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    getUser();
  }, [userIdOrEmail, handleNameUpdate]);
  return (
    <div>
      <h1 className="heading-text " data-aos="fade-down">
        Settings
      </h1>
      {/* container  */}
      <main className=" setting-container">
        {/* my information  */}
        <section className=" my-information">
          <h4 className=" information-header  ">My Information</h4>
          <form className="settings-form">
            <section className=" settings-subform">
              <input
                type="text"
                className="input-setting-name"
                value={firstName}
                onChange={handleChange}
                placeholder={
                  user?.firstName + " " + user?.lastName || "John Doe"
                }
              />
              <div className=" subform">
                <label htmlFor="email" className="label">
                  Email
                </label>

                <p className=" input-setting-email">
                  {user?.email || "johndoe@example.com"}
                </p>
              </div>

              <p className="email-msg">
                Your email can’t be changed as you signed up using your Google
                account.
              </p>
            </section>
            <button
              className={state ? " button-active" : " button-inactive"}
              onClick={handleNameUpdate}>
              {firstNameLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>

        {/* security  */}
        <section className=" my-information">
          <h4 className=" information-header  ">Security</h4>
          <form className="settings-form">
            <section className=" settings-subform">
              <div className=" subform">
                <label htmlFor="password" className="label">
                  Password
                </label>
                <article>
                  <input
                    type="text"
                    className=" input-security-password"
                    name="password"
                    id=""
                    placeholder="************"
                  />
                  <button
                    type="button"
                    className=" change-button"
                    onClick={() => setChangePassoword(true)}>
                    Change
                  </button>
                </article>
              </div>

              <div className=" security-detail">
                <p className=" security-textc">
                  Multi-factor Authentication{" "}
                  <span>
                    Multi-factor Authentications adds a layer of security on
                    your account
                  </span>
                </p>
                <span onClick={() => setMultiF(!multiF)}>
                  {!multiF ? icons.click : icons.clickactive}
                </span>
              </div>
            </section>
            <button className={multiF ? " button-active" : " button-inactive"}>
              Save Changes
            </button>
          </form>
        </section>

        {/* management  */}
        <section className=" my-information">
          <h4 className=" information-header  ">Account Management</h4>
          <div className="management-container">
            <p className=" management-textc">
              Plan
              <span>Free</span>
            </p>

            <div className=" management-detail">
              <p className="management-t">
                Upgrade to Pro to enjoy more features
              </p>
              <button
                className="button-blue"
                onClick={() => router.push("/Pricing")}>
                Upgrade to Pro
              </button>
            </div>
          </div>
        </section>

        {/* delete account  */}
        <section className="management-container">
          <p className=" management-textc">
            Delete Account
            <span>Permanently delete your account</span>
          </p>

          <div className=" management-detail">
            <button
              type="button"
              onClick={() => setDeleteAccount(true)}
              className="delete-accountB">
              Delete my account
            </button>
          </div>
        </section>
      </main>
      {/* change password  */}
      {changePassword && (
        <section className="settings-overlay">
          <div className="overlay-container">
            <h4 className=" overlay-header">
              Change Password{" "}
              <button
                type="button"
                className=" cursor-pointer "
                onClick={() => setChangePassoword(false)}>
                {icons.exit}
              </button>
            </h4>
            <form action="" className="  overlay-form1">
              <section className="  overlay-form2">
                {/* new password  */}
                <div className="  overlay-form3 ">
                  <label htmlFor="password" className=" overlay-label">
                    Confirm Email:
                  </label>
                  <input
                    type="text"
                    className=" overlay-input "
                    name="password"
                    value={user?.email}
                    readOnly
                  />
                </div>
              </section>
              <button
                className="button-blue overlay-button "
                id="savePasswordChange"
                onClick={handleForgotPassword}>
                {/* Save Change */}
                {emailLoading ? "Sending..." : "Send Reset Password Email"}
              </button>
              {emailError && (
                <p className="overlay-reset-email-failure">
                  Error Sending Password Reset Email.
                </p>
              )}
            </form>
          </div>
        </section>
      )}

      {/* secure account  */}
      {secureAccount && (
        <section className="settings-overlay">
          <div className="overlay-container">
            <h4 className=" overlay-header">
              Email Sent
              <button
                type="button"
                className=" cursor-pointer "
                onClick={() => setSecureAccount(false)}>
                {icons.exit}
              </button>
            </h4>
            <form action="" className="  overlay-form1">
              <section className="  overlay-form2">
                <div className="  overlay-form3 ">
                  <label htmlFor="mobilenumber" className=" overlay-label">
                    Reset Password Email Sent, Kindly check your Inbox.
                  </label>
                  <input
                    type="text"
                    className=" overlay-input "
                    name="password"
                    value={user?.email}
                    readOnly
                  />
                </div>
              </section>
              <button
                className="button-blue overlay-button"
                type="button"
                id="secure"
                onClick={() => setSecureAccount(false)}>
                Close
              </button>
            </form>
          </div>
        </section>
      )}

      {/* DELETE POST  */}
      {deleteAccount && (
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
                  Delete Your Account
                  <span>
                    This action is permanent. Please be certain you want to
                    delete this account, all your data will be permanently
                    deleted and visitors will no longer be able to see your
                    profile
                  </span>
                </h2>
              </div>
              <span className="line-through"></span>
              <div className="current-delete-btns">
                <button
                  className="current-cancel-btn"
                  onClick={() => setDeleteAccount(false)}>
                  Cancel
                </button>
                <button
                  className="current-delete-btn"
                  type="button"
                  onClick={handleDeleteAccount}>
                  Delete my account
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
