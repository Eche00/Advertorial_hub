"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageSkeleton from "../../ImageSkeleton";
import { icons } from "@/lib/Icons";

export default function Post() {
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [user, setUser] = useState(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    // ✅ Get postId directly from the URL pathname
    const pathParts = window.location.pathname.split("/");
    const postId = pathParts[pathParts.length - 1];
    if (!postId) return;

    // fetch post
    fetch(`https://advertorial-backend.onrender.com/api/posts/${postId}`)
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch((err) => console.error("Error fetching post:", err));

    // fetch analytics
    fetch(
      `https://advertorial-backend.onrender.com/api/posts/analytics/${postId}`
    )
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((err) => console.error("Error fetching analytics:", err));

    // fetch user
    const getUser = async () => {
      const userIdOrEmail = localStorage.getItem("userId");
      if (!userIdOrEmail) return router.push("/authentication/Login");

      try {
        const res = await fetch(
          `https://advertorial-backend.onrender.com/api/auth/user/${userIdOrEmail}`
        );
        const userData = await res.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    getUser();
  }, [router]);

  if (!post) return <p>Loading...</p>;

  // handle delete post
  const handleDeletePost = async (postId) => {
    const userToken = localStorage.getItem("token");

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

      if (!response.ok) throw new Error("Failed to delete post");

      console.log(`Post ${postId} deleted successfully.`);
      router.push("/dashboard/posts"); // ✅ redirect after delete
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // handle share post
  const handleSharePost = (postId) => {
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: "Check out this post!",
          url: `${window.location.origin}/dashboard/posts/${postId}`,
        })
        .catch((error) => console.error("Error sharing post:", error));
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/dashboard/posts/${postId}`
      );
      alert("Post link copied to clipboard!");
    }
  };

  return (
    <div
      style={{ padding: "40px 0px" }}
      className="createpost-container"
      onClick={() => setMenu(false)}
    >
      <section className="recetpost-card" key={post._id}>
        {/* Post header */}
        <div className="recentpost-info">
          <article>
            <p className="avatar-dummy">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </p>
            <p>
              {user?.firstName} {user?.lastName}{" "}
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

          {/* Menu */}
          <div className="recentpost-menu">
            <span
              onClick={(e) => {
                e.stopPropagation();
                setMenu(menu === post._id ? null : post._id);
              }}
            >
              {icons.menu}
            </span>
            {menu === post._id && (
              <ul>
                <li onClick={() => handleSharePost(post._id)}>Share Post</li>
                <li>Edit Post</li>
                <li className="d" onClick={() => handleDeletePost(post._id)}>
                  Delete Post
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Post body */}
        <p style={{ margin: "0", fontSize: "16px", fontWeight: "bolder" }}>
          {post.title}
        </p>
        <p style={{ margin: "0" }}>{post.content}</p>

        {/* Images */}
        <ImageSkeleton images={post.images} />

        {/* Analytics */}
        <span>Post Insights</span>
        {analytics && (
          <div className="post-analytics" style={{ marginTop: "1rem" }}>
            <p>Total Views: {analytics?.totalViews}</p>

            <div>
              <strong>Devices:</strong>
              <ul>
                {Object.entries(analytics?.deviceStats || {}).map(
                  ([device, count]) => (
                    <li key={device}>
                      {device}: {count}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <strong>Locations:</strong>
              <ul>
                {Object.entries(analytics?.locationStats || {}).map(
                  ([location, count]) => (
                    <li key={location}>
                      {location}: {count}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
