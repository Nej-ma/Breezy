import { TFunction } from "i18next";

// private function to help process post content
export const extractTags = (content: string): string[] => {
  const tagPattern = /#(\w+)/g;
  const tags = [];
  let match;

  while ((match = tagPattern.exec(content)) !== null) {
    tags.push(match[1]);
  }

  return tags;
};

export const extractMentions = (content: string): string[] => {
  const mentionPattern = /@(\w+)/g;
  const mentions = [];
  let match;

  while ((match = mentionPattern.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
};

export const getRelativeTime = (
  t: TFunction<"common", any>,
  dateString: string
): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000; // seconds

  if (diff < 60) return t("post.time.now");
  if (diff < 3600) return `${Math.floor(diff / 60)}${t("post.time.minute")}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}${t("post.time.hour")}`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}${t("post.time.day")}`;

  // If more than a week, show date (e.g., Jun 18)
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  if (date.getFullYear() !== now.getFullYear()) {
    options.year = "numeric";
  }
  return date.toLocaleDateString(undefined, options);
};
