// Extract the ternary logic into a function
export const getComments = (comments: any): string[] => {
  if (Array.isArray(comments)) {
    return comments;
  }
  if (comments) {
    return [comments];
  }
  return [];
};