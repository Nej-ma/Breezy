"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Users, Hash, X } from "lucide-react";

// services
import { userService } from "@/services/userService";
import { postService } from "@/services/postService";

// types
import type { UserProfile } from "@/utils/types/userType";
import type { Post as PostType } from "@/utils/types/postType";

// components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostsSection } from "@/components/custom/post-section";

// hooks
import { useAuth } from "@/app/auth-provider";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthorProfiles } from "@/hooks/use-author";

type SearchType = "users" | "tags" | "all";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedTags, setSearchedTags] = useState<string[]>([]);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.username) {
        try {
          const profile = await userService.getUserProfile(user.username);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };
    fetchUserProfile();
  }, [user]); // Search function
  const performSearch = useCallback(async (query: string, type: SearchType) => {
    if (query.length < 2) {
      setUsers([]);
      setPosts([]);
      return;
    }

    setIsLoading(true);
    try {
      if (type === "users" || type === "all") {
        const userResults = await userService.searchUser(query);
        setUsers(userResults);
      }

      if (type === "tags" || type === "all") {
        // Extraire les tags du query (supporte #tag1 #tag2 ou tag1 tag2)
        const tags = query
          .split(/[\s,]+/) // Split par espaces ou virgules
          .map((tag) => tag.replace("#", "").trim()) // Enlever les # et trim
          .filter((tag) => tag.length > 0); // Filtrer les tags vides
        if (tags.length > 0) {
          const tagResults = await postService.getPostsByTags(tags, 10, 0);
          setPosts(tagResults.posts);
          setSearchedTags(tags);
        }
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to search when query or type changes
  useEffect(() => {
    performSearch(debouncedSearchQuery, searchType);
  }, [debouncedSearchQuery, searchType, performSearch]);

  // Update URL when search query changes
  useEffect(() => {
    if (searchQuery) {
      const newUrl = `/search?q=${encodeURIComponent(searchQuery)}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchQuery, router]);

  const handleClear = () => {
    setSearchQuery("");
    setUsers([]);
    setPosts([]);
    setSearchedTags([]);
    router.replace("/search", { scroll: false });
  };

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      {" "}
      {/* Mobile Search Header */}
      <div className="md:hidden sticky top-0 bg-background/80 backdrop-blur-sm z-10 pb-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="shrink-0"
          >
            ←
          </Button>
          <h1 className="text-xl font-bold">Recherche</h1>
        </div>
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Rechercher des utilisateurs ou des tags (#javascript #react)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>{" "}
      {/* Desktop Search Header */}
      <div className="hidden md:block mb-6">
        <h1 className="text-2xl font-bold mb-4">Recherche</h1>

        {/* Desktop Search Input */}
        <div className="relative max-w-md mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Rechercher des utilisateurs ou des tags (#javascript #react)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {searchQuery && (
          <p className="text-muted-foreground">
            Résultats pour &ldquo;{searchQuery}&rdquo;
          </p>
        )}
      </div>
      {/* Search Results */}
      {searchQuery.length >= 2 && (
        <Tabs
          value={searchType}
          onValueChange={(value) => setSearchType(value as SearchType)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Tout
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Tags
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-6">
              {/* Users Section */}
              {users.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Utilisateurs
                  </h2>
                  <div className="space-y-2">
                    {users.slice(0, 3).map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                    {users.length > 3 && (
                      <Button
                        variant="outline"
                        onClick={() => setSearchType("users")}
                        className="w-full"
                      >
                        Voir tous les utilisateurs ({users.length})
                      </Button>
                    )}
                  </div>
                </div>
              )}{" "}
              {/* Posts Section */}
              {posts.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Posts avec tags
                    {searchedTags.length > 0 && (
                      <span className="text-sm font-normal text-muted-foreground">
                        ({searchedTags.map((tag) => `#${tag}`).join(", ")})
                      </span>
                    )}
                  </h2>
                  <div className="space-y-4">
                    {userProfile && (
                      <PostsSection
                        posts={posts.slice(0, 3)}
                        userProfile={userProfile}
                        isLoading={isLoading}
                      />
                    )}
                    {posts.length > 3 && (
                      <Button
                        variant="outline"
                        onClick={() => setSearchType("tags")}
                        className="w-full"
                      >
                        Voir tous les posts ({posts.length})
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {/* No Results */}
              {!isLoading && users.length === 0 && posts.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun résultat trouvé pour &ldquo;{searchQuery}&rdquo;</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-8">Recherche en cours...</div>
              ) : users.length > 0 ? (
                users.map((user) => <UserCard key={user.id} user={user} />)
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun utilisateur trouvé</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tags" className="mt-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Recherche en cours...</div>
              ) : posts.length > 0 ? (
                userProfile && (
                  <PostsSection
                    posts={posts}
                    userProfile={userProfile}
                    isLoading={isLoading}
                  />
                )
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun post trouvé avec ces tags</p>
                  <p className="text-sm mt-2">
                    Essayez #javascript, #react, #frontend...
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}

// User Card Component
function UserCard({ user }: { user: UserProfile }) {
  const router = useRouter();

  const handleUserClick = () => {
    router.push(`/${user.username}`);
  };

  return (
    <button
      onClick={handleUserClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
    >
      <Avatar className="w-12 h-12">
        <AvatarImage src={user.profilePicture} alt={user.username} />
        <AvatarFallback>
          {user.displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{user.displayName}</p>
        <p className="text-sm text-muted-foreground truncate">
          @{user.username}
        </p>
        {user.bio && (
          <p className="text-sm text-muted-foreground truncate mt-1">
            {user.bio}
          </p>
        )}
      </div>
      <div className="text-xs text-muted-foreground text-right">
        <div>{user.followersCount} followers</div>
        <div>{user.postsCount} posts</div>
      </div>
    </button>
  );
}
