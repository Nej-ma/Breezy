import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  UserPlaceholderIcon,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleBadge } from "@/components/custom/role-badge";
import { userService } from "@/services/userService";
import { useAuth } from "@/app/auth-provider";
import type { UserProfile } from "@/utils/types/userType";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { UserRoundCheck, UserRoundPlus, Loader2 } from "lucide-react";

interface FollowersModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "followers" | "following";
}

interface TabData {
  users: UserProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
  loading: boolean;
  loadingMore: boolean;
}

export function FollowersModal({ 
  user, 
  isOpen, 
  onClose, 
  defaultTab = "followers" 
}: FollowersModalProps) {
  const { user: currentUser } = useAuth();
  const [followersData, setFollowersData] = useState<TabData>({
    users: [],
    pagination: { page: 0, limit: 5, total: 0, pages: 0, hasMore: false },
    loading: false,
    loadingMore: false
  });
  const [followingData, setFollowingData] = useState<TabData>({
    users: [],
    pagination: { page: 0, limit: 5, total: 0, pages: 0, hasMore: false },
    loading: false,
    loadingMore: false
  });
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"followers" | "following">(defaultTab);

  // Optimisation principale : fonction pour vérifier TOUS les statuts en une seule fois
  const checkAllFollowingStatus = useCallback(async (allUserIds: string[]) => {
    if (!currentUser || allUserIds.length === 0) return;
    
    try {
      // Filtrer les utilisateurs qu'on ne suit pas déjà et qui ne sont pas nous-mêmes
      const uniqueUserIds = [...new Set(allUserIds)].filter(id => 
        id !== currentUser.id && !(id in followingStatus)
      );
      
      if (uniqueUserIds.length === 0) return;

      
      // Faire TOUTES les requêtes en parallèle d'un coup
      const statusPromises = uniqueUserIds.map(async (userId) => {
        try {
          const isFollowing = await userService.isFollowing(userId);
          return [userId, isFollowing] as [string, boolean];
        } catch {
          return [userId, false] as [string, boolean];
        }
      });

      const allStatuses = await Promise.all(statusPromises);
      const statusMap = Object.fromEntries(allStatuses);
      
      setFollowingStatus(prev => ({ ...prev, ...statusMap }));
      
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  }, [currentUser, followingStatus]);

  const fetchFollowersPage = useCallback(async (page: number = 1, append: boolean = false) => {
    if (append) {
      setFollowersData(prev => ({ ...prev, loadingMore: true }));
    } else {
      setFollowersData(prev => ({ ...prev, loading: true, users: [] }));
    }

    try {
      const response = await userService.getFollowers(user.userId, page, 5);
      
      setFollowersData(prev => ({
        users: append ? [...prev.users, ...response.users] : response.users,
        pagination: response.pagination,
        loading: false,
        loadingMore: false
      }));

      return response.users.map(u => u.userId);
      
    } catch (error) {
      console.error("Error fetching followers:", error);
      setFollowersData(prev => ({ ...prev, loading: false, loadingMore: false }));
      return [];
    }
  }, [user.userId]);

  const fetchFollowingPage = useCallback(async (page: number = 1, append: boolean = false) => {
    if (append) {
      setFollowingData(prev => ({ ...prev, loadingMore: true }));
    } else {
      setFollowingData(prev => ({ ...prev, loading: true, users: [] }));
    }

    try {
      const response = await userService.getFollowing(user.userId, page, 5);
      
      setFollowingData(prev => ({
        users: append ? [...prev.users, ...response.users] : response.users,
        pagination: response.pagination,
        loading: false,
        loadingMore: false
      }));

      return response.users.map(u => u.userId);
      
    } catch (error) {
      console.error("Error fetching following:", error);
      setFollowingData(prev => ({ ...prev, loading: false, loadingMore: false }));
      return [];
    }
  }, [user.userId]);

  // Fonction pour charger les deux onglets ET vérifier tous les statuts
  const loadBothTabsAndStatus = useCallback(async () => {
    
    // Charger les deux listes en parallèle
    const [followersUserIds, followingUserIds] = await Promise.all([
      fetchFollowersPage(1, false),
      fetchFollowingPage(1, false)
    ]);
    
    // Combiner tous les IDs et vérifier les statuts en une seule fois
    const allUserIds = [...followersUserIds, ...followingUserIds];
    if (allUserIds.length > 0) {
      await checkAllFollowingStatus(allUserIds);
    }
  }, [checkAllFollowingStatus, fetchFollowersPage, fetchFollowingPage]);

  useEffect(() => {
    if (isOpen) {
      // Reset data when modal opens
      setFollowersData({
        users: [],
        pagination: { page: 0, limit: 5, total: 0, pages: 0, hasMore: false },
        loading: false,
        loadingMore: false
      });
      setFollowingData({
        users: [],
        pagination: { page: 0, limit: 5, total: 0, pages: 0, hasMore: false },
        loading: false,
        loadingMore: false
      });
      setFollowingStatus({});
      setActiveTab(defaultTab);
      
      // Charger les deux onglets dès l'ouverture
      setTimeout(() => {
        loadBothTabsAndStatus();
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user.userId, defaultTab]);

  const handleTabChange = (tab: string) => {
    const newTab = tab as "followers" | "following";
    setActiveTab(newTab);
    // Plus besoin de charger ici, tout est déjà chargé !
  };

  const loadMoreFollowers = async () => {
    if (followersData.pagination.hasMore && !followersData.loadingMore) {
      const newUserIds = await fetchFollowersPage(followersData.pagination.page + 1, true);
      if (newUserIds.length > 0) {
        await checkAllFollowingStatus(newUserIds);
      }
    }
  };

  const loadMoreFollowing = async () => {
    if (followingData.pagination.hasMore && !followingData.loadingMore) {
      const newUserIds = await fetchFollowingPage(followingData.pagination.page + 1, true);
      if (newUserIds.length > 0) {
        await checkAllFollowingStatus(newUserIds);
      }
    }
  };

  const handleFollowClick = async (targetUserId: string) => {
    if (!currentUser) return;

    const isCurrentlyFollowing = followingStatus[targetUserId];
    
    // Mise à jour optimiste de l'UI
    setFollowingStatus(prev => ({
      ...prev,
      [targetUserId]: !isCurrentlyFollowing
    }));
    
    try {
      if (isCurrentlyFollowing) {
        await userService.unfollowUser(targetUserId);
      } else {
        await userService.followUser(targetUserId);
      }
      
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      // Rollback en cas d'erreur
      setFollowingStatus(prev => ({
        ...prev,
        [targetUserId]: isCurrentlyFollowing
      }));
    }
  };

  const renderUserList = (data: TabData, loadMore: () => void) => (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {data.loading && data.users.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
        </div>
      ) : data.users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun utilisateur trouvé
        </div>
      ) : (
        <>
          {data.users.map((userItem) => (
            <div
              key={userItem.userId}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Link
                href={`/${userItem.username}`}
                className="flex items-center gap-3 flex-1 min-w-0"
                onClick={onClose}
              >
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={userItem.profilePicture} alt={userItem.displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white">
                    <UserPlaceholderIcon className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {userItem.displayName}
                    </h4>
                    {userItem.role && userItem.role !== 'user' && (
                      <RoleBadge role={userItem.role} />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">@{userItem.username}</p>
                  {userItem.bio && (
                    <p className="text-xs text-gray-400 truncate mt-1 max-w-full">
                      {userItem.bio.length > 45 ? `${userItem.bio.slice(0, 45)}...` : userItem.bio}
                    </p>
                  )}
                </div>
              </Link>
              
              {currentUser && currentUser.id !== userItem.userId && (
                <Button
                  size="sm"
                  variant={followingStatus[userItem.userId] ? "outline" : "default"}
                  className={`ml-3 flex-shrink-0 min-w-[80px] ${
                    followingStatus[userItem.userId]
                      ? "border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
                      : "bg-[var(--primary)] text-white hover:bg-[var(--primary-light)]"
                  }`}
                  onClick={() => handleFollowClick(userItem.userId)}
                >
                  {followingStatus[userItem.userId] ? (
                    <>
                      <UserRoundCheck className="w-3 h-3 mr-1" />
                      Suivi(e)
                    </>
                  ) : (
                    <>
                      <UserRoundPlus className="w-3 h-3 mr-1" />
                      Suivre
                    </>
                  )}
                </Button>
              )}
            </div>
          ))}
          
          {data.pagination.hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={data.loadingMore}
                className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
              >
                {data.loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  `Charger plus (${data.pagination.total - data.users.length} restants)`
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center">
            Profil de {user.displayName}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="followers" className="relative">
              Followers
              <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1 rounded">
                {followersData.pagination.total}
              </span>
            </TabsTrigger>
            <TabsTrigger value="following" className="relative">
              Following  
              <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1 rounded">
                {followingData.pagination.total}
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="mt-0">
            {renderUserList(followersData, loadMoreFollowers)}
          </TabsContent>
          
          <TabsContent value="following" className="mt-0">
            {renderUserList(followingData, loadMoreFollowing)}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}