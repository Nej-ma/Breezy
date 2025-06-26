// src/services/postService.ts - Version avec API routes
import apiClient from "@/utils/api";
import type {
  Post,
  PostVisibility,
  PostResponse,
} from "@/utils/types/postType";
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
const getAllPosts = async (params?: {
  id?: string;
  filter?: string;
  author?: string;
}): Promise<Post[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.id) queryParams.append("id", params.id);
    if (params?.filter) queryParams.append("filter", params.filter);
    if (params?.author) queryParams.append("author", params.author);

    const url = queryParams.toString() ? `posts?${queryParams}` : "posts";
    const response = await apiClient.get(url);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
};

const getFollowingPosts = async (): Promise<Post[]> => {
  try {
    const response = await apiClient.get("posts/following");

    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch following posts: ${response.statusText}`
      );
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching following posts:", error);
    throw error;
  }
};

const getPostById = async (postId: string): Promise<PostResponse> => {
  try {
    const response = await apiClient.get(`posts/?id=${postId}`);

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
    userIds.forEach((id) => queryParams.append("userIds", id));

    const response = await apiClient.get(
      `posts/users?${queryParams.toString()}`
    );

    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch posts for users: ${response.statusText}`
      );
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching posts for users:", error);
    throw error;
  }
};

const getPostsByAuthor = async (authorId: string): Promise<Post[]> => {
  try {
    const response = await apiClient.get(`posts?author=${authorId}`);

    if (response.status !== 200) {
      console.error(
        "❌ Response not OK:",
        response.status,
        response.statusText
      );
      throw new Error(
        `Failed to fetch posts by author: ${response.statusText}`
      );
    }

    const data = response.data;

    const posts = Array.isArray(data)
      ? data
      : Array.isArray(data.posts)
      ? data.posts
      : [];

    return posts;
  } catch (error) {
    console.error("Error fetching posts by author:", error);
    throw error;
  }
};

const postPost = async (content: string, visibility: string, images: string[], videos: string[]) => {
  try {
    const tags = extractTags(content);
    const mentions = extractMentions(content);

    const data = {
      content,
      visibility,
      tags,
      mentions,
      images,
      videos,
    };

    const response = await apiClient.post("posts", data);

    if (response.status === 201) {
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

const likePost = async (postId: string, userId: string) => {
  try {
    const response = await apiClient.put(`posts/${postId}/like`, { userId });

    if (response.status === 200) {
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
    } else {
      throw new Error(`Error deleting post: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

// Supprimer un post en tant que modérateur (peut supprimer n'importe quel post)
const moderatorDeletePost = async (postId: string, reason?: string) => {
  try {
    const response = await apiClient.delete(`posts/${postId}`, {
      data: { 
        moderatorAction: true,
        reason: reason || "Contenu inapproprié" 
      }
    });

    if (response.status === 200) {
      console.log(`Post ${postId} supprimé par modération`);
    } else {
      throw new Error(`Error deleting post as moderator: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting post as moderator:", error);
    throw error;
  }
};

const getPostsByTags = async (
  tags: string[],
  limit?: number,
  skip?: number
): Promise<{
  posts: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    limit: number;
    skip: number;
  };
  searchCriteria: {
    tags: string[];
  };
}> => {
  try {
    const queryParams = new URLSearchParams();
    tags.forEach((tag) => queryParams.append("tags", tag));
    if (limit) queryParams.append("limit", limit.toString());
    if (skip) queryParams.append("skip", skip.toString());

    const response = await apiClient.get(
      `posts/search/tags?${queryParams.toString()}`
    );

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
  getPostById,
  getUserPostsByUserIds,
  postPost,
  likePost,
  getPostsByAuthor,
  updatePostContent,
  updatePostVisibility,
  deletePost,
  moderatorDeletePost,
  getPostsByTags,
};
