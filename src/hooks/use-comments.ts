import { useState, useRef } from "react";
import { CommentType } from "@/utils/types/commentType";
import { commentService } from "@/services/commentService";

export function useComments() {
  const [commentsCache, setCommentsCache] = useState<Record<string, CommentType[]>>({});
  const pendingFetches = useRef<Map<string, Promise<CommentType[]>>>(new Map());

  const getPostComments = async (postId: string) => {
    // Return cached comments if they exist
    if (commentsCache[postId]) {
      return commentsCache[postId];
    }

    // Check if there's already a pending fetch for this post
    const pendingFetch = pendingFetches.current.get(postId);
    if (pendingFetch) {
      return pendingFetch;
    }

    // Create new fetch promise
    const fetchPromise = commentService.getPostComments(postId)
      .then(comments => {
        setCommentsCache(prev => ({
          ...prev,
          [postId]: comments
        }));
        pendingFetches.current.delete(postId);
        return comments;
      })
      .catch(error => {
        console.error("Error fetching comments:", error);
        pendingFetches.current.delete(postId);
        return [];
      });

    pendingFetches.current.set(postId, fetchPromise);
    return fetchPromise;
  };

  return { commentsCache, getPostComments };
}