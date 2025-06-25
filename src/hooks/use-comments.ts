import { useState, useRef } from "react";
import { CommentType } from "@/utils/types/commentType";
import { commentService } from "@/services/commentService";

export function useComments() {
  const [commentsCache, setCommentsCache] = useState<Record<string, CommentType[]>>({});
  const pendingFetches = useRef<Map<string, Promise<CommentType[]>>>(new Map());

  const getPostComments = async (postId: string, forceRefresh = false) => {
    // Return cached comments if they exist and no force refresh
    if (commentsCache[postId] && !forceRefresh) {
      return commentsCache[postId];
    }

    // Check if there's already a pending fetch for this post
    const pendingFetch = pendingFetches.current.get(postId);
    if (pendingFetch && !forceRefresh) {
      return pendingFetch;
    }

    // Clear existing pending fetch if force refreshing
    if (forceRefresh) {
      pendingFetches.current.delete(postId);
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