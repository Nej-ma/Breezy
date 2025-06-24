import React, { useEffect, useState } from "react";

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

// hooks
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/auth-provider";

// helpers
import { getRelativeTime } from "@/utils/helpers/stringFormatter";

// Types
import type { CommentType } from "@/utils/types/commentType";

// services
import { commentService } from "@/services/commentService";

type CommentSectionProps = {
  comments: CommentType[];
  refreshComments?: () => void; // Add this prop
};

export function CommentSection({
  comments,
  refreshComments,
}: CommentSectionProps) {
  const { t } = useTranslation("common");

  const { user } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // States
  const [showAllComments, setShowAllComments] = useState(false);

  const visibleComments = showAllComments ? comments : comments.slice(0, 1);

  useEffect(() => {
    // Reset to show only the first comment when comments change
    setShowAllComments(false);
  }, [comments]);

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
    <>
      {/* Comments Section */}
      {comments.length > 0 && (
        <div className="space-y-4 my-5">
          <h3 className="text-gray-400">
            {t("comments.title", { count: comments.length })}
          </h3>
          {visibleComments.map((comment) => (
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {comment.repliesCount}
                  </Button>
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
                      {deletingId === comment._id
                        ? "Suppression..."
                        : "Supprimer"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
