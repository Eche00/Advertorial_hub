"use client";

import { useEffect, useRef, useState } from "react";
import { icons } from "../../lib/Icons";
import { useRouter } from "next/navigation";
import ImageSkeleton from "./ImageSkeleton";
import "../../styles/Seetingshome.css";
import Loader from "./loading";
import toast from "react-hot-toast";

export default function HomePage() {
  // Post Progress States
  const [selectImg, setSelectImg] = useState(false);
  const [recentPosts, setRecentPost] = useState(true);
  const [loading, setLoading] = useState(true);
  // Backend Integration States
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [isAd, setIsAd] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);

  // post array
  const [userPosts, setUserPosts] = useState([]);
  const [userReactions, setUserReactions] = useState({});
  const [isReacting, setIsReacting] = useState({});

  // loading states and error handling
  const [errorPost, setErrorPost] = useState(false);
  const [errorPostMessage, setErrorPostMessage] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const router = useRouter();

  // Getting users
  const getAllUsers = async () => {
    const userToken = localStorage.getItem("token");
    try {
      const res = await fetch(
        `https://advertorial-backend.onrender.com/api/auth/users`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`, // this was missing
            "Content-Type": "application/json",
          },
        }
      );
      const users = await res.json();
      setAllUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Getting user
  const getUser = async (idOrEmail) => {
    const userToken = localStorage.getItem("token");

    try {
      const response = await fetch(
        `https://advertorial-backend.onrender.com/api/auth/user/${idOrEmail}`,
        {
          headers: {
            Authorization: ` ${userToken}`,
          },
        }
      );

      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  // Getting posts
  const getPosts = async () => {
    const userToken = localStorage.getItem("token");
    const currentUserId = localStorage.getItem("userId");
    setLoading(true);
    try {
      const response = await fetch(
        "https://advertorial-backend.onrender.com/api/posts",
        {
          headers: {
            Authorization: ` ${userToken}`,
          },
        }
      );

      const postsData = await response.json();
      console.log("Post ID:" + postsData);

      if (!response.ok) {
        return console.error("Failed to fetch posts:", postsData);
      }

      // ✅ Fetch creator data for each post
      const postsWithCreators = await Promise.all(
        postsData.map(async (post) => {
          const creatorData = await getUser(post.creatorId);
          return {
            ...post,
            creator: creatorData,
          };
        })
      );

      setUserPosts(postsWithCreators);

      // ✅ Reactions
      const reactions = {};
      postsData.forEach((post) => {
        reactions[post._id] = {
          liked:
            Array.isArray(post.likesUsers) &&
            currentUserId &&
            post.likesUsers.some(
              (id) => id?.toString() === currentUserId.toString()
            ),
          disliked:
            Array.isArray(post.dislikesUsers) &&
            currentUserId &&
            post.dislikesUsers.some(
              (id) => id?.toString() === currentUserId.toString()
            ),
        };
      });
      setUserReactions(reactions);
      console.log("✅ Reactions updated after getPosts:", reactions);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // to handle post data on but clicks to get updated data, connection above
  useEffect(() => {
    if (typeof window !== "undefined") {
      getAllUsers();
      getPosts();
      getUser();
    }
  }, []);
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
        setTitle("");
        setContent("");
        setImages([]);
        setImagePreviews([]);
        toast.success("Post created successfully!");
        getPosts();
      } else {
        toast.error(data?.message || "Error creating post.");
        setErrorPost(true);
        setErrorPostMessage(data.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("An error occurred. Please try again.");
      setErrorPost(true);
      setErrorPostMessage(err.message || err);
    } finally {
      setCreateLoading(false);
    }
  };

  // switching from-to create/created post
  const handleSwitch = (e) => {
    e.preventDefault();

    if (e.target.id === "createpost") {
      setRecentPost(false);
    } else if (e.target.id === "createdpost") {
      setRecentPost(true);
    }

    if (e.target.id === "cancelCreatePost") {
      setRecentPost(true);
    }
  };

  // handle view post
  const handleViewPost = (e, postId) => {
    e.preventDefault();
    router.push(`/dashboard/posts/${postId}`);
  };

  // handling likes and dislikes
  const handlePostReaction = async (postId, reactionType) => {
    const userToken = localStorage.getItem("token");
    if (!userToken) {
      // redirect or show login modal
      return;
    }

    // ----- optimistic update prep -----
    const prevReactions = userReactions;
    const prevPosts = userPosts;

    const prev = prevReactions[postId] || { liked: false, disliked: false };

    let next = { ...prev };
    if (reactionType === "like") {
      // toggle like, clear dislike if turning like on
      next = {
        liked: !prev.liked,
        disliked: prev.liked ? prev.disliked : false,
      };
    } else if (reactionType === "dislike") {
      // toggle dislike, clear like if turning dislike on
      next = {
        liked: prev.disliked ? prev.liked : false,
        disliked: !prev.disliked,
      };
    }

    // compute new counts for the post
    const updatedPosts = userPosts.map((p) => {
      if (p._id !== postId) return p;

      let likes = p.likes ?? 0;
      let dislikes = p.dislikes ?? 0;

      if (reactionType === "like") {
        if (prev.liked) {
          // undo like
          likes -= 1;
        } else {
          // new like
          likes += 1;
          if (prev.disliked) dislikes -= 1; // remove old dislike
        }
      } else {
        // dislike
        if (prev.disliked) {
          // undo dislike
          dislikes -= 1;
        } else {
          // new dislike
          dislikes += 1;
          if (prev.liked) likes -= 1; // remove old like
        }
      }

      return { ...p, likes, dislikes };
    });

    // set optimistic state
    setIsReacting((m) => ({ ...m, [postId]: true }));
    setUserReactions((r) => ({ ...r, [postId]: next }));
    setUserPosts(updatedPosts);

    try {
      const res = await fetch(
        `https://advertorial-backend.onrender.com/api/posts/${postId}/reactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${userToken}`,
          },
          body: JSON.stringify({ reactionType }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Reaction failed");
      }

      // If backend returns the fresh counts, you can sync them here:
      setUserPosts((posts) =>
        posts.map((p) =>
          p._id === postId
            ? { ...p, likes: data.likes, dislikes: data.dislikes }
            : p
        )
      );
    } catch (err) {
      console.error(err);

      // rollback
      setUserReactions(prevReactions);
      setUserPosts(prevPosts);
    } finally {
      setIsReacting((m) => ({ ...m, [postId]: false }));
    }
  };

  useEffect(() => {
    console.log("User reactions:", userReactions);
  }, [userReactions]);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-container">
        <section className="recentpost-header">
          <h1 className=" page-h-text" data-aos="fade-down">
            {recentPosts ? "Home" : "Create a post"}
          </h1>
          {/* show button when post has been made before  */}
          {recentPosts && (
            <button type="button" id="createpost" onClick={handleSwitch}>
              {icons.createpost}Create Post
            </button>
          )}
        </section>
        {/* container  */}
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

                    {post?.creator?.profilePicture ? (
                      <img
                        src={post?.creator?.profilePicture}
                        alt="Profile"
                        className="avatar-dummy-img"
                      />
                    ) : (
                      <p className="avatar-dummy">
                        {post?.creator?.firstName.slice(0, 1) +
                          post?.creator?.lastName.slice(0, 1)}
                      </p>
                    )}

                    {/*  */}

                    <p>
                      {post?.creator?.firstName + " " + post?.creator?.lastName}{" "}
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
                    <p
                      onClick={() =>
                        !isReacting[post._id] &&
                        handlePostReaction(post._id, "like")
                      }
                      className="reaction-button">
                      {userReactions[post._id]?.liked
                        ? icons.likesfill
                        : icons.likes}
                      {post?.likes}
                    </p>

                    <p
                      onClick={() =>
                        !isReacting[post._id] &&
                        handlePostReaction(post._id, "dislike")
                      }
                      className="reaction-button">
                      {userReactions[post._id]?.disliked
                        ? icons.dislikefill
                        : icons.dislike}
                      {post?.dislikes}
                    </p>

                    <button onClick={() => handleSharePost(post._id)}>
                      {" "}
                      Share {icons.sharepublic}
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
          </main>
        )}
        {/*  img  select */}
        {selectImg && (
          <section className="addLink-overlay mild-zoom">
            <div
              className="overlay-container"
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
      </div>
      <footer className="dashFooter">
        <p>&copy; 2025 Advertorial Hub. All Rights Reserved.</p>
        <a href="/Policy">Privacy Policy</a> | <a href="/AboutUs">About Us</a>
      </footer>
    </div>
  );
}
