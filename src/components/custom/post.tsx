// Post.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage, UserPlaceholderIcon } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Repeat2, Heart, Share, Sparkles, Pin, User, MoreVertical, Pen, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type User = {
  name: string;
  username: string;
  avatar?: string;
};

type PostType = {
  id: number;
  pinned?: boolean;
  timestamp: string;
  content: string;
  tags?: string[];
  comments: number;
  reposts: number;
  likes: number;
};

interface PostProps {
  post: PostType;
  user: User;
  showPinnedPost?: boolean;
  onTogglePin?: (postId: number | number) => void;
}

export function Post({ post, user, showPinnedPost: showPinnedBanner, onTogglePin }: PostProps) {
    const showPost = showPinnedBanner && post.pinned;
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
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white">
                    <UserPlaceholderIcon className="w-8 h-8" />
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-900">{user.name}</span>
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
                            ${post.pinned
                            ? "text-[var(--primary)] hover:text-[var(--primary-light)]"
                            : "text-gray-400 hover:text-[var(--primary)]"}
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
                            <Pen className="w-4 h-4 text-[var(--primary)]" />
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

                {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, tagIndex) => (
                    <Badge
                        key={tagIndex}
                        className="bg-[var(--secondary-light)] text-[var(--primary-light)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] border-0 rounded-full"
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
                    className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {post.comments}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full"
                >
                    <Repeat2 className="w-4 h-4 mr-2" />
                    {post.reposts}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full"
                >
                    <Heart className="w-4 h-4 mr-2" />
                    {post.likes}
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