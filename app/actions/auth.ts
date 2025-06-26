// app/actions/auth.ts
"use server";

import { prisma } from "@/libs/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ログイン
export async function loginUser(username: string, password: string) {
  if (!username || !password) {
    return { success: false, message: "Username and password are required" };
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { success: false, message: "Invalid username or password" };
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });

  return { success: true, token, avatar: user.avatar, nickname: user.nickname }; // 成功時にはトークンを含む
}

// ユーザー登録
export async function registerUser(
  username: string,
  password: string,
  nickname: string
) {
  if (!username || !password || !nickname) {
    return { success: false, message: "All fields are required" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, nickname },
    });
    return { success: true, user };
  } catch (error) {
    return { success: false, message: "User already exists" };
  }
}

// トークンの有効性とユーザー存在確認
export async function validateTokenAndCheckUser(token: string) {
  if (!token) {
    return { success: false, message: "Unauthorized: No token provided" };
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return { success: false, message: "Unauthorized: User not found" };
    }

    return { success: true, user }; // ユーザー情報を返す
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { success: false, message: "Unauthorized: Token has expired" };
    }
    throw new Error("Unauthorized");
  }
}

// ユーザー情報の取得
export async function fetchUserProfile(token: string) {
  const result = await validateTokenAndCheckUser(token);
  if (result.success && result.user) {
    return {
      success: true,
      user: {
        avatar: result.user.avatar || "",
        nickname: result.user.nickname || "",
        id: result.user.id,
        role: result.user.role,
      },
    };
  } else {
    return result;
  }
}

// ユーザー情報の更新
export async function updateUserNickname(token: string, nickname: string) {
  if (!nickname) {
    return { success: false, message: "Nickname is required" };
  }

  const result = await validateTokenAndCheckUser(token);
  if (result.success && result.user) {
    const updatedUser = await prisma.user.update({
      where: { id: result.user.id },
      data: { nickname },
    });
    return { success: true, updatedUser };
  } else {
    return { success: false, message: "Failed to update nickname" };
  }
}
