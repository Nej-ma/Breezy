"use client";

import type React from "react";
// hooks
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/auth-provider";
import { useTranslation } from "react-i18next";

// services
import { postService } from "@/services/postService";
import { userService } from "@/services/userService";

// types
import type { UserProfile } from "@/utils/types/userType";

// ui components
import {
  Paperclip,
  Globe,
  Lock,
  Users,
  ChevronDown,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  UserPlaceholderIcon,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { AutoCompleteUser } from "./auto-completer-user";

// form
import { useForm, Controller, FormProvider } from "react-hook-form";

interface PostComposerProps {
  userProfile: UserProfile | null;
  refreshPosts?: () => void;
}

interface FormValues {
  content: string;
}

export default function PostComposer({
  userProfile,
  refreshPosts,
}: PostComposerProps) {
  const { t } = useTranslation("common");

  // Define visibility options with translations
  const visibilityOptions = [
    {
      value: "public",
      label: t("post.visibility.public", "Public"),
      description: t("post.visibility.publicDescription", "Visible par tous"),
      icon: Globe,
    },
    {
      value: "friends",
      label: t("post.visibility.friends", "Amis"),
      description: t("post.visibility.friendsDescription", "Visible par vos amis"),
      icon: Users,
    },
    {
      value: "private",
      label: t("post.visibility.private", "Privé"),
      description: t("post.visibility.privateDescription", "Visible par vous seul"),
      icon: Lock,
    },
  ];

  const [visibility, setVisibility] = useState(visibilityOptions[0]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState<UserProfile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionTriggerRef = useRef<HTMLDivElement>(null);

  // get user data
  const { user } = useAuth();

  const methods = useForm<FormValues>({
    defaultValues: { content: "" },
  });
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = methods;

  const content = watch("content") || "";
  const characterCount = content.length;
  const maxCharacters = 200;

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    // trigger autocomplete when user types @
    const words = content.split(" ");
    const mentionTrigger = words.find((word) => word.startsWith("@"));
    if (mentionTrigger && mentionTrigger.length > 1) {
      console.log("Triggering autocomplete for:", mentionTrigger);

      // Vérifier si userService.searchUser existe
      if (userService.searchUsers) {
        userService.searchUsers(mentionTrigger.slice(1)).then((profiles) => {
          if (profiles) {
            console.log("Found user profiles:", profiles);
            setSearchedUsers(profiles);
          } else {
            console.log("No users found for:", mentionTrigger);
            setSearchedUsers([]);
          }
        }).catch((error) => {
          console.error("Error searching users:", error);
          setSearchedUsers([]);
        });
      }
    } else {
      setSearchedUsers([]);
    }
  }, [content]);

  const onSubmit = async (data: FormValues) => {
    setIsPosting(true);

    try {
      // Submit post with files
      await postService.postPost(data.content, visibility.value, attachedFiles);

      // Reset the form and attached files after posting
      reset();
      setAttachedFiles([]);
      setSearchedUsers([]);
      refreshPosts?.();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  // Don't render if no userProfile yet
  if (!userProfile) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-lg border shadow-sm p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg border shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <Avatar className="w-12 h-12 ring-2 border-none">
            <AvatarImage
              src={userProfile?.profilePicture || "/placeholder.svg"}
              alt={userProfile?.displayName}
            />
            <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white">
              <UserPlaceholderIcon className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {t("postComposer.createPost", "Créer une publication")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("postComposer.shareThoughts", `Breeze what's on your mind, ${user?.username || "Guest"}!`)}
          </p>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Content Input */}
          <Controller
            name="content"
            control={control}
            rules={{
              maxLength: {
                value: maxCharacters,
                message: t("postComposer.characterLimit", {
                  count: maxCharacters,
                }),
              },
            }}
            render={({ field }) => (
              <div>
                <Textarea
                  placeholder={t("postComposer.placeholder", "Quoi de neuf ?")}
                  {...field}
                  ref={(e) => {
                    // Maintain both refs
                    field.ref(e);
                    textareaRef.current = e;
                  }}
                  className="min-h-[100px] resize-none border-0 p-0 text-base placeholder:text-muted-foreground focus-visible:ring-0"
                  maxLength={maxCharacters}
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

                      // Force a re-render
                      methods.trigger("content");
                    }
                  }}
                  triggerRef={mentionTriggerRef}
                />
              </div>
            )}
          />
          {/* Character Count */}
          {content && (
            <div className="flex justify-end">
              <span
                className={`text-xs ${
                  characterCount > maxCharacters * 0.9
                    ? characterCount >= maxCharacters
                      ? "text-red-500"
                      : "text-yellow-500"
                    : "text-muted-foreground"
                }`}
              >
                {characterCount}/{maxCharacters}
              </span>
            </div>
          )}

          {errors.content && (
            <div className="text-xs text-red-500">{errors.content.message}</div>
          )}

          {/* Attached Files */}
          {attachedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("post.attachedFiles", "Fichiers joints")}</p>
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Paperclip className="w-3 h-3" />
                    <span className="text-xs truncate max-w-[100px]">
                      {file.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeFile(index)}
                      type="button"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <div className="flex items-center gap-2">
              {/* File Attachment */}
              <div className="relative">
                <input
                  type="file"
                  multiple
                  onChange={handleFileAttachment}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                  type="button"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {t("post.actions.attach", "Joindre")}
                  </span>
                </Button>
              </div>

              {/* Visibility Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                    type="button"
                  >
                    <visibility.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{visibility.label}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {visibilityOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setVisibility(option)}
                      className="flex items-start gap-3 p-3"
                    >
                      <option.icon className="w-4 h-4 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                      {visibility.value === option.value && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Post Button */}
            <Button
              type="submit"
              disabled={
                (!content.trim() && attachedFiles.length === 0) ||
                isPosting ||
                characterCount > maxCharacters
              }
              className="bg-primary hover:bg-primary/90"
            >
              {isPosting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {t("postComposer.posting", "Publication...")}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t("common.post", "Publier")}
                </>
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}