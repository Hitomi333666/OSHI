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
  favoriteCount: number;
  ratingAvg: number;
  comments: {
    user: {
      nickname: string;
      avatar: string | null;
      role: string; // role プロパティが存在
    };
    content: string;
    createdAt: string;
  }[];
};
