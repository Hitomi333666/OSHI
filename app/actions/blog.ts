// app/actions/blog.ts
import { client } from "@/libs/microcms";
import { BlogPost } from "@/types/blog";

// Server Actionとしてブログ記事を取得する関数
export async function getBlogPosts(): Promise<BlogPost[]> {
  "use server"; // Server Actionsの指示
  const data = await client.get({
    endpoint: "blog",
    queries: {
      fields: "id,title,content,eyecatch,tags,updatedAt",
    },
  });
  return data.contents;
}

// Server Actionとして記事を取得
export async function getArticle(id: string): Promise<BlogPost | null> {
  "use server";
  try {
    const data = await client.get({
      endpoint: "blog",
      contentId: id,
    });
    return data as BlogPost;
  } catch (error) {
    console.log(`Failed to fetch article with id: ${id}`, error);
    return null;
  }
}
