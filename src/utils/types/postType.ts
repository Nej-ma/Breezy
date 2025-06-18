export type Post = {
  id: number;
  pinned?: boolean;
  timestamp: string;
  content: string;
  tags?: string[];
  media?: {
    type: "image" | "video";
    url: string;
  };
  comments: number;
  reposts: number;
  likes: number;
};
