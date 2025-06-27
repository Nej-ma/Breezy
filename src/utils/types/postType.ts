export type PostVisibility = "public" | "private" | "followers"; // adjust as needed

export type Post = {
  _id: string;
  author: string;
  content: string;
  images: string[];
  videos: string[];
  tags: string[];
  mentions: string[];
  likes: string[];
  commentsCount: number;
  repostsCount: number;
  isReported: boolean;
  isDeleted: boolean;
  visibility: PostVisibility;
  createdAt: string;
  // Enriched author data from backend
  authorRole?: string;
  authorDisplayName?: string;
  authorUsername?: string;
  authorProfilePicture?: string;
};

export type PostResponse = {
  post: Post;
  filter: string;
  id: string;
};
