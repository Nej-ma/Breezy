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
  visibility: "public" | "private" | "friends"; // adjust as needed
  createdAt: string;
};
