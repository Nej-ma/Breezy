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
import { useAuth } from "@/app/auth-provider";

// types
import type { UserProfile } from "@/utils/types/userType";

export default function HomePage() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postService.getUserPosts();
        setPosts(response);
        
        if (user?.username) {
          const userProfile: UserProfile = await userService.getUserProfile(
            user.username
          );
          setUserProfile(userProfile);
        }
      } catch (error) {
        console.error("Error fetching posts or user profile:", error);
      }
    };
    
    if (user) {
      fetchPosts();
    }
  }, [user]); // Dépendance sur user pour éviter les appels avec username vide

  const refreshPosts = useCallback(() => {
    const fetchPosts = async () => {
      try {
        const response = await postService.getUserPosts();
        setPosts(response);
      } catch (error) {
        console.error("Error refreshing posts:", error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <main className="flex flex-col items-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Breezy</h1>
      <PostComposer userProfile={userProfile} refreshPosts={refreshPosts} />
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 mt-6">
        {posts.map((post: PostType) => {
          if (!userProfile) return null;
          return (
            <Post
              key={post._id}
              post={post}
              user={userProfile}
              refreshPosts={refreshPosts}
            />
          );
        })}
      </div>
    </main>
  );
}