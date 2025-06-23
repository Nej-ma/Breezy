import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

// services
import { commentService } from "@/services/commentService";
import { userService } from "@/services/userService";

// typs
import type { UserProfile } from "@/utils/types/userType";

// ui components
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  UserPlaceholderIcon,
} from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { AutoCompleteUser } from "@/components/custom/auto-completer-user";

import { Send } from "lucide-react";

type FormData = {
  content: string;
};

interface CommentComposerProps {
  postId: string;
  userProfile: UserProfile;
}

export function CommentComposer({ postId, userProfile }: CommentComposerProps) {
  const [searchedUsers, setSearchedUsers] = useState<UserProfile[]>([]);
  const [mentionned, setMentionned] = useState<string[]>(); // table of user's id
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionTriggerRef = useRef<HTMLDivElement>(null);

  // Define the form using react-hook-form
  const methods = useForm<FormData>({
    mode: "onChange",
    defaultValues: { content: "" },
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting, isValid },
  } = methods;

  const content = watch("content") || "";
  const characterCount = content.length;
  const maxCharacters = 200;

  useEffect(() => {
    // trigger autocomplete when user types @
    const words = content.split(" ");
    const mentionTrigger = words.find((word) => word.startsWith("@"));
    if (mentionTrigger && mentionTrigger.length > 1) {
      console.log("Triggering autocomplete for:", mentionTrigger);

      // Vérifier si userService.searchUser existe
      if (userService.searchUsers) {
        userService
          .searchUsers(mentionTrigger.slice(1))
          .then((profiles) => {
            if (profiles) {
              console.log("Found user profiles:", profiles);
              setSearchedUsers(profiles);
            } else {
              console.log("No users found for:", mentionTrigger);
              setSearchedUsers([]);
            }
          })
          .catch((error) => {
            console.error("Error searching users:", error);
            setSearchedUsers([]);
          });
      }
    } else {
      setSearchedUsers([]);
    }
  }, [content]);

  const onSubmit = (data: FormData) => {
    // handleAddComment logic here
    // e.g., send data.comment to API

    commentService
      .createComment(postId, data.content)
      .then(() => {
        // Optionally, you can show a success message or refresh comments
        console.log("Comment added successfully");
      })
      .catch((error) => {
        console.error("Error adding comment:", error);
      });
    reset();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="flex space-x-3 m-x-5">
      <Avatar className="w-8 h-8 ring-2 border-none">
        <AvatarImage
          src={userProfile.profilePicture || "/placeholder.svg"}
          alt={userProfile.displayName}
        />
        <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white">
          <UserPlaceholderIcon className="w-8 h-8" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Textarea
            placeholder="Écrivez votre commentaire..."
            {...register("content", { required: true })}
            onKeyPress={handleKeyPress}
            className="min-h-[80px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
          {/* Mention Trigger */}
          <AutoCompleteUser
            users={searchedUsers}
            onSelect={(user) => {
              // Get the current content
              const currentContent = methods.getValues("content");

              // Find the last mention token
              const words = currentContent.split(" ");
              let mentionIndex = -1;

              for (let i = words.length - 1; i >= 0; i--) {
                if (words[i].startsWith("@")) {
                  mentionIndex = i;
                  break;
                }
              }

              if (mentionIndex !== -1) {
                // Replace the mention with the selected username
                words[mentionIndex] = `@${user.username}`;

                // Update the content with the new mention
                methods.setValue("content", words.join(" "), {
                  shouldValidate: true,
                  shouldDirty: true,
                });

                // Clear the searched users
                setSearchedUsers([]);
                setMentionned((prev) => [...(prev || []), user.id]);

                // Force a re-render
                methods.trigger("content");
              }
            }}
            triggerRef={mentionTriggerRef}
          />
          <div className="flex justify-end mt-3">
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              size="sm"
              className="bg-primary text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Commenter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CommentComposer;
