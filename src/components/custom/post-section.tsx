import React, {
  forwardRef,
  useEffect,
  useState,
  useImperativeHandle,
} from "react";

import { Post as PostType } from "@/utils/types/postType";
import { UserProfile } from "@/utils/types/userType";
import { Post } from "./post";

// services
import { postService } from "@/services/postService";

// hooks
import { useAuthorProfiles } from "@/hooks/use-author";

// Add export for the ref type
export interface PostsSectionRef {
  refresh: () => Promise<void>;
}

interface PostsSectionProps {
  posts?: PostType[]; // Optional, if you want to pass initial posts
  userProfile: UserProfile;
  filter?: (post: PostType) => boolean;
  isLoading?: boolean;
}

export const PostsSection = forwardRef<PostsSectionRef, PostsSectionProps>(
  ({ posts: initialPosts, userProfile, filter, isLoading }, ref) => {
    const { authorProfiles, getAuthorProfile } = useAuthorProfiles();

    const [posts, setPosts] = useState<PostType[]>(initialPosts || []);

    const filteredPosts = filter ? posts.filter(filter) : posts;

    const fetchPosts = async () => {
      console.log("Fetching posts...");
      try {
        const response = await postService.getAllPosts();
        setPosts(response);

        // Pre-fetch author profiles
        response.forEach((post) => {
          if (post.author && !authorProfiles[post.author]) {
            getAuthorProfile(post.author);
          }
        });
      } catch (error) {
        console.error("Error refreshing posts:", error);
      }
    };

    useImperativeHandle(ref, () => ({
      refresh: fetchPosts,
    }));

    useEffect(() => {
      // Only fetch posts if no initial posts were provided
      if (!initialPosts || initialPosts.length === 0) {
        console.log("No initial posts, fetching posts...");
        fetchPosts();
      } else {
        console.log("Using initial posts:", initialPosts.length);
        // Pre-fetch author profiles for initial posts
        initialPosts.forEach((post) => {
          if (post.author && !authorProfiles[post.author]) {
            getAuthorProfile(post.author);
          }
        });
      }
    }, [initialPosts]); // Depend on initialPosts

    const refreshPosts = async () => {
      await fetchPosts();
    };

    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Post
            key={post._id}
            post={post}
            userProfile={userProfile}
            authorProfile={authorProfiles[post.author]}
            refreshPosts={refreshPosts}
          />
        ))}
      </div>
    );
  }
);
