// app/actions/books.ts
"use server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/libs/prisma";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service Role Key を使用
);
// 書籍一覧を取得
export async function listBooks() {
  // books/ バケットのフォルダ一覧を取得
  const { data: folders, error: folderError } = await supabase.storage
    .from("books")
    .list("");
  if (folderError) {
    console.error("フォルダ一覧取得エラー:", folderError);
    return [];
  }
  // `.emptyFolderPlaceholder` を除外し、名前が正しくあるものだけを対象にする
  const validFolders = folders.filter(
    (folder) => folder.name && folder.name !== ".emptyFolderPlaceholder"
  );
  const books = await Promise.all(
    validFolders.map(async (folder) => {
      const bookId = folder.name; // フォルダ名を bookId とする
      const metadataPath = `${bookId}/metadata.json`;
      // metadata.json をダウンロード
      const { data: metadataFile, error: metaError } = await supabase.storage
        .from("books")
        .download(metadataPath);
      if (metaError || !metadataFile) {
        console.error(`メタデータ取得エラー: ${bookId}`, metaError);
        return null;
      }
      try {
        const metadataText = await metadataFile.text();
        const metadata = JSON.parse(metadataText);
        // 画像の期限付きURLを取得
        const { data: imageSignedUrl } = await supabase.storage
          .from("books")
          .createSignedUrl(`${bookId}/${metadata.images[0]}`, 60 * 60); // 1時間有効
        return {
          id: bookId,
          title: String(metadata.title),
          price: Number(metadata.price),
          imageUrl: imageSignedUrl?.signedUrl || "", // URL が取得できない場合は空文字
        };
      } catch (parseError) {
        console.error(`JSON 解析エラー: ${bookId}`, parseError);
        return null;
      }
    })
  );
  // `null` を除外し、空配列を保証
  const validBooks = books.filter(
    (
      book
    ): book is { id: string; title: string; price: number; imageUrl: string } =>
      book !== null
  );
  return validBooks;
}
// 書籍を削除
export async function deleteBook(bookId: string) {
  // フォルダ内の全ファイルを取得
  const { data, error } = await supabase.storage.from("books").list(bookId);
  if (error) {
    console.error("ファイル取得エラー:", error);
    return false;
  }
  // 全ファイルを削除
  const filePaths = data.map((file) => `${bookId}/${file.name}`);
  const { error: deleteError } = await supabase.storage
    .from("books")
    .remove(filePaths);
  if (deleteError) {
    console.error("削除エラー:", deleteError);
    return false;
  }
  return true;
}
// 🔹 書籍の詳細情報を取得
export async function getBookDetails(bookId: string) {
  const metadataPath = `${bookId}/metadata.json`;
  // metadata.json をダウンロード
  const { data: metadataFile, error: metaError } = await supabase.storage
    .from("books")
    .download(metadataPath);
  if (metaError || !metadataFile) {
    console.error(`書籍データ取得エラー: ${bookId}`, metaError);
    return null;
  }
  try {
    const metadataText = await metadataFile.text();
    const metadata = JSON.parse(metadataText);
    // 🔹 すべての画像の期限付き URL を取得
    const signedUrls = await Promise.all(
      metadata.images.map(async (image: string) => {
        const { data: signedUrl } = await supabase.storage
          .from("books")
          .createSignedUrl(`${bookId}/${image}`, 60 * 60);
        return signedUrl?.signedUrl || "";
      })
    );
    return {
      id: bookId,
      title: metadata.title,
      description: metadata.description,
      price: metadata.price,
      imageUrls: signedUrls.filter((url) => url !== ""),
    };
  } catch (parseError) {
    console.error(`JSON 解析エラー: ${bookId}`, parseError);
    return null;
  }
}
export async function getBookData(bookId: string) {
  try {
    // 書籍のメタデータ取得
    const { data: metadataFile, error: metadataError } = await supabase.storage
      .from("books")
      .download(`${bookId}/metadata.json`);
    if (metadataError || !metadataFile) {
      throw new Error("メタデータの取得に失敗しました");
    }
    const metadataText = await metadataFile.text();
    const bookMetadata = JSON.parse(metadataText);
    // 画像ファイルの一覧を取得
    const { data: files, error: filesError } = await supabase.storage
      .from("books")
      .list(bookId);
    if (filesError || !files) {
      throw new Error("画像一覧の取得に失敗しました");
    }
    // PNG 画像の署名付きURLを発行
    const imageUrls = await Promise.all(
      files
        .filter((file) => file.name.endsWith(".png")) // PNG のみ
        .map(async (file) => {
          const { data: signedUrlData } = await supabase.storage
            .from("books")
            .createSignedUrl(`${bookId}/${file.name}`, 60);
          return signedUrlData?.signedUrl || "";
        })
    );
    return { metadata: bookMetadata, images: imageUrls };
  } catch (error) {
    console.error("getBookData Error:", error);
    return { error: (error as Error).message };
  }
}
// 指定したユーザーIDとブログIDからお気に入りと評価を取得
export async function getUserBuyBooks(
  bookId: string,
  userId: string
): Promise<{ success: boolean; bought: boolean }> {
  try {
    console.log("bookId -> ", bookId);
    console.log("userId -> ", userId);
    const bought = await prisma.receipt.findFirst({
      where: { bookId, userId },
    });
    return {
      success: true,
      bought: bought !== null,
    };
  } catch (error) {
    console.error(
      `Failed to fetch interaction for user ${userId} and book ${bookId}`,
      error
    );
    return {
      success: false,
      bought: false,
    };
  }
}
