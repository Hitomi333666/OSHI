// types/blog.ts
export type BlogPost = {
  id: string;
  title: string;
  content: string;
  eyecatch: {
    url: string;
    width: number;
    height: number;
  };
  tags: string;
  updatedAt: string;
};
