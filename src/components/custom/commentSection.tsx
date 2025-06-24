import React, { useEffect, useState } from "react";

// ui components
import { Button } from "@/components/ui/button";

import { Comment } from "./comment";

// hooks
import { useTranslation } from "react-i18next";

// Types
import type { CommentType } from "@/utils/types/commentType";
import { UserProfile } from "@/utils/types/userType";

type CommentSectionProps = {
  comments: CommentType[];
  userProfile: UserProfile;
  refreshComments?: () => void; // Add this prop
};

export function CommentSection({
  comments,
  refreshComments,
  userProfile,
}: CommentSectionProps) {
  const { t } = useTranslation("common");

  // States
  const [showAllComments, setShowAllComments] = useState(false);

  const mainComments = comments.filter((c) => !c.parentComment);
  const replies = comments.filter((c) => !!c.parentComment).reverse();

  const visibleComments = showAllComments
    ? mainComments
    : mainComments.slice(0, 1);

  useEffect(() => {
    // Reset to show only the first comment when comments change
    setShowAllComments(false);
  }, [comments]);

  return (
    <>
      {/* Comments Section */}
      {mainComments.length > 0 && (
        <div className="space-y-4 my-5">
          <h3 className="text-gray-400">
            {t("comments.title", { count: comments.length })}
          </h3>
          {visibleComments.map((comment) => (
            <div key={comment._id} className="mb-4">
              <Comment
                comment={comment}
                userProfile={userProfile}
                refreshComments={refreshComments}
                replies={replies.filter(
                  (reply) => reply.parentComment === comment._id
                )}
                canReply={true} // Allow replies for main comments
              />
            </div>
          ))}

          {mainComments.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllComments(!showAllComments)}
              className="text-blue-500 hover:text-blue-600 p-0 h-auto font-normal"
            >
              {showAllComments
                ? "Masquer les commentaires"
                : `Voir ${mainComments.length - 1} commentaire${
                    mainComments.length - 1 > 1 ? "s" : ""
                  } de plus`}
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export default CommentSection;
