"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

// services
import { userService } from "@/services/userService";

// types
import type { UserProfile } from "@/utils/types/userType";

// components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface UserSearchProps {
  onUserSelect: (users: UserProfile[]) => void;
  onClear: () => void;
}

export function UserSearch({ onUserSelect, onClear }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Search for users when debounced query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedSearchQuery.length < 2) {
        setSearchResults([]);
        setIsPopoverOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await userService.searchUser(debouncedSearchQuery);
        setSearchResults(results);
        setIsPopoverOpen(results.length > 0);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
        setIsPopoverOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    searchUsers();
  }, [debouncedSearchQuery]);
  const handleUserClick = (user: UserProfile) => {
    const newSelectedUsers = [user];
    setSearchQuery(user.displayName);
    setIsPopoverOpen(false);
    onUserSelect(newSelectedUsers);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      e.preventDefault();
      handleUserClick(searchResults[0]);
    }
  };
  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsPopoverOpen(false);
    onClear();
  };

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="relative">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher des utilisateurs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
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
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 text-center text-muted-foreground">
                  Recherche en cours...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-3 text-center text-muted-foreground">
                  Aucun utilisateur trouvé
                </div>
              ) : (
                <div className="space-y-1 p-1">
                  {searchResults.map((user) => (
                    <button
                      key={user._id || user.userId}
                      className="w-full flex items-center gap-3 p-2 hover:bg-muted rounded-sm transition-colors text-left"
                      onClick={() => handleUserClick(user)}
                    >
                      <Avatar className="w-8 h-8">
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
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.followersCount} followers
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
