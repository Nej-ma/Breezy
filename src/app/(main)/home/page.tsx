"use client";

import React, { useCallback, useEffect, useState } from "react";

// services
import { userService } from "@/services/userService";
import { postService } from "@/services/postService";
import type { Post as PostType } from "@/utils/types/postType";

// components
import PostComposer from "@/components/custom/post-composer";

// ui components
import { Post } from "@/components/custom/post";

// hooks
import { useUser } from "@/utils/hooks/useUser";

// types
import type { UserProfile } from "@/utils/types/userType";

export default function HomePage() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { getUser } = useUser();
  const user = getUser();

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await postService.getUserPosts();
      setPosts(response);

      const userProfile: UserProfile = await userService.getUserProfile(
        user?.username || ""
      );
      setUserProfile(userProfile);
    };
    fetchPosts();

    // fetch user profile in order to get avatar
  }, []);

  const refreshPosts = useCallback(() => {
    const fetchPosts = async () => {
      const response = await postService.getUserPosts();
      setPosts(response);
    };
    fetchPosts();
  }, []);

  return (
    <main className="flex flex-col items-center  min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Breezy</h1>
      <PostComposer userProfile={userProfile} refreshPosts={refreshPosts} />
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 mt-6">
        {posts.map((post: PostType) => {
          if (!userProfile) return null;

          return <Post key={post._id} post={post} user={userProfile} />;
        })}
      </div>
    </main>
  );
}
