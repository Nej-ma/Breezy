"use client";

import { Post } from "@/components/custom/post";
// services

// components
import PostForm from "@/components/custom/postForm";

// ui components

import React from "react";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center  min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Breezy</h1>
      <PostForm />
    </main>
  );
}
