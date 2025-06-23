export type CommentType = {
  _id: string;
  author: string;
  authorUsername: string;
  authorDisplayName: string;
  authorProfilePicture: string;
  post: string;
  parentComment: string | null;
  content: string;
  mentions: string[];
  likes: string[];
  repliesCount: number;
  isReported: boolean;
  createdAt: string;
};
