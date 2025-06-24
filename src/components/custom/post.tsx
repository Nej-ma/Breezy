"use client";

// Post.tsx
import { Card, CardContent } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  UserPlaceholderIcon,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Eye,
  Heart,
  Share,
  Sparkles,
  MoreVertical,
  Pencil,
  Trash2,
  Globe,
  Users,
  Lock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "../ui/textarea";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next"; // Add this import

import CommentSection from "./commentSection";
import CommentComposer from "./comment-composer";

// Hooks
import { useAuth } from "@/app/auth-provider";

// helpers
import { getRelativeTime } from "@/utils/helpers/stringFormatter";

// Types
import type { Post, PostVisibility } from "@/utils/types/postType";
import type { UserProfile } from "@/utils/types/userType";
import type { CommentType } from "@/utils/types/commentType";

// Services
import { postService } from "@/services/postService";
import { commentService } from "@/services/commentService";
import { useRef } from "react";

// Add this import if not already present
import Loader from "./loader";
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";

interface PostProps {
  post: Post;
  userProfile: UserProfile;
  refreshPosts?: () => void; // Optional prop to refresh posts after actions
}

export function Post({ post, userProfile, refreshPosts }: PostProps) {
  // Add translation hook
  const { t } = useTranslation("common");

  // Define visibility options with translations
  const visibilityOptions = [
    {
      value: "public",
      label: t("post.visibility.public"),
      description: t("post.visibility.publicDescription"),
      icon: Globe,
    },
    {
      value: "friends",
      label: t("post.visibility.friends"),
      description: t("post.visibility.friendsDescription"),
      icon: Users,
    },
    {
      value: "private",
      label: t("post.visibility.private"),
      description: t("post.visibility.privateDescription"),
      icon: Lock,
    },
  ];

  // Existing state variables
  const [likedState, setLikedState] = useState(
    post.likes.includes(userProfile.userId)
  );
  const likeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Add new state for dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // add state to modify the content
  const [modifyContentState, setModifyContentState] = useState(false);
  const [modifiedContent, setModifiedContent] = useState(post.content);
  // Add loading state for update operations
  const [isLoading, setIsLoading] = useState(false);
  // post's comments
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true); // loader state

  // users
  const { user } = useAuth();

  // === BACKEND INTERACTIONS ===
  const handleToggleLike = () => {
    if (likeTimeout.current) {
      clearTimeout(likeTimeout.current);
    }
    likeTimeout.current = setTimeout(() => {
      postService.likePost(post._id).then(() => {
        // Optionally handle success or update local state
        postService.getUserPostsById(post._id).then((updatedPost: Post) => {
          // Update the post with the new likes count
          post.likes = updatedPost.likes;
          setLikedState(updatedPost.likes.includes(userProfile.userId));
        });
      });
    }, 400); // 400ms debounce
  };

  // Function to fetch comments
  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const fetchedComments = await commentService.getPostComments(post._id);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  // fetch all cmments for the post
  useEffect(() => {
    if (post._id) {
      fetchComments();
    }
  }, [post._id]);

  useEffect(() => {
    if (userProfile.userId && post.likes.includes(userProfile.userId)) {
      setLikedState(true);
    } else {
      setLikedState(false);
    }

    console.log("Post likes updated:", post.likes);
    console.log("User profile ID:", userProfile.userId);
  }, [userProfile.userId, post.likes]);

  const updatePost = (newContent: string) => {
    setIsLoading(true);

    postService
      .updatePostContent(post._id, newContent)
      .then(() => {
        setModifyContentState(false);
        setModifiedContent(newContent);
        refreshPosts?.();
        return true;
      })
      .finally(() => {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      });
  };

  const updateVisibility = (newVisibility: PostVisibility) => {
    setIsLoading(true);

    postService
      .updatePostVisibility(post._id, newVisibility)
      .then(() => {
        post.visibility = newVisibility;
        refreshPosts?.();
        return true;
      })
      .finally(() => {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      });
  };

  return (
    <>
      <Card
        key={post._id}
        className={
          "border-0 shadow-lg bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 "
        }
      >
        <CardContent>
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12 ring-2 border-none">
              <Link
                href={`/${userProfile.username}`}
                className="block w-12 h-12 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <AvatarImage
                  src={userProfile.profilePicture || "/placeholder.svg"}
                  alt={userProfile.displayName}
                />
                <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white">
                  <UserPlaceholderIcon className="w-8 h-8" />
                </AvatarFallback>
              </Link>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-900 transition-colors">
                  {userProfile.username}
                </span>
                <Sparkles className="w-4 h-4 text-[var(--primary-light)]" />
                <span className="text-gray-500">@{userProfile.username}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 text-sm">
                  {getRelativeTime(t, post.createdAt)}
                </span>

                <div className="ml-auto flex items-center gap-1">
                  {(userProfile.userId === post.author ||
                    user?.role === "moderator" ||
                    user?.role === "admin") && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-500"
                        >
                          <span className="sr-only">
                            {t("post.actions.open")}
                          </span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {userProfile.userId === post.author && (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => setModifyContentState(true)}
                          >
                            <Pencil className="w-4 h-4 text-[var(--primary)]" />
                            {t("post.actions.edit")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => setIsDeleteDialogOpen(true)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                          {t("post.actions.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              {modifyContentState ? (
                <div>
                  <Textarea
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    value={modifiedContent}
                    onChange={(e) => setModifiedContent(e.target.value)}
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 mr-2"
                    onClick={() => {
                      setModifyContentState(false);
                      setModifiedContent(post.content);
                    }}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    size="sm"
                    className="mt-2 ml-auto"
                    onClick={() => {
                      updatePost(modifiedContent);
                      setModifyContentState(false);
                      setModifiedContent(post.content);
                    }}
                  >
                    {t("common.save")}
                  </Button>
                </div>
              ) : isLoading ? (
                <Loader />
              ) : (
                <p className="text-gray-800 leading-relaxed mb-4">
                  {post.content}
                </p>
              )}

              {(post.images?.length > 0 || post.videos?.length > 0) && (
                <div className="mb-4 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                  {post.images &&
                    post.images.map((imgUrl, idx) => (
                      <img
                        key={`img-${idx}`}
                        src={imgUrl}
                        alt={`${t("post.image")} ${idx + 1}`}
                        className="w-full max-h-80 object-cover"
                        loading="lazy"
                      />
                    ))}
                  {post.videos &&
                    post.videos.map((videoUrl, idx) => (
                      <video
                        key={`video-${idx}`}
                        src={videoUrl}
                        controls
                        className="w-full max-h-80 object-cover"
                        style={{ background: "#000" }}
                      />
                    ))}
                </div>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, tagIndex) => (
                    <Badge
                      key={tagIndex}
                      className="bg-[var(--secondary-light)] text-[var(--primary-light)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] border-0 rounded-full font-semibold"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-full transition-all
                    ${
                      likedState
                        ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                        : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                    }`}
                  onClick={handleToggleLike}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      likedState ? "fill-current" : "fill-none"
                    }`}
                  />
                  {post.likes.length}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                >
                  <MessageCircle className="w-4 h-4" />
                  {post.commentsCount}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                >
                  <Share className="w-4 h-4" />
                </Button>

                {userProfile.userId === post.author && (
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                          type="button"
                        >
                          {(() => {
                            const Icon = visibilityOptions.find(
                              (option) => option.value === post.visibility
                            )?.icon;
                            return Icon ? <Icon className="w-4 h-4" /> : null;
                          })()}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        {visibilityOptions.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() =>
                              updateVisibility(option.value as PostVisibility)
                            }
                            className="flex items-start gap-3 p-3"
                          >
                            <option.icon className="w-4 h-4 mt-0.5" />
                            <div className="flex-1">
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                            {post.visibility ===
                              (option.value as PostVisibility) && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comment Composer */}
          <div className="m-4">
            <Separator className="my-4" />

            {commentsLoading ? (
              <Loader />
            ) : comments.length > 0 ? (
              <CommentSection
                comments={comments}
                refreshComments={fetchComments}
                userProfile={userProfile}
              />
            ) : null}
            <CommentComposer
              postId={post._id}
              userProfile={userProfile}
              refreshComments={fetchComments} // Pass the refresh function
            />
          </div>
        </CardContent>
      </Card>
      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("post.delete.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("post.delete.confirmation")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                className="text-white bg-destructive hover:bg-destructive/90 focus:ring-2 focus:ring-destructive/50"
                onClick={() => {
                  postService.deletePost(post._id).then(() => {
                    setIsDeleteDialogOpen(false);
                    refreshPosts?.();
                  });
                }}
              >
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {/* End of Delete Confirmation Dialog */}
    </>
  );
}
