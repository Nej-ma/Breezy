import React from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

type FormData = {
  comment: string;
};

const CommentComposer: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: { comment: "" },
  });

  const onSubmit = (data: FormData) => {
    // handleAddComment logic here
    // e.g., send data.comment to API
    reset();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Vous" />
            <AvatarFallback className="bg-blue-500 text-white text-xs">
              VO
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Textarea
                placeholder="Écrivez votre commentaire..."
                {...register("comment", { required: true })}
                onKeyPress={handleKeyPress}
                className="min-h-[80px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="flex justify-end mt-3">
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Commenter
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentComposer;
