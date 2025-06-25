"use client";
import { EditProfile, EditProfileData } from "@/components/custom/edit-profile";
import { Post } from "@/components/custom/post";
import { Stats } from "@/components/custom/stats";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  UserPlaceholderIcon,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserProfileTabs } from "@/components/custom/user-profile-tabs";
import { userService, type UserUpdate } from "@/services/userService";
import {
  ArrowLeft,
  Calendar,
  Flag,
  Heart,
  ImageIcon,
  LinkIcon,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Send,
  Sparkles,
  StickyNote,
  UserRoundCheck,
  UserRoundPlus,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
// types
import type { Post as PostType } from "@/utils/types/postType";
import type { UserProfile } from "@/utils/types/userType";
import { useAuth } from "@/app/auth-provider";
import { useAuthorProfiles } from "@/hooks/use-author";
import { postService } from "@/services/postService";

export default function ProfilePage() {
  const params = useParams();
  const { user: currentUser } = useAuth();
  const { authorProfiles, getAuthorProfile } = useAuthorProfiles();

  const [user, setUserData] = useState<UserProfile>();
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(0);

  const fetchUserAndPosts = async () => {
    try {
      const userData = await userService.getUserProfile(params.username as string);
      setUserData(userData);
      setFollowersCount(userData.followersCount || 0); 
      
      const userPosts = await postService.getPostsByAuthor(userData.userId);
      setUserPosts(userPosts);

      const allPosts = await postService.getAllPosts();
      setPosts(allPosts);

    } catch {
      setUserData(undefined);
      setFollowersCount(0);
      setUserPosts([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndPosts();
  }, [params.username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span>Chargement...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span>Utilisateur non trouvé</span>
      </div>
    );
  }

  const handleUpdate = async (data: EditProfileData) => {
    try {
      const updatedUser: UserUpdate = {
        displayName: data.displayName,
        bio: data.bio,
        location: data.location,
        website: data.website,
        // Optionally handle banner, avatar, location, website if needed
      };

      const newUserData = await userService.updateUser(updatedUser);

      setUserData(newUserData);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleFollowClick = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount((count) => count - 1);
    } else {
      setIsFollowing(true);
      setFollowersCount((count) => count + 1);
    }
  };
  const isCurrentUser = currentUser && currentUser.id === user.userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Floating Header */}
      <div className="bg-white/60 backdrop-blur-md sticky top-0 z-11 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary-light)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                {user.displayName}
              </h1>
              <Sparkles className="w-4 h-4 text-[var(--primary-light)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="relative h-64 overflow-hidden ">
        <img
          src={user.coverPicture || "/placeholder.svg"}
          alt="Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Content with Unique Layout */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Profile Card - Floating Design */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 -mt-20 relative z-10 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="w-28 h-28 ">
                  <AvatarImage
                    src={user.profilePicture}
                    alt={user.displayName}
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white">
                    <UserPlaceholderIcon className="w-16 h-16 text-white-400" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex gap-4 mt-4">
                <Stats label="Posts" value={user.postsCount} />
                <Stats label="Followers" value={followersCount} />
                <Stats label="Following" value={user.followingCount} />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {user.displayName}
                  </h2>
                  <p className="text-[var(--primary-light)] font-medium">
                    @{user.username}
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-gray-300 hover:border-blue-300"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer">
                        <Send className="w-4 h-4 text-[var(--primary)]" />
                        Envoyer un message
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Flag className="w-4 h-4" />
                        Signaler
                      </DropdownMenuItem>
                    </DropdownMenuContent>{" "}
                  </DropdownMenu>
                  {isCurrentUser ? (
                    <EditProfile user={user} onSave={handleUpdate} />
                  ) : (
                    <Button
                      className={`min-w-[120px] rounded-full px-4 py-2 transition-all duration-200 flex items-center gap-2
                      ${
                        isFollowing
                          ? "bg-white text-[var(--primary)] border border-blue-200 hover:bg-[var(--secondary-light)] hover:text-[var(--primary-light)] shadow-sm"
                          : "bg-[var(--primary)] text-white shadow-md"
                      }
                      active:scale-95
                    `}
                      onClick={handleFollowClick}
                    >
                      {isFollowing ? (
                        <>
                          <UserRoundCheck className="w-4 h-4 transition-transform duration-200" />
                          <span>Suivi(e)</span>
                        </>
                      ) : (
                        <>
                          <UserRoundPlus className="w-4 h-4 transition-transform duration-200" />
                          <span>Suivre</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Bio and Additional Info */}
              <p className="text-gray-700 leading-relaxed mt-4 mb-4">
                {user.bio}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {user.location && (
                  <div className="flex items-center gap-1 bg-gray-50 rounded-full px-3 py-1">
                    <MapPin className="w-3 h-3" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-1 bg-gray-50 rounded-full px-3 py-1">
                    <LinkIcon className="w-3 h-3" />
                    <a
                      href={`https://${user.website}`}
                      className="text-blue-600 hover:underline"
                    >
                      {user.website}
                    </a>
                  </div>
                )}
                {user.createdAt && (
                  <div className="flex items-center gap-1 bg-gray-50 rounded-full px-3 py-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Rejoint en{" "}
                      {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Posts, Replies, Media, Likes */}
        <UserProfileTabs
          userPosts={userPosts}
          posts={posts}
          user={user}
          currentUser={currentUser}
          refresh={() => fetchUserAndPosts()}
        />
      </div>
    </div>
  );
}
