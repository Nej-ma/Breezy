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
        const response = await postService.getAllPosts();
        setPosts(response);

        console.log("Fetched posts:", response);

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
        const response = await postService.getAllPosts();
        setPosts(response);
      } catch (error) {
        console.error("Error refreshing posts:", error);
      }
    };
    fetchPosts();
  }, []);
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow border-b mb-2 ">        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Breezy</h1>
        </div>
      </header>
      

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        <PostComposer userProfile={userProfile} refreshPosts={refreshPosts} />
        
        <div className="space-y-4">
          {posts.map((post: PostType) => {
            if (!userProfile) return null;
            return (
              <Post
                key={post._id}
                post={post}
                userProfile={userProfile}
                refreshPosts={refreshPosts}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
