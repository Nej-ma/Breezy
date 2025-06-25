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
import { userService } from "@/services/userService";
import { useAuth } from "@/app/auth-provider";
import type { UserProfile } from "@/utils/types/userType";
import { useEffect, useState } from "react";
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

  const fetchFollowersPage = async (page: number = 1, append: boolean = false) => {
    if (append) {
      setFollowersData(prev => ({ ...prev, loadingMore: true }));
    } else {
      setFollowersData(prev => ({ ...prev, loading: true, users: [] }));
    }

    try {
      console.log(`📋 Fetching followers page ${page} for user ${user.userId}`);
      const response = await userService.getFollowers(user.userId, page, 5);
      
      setFollowersData(prev => ({
        users: append ? [...prev.users, ...response.users] : response.users,
        pagination: response.pagination,
        loading: false,
        loadingMore: false
      }));

      // Check following status for new users
      if (currentUser) {
        const statusPromises = response.users.map(async (u) => {
          if (u.userId === currentUser.id) return [u.userId, false];
          try {
            const isFollowing = await userService.isFollowing(u.userId);
            return [u.userId, isFollowing];
          } catch {
            return [u.userId, false];
          }
        });

        const statuses = await Promise.all(statusPromises);
        const statusMap = Object.fromEntries(statuses);
        setFollowingStatus(prev => ({ ...prev, ...statusMap }));
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
      setFollowersData(prev => ({ ...prev, loading: false, loadingMore: false }));
    }
  };

  const fetchFollowingPage = async (page: number = 1, append: boolean = false) => {
    if (append) {
      setFollowingData(prev => ({ ...prev, loadingMore: true }));
    } else {
      setFollowingData(prev => ({ ...prev, loading: true, users: [] }));
    }

    try {
      console.log(`📋 Fetching following page ${page} for user ${user.userId}`);
      const response = await userService.getFollowing(user.userId, page, 5);
      
      setFollowingData(prev => ({
        users: append ? [...prev.users, ...response.users] : response.users,
        pagination: response.pagination,
        loading: false,
        loadingMore: false
      }));

      // Check following status for new users
      if (currentUser) {
        const statusPromises = response.users.map(async (u) => {
          if (u.userId === currentUser.id) return [u.userId, false];
          try {
            const isFollowing = await userService.isFollowing(u.userId);
            return [u.userId, isFollowing];
          } catch {
            return [u.userId, false];
          }
        });

        const statuses = await Promise.all(statusPromises);
        const statusMap = Object.fromEntries(statuses);
        setFollowingStatus(prev => ({ ...prev, ...statusMap }));
      }
    } catch (error) {
      console.error("Error fetching following:", error);
      setFollowingData(prev => ({ ...prev, loading: false, loadingMore: false }));
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Reset data when modal opens
      console.log(`🔄 Modal opened for user ${user.userId}, tab: ${defaultTab}`);
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
      
      // Load BOTH tabs data immediately when modal opens
      console.log(`🔄 Loading both followers and following data for user ${user.userId}`);
      setTimeout(() => {
        fetchFollowersPage(1, false);
        fetchFollowingPage(1, false);
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user.userId, defaultTab]);

  const handleTabChange = (tab: string) => {
    const newTab = tab as "followers" | "following";
    console.log(`🔄 Tab changed to: ${newTab}`);
    setActiveTab(newTab);
    // No need to fetch data here since we load both tabs at modal open
  };

  const loadMoreFollowers = () => {
    if (followersData.pagination.hasMore && !followersData.loadingMore) {
      fetchFollowersPage(followersData.pagination.page + 1, true);
    }
  };

  const loadMoreFollowing = () => {
    if (followingData.pagination.hasMore && !followingData.loadingMore) {
      fetchFollowingPage(followingData.pagination.page + 1, true);
    }
  };

  const handleFollowClick = async (targetUserId: string) => {
    if (!currentUser) return;

    const isCurrentlyFollowing = followingStatus[targetUserId];
    
    try {
      if (isCurrentlyFollowing) {
        await userService.unfollowUser(targetUserId);
      } else {
        await userService.followUser(targetUserId);
      }
      
      // Update local state immediately
      setFollowingStatus(prev => ({
        ...prev,
        [targetUserId]: !isCurrentlyFollowing
      }));
      
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
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
                    {userItem.isVerified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">@{userItem.username}</p>
                  {userItem.bio && (
                    <p className="text-xs text-gray-400 truncate mt-1">{userItem.bio}</p>
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
