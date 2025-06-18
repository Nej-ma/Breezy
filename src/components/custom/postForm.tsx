"use client";

import { useForm, Controller } from "react-hook-form";

// ui components
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

// icons
import { Eye, Lock, Users, ImageUp } from "lucide-react"; // Example icons

const visibilityIcons: Record<string, React.ReactNode> = {
  public: <Eye className="w-5 h-5" />,
  private: <Lock className="w-5 h-5" />,
  friends: <Users className="w-5 h-5" />,
};

type PostFormValues = {
  content: string;
  media: FileList;
  tags: string;
  mentions: string;
  visibility: "public" | "private" | "friends";
};

const PostForm: React.FC = () => {
  const form = useForm<PostFormValues>({
    defaultValues: {
      content: "",
      tags: "",
      mentions: "",
      visibility: "public",
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
  } = form;

  // Watch content to enforce max length
  const contentValue = watch("content", "");

  const onSubmit = (data: PostFormValues) => {
    console.log(data);
    reset();
  };

  const getMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  };

  const getTags = (content: string): string[] => {
    const tagRegex = /#(\w+)/g;
    const tags = [];
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1]);
    }
    return tags;
  };

  return (
    <Card className="w-full p-5 border-0 shadow-lg bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 ">
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 max-w-md mx-auto"
          >
            <FormField
              control={control}
              name="content"
              rules={{
                required: "Content is required",
                maxLength: {
                  value: 200,
                  message: "Content must be at most 200 characters",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="What's new?"
                      {...field}
                      rows={4}
                      maxLength={200}
                    />
                  </FormControl>
                  <FormDescription className="ml-auto">
                    {contentValue?.length ?? 0}/200
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-row items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Trigger the hidden file input click
                  document.getElementById("media-upload-input")?.click();
                }}
              >
                <ImageUp />
              </Button>
              <FormField
                control={control}
                name="media"
                render={({ field }) => (
                  <Input
                    id="media-upload-input"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                )}
              />

              <FormField
                control={control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="justify-start"
                            type="button"
                          >
                            {field.value ? (
                              <span className="flex items-center gap-2">
                                {visibilityIcons[field.value]}
                              </span>
                            ) : (
                              <span>Select visibility</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[180px] p-0">
                          <div>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => field.onChange("public")}
                            >
                              <Eye className="inline w-4 h-4 mr-2" /> Public
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => field.onChange("private")}
                            >
                              <Lock className="inline w-4 h-4 mr-2" /> Private
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => field.onChange("friends")}
                            >
                              <Users className="inline w-4 h-4 mr-2" /> Friends
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="ml-auto"
                disabled={!isValid || (contentValue?.length ?? 0) === 0}
              >
                Create Post
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PostForm;
