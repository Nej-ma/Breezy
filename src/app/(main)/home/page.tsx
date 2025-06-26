"use client";
import React, { useCallback, useEffect, useState } from "react";

// services
import { userService } from "@/services/userService";

// components
import PostComposer from "@/components/custom/post-composer";

// ui components
import { PostsSection } from "@/components/custom/post-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// hooks
import { useAuth } from "@/app/auth-provider";

// types
import type { UserProfile } from "@/utils/types/userType";
import type { PostsSectionRef, PostsFilters } from "@/components/custom/post-section";

export default function HomePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();
  const postsSectionRef = React.useRef<PostsSectionRef>(null);
  const [getFollowingPost, setGetFollowingPost] = useState<boolean>(false);

  const refreshPosts = useCallback(() => {
    if (
      postsSectionRef.current &&
      typeof postsSectionRef.current.refresh === "function"
    ) {
      postsSectionRef.current.refresh();
    }
  }, []);

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;

    try {
      if (!user.id) throw new Error("User ID is undefined");
      const profile = await userService.getUserProfile(user.username);
      setUserProfile(profile);
    } catch (error) {
      setUserProfile(null);
    }
  }, [user]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow border-b mb-2 ">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Breezy</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        <PostComposer userProfile={userProfile} refreshPosts={refreshPosts} />

        <Tabs
          defaultValue="all"
          onValueChange={(value) => setGetFollowingPost(value === "following")}
        >
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              Tous les posts
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1">
              Abonnements
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="space-y-4">
              {userProfile && (
                <PostsSection
                  ref={postsSectionRef}
                  userProfile={userProfile}
                  isLoading={!userProfile}
                  filter={{ all: true }}
                />
              )}
            </div>
          </TabsContent>
          <TabsContent value="following">
            <div className="space-y-4">
              {userProfile && (
                <PostsSection
                  ref={postsSectionRef}
                  userProfile={userProfile}
                  isLoading={!userProfile}
                  filter={{ following: true }}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
