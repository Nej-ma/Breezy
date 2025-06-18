"use client";

import type React from "react";
// hooks
import { useState } from "react";
import { useUser } from "@/utils/hooks/useUser";

// services
import { postService } from "@/services/postService";

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

// form
import { useForm, Controller, FormProvider } from "react-hook-form";

const visibilityOptions = [
  {
    value: "public",
    label: "Public",
    description: "Anyone can see this post",
    icon: Globe,
  },
  {
    value: "friends",
    label: "Friends",
    description: "Only your friends can see this",
    icon: Users,
  },
  {
    value: "private",
    label: "Only me",
    description: "Only you can see this post",
    icon: Lock,
  },
];

type FormValues = {
  content: string;
};

function Form({
  children,
  ...props
}: React.PropsWithChildren<React.FormHTMLAttributes<HTMLFormElement>>) {
  return (
    <form {...props} className="space-y-3">
      {children}
    </form>
  );
}

interface PostComposerProps {
  userProfile: UserProfile | null;
  refreshPosts?: () => void; // Optional prop to refresh posts after submission
}

export default function PostComposer({
  userProfile,
  refreshPosts,
}: PostComposerProps) {
  const [visibility, setVisibility] = useState(visibilityOptions[0]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  // get user data
  const { getUser } = useUser();
  const user = getUser();

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

  const onSubmit = async (data: FormValues) => {
    if (!data.content.trim() && attachedFiles.length === 0) return;

    setIsPosting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    reset();
    setAttachedFiles([]);
    setIsPosting(false);

    try {
      await postService.postPost(data.content, visibility.value, attachedFiles);
      // Optionally refresh posts if a refresh function is provided
      refreshPosts?.();
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

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
          <h3 className="font-semibold text-sm">Create a post</h3>
          <p className="text-xs text-muted-foreground">
            Share what's on your mind
          </p>
        </div>
      </div>

      <FormProvider {...methods}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          {/* Content Input */}
          <Controller
            name="content"
            control={control}
            rules={{
              maxLength: {
                value: maxCharacters,
                message: `Maximum ${maxCharacters} characters allowed.`,
              },
            }}
            render={({ field }) => (
              <Textarea
                placeholder="What's happening?"
                {...field}
                className="min-h-[100px] resize-none border-0 p-0 text-base placeholder:text-muted-foreground focus-visible:ring-0"
                maxLength={maxCharacters}
              />
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
              <p className="text-sm font-medium">Attached files:</p>
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
                  <span className="hidden sm:inline">Attach</span>
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
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </Form>
      </FormProvider>
    </div>
  );
}
