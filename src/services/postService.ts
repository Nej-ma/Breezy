// Breezy Post Service
// Types

import apiClient from "@/utils/api";
import type { Post } from "@/utils/types/postType";

export type PostRequest = {
  content: string;
  visibility: string;
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

export const postService = {
  getUserPosts,
  postPost,
};
