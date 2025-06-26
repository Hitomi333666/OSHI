// app/actions/blog.ts
"use server";

import { prisma } from "@/libs/prisma";
import { client } from "@/libs/microcms";
import { BlogPost } from "@/types/blog";
import jwt from "jsonwebtoken";

// Server Actionとしてブログ記事を取得する関数
export async function getBlogPosts(): Promise<BlogPost[]> {
  const data = await client.get({
    endpoint: "blog",
    queries: {
      fields: "id,title,content,eyecatch,tags,updatedAt",
    },
  });
  return data.contents;
}

// ブログ記事取得
export async function getArticle(id: string): Promise<BlogPost | null> {
  try {
    const data = await client.get({
      endpoint: "blog",
      contentId: id,
    });

    // Prisma で追加情報 (コメント、評価、いいね) を取得
    const comments = await prisma.comment.findMany({
      where: { blogId: id },
      include: {
        user: { select: { nickname: true, avatar: true, role: true } },
      }, // role を含めて取得
    });

    const favoritesCount = await prisma.favorite.count({
      where: { blogId: id },
    });
    const averageRating = await prisma.rating.aggregate({
      where: { blogId: id },
      _avg: { rating: true },
    });

    return {
      ...data,
      comments: comments.map((comment) => ({
        user: {
          nickname: comment.user.nickname,
          avatar: comment.user.avatar,
          role: comment.user.role, // role を追加
        },
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
      })),
      favoriteCount: favoritesCount,
      ratingAvg: averageRating._avg.rating ?? 0,
    };
  } catch (error) {
    console.error(`Failed to fetch article with id: ${id}`, error);
    return null;
  }
}

// 指定したユーザーIDとブログIDからお気に入りと評価を取得
export async function getUserBlogInteraction(
  blogId: string,
  userId: string
): Promise<{ success: boolean; isFavorite: boolean; userRating: number }> {
  try {
    const favorite = await prisma.favorite.findFirst({
      where: { blogId, userId },
    });
    const rating = await prisma.rating.findFirst({
      where: { blogId, userId },
    });

    return {
      success: true,
      isFavorite: favorite !== null,
      userRating: rating ? rating.rating : 0,
    };
  } catch (error) {
    console.error(
      `Failed to fetch interaction for user ${userId} and blog ${blogId}`,
      error
    );
    return {
      success: false,
      isFavorite: false,
      userRating: 0,
    };
  }
}

// コメント投稿
export async function postComment(
  blogId: string,
  userId: string,
  content: string
) {
  await prisma.comment.create({
    data: { blogId, userId, content },
  });
  // 使用例
  sendEmailWithJWT("投稿がありました", content, userId, blogId);
}

// お気に入り登録・解除 (トグル)
export async function toggleFavorite(blogId: string, userId: string) {
  const favorite = await prisma.favorite.findFirst({
    where: { blogId, userId },
  });
  if (favorite) {
    await prisma.favorite.delete({ where: { id: favorite.id } });
  } else {
    await prisma.favorite.create({ data: { blogId, userId } });
  }
}

// 評価登録
export async function postRating(
  blogId: string,
  userId: string,
  rating: number
) {
  await prisma.rating.upsert({
    where: {
      userId_blogId: { blogId, userId },
    },
    update: { rating },
    create: { blogId, userId, rating },
  });
}

// メール送信
export async function sendEmailWithJWT(
  subject: string,
  message: string,
  userId: string,
  blogId: string
) {
  const MAIL_SECRET = process.env.MAIL_SECRET; // 秘密鍵を環境変数から取得
  const GAS_MAIL_SERVICE_URL = process.env.GAS_MAIL_SERVICE_URL;
  const MAIL_ADDRESS = process.env.MAIL_ADDRESS;
  const MAIL_TITLE = process.env.MAIL_TITLE;

  if (!MAIL_SECRET || !GAS_MAIL_SERVICE_URL || !MAIL_ADDRESS || !MAIL_TITLE) {
    console.error("can't get process env");
    return;
  }

  // JWTペイロードの作成
  const payload = {
    userId: userId, // 引数として受け取ったuserIdを利用
    blogId: blogId, // 任意でadmin roleを付与
  };

  // JWT生成
  const token = jwt.sign(payload, MAIL_SECRET, {
    algorithm: "HS256", // HS256署名アルゴリズムを使用
    expiresIn: "1m", // 有効期限は1分
  });
  // メール送信リクエストのデータ
  const data = {
    email: MAIL_ADDRESS,
    subject: MAIL_TITLE,
    message: message || "No Message",
    token: token, // JWTトークンをリクエストデータに含める
  };

  // POSTリクエストの送信
  try {
    const response = await fetch(GAS_MAIL_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data), // JSONデータをリクエストボディとして送信
    });

    const responseData = await response.json();
    if (response.ok) {
      console.log("Email sent successfully:", responseData);
    } else {
      console.error("Error sending email:", responseData);
    }
  } catch (error) {
    console.error(`Error sending email with userId: ${userId}`, error);
  }
}
