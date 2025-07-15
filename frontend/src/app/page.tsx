"use client";

import { useEffect, useState } from "react";

// Define the Post type based on expected API response
interface Post {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch(`http://localhost:8080/wp-json/wp/v2/posts`)
      .then((res) => res.json())
      .then((data: Post[]) => setPosts(data));
  }, []);
  

  return (
    <div>
      <h1>Headless WordPress Site</h1>
      {posts.map((post) => (
        <div key={post.id}>
          <h2>{post.title.rendered}</h2>
          <div dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
        </div>
      ))}
    </div>
  );
}
