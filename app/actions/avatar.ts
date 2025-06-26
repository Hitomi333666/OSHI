// app/actions/avatar.ts
"use server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/libs/prisma";
import jwt from "jsonwebtoken";
const supabaseAdmin = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY! // サービスロールキー
);
export async function uploadAvatar(
token: string,
blob: Blob
): Promise<string | null> {
    try {
    const buffer = Buffer.from(await blob.arrayBuffer());
    const user: any = jwt.verify(token, process.env.JWT_SECRET as string);
    // Sharpで画像を加工
    const processedImage = await sharp(buffer)
    .resize(400, 400, { fit: "cover" })
    .toFormat("png")
    .toBuffer();
    const bucketName = process.env.SUPABASE_BUCKET_NAME;
    if (!bucketName) {
    throw new Error(
    "SUPABASE_BUCKET_NAME is not set in environment variables"
    );
    }
    // **古いアバターを削除するためのURL取得**
    const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { avatar: true },
    });
    const oldAvatarUrl = currentUser?.avatar || null;
    const fileName = `${uuidv4()}.png`;
    // Supabaseストレージに画像をアップロード
    const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(fileName, processedImage, {
    contentType: "image/png",
    upsert: false,
    });
    if (error) {
    console.error("Supabase upload error:", error.message);
    throw new Error("Failed to upload image to Supabase storage.");
    }
    // **公開 URL を取得**
    const avatarUrl =
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketNa
    me}/${data.path}`;
    // **Prisma で avatar URL を更新**
    await prisma.user.update({
    where: { id: user.id },
    data: { avatar: avatarUrl },
    });
    // **古いファイルを削除**
    if (oldAvatarUrl) {
    const oldFilePath = oldAvatarUrl.split("/storage/v1/object/public/")
    [1];
    await supabaseAdmin.storage.from(bucketName).remove([oldFilePath]);
    console.log(`Deleted old avatar: ${oldFilePath}`);
}
return avatarUrl;
} catch (error: any) {
console.error("Error uploading avatar:", error.message);
return null;
}