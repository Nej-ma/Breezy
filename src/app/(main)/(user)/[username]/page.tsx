"use client";
import { EditProfile, EditProfileData } from "@/components/custom/edit-profile";
import { FollowersModal } from "@/components/custom/followers-modal";
import { DeleteUser } from "@/components/custom/delete-user";
import { Stats } from "@/components/custom/stats";
import { RoleBadge } from "@/components/custom/role-badge";
import { SuspendedAccount } from "@/components/custom/suspended-account";
import { SuspendUserModal } from "@/components/custom/suspend-user-modal";
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
import { adminService } from "@/services/adminService";
import {
  ArrowLeft,
  Calendar,
  Flag,
  LinkIcon,
  MapPin,
  MoreHorizontal,
  Send,
  Sparkles,
  UserRoundCheck,
  UserRoundPlus,
  Shield,
  ShieldOff,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
// types
import type { Post as PostType } from "@/utils/types/postType";
import type { UserProfile } from "@/utils/types/userType";
import { useAuth } from "@/app/auth-provider";
import { postService } from "@/services/postService";

export default function ProfilePage() {
  const params = useParams();
  const { user: currentUser } = useAuth();

  const [user, setUserData] = useState<UserProfile>();
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [likedPosts] = useState<number[]>([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<"followers" | "following">("followers");
  const [isModerating, setIsModerating] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const fetchUserAndPosts = async () => {
    try {
      const userData = await userService.getUserProfile(
        params.username as string
      );
      setUserData(userData);
      setFollowersCount(userData.followersCount || 0);

      const userPosts = await postService.getPostsByAuthor(userData.userId);
      setUserPosts(userPosts);

      const allPosts = await postService.getAllPosts();
      setPosts(allPosts);

      // Check if current user is following this user
      if (currentUser && currentUser.id !== userData.userId) {
        try {
          const followingStatus = await userService.isFollowing(
            userData.userId
          );
          setIsFollowing(followingStatus);
        } catch (error) {
          console.error("Error checking follow status:", error);
        }
      }
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
  }, [params.username, currentUser]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary)] mb-6 sm:h-16 sm:w-16 h-12 w-12"></div>
        <span className="text-xl font-semibold text-[var(--primary)] text-center sm:text-xl text-lg">
          Chargement du profil...
        </span>
        <span className="text-gray-500 mt-2 text-center sm:text-base text-sm">
          Merci de patienter pendant que nous préparons la page ✨
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
        <img
          src="/not_found_cat.svg"
          alt="Utilisateur non trouvé"
          className="w-80 h-80 mb-10 opacity-100 drop-shadow-2xl max-w-full sm:w-96 sm:h-96 w-60 h-60"
        />
        <span className="text-2xl font-bold text-[var(--primary)] mb-3 text-center sm:text-3xl text-2xl">
          Oups, utilisateur introuvable !
        </span>
        <span className="text-lg text-gray-500 mb-6 text-center sm:text-lg text-base">
          Il semblerait que ce profil n'existe pas ou a été supprimé.
        </span>
        <Link
          href="/"
          className="text-[var(--primary)] hover:underline font-semibold flex items-center gap-2 text-lg sm:text-lg text-base"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour à l'accueil
        </Link>
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
        profilePicture: data.avatar,
        coverPicture: data.banner,
      };

      const newUserData = await userService.updateUser(updatedUser);

      setUserData(newUserData);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleFollowClick = async () => {
    if (!currentUser || !user) return;

    const wasFollowing = isFollowing;
    const newFollowersCount = wasFollowing
      ? user.followersCount - 1
      : user.followersCount + 1;

    // ✅ Mise à jour immédiate de l'UI
    setIsFollowing(!wasFollowing);
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            followersCount: newFollowersCount,
          }
        : prev
    );

    try {
      if (wasFollowing) {
        await userService.unfollowUser(user.userId);
      } else {
        await userService.followUser(user.userId);
      }

      // ✅ Validation optionnelle avec les vraies données
      const updatedUserData = await userService.getUserProfile(
        params.username as string
      );
      setUserData(updatedUserData);
    } catch (error) {
      // ✅ Rollback en cas d'erreur
      setIsFollowing(wasFollowing);
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              followersCount: user.followersCount,
            }
          : prev
      );
      console.error("Error:", error);
    }
  };

  const handleStatsClick = (type: "followers" | "following") => {
    setFollowersModalTab(type);
    setShowFollowersModal(true);
  };

  const handleModalClose = async () => {
    setShowFollowersModal(false);
    // Rafraîchir les counts après fermeture de la modal au cas où il y aurait eu des changements
    try {
      const updatedUserData = await userService.getUserProfile(
        params.username as string
      );
      setUserData(updatedUserData); // Mettre à jour l'objet user complet
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  // Fonctions de modération
  const handleSuspendUser = async (duration?: number, reason?: string) => {
    if (!currentUser || !user || !adminService.hasModeratorPermissions(currentUser.role)) return;
    
    setIsModerating(true);
    try {
      await adminService.suspendUser(user.userId, {
        duration,
        reason
      });
      
      // Recharger les données utilisateur
      await fetchUserAndPosts();
      setShowSuspendModal(false);
    } catch (error) {
      console.error("Erreur lors de la suspension:", error);
    } finally {
      setIsModerating(false);
    }
  };

  const openSuspendModal = () => {
    setShowSuspendModal(true);
  };

  const handleUnsuspendUser = async () => {
    if (!currentUser || !user || !adminService.hasModeratorPermissions(currentUser.role)) return;
    
    setIsModerating(true);
    try {
      await adminService.unsuspendUser(user.userId);
      
      // Recharger les données utilisateur
      await fetchUserAndPosts();
    } catch (error) {
      console.error("Erreur lors de la levée de suspension:", error);
    } finally {
      setIsModerating(false);
    }
  };
  
  const isCurrentUser = currentUser && currentUser.id === user.userId;
  
  // Vérifier si le compte est suspendu
  if (user.isSuspended) {
    return (
      <SuspendedAccount 
        displayName={user.displayName}
        suspendedUntil={user.suspendedUntil}
        userId={user.userId}
        currentUserRole={currentUser?.role}
        onUnsuspend={fetchUserAndPosts}
      />
    );
  }

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
      <div className="relative h-64 overflow-hidden">
        {user.coverPicture ? (
          <img
        src={user.coverPicture}
        alt={`${user.displayName}'s cover picture`}
        className="w-full h-64 object-cover"
          />
        ) : (
          <div
        className="w-full h-64"
        role="img"
        aria-label="Default cover picture"
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
        }}
          />
        )}
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
              </div>

              {/* Stats Cards */}
              <div className="flex gap-4 mt-4">
                <Stats label="Posts" value={user.postsCount} />
                <div
                  onClick={() => handleStatsClick("followers")}
                  className="cursor-pointer"
                >
                  <Stats label="Followers" value={user.followersCount || 0} />
                </div>
                <div
                  onClick={() => handleStatsClick("following")}
                  className="cursor-pointer"
                >
                  <Stats label="Following" value={user.followingCount || 0} />
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user.displayName}
                    </h2>
                    {user.role && user.role !== 'user' && (
                      <RoleBadge role={user.role} />
                    )}
                  </div>
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
                      
                      {/* Actions de modération - uniquement pour admins/modos et pas sur soi-même */}
                      {currentUser && 
                       adminService.hasModeratorPermissions(currentUser.role) && 
                       !isCurrentUser && (
                        <>
                          {user.isSuspended ? (
                            <DropdownMenuItem 
                              className="cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50"
                              onClick={handleUnsuspendUser}
                              disabled={isModerating}
                            >
                              <ShieldOff className="w-4 h-4" />
                              {isModerating ? "Traitement..." : "Lever la suspension"}
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="cursor-pointer text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                              onClick={openSuspendModal}
                              disabled={isModerating}
                            >
                              <Shield className="w-4 h-4" />
                              {isModerating ? "Traitement..." : "Suspendre utilisateur"}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      
                      <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Flag className="w-4 h-4" />
                        Signaler
                      </DropdownMenuItem>
                      {isCurrentUser && (
                        <DeleteUser
                          userId={user._id}
                          username={user.username}
                        />
                      )}
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

      {/* Followers Modal */}
      {user && (
        <FollowersModal
          user={user}
          isOpen={showFollowersModal}
          onClose={handleModalClose}
          defaultTab={followersModalTab}
        />
      )}

      {/* Suspend User Modal */}
      {user && (
        <SuspendUserModal
          isOpen={showSuspendModal}
          onClose={() => setShowSuspendModal(false)}
          onSuspend={handleSuspendUser}
          userName={user.displayName}
          isLoading={isModerating}
        />
      )}
    </div>
  );
}