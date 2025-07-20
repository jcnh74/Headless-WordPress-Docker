import React, { useState, useEffect } from "react";
import { getPosts } from "../services/api";
// import sanitizeHtml from "sanitize-html";
import WordPressBlockRenderer from "../services/blockRenderer";
// import BlockSlider from "./BlockSlider";

const blockRenderer = new WordPressBlockRenderer();

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="post-list">
      {posts.map((post) => {
        const renderedBlocks = blockRenderer.renderBlocks(
          post.content.rendered
        );
        return (
          <article key={post.id} className="post">
            <div className="post-details">
              <h2>{post.title.rendered}</h2>
              <p>Published: {new Date(post.date).toLocaleDateString()}</p>
            </div>
            <div className="post-blocks">{renderedBlocks}</div>
          </article>
        );
      })}
    </div>
  );
};

export default PostList;
