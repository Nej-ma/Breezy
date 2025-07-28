import apiClient from "@/utils/api";
import type { CommentType } from "@/utils/types/commentType";

export type CommentRequest = {
  content: string;
  parentComment: string | null; // ID of the parent comment if it's a reply
  mentions: string[]; // List of mentioned users
};

const getPostComments = async (postId: string): Promise<CommentType[]> => {
  try {
    const response = await apiClient.get(`posts/comments/${postId}`);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }

    return response.data;
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
): Promise<void> => {
  const request = {
    content: comment,
    parentComment: parentCommentId,
    mentions: mentions,
  };

  try {
    const response = await apiClient.post(`posts/comments/${postId}`, request);

    if (response.status !== 200) {
      throw new Error(`Failed to create comment: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

const updateComment = async (
  commentId: string,
  comment: string,
  mentions: string[] = []
): Promise<Comment> => {
  try {
    const response = await apiClient.put(`posts/comments/${commentId}`, {
      comment,
      mentions,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to update comment: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
};

const likeComment = async (
  commentId: string,
  likeState: "like" | "unlike"
): Promise<void> => {
  try {
    const response = await apiClient.put(`posts/comments/${commentId}/like`, {
      action: likeState,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to like comment: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error liking comment:", error);
    throw error;
  }
};

const deleteComment = async (commentId: string): Promise<void> => {
  try {
    const response = await apiClient.delete(`posts/comments/${commentId}`);

    if (response.status !== 200) {
      throw new Error(`Failed to delete comment: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

const moderateComment = async (commentId: string, reason?: string): Promise<void> => {
  try {
    const response = await apiClient.delete(`posts/comments/${commentId}`, {
      data: { reason: reason || 'Moderation action' }
    });

    if (response.status !== 200) {
      throw new Error(`Failed to moderate comment: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error moderating comment:", error);
    throw error;
  }
};

export const commentService = {
  getPostComments,
  createComment,
  updateComment,
  likeComment,
  deleteComment,
  moderateComment,
};
