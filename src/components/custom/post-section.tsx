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
  refresh?: () => Promise<void>;
}

interface PostsSectionProps {
  posts?: PostType[]; // Optional, if you want to pass initial posts
  userProfile: UserProfile;
  filter?: (post: PostType) => boolean;
  isLoading?: boolean;
  refreshParents?: () => void;
}

export const PostsSection = forwardRef<PostsSectionRef, PostsSectionProps>(
  (
    { posts: initialPosts, userProfile, filter, isLoading, refreshParents },
    ref
  ) => {
    const { authorProfiles, getAuthorProfile } = useAuthorProfiles();
    const [loadingAuthors, setLoadingAuthors] = useState(false);

    const [posts, setPosts] = useState<PostType[]>(initialPosts || []);

    const filteredPosts = filter ? posts.filter(filter) : posts;

    const fetchPosts = async () => {
      try {
        const response = await postService.getAllPosts();
        setPosts(response);

        // Fetch all author profiles in parallel
        setLoadingAuthors(true);
        const authorPromises = response
          .filter((post) => post.author && !authorProfiles[post.author])
          .map((post) => getAuthorProfile(post.author));

        await Promise.all(authorPromises);
        setLoadingAuthors(false);
      } catch (error) {
        console.error("Error refreshing posts:", error);
        setLoadingAuthors(false);
      }
    };

    useImperativeHandle(ref, () => ({
      refresh: fetchPosts,
    }));

    useEffect(() => {
      if (!initialPosts || initialPosts.length === 0) {
        fetchPosts();
      } else {
        // Pre-fetch author profiles in parallel
        setLoadingAuthors(true);
        const authorPromises = initialPosts
          .filter((post) => post.author && !authorProfiles[post.author])
          .map((post) => getAuthorProfile(post.author));

        Promise.all(authorPromises).finally(() => setLoadingAuthors(false));
      }
    }, [initialPosts]);

    const refreshPosts = async () => {
      await fetchPosts();

      if (refreshParents) {
        refreshParents();
      }
    };

    if (isLoading || loadingAuthors) {
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
