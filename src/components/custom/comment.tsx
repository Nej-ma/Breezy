import React, { useState } from "react";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  UserPlaceholderIcon,
} from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Trash2, MoreVertical, Heart, MessageCircle } from "lucide-react";

import { Separator } from "@radix-ui/react-separator";

import { CommentComposer } from "@/components/custom/comment-composer";

// Types
import type { CommentType } from "@/utils/types/commentType";

// helpers
import { getRelativeTime } from "@/utils/helpers/stringFormatter";

// services
import { commentService } from "@/services/commentService";

// hooks
import { useAuth } from "@/app/auth-provider";
import { useTranslation } from "react-i18next";
import { UserProfile } from "@/utils/types/userType";

type CommentProps = {
  comment: CommentType;
  userProfile: UserProfile;
  refreshComments?: () => void; // Add this prop
  replies?: CommentType[]; // Optional, if you want to display replies
  canReply?: boolean; // Optional, if you want to allow replies
};

export function Comment({
  comment,
  userProfile,
  refreshComments,
  replies = [],
  canReply = false, // Allow replies by default
}: CommentProps) {
  const { t } = useTranslation("common");
  const { user } = useAuth();

  // state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toggledReply, setToggledReply] = useState<boolean>(false);

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      await commentService.deleteComment(commentId);

      if (refreshComments) {
        refreshComments();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire :", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleLike = async (commentId: string, isLiked: boolean) => {
    if (!user) return;

    const likeState = isLiked ? "like" : "unlike";

    try {
      await commentService.likeComment(commentId, likeState);

      if (refreshComments) {
        refreshComments();
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du like :", error);
    }
  };

  return (
    <div
      className={`${!canReply ? "ml-6 border-l-2 border-gray-100 pl-4" : ""}`}
    >
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8 ring-2 border-none">
          <AvatarImage
            src={comment.authorProfilePicture || "/placeholder.svg"}
            alt={comment.authorUsername}
          />
          <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white">
            <UserPlaceholderIcon className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-sm text-gray-900">
              {comment.authorUsername}
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

          <div className="flex items-center space-x-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full transition-all
                    ${
                      user?.id && comment.likes.includes(user.id)
                        ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                        : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                    }`}
              onClick={() =>
                handleToggleLike(
                  comment._id,
                  !!(user?.id && comment.likes.includes(user.id))
                )
              }
            >
              <Heart
                className={`w-4 h-4 ${
                  user?.id && comment.likes.includes(user.id)
                    ? "fill-current"
                    : "fill-none"
                }`}
              />
              {comment.likes.length}
            </Button>
            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                onClick={() => setToggledReply(!toggledReply)}
              >
                <MessageCircle className="w-4 h-4" />
                {comment.repliesCount}
              </Button>
            )}
          </div>
        </div>
        {user?.id === comment.author && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-500"
              >
                <span className="sr-only">Ouvrir le menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={() => handleDelete(comment._id)}
                disabled={deletingId === comment._id}
              >
                <Trash2 className="w-4 h-4 text-red-600 mr-2" />
                {deletingId === comment._id ? "Suppression..." : "Supprimer"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {replies.length > 0 && (
        <div className="space-y-2">
          {replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              userProfile={userProfile}
              refreshComments={refreshComments}
              canReply={false} // Disable replies for replies
            />
          ))}
        </div>
      )}

      {/* form to reply to the comment*/}
      {toggledReply && (
        <div className="ml-6 border-l-2 border-gray-100 pl-4 m-y-4">
          <CommentComposer
            postId={comment.post}
            parentCommentId={comment._id}
            userProfile={userProfile}
            refreshComments={refreshComments}
          />
        </div>
      )}
    </div>
  );
}
