import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";

// Types
import type { Post, PostVisibility } from "@/utils/types/postType";

type CommentSectionProps = {
  post: Post;
};

const CommentSection: React.FC<CommentSectionProps> = ({ post }) => {
  const [showAllComments, setShowAllComments] = useState(false);

  const visibleComments = showAllComments
    ? post.comments
    : post.comments.slice(0, 1);

  return (
    <>
      {/* Comments Section */}
      {post.comments.length > 0 && (
        <div className="space-y-4">
          {visibleComments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage
                  src={comment.avatar || "/placeholder.svg"}
                  alt={comment.author}
                />
                <AvatarFallback className="bg-gray-500 text-white text-xs">
                  {comment.author.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-sm text-gray-900">
                    {comment.author}
                  </h4>
                  <span className="text-gray-500 text-xs">
                    {comment.username}
                  </span>
                  <span className="text-gray-500 text-xs">·</span>
                  <span className="text-gray-500 text-xs">
                    {comment.timestamp}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
              </div>
            </div>
          ))}

          {post.comments.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllComments(!showAllComments)}
              className="text-blue-500 hover:text-blue-600 p-0 h-auto font-normal"
            >
              {showAllComments
                ? "Masquer les commentaires"
                : `Voir ${post.comments.length - 1} commentaire${
                    post.comments.length - 1 > 1 ? "s" : ""
                  } de plus`}
            </Button>
          )}
        </div>
      )}
    </>
  );
};

export default CommentSection;
