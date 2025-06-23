import React, { useEffect, useState } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  UserPlaceholderIcon,
} from "../ui/avatar";
import { Button } from "../ui/button";

// hooks
import { useTranslation } from "react-i18next";

// helpers
import { getRelativeTime } from "@/utils/helpers/stringFormatter";

// Types
import type { CommentType } from "@/utils/types/commentType";

type CommentSectionProps = {
  comments: CommentType[];
};

export function CommentSection({ comments }: CommentSectionProps) {
  const { t } = useTranslation("common");

  // States
  const [showAllComments, setShowAllComments] = useState(false);

  const visibleComments = showAllComments ? comments : comments.slice(0, 1);

  useEffect(() => {
    // Reset to show only the first comment when comments change
    setShowAllComments(false);
  }, [comments]);

  return (
    <>
      {/* Comments Section */}
      {comments.length > 0 && (
        <div className="space-y-4 my-5">
          {visibleComments.map((comment) => (
            <div key={comment._id} className="flex space-x-3">
              <Avatar className="h-8 w-8 ring-2 border-none">
                <AvatarImage
                  src={comment.authorProfilePicture || "/placeholder.svg"}
                  alt={comment.author}
                />
                <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white">
                  <UserPlaceholderIcon className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-sm text-gray-900">
                    {comment.author}
                  </h4>
                  <span className="text-gray-500 text-xs">
                    {comment.authorUsername}
                  </span>
                  <span className="text-gray-500 text-xs">·</span>
                  <span className="text-gray-500 text-xs">
                    {getRelativeTime(t, comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
              </div>
            </div>
          ))}

          {comments.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllComments(!showAllComments)}
              className="text-blue-500 hover:text-blue-600 p-0 h-auto font-normal"
            >
              {showAllComments
                ? "Masquer les commentaires"
                : `Voir ${comments.length - 1} commentaire${
                    comments.length - 1 > 1 ? "s" : ""
                  } de plus`}
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export default CommentSection;
