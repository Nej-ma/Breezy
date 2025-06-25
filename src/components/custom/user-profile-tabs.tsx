import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Post } from "@/components/custom/post";
import { Heart, ImageIcon, MessageCircle, StickyNote } from "lucide-react";
import type { Post as PostType } from "@/utils/types/postType";
import type { UserProfile } from "@/utils/types/userType";
import React, { useState, useEffect } from "react";

interface UserProfileTabsProps {
  userPosts: PostType[];
  posts: PostType[];
  user: UserProfile;
  currentUser: UserProfile;
  refresh?: () => void;
}

export const UserProfileTabs: React.FC<UserProfileTabsProps> = ({ userPosts, posts, user, currentUser, refresh }) => {
  const isCurrentUser = currentUser && currentUser.id === user.userId;
  const [likedPosts, setLikedPosts] = useState<PostType[]>([]);

  useEffect(() => {
    setLikedPosts(posts.filter((post) => post.likes && post.likes.includes(currentUser?.id)));
  }, [posts, currentUser]);

  return (
    <Tabs defaultValue="posts" className="pb-8">
      <TabsList className="w-full bg-white rounded-2xl shadow border border-blue-100 flex gap-2">
        {[
          {
            value: "posts",
            icon: <StickyNote className="w-4 h-4" />,
            label: "Posts",
          },
          {
            value: "replies",
            icon: <MessageCircle className="w-4 h-4" />,
            label: "Réponses",
          },
          {
            value: "media",
            icon: <ImageIcon className="w-4 h-4" />,
            label: "Médias",
          },
          ...(isCurrentUser
            ? [
                {
                  value: "likes",
                  icon: <Heart className="w-4 h-4" />,
                  label: "J'aime",
                },
              ]
            : []),
        ].map(({ value, icon, label }) => (
          <TabsTrigger
            key={value}
            value={value}
            className={[
              "flex-1 py-3 rounded-xl font-semibold transition-all duration-200 animate-fade-in",
              "hover:bg-blue-50",
              "data-[state=active]:bg-gradient-to-r",
              "data-[state=active]:from-[var(--primary)]",
              "data-[state=active]:to-[var(--primary-light)]",
              "data-[state=active]:text-white",
              "data-[state=inactive]:text-gray-500",
              "data-[state=inactive]:bg-transparent",
            ].join(" ")}
          >
            {icon}
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {/* Posts Tab Content */}
      <TabsContent value="posts" className="mt-6 space-y-4">
        {userPosts.length > 0 ? (
          userPosts.map((post) => <Post key={post._id} post={post} userProfile={user} refreshPosts={refresh} />)
        ) : (
          <div className="flex flex-col items-center justify-center bg-card rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <StickyNote className="w-8 h-8 text-primary" />
            </div>
            <p className="text-gray-500 text-lg">Aucun post pour l'instant</p>
            <p className="text-gray-400 text-sm mt-2">
              Quand tu publieras ton premier post, il apparaîtra ici !
            </p>
          </div>
        )}
      </TabsContent>
      {/* Replies Tab Content */}
      <TabsContent value="replies" className="mt-6">
        <div className="flex flex-col items-center justify-center bg-card rounded-2xl shadow-lg p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <p className="text-gray-500 text-lg">Pas encore de réponses</p>
          <p className="text-gray-400 text-sm mt-2">
            Tes futures réponses s'afficheront ici. N'hésite pas à participer !
          </p>
        </div>
      </TabsContent>
      {/* Media Tab Content */}
      <TabsContent value="media" className="mt-6 space-y-4">
        {mediaPosts.map((post) => (
          <Post key={post._id} post={post} userProfile={user} refreshPosts={refresh}/>
        ))}
        {mediaPosts.length === 0 && (
          <div className="flex flex-col items-center justify-center bg-card rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-primary" />
            </div>
            <p className="text-gray-500 text-lg">Aucun média partagé pour l'instant</p>
            <p className="text-gray-400 text-sm mt-2">
              Partage des photos ou vidéos pour les retrouver ici.
            </p>
          </div>
        )}
      </TabsContent>
      {/* Likes Tab Content */}
      <TabsContent value="likes" className="mt-6 space-y-4">
        {likedPosts.length > 0 ? (
          likedPosts.map((post) => (
            <Post
              key={post._id}
              post={post}
              userProfile={user}
              refreshPosts={() => {
                refresh?.();
              }}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center bg-card rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <p className="text-gray-500 text-lg">Aucun post liké pour le moment</p>
            <p className="text-gray-400 text-sm mt-2">
              Les posts que tu aimeras s'afficheront ici.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
