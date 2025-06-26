// app/(store)/book/[id]/page.tsx
import { getBookDetails } from "@/app/actions/books";
import BookClient from "./BookClient"; // クライアントコンポーネントをインポート
type PageProps = {
  params: Promise<{ id: string }>;
};
export default async function BookPage({ params }: PageProps) {
  const { id } = await params;
  const book = await getBookDetails(id); // 🔹 非同期でデータ取得

  return <BookClient book={book} bookId={id} />;
}
