import type { CommentType } from "@/utils/types/commentType";

export type CommentRequest = {
  content: string;
  parentComment: string | null; // ID of the parent comment if it's a reply
  mentions: string[]; // List of mentioned users
};

const getPostComments = async (postId: string): Promise<CommentType[]> => {
  try {
    const response = await fetch(`/api/posts/comments/${postId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching post comments:", error);
    throw error;
  }
};

const createComment = async (
  postId: string,
  comment: string,
  parentCommentId: string | null = null,
  mentions: string[] = []
): Promise<Comment> => {
  const request = {
    content: comment,
    parentComment: parentCommentId, // Assuming this is a top-level comment
    mentions: mentions, // Assuming no mentions for simplicity
  };

  try {
    const response = await fetch(`/api/posts/comments/${postId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create comment: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

export const commentService = {
  getPostComments,
  createComment,
};
