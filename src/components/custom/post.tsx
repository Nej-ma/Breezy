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
import { RoleBadge } from "@/components/custom/role-badge";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Heart,
  Share,
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
import Image from "next/image";
import { useTranslation } from "react-i18next";

import CommentSection from "./comment-section";
import CommentComposer from "./comment-composer";

// Hooks
import { useAuth } from "@/app/auth-provider";
import { useComments } from "@/hooks/use-comments";

// helpers
import { getRelativeTime } from "@/utils/helpers/stringFormatter";

// Types
import type { Post, PostVisibility } from "@/utils/types/postType";
import type { UserProfile } from "@/utils/types/userType";
import type { CommentType } from "@/utils/types/commentType";

// Services
import { postService } from "@/services/postService";
import { adminService } from "@/services/adminService";

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
  authorProfile?: UserProfile;
  refreshPosts?: () => void; // Optional prop to refresh posts after actions
}

export function Post({
  post,
  userProfile,
  authorProfile: initialAuthorProfile,
  refreshPosts,
}: PostProps) {
  const { t } = useTranslation("common");
  const { getPostComments } = useComments();

  // Define visibility options
  const visibilityOptions = [
    {
      value: "public" as const,
      label: t("post.visibility.public"),
      description: t("post.visibility.publicDescription"),
      icon: Globe,
    },
    {
      value: "followers" as const,
      label: t("post.visibility.followers"),
      description: t("post.visibility.followersDescription"),
      icon: Users,
    },
    {
      value: "private" as const,
      label: t("post.visibility.private"),
      description: t("post.visibility.privateDescription"),
      icon: Lock,
    },
  ];

  // Existing state variables
  const [likesState, setLikesState] = useState<Array<string>>(post.likes ?? []);
  const [likedState, setLikedState] = useState(
    (post.likes ?? []).includes(userProfile.userId)
  );
  // Add new state for dialog
  const [showComments, setShowComments] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentComposerOpen, setCommentComposerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [modifyContentState, setModifyContentState] = useState(false);
  const [modifiedContent, setModifiedContent] = useState(post.content);
  const [isLoading, setIsLoading] = useState(false);
  const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(
    post.author === userProfile.userId
      ? userProfile
      : initialAuthorProfile || null
  );

  const { user } = useAuth();

  // Debug logs pour vérifier le rôle de l'utilisateur (à supprimer après debug)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("=== DEBUG POST COMPONENT ===");
      console.log("User role from auth:", user?.role);
      console.log("Has moderator permissions:", user?.role && adminService.hasModeratorPermissions(user.role));
      console.log("==============================");
    }
  }, [user]);

  // === BACKEND INTERACTIONS ===
  const handleToggleLike = async () => {
    // Optimistic update
    const isLiked = likesState.includes(userProfile.userId);
    const previousLikes = [...likesState];
    const newLikes = isLiked
      ? likesState.filter((id) => id !== userProfile.userId)
      : [...likesState, userProfile.userId];

    setLikesState(newLikes);
    setLikedState(!isLiked);

    try {
      // Call the API which toggles like/unlike
      await postService.likePost(post._id, userProfile.userId);

      refreshPosts?.();

      // Optionally, fetch the latest likes from backend to ensure sync
      // (if your API returns the updated post, use that instead)
      // Here, we just assume the optimistic update is correct
    } catch (error) {
      // Rollback optimistic update on error
      setLikesState(previousLikes);
      setLikedState(isLiked);
      console.error("Error updating like:", error);
    }
  };

  const handleCommentClick = () => {
    setShowComments(!showComments);
    setCommentComposerOpen(!commentComposerOpen);
  };

  useEffect(() => {
    if (showComments) {
      const loadComments = async () => {
        setCommentsLoading(true);
        try {
          const fetchedComments = await getPostComments(post._id, false);
          setComments(fetchedComments);
        } catch (error) {
          console.error("Error loading comments:", error);
        } finally {
          setCommentsLoading(false);
        }
      };
      loadComments();
    }
    // Intentionnellement on ne met que showComments et post._id pour éviter les boucles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments, post._id]);

  useEffect(() => {
    if (userProfile.userId && likesState.includes(userProfile.userId)) {
      setLikedState(true);
    } else {
      setLikedState(false);
    }
  }, [userProfile.userId, likesState]);

  const refreshPost = async () => {
    try {
      const response = await postService.getPostById(post._id);
      if (response) {
        setAuthorProfile(
          response.post.author === userProfile.userId
            ? userProfile
            : initialAuthorProfile || null
        );
      }

      post.commentsCount = response.post.commentsCount;
      post.likes = response.post.likes;

      // Rafraîchir les commentaires si ils sont affichés
      if (showComments) {
        setCommentsLoading(true);
        try {
          const fetchedComments = await getPostComments(post._id, true);
          setComments(fetchedComments);
        } finally {
          setCommentsLoading(false);
        }
      }
    } catch (error) {
      console.error("Error fetching post by ID:", error);
    }
  };

  const updatePost = (newContent: string) => {
    setIsLoading(true);
    postService
      .updatePostContent(post._id, newContent)
      .then(() => {
        setModifyContentState(false);
        setModifiedContent(newContent);
        refreshPosts?.();
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
            <Avatar className="ring-2 border-none w-8 h-8 md:w-12 md:h-12">
              <Link
                href={`/${authorProfile?.username}`}
                className="block w-8 h-8 md:w-12 md:h-12 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <AvatarImage
                  src={authorProfile?.profilePicture || "/placeholder.svg"}
                  alt={authorProfile?.displayName}
                />
                <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white">
                  <UserPlaceholderIcon className="w-8 h-8 sm:w-6 sm:h-6 xs:w-5 xs:h-5" />
                </AvatarFallback>
              </Link>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-900 transition-colors">
                  {post.authorDisplayName || authorProfile?.displayName}
                </span>
                {/* Afficher le badge de rôle pour tous les auteurs avec un rôle spécial */}
                {(post.authorRole || authorProfile?.role) && 
                 (post.authorRole === 'admin' || post.authorRole === 'moderator' || 
                  authorProfile?.role === 'admin' || authorProfile?.role === 'moderator') && (
                  <RoleBadge role={(post.authorRole || authorProfile?.role) as 'admin' | 'moderator'} />
                )}
                <span className="text-gray-500">
                  @{post.authorUsername || authorProfile?.username}
                </span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 text-sm">
                  {getRelativeTime(t, post.createdAt)}
                </span>

                <div className="ml-auto flex items-center gap-1">
                  {(userProfile.userId === post.author ||
                    (user?.role && adminService.hasModeratorPermissions(user.role))) && (
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
                        
                        {/* Option de suppression - propriétaire du post ou modérateur */}
                        {(userProfile.userId === post.author || 
                          (user?.role && adminService.hasModeratorPermissions(user.role))) && (
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => setIsDeleteDialogOpen(true)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                            {userProfile.userId === post.author 
                              ? t("post.actions.delete") 
                              : "Supprimer (Modération)"}
                          </DropdownMenuItem>
                        )}
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
                <p className="text-sm text-gray-700 mt-1">
                  {post.content
                    .split(" ")
                    .filter((word) => !word.startsWith("#"))
                    .map((word, idx) => {
                      if (word.startsWith("@")) {
                        return (
                          <Link
                            href={`/${word.slice(1)}`}
                            key={idx}
                            className="text-primary font-semibold mr-1"
                          >
                            {word}{" "}
                          </Link>
                        );
                      }

                      return word + " ";
                    })}
                </p>
              )}

              {(post.images?.length > 0 || post.videos?.length > 0) && (
                <div className="mt-3 mb-4 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                  {post.images &&
                    post.images.map((imgUrl, idx) => (
                      <Image
                        key={`img-${idx}`}
                        src={imgUrl}
                        alt={`${t("post.image")} ${idx + 1}`}
                        className="w-full max-h-80 object-cover"
                        width={500}
                        height={320}
                        style={{ maxHeight: '320px', objectFit: 'cover' }}
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
                <div className="flex flex-wrap gap-2 mb-4 my-3">
                  {post.tags.map((tag, tagIndex) => (
                    <Link href={`/search?q=${tag}`} key={tagIndex}>
                      <Badge
                        key={tagIndex}
                        className="bg-[var(--secondary-light)] text-[var(--primary-light)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] border-0 rounded-full font-semibold"
                      >
                        #{tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2 mb-4">
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
              {likesState.length}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
              onClick={handleCommentClick}
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

            {user?._id === post.author && (
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

          {/* Comment Section */}
          {showComments && (
            <div className="m-4">
              <Separator className="my-4" />

              {commentsLoading ? (
                <Loader />
              ) : comments.length > 0 ? (
                <CommentSection
                  comments={comments}
                  refreshComments={refreshPost}
                  userProfile={userProfile}
                />
              ) : (
                <p className="text-gray-500 mb-4">{t("post.noComments")}</p>
              )}

              {commentComposerOpen && (
                <CommentComposer
                  postId={post._id}
                  userProfile={userProfile}
                  refreshComments={refreshPost}
                />
              )}
            </div>
          )}
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
                  // Vérifier si c'est une action de modération
                  const isModerationAction = userProfile.userId !== post.author && 
                    user?.role && 
                    adminService.hasModeratorPermissions(user.role);
                  
                  if (isModerationAction) {
                    // Suppression en tant que modérateur
                    postService.moderatorDeletePost(post._id, "Contenu supprimé par modération").then(() => {
                      setIsDeleteDialogOpen(false);
                      refreshPosts?.();
                    }).catch((error) => {
                      console.error("Erreur suppression modération:", error);
                    });
                  } else {
                    // Suppression normale par l'auteur
                    postService.deletePost(post._id).then(() => {
                      setIsDeleteDialogOpen(false);
                      refreshPosts?.();
                    }).catch((error) => {
                      console.error("Erreur suppression normale:", error);
                    });
                  }
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
