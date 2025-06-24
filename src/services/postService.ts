// src/services/postService.ts - Version avec API routes
import apiClient from "@/utils/api";
import type { Post, PostVisibility } from "@/utils/types/postType";
import { extractTags, extractMentions } from "@/utils/helpers/stringFormatter";

export type PostRequest = {
  content: string;
  visibility: PostVisibility;
  images: File[];
  videos: File[];
  tags: string[];
  mentions: string[];
};

// ✅ Utilise les API routes Next.js au lieu du backend direct
const getAllPosts = async (): Promise<Post[]> => {
  try {
    const response = await apiClient.get("posts");

    if (response.status !== 200) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
};

const getUserPostsById = async (postId: string): Promise<Post> => {
  try {
    const response = await apiClient.get(`posts/${postId}`);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching user posts by ID:", error);
    throw error;
  }
};

const getUserPostsByUserIds = async (userIds: string[]): Promise<Post[]> => {
  try {
    const queryParams = new URLSearchParams();
    userIds.forEach(id => queryParams.append('userIds', id));
    
    const response = await apiClient.get(`posts/users?${queryParams.toString()}`);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch posts for users: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching posts for users:", error);
    throw error;
  }
};

const getPostsByAuthor = async (authorId: string): Promise<Post[]> => {
  try {
    console.log("📊 Fetching posts by author:", authorId);
    const response = await apiClient.get(`posts?author=${authorId}`);
    console.log("📊 Response status:", response.status);
    
    if (response.status !== 200) {
      console.error("❌ Response not OK:", response.status, response.statusText);
      throw new Error(`Failed to fetch posts by author: ${response.statusText}`);
    }
    
    const data = response.data;
    console.log("📊 Posts data received:", data);
    console.log("📊 Data type:", typeof data, "Is array:", Array.isArray(data));
    
    const posts = Array.isArray(data) ? data : (Array.isArray(data.posts) ? data.posts : []);
    console.log("📊 Final posts array:", posts.length, "posts");
    
    return posts;
  } catch (error) {
    console.error("Error fetching posts by author:", error);
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

    console.log("📝 Creating post with data:", data);

    const response = await apiClient.post("posts", data);

    console.log("📊 Post response status:", response.status);

    if (response.status === 201) {
      console.log("✅ Post created successfully");
      return response.data;
    } else if (response.status === 400) {
      throw new Error("Bad request: Invalid post data");
    } else if (response.status === 401) {
      throw new Error("Unauthorized: Please log in");
    } else {
      throw new Error(
        response.data?.error || `Unexpected error: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};

const likePost = async (postId: string) => {
  try {
    const response = await apiClient.put(`posts/${postId}/like`);

    if (response.status === 200) {
      console.log("Post liked successfully");
    } else {
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
      throw new Error(`Error modifying post: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error modifying post:", error);
    throw error;
  }
};

const updatePostVisibility = async (
  postId: string,
  visibility: PostVisibility
) => {
  try {
    const response = await apiClient.put(`posts/${postId}`, { visibility });

    if (response.status === 200) {
      console.log("Post visibility updated successfully");
    } else {
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
      throw new Error(`Error deleting post: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

const getPostsByTags = async (tags: string[], limit?: number, skip?: number): Promise<{
  posts: Post[], 
  pagination: {
    currentPage: number,
    totalPages: number,
    totalResults: number,
    limit: number,
    skip: number
  }, 
  searchCriteria: {
    tags: string[]
  }
}> => {
  try {
    const queryParams = new URLSearchParams();
    tags.forEach(tag => queryParams.append('tags', tag));
    if (limit) queryParams.append('limit', limit.toString());
    if (skip) queryParams.append('skip', skip.toString());
    
    const response = await apiClient.get(`posts/search/tags?${queryParams.toString()}`);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch posts by tags: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching posts by tags:", error);
    throw error;
  }
};

export const postService = {
  getAllPosts,
  getUserPostsById,
  getUserPostsByUserIds,
  postPost,
  likePost,
  getPostsByAuthor,
  updatePostContent,
  updatePostVisibility,
  deletePost,
  getPostsByTags,
};

