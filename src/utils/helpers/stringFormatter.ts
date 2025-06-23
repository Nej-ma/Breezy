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
