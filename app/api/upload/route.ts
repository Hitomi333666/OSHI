// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const price = formData.get("price") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    if (!files.length || !title || !price || !description) {
      return NextResponse.json(
        { error: "必要なデータがありません" },
        { status: 400 }
      );
    }
    // 現在の books フォルダ数を取得し、次の `bookId` を決定
    const { data: folders, error: folderError } = await supabase.storage
      .from("books")
      .list("");
    if (folderError) {
      console.error("フォルダ一覧取得エラー:", folderError);
      return NextResponse.json(
        { error: "書籍 ID の生成に失敗しました" },
        { status: 500 }
      );
    }
    const existingBookIds = folders
      .map((folder) => folder.name)
      .filter((name) => name.startsWith("book"))
      .map((name) => Number(name.replace("book", "")))
      .filter((num) => !isNaN(num));
    const nextBookNumber =
      existingBookIds.length > 0 ? Math.max(...existingBookIds) + 1 : 1;
    const bookId = `book${nextBookNumber}`;
    // ファイルを1つずつ Supabase にアップロード
    const fileList: string[] = [];
    for (const file of files) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const filePath = `${bookId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("books")
        .upload(filePath, fileBuffer, {
          contentType: file.type || "application/octet-stream",
        });
      if (uploadError) {
        console.error(`アップロード失敗: ${file.name}`, uploadError);
        return NextResponse.json(
          { error: `ファイル「${file.name}」のアップロードに失敗しました` },
          { status: 500 }
        );
      }
      fileList.push(file.name);
    }
    // metadata.json をアップロード
    const metadata = {
      id: bookId,
      images: fileList,
      title,
      description,
      price: Number(price),
    };
    const { error: metadataError } = await supabase.storage
      .from("books")
      .upload(`${bookId}/metadata.json`, JSON.stringify(metadata), {
        contentType: "application/json",
      });
    if (metadataError) {
      console.error("メタデータアップロードエラー:", metadataError);
      return NextResponse.json(
        { error: "メタデータのアップロードに失敗しました" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, bookId, files: fileList });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
