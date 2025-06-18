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
  Repeat2,
  Heart,
  Share,
  Sparkles,
  Pin,
  User,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import Link from "next/link";

// Types
import type { Post } from "@/utils/types/postType";

type User = {
  displayName: string;
  username: string;
  avatar?: string;
};

interface PostProps {
  post: Post;
  user: User;
  showPinnedPost?: boolean;
  liked?: boolean;
  onToggleLike?: () => void;
  onTogglePin?: (postId: number) => void;
}

export function Post({
  post,
  user,
  showPinnedPost: showPinnedBanner,
  liked,
  onTogglePin,
  onToggleLike,
}: PostProps) {
  const showPost = showPinnedBanner && post.pinned;

  const [reposted, setReposted] = useState(false);

  return (
    <Card
      key={post.id}
      className={
        "border-0 shadow-lg bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 " +
        (showPost ? "pt-0 pb-6" : "")
      }
    >
      {showPost && (
        <div className="bg-[var(--secondary-light)] px-6 py-2 border-b border-[var(primary)]">
          <div className="flex items-center gap-2 text-sm text-[var(--primary-light)]">
            <Pin className="w-3 h-3 mt-0.5" fill="currentColor" />
            <span className="font-medium">Épinglé</span>
          </div>
        </div>
      )}
      <CardContent>
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12 ring-2 border-none">
            <Link
              href={`/${user.username}`}
              className="block w-12 h-12 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <AvatarImage
                src={user.avatar || "/placeholder.svg"}
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
              <span className="text-gray-500 text-sm">{post.timestamp}</span>
              {/* Bouton épingler à droite */}
              <div className="ml-auto flex items-center gap-1">
                {onTogglePin && (
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
                )}
                {/* Dropdown actions */}
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
                    <DropdownMenuItem className="cursor-pointer">
                      <Pencil className="w-4 h-4 text-[var(--primary)]" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <p className="text-gray-800 leading-relaxed mb-4">{post.content}</p>

            {post.media && (
              <div className="mb-4 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                {post.media.type === "image" && (
                  <img
                    src={post.media.url}
                    alt="media"
                    className="w-full max-h-80 object-cover"
                    loading="lazy"
                  />
                )}
                {post.media.type === "video" && (
                  <video
                    src={post.media.url}
                    controls
                    className="w-full max-h-80 object-cover"
                    style={{ background: "#000" }}
                  />
                )}
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
                      liked
                        ? "text-red-500 hover:text-red-500 hover:bg-red-50"
                        : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                    }
                    active:scale-95
                    `}
                onClick={onToggleLike}
              >
                {liked ? (
                  <Heart className="w-4 h-4 fill-current" />
                ) : (
                  <Heart className="w-4 h-4" />
                )}
                <span className="inline-block min-w-[2ch] text-center font-mono tabular-nums">
                  {post.likes + (liked ? 1 : 0)}
                </span>
              </Button>
              <Button
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
                {post.reposts + (reposted ? 1 : 0)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
              >
                <MessageCircle className="w-4 h-4" />
                {post.comments}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
