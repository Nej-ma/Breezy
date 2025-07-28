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
  parentCommentId?: string; // Optional, if you want to reply to a specific comment
  userProfile: UserProfile;
  refreshComments?: () => void; // Add this prop
}

export function CommentComposer({
  postId,
  parentCommentId, // Optional, if you want to reply to a specific comment
  userProfile,
  refreshComments,
}: CommentComposerProps) {
  const [searchedUsers, setSearchedUsers] = useState<UserProfile[]>([]);
  const [mentioned, setMentioned] = useState<string[]>(); // table of user's id
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
    const mentions = words.filter((word) => word.startsWith("@"));

    const mentionTrigger =
      mentions.length > 0 ? mentions[mentions.length - 1] : "";

    if (
      mentionTrigger &&
      mentionTrigger !== "@" &&
      mentionTrigger === words[words.length - 1]
    ) {
      userService
        .searchUser(mentionTrigger.slice(1))
        .then((profiles) => {
          if (profiles) {
            setSearchedUsers(profiles);
          } else {
            setSearchedUsers([]);
          }
        })
        .catch((error) => {
          console.error("Error searching users:", error);
          setSearchedUsers([]);
        });
    } else {
      setSearchedUsers([]);
    }
  }, [content]);

  const onSubmit = (data: FormData) => {
    // handleAddComment logic here
    // e.g., send data.comment to API

    commentService
      .createComment(postId, data.content, parentCommentId, mentioned)
      .then(() => {
        if (refreshComments) {
          refreshComments(); // Call the refresh function if provided
        }
      })
      .catch((error) => {
        console.error("Error adding comment:", error);
      });
    reset();
  };

  return (
    <div className="flex space-x-3 mx-5">
      <Avatar className="w-8 h-8 ring-2 border-none hidden md:inline">
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
            maxLength={maxCharacters}
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
                setMentioned((prev) => [...(prev || []), user.id]);

                // Force a re-render
                methods.trigger("content");

                // Clear the searched users
                setSearchedUsers([]);
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
