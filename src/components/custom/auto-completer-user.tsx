"use client";

import { useState, useEffect, useRef } from "react";
import { UserProfile } from "@/utils/types/userType";
import { useTranslation } from "react-i18next"; // Add this import

import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  UserPlaceholderIcon,
} from "@/components/ui/avatar";

interface AutoCompleteUserProps {
  users?: UserProfile[];
  onSelect?: (user: UserProfile) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>; // Reference to the PopoverAnchor
}

export function AutoCompleteUser({
  users = [],
  onSelect,
  triggerRef,
}: AutoCompleteUserProps) {
  const { t } = useTranslation("common"); // Add translation hook
  const [open, setOpen] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    setOpen(users.length > 0);
    setSearchedUsers(users);
  }, [users]);

  const handleUserSelect = (user: UserProfile) => {
    if (onSelect) {
      onSelect(user);
    }
    setOpen(false);

    // Focus back on the textarea after selection
    setTimeout(() => {
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.focus();
      }
    }, 0);
  };

  return (
    <Popover open={open}>
      <PopoverAnchor ref={triggerRef} />
      <PopoverContent align="start" className="p-0 w-72">
        <Command>
          <CommandList>
            {searchedUsers.length === 0 ? (
              <CommandEmpty>{t("postComposer.noUsersFound")}</CommandEmpty>
            ) : (
              <CommandGroup>
                {searchedUsers.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => handleUserSelect(user)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Avatar className="w-6 h-6">
                      {user.profilePicture ? (
                        <AvatarImage
                          src={user.profilePicture}
                          alt={user.username}
                        />
                      ) : (
                        <AvatarFallback>
                          <UserPlaceholderIcon />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span>{user.displayName}</span>
                    {user.username && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        @{user.username}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
