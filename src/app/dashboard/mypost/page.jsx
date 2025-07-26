"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { icons } from "@/lib/Icons";
import ImageSkeleton from "../ImageSkeleton";
import "../../../styles/Seetingshome.css";
import Loader from "../loading";
import toast from "react-hot-toast";

export default function HomePage() {
  // UI States
  const [showList, setShowList] = useState(false);
  const [addLink, setAddLink] = useState(false);
  const [profile, setProfile] = useState(false);
  const [deleteLink, setDeleteLink] = useState(false);
  const [makeAds, setMakeAds] = useState(false);
  const [editPosts, setEditPosts] = useState(false);
  const [deletePost, setDeletePost] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  // EDIT POST STATES
  const [isEditing, setIsEditing] = useState(false);
  const [postToEditId, setPostToEditId] = useState(null);

  // Post Progress States
  const [createPost, setCreatePost] = useState(false);
  const [selectImg, setSelectImg] = useState(false);
  const [recentPosts, setRecentPost] = useState(false);
  const [menu, setMenu] = useState(false);
  // MAKE ADS STATES
  const [adTarget, setAdTarget] = useState("");
  const [adMinAge, setAdMinAge] = useState("");
  const [adMaxAge, setAdMaxAge] = useState("");
  const [adLocation, setAdLocation] = useState("");
  const [adGender, setAdGender] = useState("");
  const [adPost, setAdPost] = useState(null); // set when opening the modal
  const [adPostId, setAdPostId] = useState(null); // set when opening the modal
  const [makeAdLoading, setMakeAdLoading] = useState(false);

  // Backend Integration States
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [isAd, setIsAd] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);

  // post array
  const [userPosts, setUserPosts] = useState([]);

  // loading states and error handling
  const [errorPost, setErrorPost] = useState(false);
  const [errorPostMessage, setErrorPostMessage] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const router = useRouter();

  // GETTING USER AND POST DATA
  const getUser = async () => {
    const userIdOrEmail = localStorage.getItem("userId");
    const userToken = localStorage.getItem("token");
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

      const response = await fetch(
        "https://advertorial-backend.onrender.com/api/posts",
        {
          headers: {
            Authorization: ` ${userToken}`,
          },
        }
      );

      const userData = await res.json();
      const postsData = await response.json();

      setUser(userData);
      // console.log(userData);
      if (!response.ok) {
        return console.error("Failed to fetch posts:", postsData);
      }

      const myPosts = postsData.filter(
        (post) => post.creatorId === userData.id
      );
      setUserPosts(myPosts);

      if (myPosts.length >= 1) {
        setRecentPost(true);
        setCreatePost(true);
      }
    } catch (error) {
      console.error("Error fetching user or posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // submiting post
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setErrorPost(false);
    const userToken = localStorage.getItem("token");

    if (!user) {
      toast.error("User not loaded yet.");
      return;
    }

    if (!userToken) {
      toast.error("No token found. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("isAd", isAd);
    formData.append("creatorId", user._id);
    formData.append("creatorEmail", user.email);

    images.slice(0, 5).forEach((image) => {
      formData.append("images", image);
    });

    if (video) {
      formData.append("video", video);
    }

    const toastId = toast.loading("Creating post...");

    try {
      const res = await fetch(
        "https://advertorial-backend.onrender.com/api/posts",
        {
          method: "POST",
          headers: {
            Authorization: ` ${userToken}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        setRecentPost(true);
        console.log("Post created:", data);
        setCreateLoading(false);
        setErrorPost(false);
        getUser();
        setTitle("");
        setContent("");
        setImages([]);
        setIsAd(false);
        setImagePreviews([]);
        setVideo(null);
        toast.success("Post created successfully!", { id: toastId });
      } else {
        console.error("Error creating post:", data);
        setCreateLoading(false);
        setErrorPost(true);
        setErrorPostMessage(data.message);
        toast.error(data?.message || "Failed to create post.", { id: toastId });
      }
    } catch (err) {
      console.error("Upload error:", err);
      setErrorPost(true);
      setErrorPostMessage(err.message || err);
      setCreateLoading(false);
      toast.error("An error occurred during upload.", { id: toastId });
    }
  };

  // HANDLE MAKE POST AD (NOT FINISHED)
  const handleSubmitAd = async () => {
    setMakeAdLoading(true); // Start loading

    const userToken = localStorage.getItem("token");
    const userIdOrEmail = user?._id || user?.email;

    if (!userToken || !userIdOrEmail || !adPostId) {
      console.log(
        "Missing data. Please check your user login or post selection."
      );
      toast.error("Missing user or post info. Please try again.");
      setMakeAdLoading(false); // Stop loading
      return;
    }

    if (!adMinAge || !adMaxAge || !adLocation || !adGender) {
      console.log("Please fill all ad targeting fields.");
      toast.error("Please fill all ad targeting fields.");
      setMakeAdLoading(false); // Stop loading
      return;
    }

    const toastId = toast.loading("Submitting ad...");

    try {
      const res = await fetch(
        `https://advertorial-backend.onrender.com/api/ads/${userIdOrEmail}/${adPostId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${userToken}`,
          },
          body: JSON.stringify({
            target: {
              ageRange: {
                min: parseInt(adMinAge),
                max: parseInt(adMaxAge),
              },
              location: adLocation,
              gender: adGender,
            },
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        console.log("Ad created successfully:", data);
        setMakeAds(false);
        setAdTarget("");
        setAdMinAge("");
        setAdMaxAge("");
        setAdLocation("");
        setAdGender("");
        setAdPost(null);
        setAdPostId(null);
        toast.success("Ad created successfully!", { id: toastId });
      } else {
        console.error("Error from server:", data);
        toast.error(data.message || "Ad creation failed.", { id: toastId });
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error: " + error.message, { id: toastId });
    }

    setMakeAdLoading(false); // Stop loading
  };

  // HANDLE EDIT POST
  const handleUpdatePost = async () => {
    setCreateLoading(true);
    setErrorPost(false);
    const userToken = localStorage.getItem("token");

    if (!user || !userToken || !postToEditId) {
      console.log("Missing user/token/postId");
      toast.error("Missing required info to update post.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("creatorId", user._id);
    formData.append("creatorEmail", user.email);

    // Only send newly added images
    images.slice(0, 5).forEach((image) => {
      formData.append("images", image);
    });

    if (video) {
      formData.append("video", video);
    }

    const toastId = toast.loading("Updating post...");

    try {
      const res = await fetch(
        `https://advertorial-backend.onrender.com/api/posts/${postToEditId}`,
        {
          method: "PUT",
          headers: {
            Authorization: ` ${userToken}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        console.log("Post updated:", data);
        setIsEditing(false);
        setPostToEditId(null);
        setCreatePost(true);
        setRecentPost(true);
        setEditPosts(false); // close modal
        setUserPosts((prev) =>
          prev.map((p) =>
            p._id === postToEditId ? data.updatedPost || data : p
          )
        );
        toast.success("Post updated successfully.", { id: toastId });
      } else {
        console.error("Update error:", data);
        setCreateLoading(false);
        setErrorPost(true);
        setErrorPostMessage(data.message);
        toast.error(data?.message || "Failed to update post.", { id: toastId });
      }
    } catch (err) {
      console.error("Upload error:", err);
      setCreateLoading(false);
      setErrorPost(true);
      setErrorPostMessage(err.message || "Unknown error");
      toast.error("An error occurred while updating.", { id: toastId });
    } finally {
      setCreateLoading(false);
      setErrorPost(false);
    }
  };

  // switching from-to create/created post
  const handleSwitch = (e) => {
    e.preventDefault();

    if (e.target.id === "createpost") {
      setCreatePost(true);
      setRecentPost(false);
      setEditPosts(false);
    } else if (e.target.id === "createdpost") {
      setCreatePost(true);
      setRecentPost(true);
    } else if (e.target.id === "editpost") {
      setCreatePost(true);
      setRecentPost(false);
      setEditPosts(true);
    }

    if (e.target.id === "cancelCreatePost" && userPosts.length >= 1) {
      // Reset form states
      setTitle("");
      setContent("");
      setImages([]);
      setVideo(null);
      setIsAd(false);
      setImagePreviews([]);

      // Show the recent post view or switch to the previous screen
      setRecentPost(true);
    } else if (e.target.id === "cancelCreatePost" && userPosts.length === 0) {
      setCreatePost(false);
    }
  };

  // handling delete post
  const handleDeletePost = async (postId) => {
    const userToken = localStorage.getItem("token");

    if (!userToken) {
      toast.error("Unauthorized. Please log in again.");
      return;
    }

    // Optional: show loading toast while deleting
    const toastId = toast.loading("Deleting post...");

    try {
      const response = await fetch(
        `https://advertorial-backend.onrender.com/api/posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: userToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete post: ${response.statusText}`);
      }

      setUserPosts((prev) => prev.filter((post) => post._id !== postId));
      toast.success("Post deleted successfully.", { id: toastId });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post.", { id: toastId });
    }
  };

  // handle share post
  const handleSharePost = (postId) => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this post",
          text: "I found this post interesting, thought you might like it too!",
          url: `https://advertorial-backend.onrender.com/api/posts/${postId}`,
        })
        .then(() => console.log("Post shared successfully!"))
        .catch((error) => console.error("Error sharing post:", error));
    }
  };

  // handle view post
  const handleViewPost = (e, postId) => {
    e.preventDefault();
    router.push(`/dashboard/posts/${postId}`);
  };

  // handling closing the menu
  const handleCancel = () => {
    setMenu(false);
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      getUser();
    }
  }, []);
  // handling likes and dislikes
  const handlePostReaction = async (postId, reactionType) => {
    const userToken = localStorage.getItem("token");

    if (!userToken) {
      router.push(`/dashboard/posts/${postId}`);
      return;
    }

    try {
      const res = await fetch(
        `https://advertorial-backend.onrender.com/api/posts/${postId}/reactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${userToken}`,
          },
          body: JSON.stringify({ reactionType }), // "like" or "dislike"
        }
      );

      const data = await res.json();

      if (res.ok) {
        console.log("Reaction successful:", data);
        // Re-fetch posts to update reaction counts
        getPosts();
      } else {
        console.error("Failed to react:", data.message);
      }
    } catch (error) {
      console.error("Error reacting to post:", error);
    }
  };
  // STATES AND CAPITAL
  const statesAndCapitals = [
    { state: "Abia", capital: "Umuahia" },
    { state: "Adamawa", capital: "Yola" },
    { state: "Akwa Ibom", capital: "Uyo" },
    { state: "Anambra", capital: "Awka" },
    { state: "Bauchi", capital: "Bauchi" },
    { state: "Bayelsa", capital: "Yenagoa" },
    { state: "Benue", capital: "Makurdi" },
    { state: "Borno", capital: "Maiduguri" },
    { state: "Cross River", capital: "Calabar" },
    { state: "Delta", capital: "Asaba" },
    { state: "Ebonyi", capital: "Abakaliki" },
    { state: "Edo", capital: "Benin City" },
    { state: "Ekiti", capital: "Ado-Ekiti" },
    { state: "Enugu", capital: "Enugu" },
    { state: "Gombe", capital: "Gombe" },
    { state: "Imo", capital: "Owerri" },
    { state: "Jigawa", capital: "Dutse" },
    { state: "Kaduna", capital: "Kaduna" },
    { state: "Kano", capital: "Kano" },
    { state: "Katsina", capital: "Katsina" },
    { state: "Kebbi", capital: "Birnin Kebbi" },
    { state: "Kogi", capital: "Lokoja" },
    { state: "Kwara", capital: "Ilorin" },
    { state: "Lagos", capital: "Ikeja" },
    { state: "Nasarawa", capital: "Lafia" },
    { state: "Niger", capital: "Minna" },
    { state: "Ogun", capital: "Abeokuta" },
    { state: "Ondo", capital: "Akure" },
    { state: "Osun", capital: "Osogbo" },
    { state: "Oyo", capital: "Ibadan" },
    { state: "Plateau", capital: "Jos" },
    { state: "Rivers", capital: "Port Harcourt" },
    { state: "Sokoto", capital: "Sokoto" },
    { state: "Taraba", capital: "Jalingo" },
    { state: "Yobe", capital: "Damaturu" },
    { state: "Zamfara", capital: "Gusau" },
  ];

  if (loading) return <Loader />;
  return (
    <div>
      {/* CONTAINER  */}
      {!createPost ? (
        <div className="  page-container">
          <h1 className=" page-h-text" data-aos="fade-down">
            Post
          </h1>
          {/* container  */}
          <main
            className=" main-card mild-zoom"
            data-aos="zoom-in"
            data-aos-delay="400"
            data-aos-duration="2000">
            {/* setup */}
            <section className=" main-card ">
              <h4 className=" h4-text  ">Your quick start guide</h4>
              <div className="profile-updating-section ">
                <p className={` ${showList ? "listoff" : "liston"} `}>
                  Getting set up checklist{" "}
                  {showList ? (
                    <button type="button" onClick={() => setShowList(false)}>
                      Skip
                    </button>
                  ) : (
                    <span onClick={() => setShowList(true)} className=" cp">
                      3 steps left
                    </span>
                  )}
                </p>
                {showList && (
                  <ul>
                    <li className="dn">
                      <span>{icons.checkgreen}</span>Confirm your email address
                    </li>
                    <li onClick={() => setAddLink(true)}>
                      <span>{icons.checkgray}</span>Add a link to your profile
                    </li>
                    <li onClick={() => setProfile(true)}>
                      <span>{icons.checkgray}</span>Update your profile
                    </li>
                  </ul>
                )}
              </div>
            </section>
            {/* Recent Post / create post */}
            <section className=" main-card ">
              <h4 className=" h4-text  ">Recent Post</h4>
              <div className="create-post-card ">
                <section className="folder-selection-container">
                  {icons.file}
                  <p>
                    No Post Yet <span>All post would appear here </span>
                  </p>
                  <button type="button" id="createpost" onClick={handleSwitch}>
                    {icons.createpost}Create Post
                  </button>
                </section>
              </div>
            </section>
          </main>
          {/* addlink section  */}
          {addLink && (
            <section className="addLink-overlay">
              <div
                className="overlay-container"
                data-aos="zoom-in"
                data-aos-delay="100"
                data-aos-duration="1000">
                <h4 className=" overlay-header">
                  Add a link to your profile
                  <button
                    type="button"
                    className=" cp "
                    onClick={() => setAddLink(false)}>
                    {icons.exit}
                  </button>
                </h4>
                <form action="" className="  overlay-form1">
                  <section className="  overlay-form2">
                    {/* selected url  */}
                    <div className="selected-url">
                      <p>
                        <span>{icons.selectedurl}</span> <span>Linkedin</span>
                      </p>
                      <p>
                        <span>{icons.editurl}</span>{" "}
                        <button
                          type="button"
                          onClick={() => setDeleteLink(true)}>
                          {icons.deleteurl}
                        </button>
                      </p>
                    </div>
                    {/* new url  */}
                    <div className="  overlay-form3 ">
                      <label htmlFor="url" className=" overlay-link-label">
                        URL
                      </label>
                      <div className="overlay-link-input">
                        <p>https://</p>
                        <input
                          type="text"
                          placeholder="www.example.com"
                          name="url"
                          id=""
                        />
                      </div>
                    </div>
                    {/*add new url  */}
                    <div className="  overlay-form3 ">
                      <label htmlFor="urlname" className=" overlay-link-label">
                        URL name
                      </label>
                      <input
                        type="text"
                        className=" overlay-input "
                        name="urlname"
                        id=""
                      />
                    </div>
                    <button className=" add-another ">
                      <span>+</span> Add another
                    </button>
                  </section>

                  <div className=" link-buttons-container">
                    <button
                      className="overlay-link-cancel "
                      id="cancel"
                      onClick={() => setAddLink(false)}>
                      Cancel
                    </button>{" "}
                    <button
                      className=" overlay-link-button "
                      id="save-link"
                      onClick={() => setAddLink(false)}>
                      Save Link
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}

          {/* profile img  */}
          {profile && (
            <section className="addLink-overlay">
              <div
                className="overlay-container"
                data-aos="zoom-in"
                data-aos-delay="100"
                data-aos-duration="1000">
                <section className=" flex flex-col gap-[16px]">
                  <h4 className=" overlay-header">
                    Update your profile image
                    <button
                      type="button"
                      className=" cp "
                      onClick={() => setProfile(false)}>
                      {icons.exit}
                    </button>
                  </h4>
                  <div
                    className="profile-container
              ">
                    {/* Dummy would be replaced by an img tag later  */}
                    <span>{icons.avatardummy}</span>
                    <button className="overlay-profile-button ">
                      Upload profile photo
                    </button>{" "}
                  </div>
                </section>

                <div className=" link-buttons-container">
                  <button
                    className="overlay-link-cancel "
                    id="cancel"
                    onClick={() => setProfile(false)}>
                    Cancel
                  </button>{" "}
                  <button
                    className=" overlay-link-button "
                    id="save-link"
                    onClick={() => setProfile(false)}>
                    Save
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* delete link  */}
          {deleteLink && (
            <section className="addLink-overlay">
              <div
                className="overlay-container"
                data-aos="zoom-in"
                data-aos-delay="100"
                data-aos-duration="1000">
                <section className=" flex flex-col gap-[16px]">
                  <h4 className=" overlay-header">
                    Delete Link
                    <button
                      type="button"
                      className=" cp "
                      onClick={() => setDeleteLink(false)}>
                      {icons.exit}
                    </button>
                  </h4>
                  <p
                    htmlFor="code"
                    className=" text-[#525866] text-[16px] font-[400] leading-[20px]">
                    This link and its data will be permanently deleted.
                  </p>
                </section>

                <div className=" link-buttons-container">
                  <button
                    className="overlay-link-cancel "
                    id="cancel"
                    onClick={() => setDeleteLink(false)}>
                    Cancel
                  </button>{" "}
                  <button
                    className=" overlay-deletelink-button"
                    id="delete-link"
                    onClick={() => setDeleteLink(false)}>
                    Yes, delete
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="page-container">
          <section className="recentpost-header">
            <h1 className=" page-h-text" data-aos="fade-down">
              {recentPosts && "Post"}
              {/* { && } */}
              {!recentPosts && !editPosts && "Create a post"}
            </h1>

            {/* show button when post has been made before  */}
            {recentPosts && (
              <button type="button" id="createpost" onClick={handleSwitch}>
                {icons.createpost}Create Post
              </button>
            )}
          </section>
          {/* RECENT POST SECTION  */}
          {recentPosts ? (
            <main
              className="createpost-container mild-zoom"
              data-aos="zoom-in"
              data-aos-delay="400"
              data-aos-duration="2000">
              <h2 className="posth-text">Recent Post</h2>
              {userPosts.map((post) => (
                <section className=" recetpost-card" key={post._id}>
                  {/* post information  */}
                  <div className=" recentpost-info">
                    <article>
                      {/*  */}

                      {user?.profilePicture ? (
                        <img
                          src={user?.profilePicture}
                          alt="Profile"
                          className="avatar-dummy-img"
                        />
                      ) : (
                        <p className="avatar-dummy">
                          {user?.firstName.slice(0, 1) +
                            user?.lastName.slice(0, 1)}
                        </p>
                      )}
                      {/*  */}

                      <p>
                        {user?.firstName + " " + user?.lastName}{" "}
                        <span>
                          {new Date() - new Date(post.createdAt) < 60000
                            ? "Just now"
                            : new Date(post.createdAt)
                                .toLocaleString("en-US", {
                                  day: "numeric",
                                  month: "long",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })
                                .replace(",", " at")}
                        </span>
                      </p>
                    </article>
                    <div className="recentpost-menu">
                      <span
                        //  onClick={() => (!menu)}
                        onClick={(e) => {
                          e.stopPropagation(),
                            setMenu(menu === post._id ? null : post._id);
                        }}>
                        {" "}
                        {icons.menu}
                      </span>
                      {menu === post._id && (
                        <ul>
                          <li
                            onClick={() => {
                              setMakeAds(true);
                              setAdPost(post);
                              setAdPostId(post._id);
                            }}>
                            Make Ads
                          </li>

                          <li
                            onClick={(e) => {
                              handleSwitch(e); // shows modal
                              // setIsEditing(true); // set edit mode
                              setPostToEditId(post._id); // track post being edited
                              setTitle(post.title); // prefill title
                              setContent(post.content); // prefill content

                              // Preload existing images into previews
                              if (post.images && post.images.length > 0) {
                                setImagePreviews(post.images); // assume post.images is an array of URLs
                              } else {
                                setImagePreviews([]);
                              }
                              setImages([]); // reset images to be uploaded (optional)
                            }}
                            id="editpost">
                            Edit Post
                          </li>
                          <li
                            className="d"
                            onClick={() => {
                              setPostToDelete(post._id); // save the correct post ID
                              setDeletePost(true); // open modal
                            }}>
                            Delete Post
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                  {/* post title  */}
                  <p
                    style={{
                      margin: "0",
                      fontSize: "16px",
                      fontWeight: "bolder",
                    }}>
                    {post.title}
                  </p>
                  {/* post write up  */}
                  <p
                    style={{
                      margin: "0",
                    }}>
                    {post.content}
                  </p>
                  <div>
                    {/* post images  */}
                    <ImageSkeleton images={post.images} />
                  </div>

                  <section>
                    <div>
                      <p>
                        {icons.likes} {post?.likes}
                      </p>
                      <p>
                        {icons.dislike} {post?.dislikes}
                      </p>
                      <button onClick={() => handleSharePost(post._id)}>
                        {" "}
                        Share {icons.sharepersonal}
                      </button>
                    </div>
                    <span onClick={(e) => handleViewPost(e, post._id)}>
                      View Insight
                    </span>
                  </section>
                </section>
              ))}
            </main>
          ) : (
            <main
              className="createpost-container mild-zoom"
              data-aos="zoom-in"
              data-aos-delay="400"
              data-aos-duration="2000">
              <h1 className=" page-h-text">{editPosts && "Edit post"}</h1>
              {/* CREATE/EDIT POST MODAL  */}
              {!editPosts ? (
                <section className="createpost-card">
                  <div className="createpost-subcard">
                    <input
                      type="text"
                      name=""
                      id=""
                      placeholder="Title"
                      className=" overlay-input "
                      value={title}
                      style={{ fontSize: "16px " }}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                      name=""
                      id=""
                      cols="30"
                      rows="10"
                      placeholder="Tell a story"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required></textarea>
                    <button type="button" onClick={() => setSelectImg(true)}>
                      <span>{icons.selectImg}</span>Add Image
                    </button>
                    {/* image preview  */}
                    {imagePreviews.length > 0 && (
                      <div className="imagepreviewcontainer">
                        {imagePreviews.map((src, index) => (
                          <img
                            key={index}
                            src={src}
                            alt={`preview-${index}`}
                            className="imagepreview "
                          />
                        ))}
                      </div>
                    )}
                    {imagePreviews.length > 0 && (
                      <p className="imagepreviewcontainer">
                        Max: 5 images allowed for Business Plan and above, 1 for
                        Free Plan.
                      </p>
                    )}
                    {errorPost && (
                      <p className="error-message">
                        Couldn't Create Post, Please try again. <br />(
                        {errorPostMessage})
                      </p>
                    )}
                  </div>

                  {/* createpost buttons  */}
                  <div className=" createpost-buttons-container">
                    <button
                      className="overlay-link-cancel "
                      id="cancelCreatePost"
                      onClick={handleSwitch}>
                      Back
                    </button>{" "}
                    <button
                      className=" overlay-link-button "
                      id="createdpost"
                      onClick={handleSubmit}>
                      {createLoading ? "Creating..." : "Create Post"}
                    </button>
                  </div>
                </section>
              ) : (
                <section className="createpost-card">
                  {/* EDIT  */}
                  <div className="createpost-subcard">
                    <input
                      type="text"
                      name=""
                      id=""
                      placeholder="Title EDIT"
                      className=" overlay-input "
                      value={title}
                      style={{ fontSize: "16px " }}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                      name=""
                      id=""
                      cols="30"
                      rows="10"
                      placeholder="Tell a story EDIT"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required></textarea>
                    <button type="button" onClick={() => setSelectImg(true)}>
                      <span>{icons.selectImg}</span>Add Image
                    </button>
                    {/* image preview  */}
                    {imagePreviews.length > 0 && (
                      <div className="imagepreviewcontainer">
                        {imagePreviews.map((src, index) => (
                          <img
                            key={index}
                            src={src}
                            alt={`preview-${index}`}
                            className="imagepreview "
                          />
                        ))}
                      </div>
                    )}
                    {imagePreviews.length > 0 && (
                      <p className="imagepreviewcontainer">
                        Max: 5 images allowed for Business Plan and above, 1 for
                        Free Plan.
                      </p>
                    )}
                    {errorPost && (
                      <p className="error-message">
                        Couldn't Create Post, Please try again. <br />(
                        {errorPostMessage})
                      </p>
                    )}
                  </div>

                  {/* createpost buttons  */}
                  <div className=" createpost-buttons-container">
                    <button
                      className="overlay-link-cancel "
                      id="cancelCreatePost"
                      onClick={handleSwitch}>
                      Back
                    </button>{" "}
                    <button
                      className="overlay-link-button"
                      id="createdpost"
                      onClick={handleUpdatePost}>
                      {createLoading ? "Updating..." : "Update Post"}
                    </button>
                  </div>
                </section>
              )}
            </main>
          )}
          {/*  SELECT IMAGE MODAL */}
          {selectImg && (
            <section className="addLink-overlay">
              <div
                className="overlay-container mild-zoom"
                data-aos="zoom-in"
                data-aos-delay="100"
                data-aos-duration="500">
                <section className=" flex flex-col gap-[16px]">
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
                      const droppedFiles = Array.from(
                        e.dataTransfer.files
                      ).slice(0, 5); // limit to 5
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
                    <p
                      style={{
                        color: "black",
                        paddingLeft: "5px",
                        paddingRight: "5px",
                        textAlign: "center",
                      }}>
                      Drag and drop up to 5 images or{" "}
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
          {/* MAKE ADS MODAL  */}
          {makeAds && (
            <section className="addLink-overlay">
              <div
                className="overlay-container mild-zoom"
                data-aos="zoom-in"
                data-aos-delay="100"
                data-aos-duration="500">
                <section>
                  <p className="pc" onClick={() => setMakeAds(false)}>
                    {icons.arrowback} Back
                  </p>
                  <h4 className=" overlay-headerAds">
                    Make Ads
                    <button
                      type="button"
                      className=" cp "
                      onClick={() => setMakeAds(false)}>
                      {icons.exit}
                    </button>
                  </h4>
                  {/* ADS INFO CONTAINER  */}
                  {adPost && (
                    <div className="ads-info-container">
                      <h5>{adPost.title}</h5>
                      <p>
                        {new Date(adPost.createdAt)
                          .toLocaleString("en-US", {
                            day: "numeric",
                            month: "long",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })
                          .replace(",", " at")}
                      </p>
                      <ul>
                        <li>
                          {icons.visibility} <span>{adPost.views.length}</span>
                        </li>
                        <li>
                          {icons.likes} <span>{adPost.likes}</span>
                        </li>
                        <li>
                          {icons.dislike} <span>{adPost.dislikes}</span>
                        </li>
                      </ul>
                    </div>
                  )}
                  {/* ADS DROPDOWN CONTAINER  */}
                  <div className="ads-dropdown-container">
                    <div>
                      <label htmlFor="target">Target</label>
                      <select
                        value={adTarget}
                        onChange={(e) => setAdTarget(e.target.value)}>
                        <option value="">Select a Target</option>
                        <option value="students">Students</option>
                        <option value="professionals">Professionals</option>
                      </select>
                    </div>
                    {/* section for two drop downs  */}
                    <section>
                      <div>
                        <label>Minimum Age</label>
                        <select
                          value={adMinAge}
                          onChange={(e) => setAdMinAge(e.target.value)}>
                          <option value="">Select min age</option>
                          {[...Array(100)].map((_, i) => (
                            <option key={i} value={i}>
                              {i}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label>Maximum Age</label>
                        <select
                          value={adMaxAge}
                          onChange={(e) => setAdMaxAge(e.target.value)}>
                          <option value="">Select max age</option>
                          {[...Array(100)].map((_, i) => (
                            <option key={i} value={i}>
                              {i}
                            </option>
                          ))}
                        </select>
                      </div>
                    </section>
                    <div>
                      <label>Location</label>
                      <select
                        value={adLocation}
                        onChange={(e) => setAdLocation(e.target.value)}>
                        <option value="">Select a location</option>
                        {statesAndCapitals.map((states) => (
                          <option value={states.state}>{states.state}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label>Gender</label>
                      <select
                        value={adGender}
                        onChange={(e) => setAdGender(e.target.value)}>
                        <option value="">Select a gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="others">Others</option>
                      </select>
                    </div>
                  </div>
                </section>

                <div className=" link-buttons-container">
                  <button
                    className="overlay-link-cancel "
                    id="cancel"
                    onClick={() => setMakeAds(false)}>
                    Cancel
                  </button>{" "}
                  <button
                    className="overlay-link-button"
                    onClick={handleSubmitAd}
                    disabled={makeAdLoading}>
                    {makeAdLoading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </section>
          )}
          {/* DELETE POST  */}
          {deletePost && (
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
                      Delete Post
                      <span>
                        Are you sure you want to delete this Post? Action <br />{" "}
                        can not be reversed.
                      </span>
                    </h2>
                  </div>
                  <span className="line-through"></span>
                  <div className="current-delete-btns">
                    <button
                      className="current-cancel-btn"
                      onClick={() => {
                        setDeletePost(false);
                        setPostToDelete(null);
                      }}>
                      Cancel
                    </button>
                    <button
                      className="current-delete-btn"
                      onClick={() => {
                        handleDeletePost(postToDelete);
                        setDeletePost(false);
                        setPostToDelete(null); // clear state
                      }}>
                      Yes, Delete Post
                    </button>
                  </div>
                </section>
              </div>
            </section>
          )}
        </div>
      )}
      <footer className="dashFooter">
        <p>&copy; 2025 Advertorial Hub. All Rights Reserved.</p>
        <a href="/Policy">Privacy Policy</a> | <a href="/AboutUs">About Us</a>
      </footer>
    </div>
  );
}
