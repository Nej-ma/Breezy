// Breezy Post Service
// Types

import apiClient from "@/utils/api";
import type { Post, PostVisibility } from "@/utils/types/postType";

export type PostRequest = {
  content: string;
  visibility: PostVisibility;
  images: File[];
  videos: File[];
  tags: string[];
  mentions: string[];
};

// private function to help process post content
const extractTags = (content: string): string[] => {
  const tagPattern = /#(\w+)/g;
  const tags = [];
  let match;

  while ((match = tagPattern.exec(content)) !== null) {
    tags.push(match[1]);
  }

  return tags;
};

const extractMentions = (content: string): string[] => {
  const mentionPattern = /@(\w+)/g;
  const mentions = [];
  let match;

  while ((match = mentionPattern.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
};

// function from API

const getUserPosts = async (): Promise<Post[]> => {
  try {
    const response = await apiClient.get(`posts`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
};

const getUserPostsById = async (postId: string): Promise<Post> => {
  try {
    const response = await apiClient.get(`posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user posts by ID:", error);
    throw error;
  }
};

const postPost = async (content: string, visibility: string, files: File[]) => {
  try {
    const tags = extractTags(content);
    const mentions = extractMentions(content);

    const data = {
      content,
      visibility,
      tags,
      mentions,
      images: files.filter((file) => file.type.startsWith("image/")),
      videos: files.filter((file) => file.type.startsWith("video/")),
    } as PostRequest;

    const response = await apiClient.post("posts", data);

    if (response.status == 201) {
      console.log("Post created successfully");
    } else if (response.status == 400) {
      console.error("Bad request: Invalid post data");
      throw new Error("Bad request: Invalid post data");
    } else if (response.status == 401) {
      console.error("Unauthorized: Please log in");
      throw new Error("Unauthorized: Please log in");
    } else {
      console.error(`Unexpected error: ${response.statusText}`);
      throw new Error(`Unexpected error: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};

const likePost = async (postId: string, userId: string) => {
  try {
    const response = await apiClient.put(`posts/${postId}/like`, { userId });
    if (response.status === 200) {
      console.log("Post liked successfully");
    } else {
      console.error(`Error liking post: ${response.statusText}`);
      throw new Error(`Error liking post: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
};

const updatePostContent = async (postId: string, content: string) => {
  try {
    const response = await apiClient.put(`posts/${postId}`, {
      content,
      tags: extractTags(content),
      mentions: extractMentions(content),
    });
    if (response.status === 200) {
      console.log("Post modified successfully");
    } else {
      console.error(`Error modifying post: ${response.statusText}`);
      throw new Error(`Error modifying post: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error modifying post:", error);
    throw error;
  }
};

const updatePostVisibility = async (postId: string, visibility: string) => {
  try {
    const response = await apiClient.put(`posts/${postId}`, {
      visibility,
    });
    if (response.status === 200) {
      console.log("Post visibility updated successfully");
    } else {
      console.error(`Error updating post visibility: ${response.statusText}`);
      throw new Error(`Error updating post visibility: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error updating post visibility:", error);
    throw error;
  }
};

const deletePost = async (postId: string) => {
  try {
    const response = await apiClient.delete(`posts/${postId}`);
    if (response.status === 200) {
      console.log("Post deleted successfully");
    } else {
      console.error(`Error deleting post: ${response.statusText}`);
      throw new Error(`Error deleting post: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

export const postService = {
  getUserPosts,
  getUserPostsById,
  postPost,
  likePost,
  updatePostContent,
  updatePostVisibility,
  deletePost,
};
