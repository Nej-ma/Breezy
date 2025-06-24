// src/services/postService.ts - Version avec API routes
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
const getUserPosts = async (): Promise<Post[]> => {
  try {
    const response = await fetch("/api/posts", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
};

const getUserPostsById = async (postId: string): Promise<Post> => {
  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user posts by ID:", error);
    throw error;
  }
};

const getUserPostsByUserIds = async (userIds: string[]): Promise<Post[]> => {
  try {
    const queryParams = new URLSearchParams();
    userIds.forEach(id => queryParams.append('userIds', id));
    
    const response = await fetch(`/api/posts/users?${queryParams.toString()}`, {
      method: "GET",
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts for users: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching posts for users:", error);
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

    const response = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    console.log("📊 Post response status:", response.status);

    if (response.status === 201) {
      console.log("✅ Post created successfully");
      return await response.json();
    } else if (response.status === 400) {
      throw new Error("Bad request: Invalid post data");
    } else if (response.status === 401) {
      throw new Error("Unauthorized: Please log in");
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Unexpected error: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};

const likePost = async (postId: string) => {
  try {
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: "PUT",
      credentials: "include",
    });

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
    const response = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        content,
        tags: extractTags(content),
        mentions: extractMentions(content),
      }),
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
    const response = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ visibility }),
    });

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
    const response = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
      credentials: "include",
    });

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
    
    const response = await fetch(`/api/posts/search/tags?${queryParams.toString()}`, {
      method: "GET",
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts by tags: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching posts by tags:", error);
    throw error;
  }
};

export const postService = {
  getUserPosts,
  getUserPostsById,
  getUserPostsByUserIds,
  postPost,
  likePost,
  updatePostContent,
  updatePostVisibility,
  deletePost,
  getPostsByTags,
};

