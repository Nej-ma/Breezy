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
import { Textarea } from "../ui/textarea";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

// Types
import type { Post, PostVisibility } from "@/utils/types/postType";
import type { UserProfile } from "@/utils/types/userType";

// Services
import { postService } from "@/services/postService";
import { useRef } from "react";

interface PostProps {
  post: Post;
  user: UserProfile;
  refreshPosts?: () => void; // Optional prop to refresh posts after actions
}

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

const visibilityOptions = [
  {
    value: "public",
    label: "Public",
    description: "Anyone can see this post",
    icon: Globe,
  },
  {
    value: "friends",
    label: "Friends",
    description: "Only your friends can see this",
    icon: Users,
  },
  {
    value: "private",
    label: "Only me",
    description: "Only you can see this post",
    icon: Lock,
  },
];

export function Post({ post, user, refreshPosts }: PostProps) {
  // Existing state variables
  const [likedState, setLikedState] = useState(
    post.likes.includes(user.userId)
  );
  const likeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Add new state for dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // add state to modify the content
  const [modifyContentState, setModifyContentState] = useState(false);
  const [modifiedContent, setModifiedContent] = useState(post.content);
  // Add loading state for update operations
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLike = () => {
    if (likeTimeout.current) {
      clearTimeout(likeTimeout.current);
    }
    likeTimeout.current = setTimeout(() => {
      postService.likePost(post._id, user.userId).then(() => {
        // Optionally handle success or update local state
        postService.getUserPostsById(post._id).then((updatedPost: Post) => {
          // Update the post with the new likes count
          post.likes = updatedPost.likes;
          setLikedState(updatedPost.likes.includes(user.userId));
        });
      });
    }, 400); // 400ms debounce
  };

  useEffect(() => {
    if (user.userId && post.likes.includes(user.userId)) {
      setLikedState(true);
    } else {
      setLikedState(false);
    }
  }, [user.userId, post.likes]);

  function getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000; // seconds

    if (diff < 60) return "now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;

    // If more than a week, show date (e.g., Jun 18)
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    if (date.getFullYear() !== now.getFullYear()) {
      options.year = "numeric";
    }
    return date.toLocaleDateString(undefined, options);
  }

  const updatePost = (newContent: string) => {
    setIsLoading(true);

    postService
      .updatePostContent(post._id, newContent)
      .then(() => {
        post.content = newContent;
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
          // (showPost ? "pt-0 pb-6" : "")
        }
      >
        {/* {showPost && (
        <div className="bg-[var(--secondary-light)] px-6 py-2 border-b border-[var(primary)]">
          <div className="flex items-center gap-2 text-sm text-[var(--primary-light)]">
            <Pin className="w-3 h-3 mt-0.5" fill="currentColor" />
            <span className="font-medium">Épinglé</span>
          </div>
        </div>
      )} */}
        <CardContent>
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12 ring-2 border-none">
              <Link
                href={`/${user.username}`}
                className="block w-12 h-12 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <AvatarImage
                  src={user.profilePicture || "/placeholder.svg"}
                  alt={user.displayName}
                />
                <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white">
                  <UserPlaceholderIcon className="w-8 h-8" />
                </AvatarFallback>
              </Link>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-900 transition-colors">
                  <Link href={`/${user.username}`}>{user.displayName}</Link>
                </span>
                <Sparkles className="w-4 h-4 text-[var(--primary-light)]" />
                <span className="text-gray-500">@{user.username}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 text-sm">
                  {getRelativeTime(post.createdAt)}
                </span>
                {/* Bouton épingler à droite */}
                <div className="ml-auto flex items-center gap-1">
                  {/* {onTogglePin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-7 h-7 rounded-full transition-colors
                            ${
                              post.pinned
                                ? "text-[var(--primary)] hover:text-[var(--primary-light)]"
                                : "text-gray-400 hover:text-[var(--primary)]"
                            }
                        `}
                    title={post.pinned ? "Unpin" : "Pin"}
                    onClick={() => onTogglePin(post.id)}
                  >
                    <Pin
                      className="w-4 h-4 rotate-45"
                      fill={post.pinned ? "currentColor" : "none"}
                    />
                  </Button>
                )} */}
                  {/* Dropdown actions */}
                  {user.userId === post.author && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 rounded-full text-gray-400 hover:text-[var(--primary-light)] focus-visible:outline-none focus:ring-0 focus:bg-transparent"
                          title="Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => setModifyContentState(true)}
                        >
                          <Pencil className="w-4 h-4 text-[var(--primary)]" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => setIsDeleteDialogOpen(true)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                          Supprimer
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
                    className="mt-2 ml-auto"
                    onClick={() => {
                      updatePost(modifiedContent);
                      setModifyContentState(false);
                      setModifiedContent(post.content);
                    }}
                  >
                    Save
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
                        alt={`image-${idx}`}
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
                        ? "text-red-500 hover:text-red-500 hover:bg-red-50"
                        : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                    }
                    active:scale-95
                    `}
                  onClick={handleToggleLike}
                >
                  {likedState ? (
                    <Heart className="w-4 h-4 fill-current" />
                  ) : (
                    <Heart className="w-4 h-4" />
                  )}
                  <span className="inline-block min-w-[2ch] text-center font-mono tabular-nums">
                    {post.likes.length}
                  </span>
                </Button>
                {/* <Button
                variant="ghost"
                size="sm"
                className={`rounded-full transition-all
                  ${
                    reposted
                      ? "text-green-600 hover:text-green-600 hover:bg-green-50"
                      : "text-gray-500 hover:text-green-600 hover:bg-green-50"
                  }
                `}
                onClick={() => setReposted((v) => !v)}
              >
                <Repeat2 className="w-4 h-4" />
                {post.repostsCount}
              </Button> */}
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

                {user.userId === post.author && (
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2"
                          type="button"
                        >
                          {post.visibility === "public" && (
                            <Globe className="w-4 h-4 text-gray-500" />
                          )}
                          {post.visibility === "friends" && (
                            <Users className="w-4 h-4 text-gray-500" />
                          )}
                          {post.visibility === "private" && (
                            <Lock className="w-4 h-4 text-gray-500" />
                          )}
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
              <AlertDialogTitle>Supprimer le post</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer ce post ? Cette action est
                irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="text-white bg-destructive hover:bg-destructive/90 focus:ring-2 focus:ring-destructive/50"
                onClick={() => {
                  postService.deletePost(post._id).then(() => {
                    // Optionally handle success or update local state
                    setIsDeleteDialogOpen(false);
                    refreshPosts?.(); // Call the refresh function if provided
                  });
                }}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {/* End of Delete Confirmation Dialog */}
    </>
  );
}
