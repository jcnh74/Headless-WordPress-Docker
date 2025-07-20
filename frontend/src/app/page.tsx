"use client";

import PostList from "./components/PostList";
import newlogo from "./logo.svg";
import Image from "next/image";

export default function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <Image
          className="logo"
          src={newlogo}
          alt="Logo"
          width={100}
          height={100}
        />
        <PostList />
      </header>
    </div>
  );
}
