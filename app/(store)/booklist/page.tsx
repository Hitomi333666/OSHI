// app/(store)/booklist/page.tsx
"use client";
import { useEffect, useState } from "react";
import { listBooks } from "@/app/actions/books";
import { getUserBuyBooks } from "@/app/actions/books";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function BookListPage() {
  const [books, setBooks] = useState<
    {
      id: string;
      title: string;
      price: number;
      imageUrl: string;
      purchased?: boolean;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const { isLoggedIn, id: userId } = useAuth();
  const router = useRouter();
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const bookList = await listBooks();
        let updatedBooks = bookList;
        // 🔹 ログインしている場合は購入済みデータを取得
        if (isLoggedIn && userId) {
          const purchaseStatuses = await Promise.all(
            bookList.map(async (book) => {
              const result = await getUserBuyBooks(book.id, userId);
              return result.success ? result.bought : false; // `bought` を取得
            })
          );
          // 🔹 `purchased: true` を購入済みの書籍に追加
          updatedBooks = bookList.map((book, index) => ({
            ...book,
            purchased: purchaseStatuses[index], // `bought` の結果を `purchased` にセッ
            ト,
          }));
        }
        setBooks(updatedBooks);
      } catch (error) {
        console.error("書籍一覧取得エラー:", error);
        setErrorMessage("書籍一覧の取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [isLoggedIn, userId]);
  // 🔹 ログインボタン押下時の処理
  const handleLoginRedirect = () => {
    sessionStorage.setItem("redirectAfterLogin", "/booklist");
    router.push("/login");
  };
  return (
    <div className="">
      <div
        className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl
lg:px-8"
      >
        <div className="mx-auto flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            販売中の書籍
          </h2>
          {/* 🔹 ログインボタン */}
          {!isLoggedIn && (
            <button className="btn btn-primary" onClick={handleLoginRedirect}>
              ログイン
            </button>
          )}
        </div>
        {errorMessage && (
          <div className="alert alert-error shadow-lg mt-4">
            <span>{errorMessage}</span>
          </div>
        )}
        {isLoading ? (
          <div
            className="absolute inset-0 flex items-center justify-center bg-base-
200 bg-opacity-70 z-50"
          >
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : books.length === 0 ? (
          <p className="text-center mt-6">現在販売中の書籍はありません。</p>
        ) : (
          <div
            className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2
lg:grid-cols-4 xl:gap-x-8"
          >
            {books.map((book) => (
              <div key={book.id} className="group relative">
                <img
                  alt={book.title}
                  src={book.imageUrl}
                  className="w-full h-auto max-h-full object-contain object-center
rounded-md group-hover:opacity-75 lg:aspect-auto lg:h-80"
                />
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      {book.purchased ? (
                        <a href={`/view/${book.id}`}>
                          <span
                            aria-hidden="true"
                            className="absolute inset-0"
                          />
                          {book.title}
                        </a>
                      ) : (
                        <a href={`/book/${book.id}`}>
                          <span
                            aria-hidden="true"
                            className="absolute inset-0"
                          />
                          {book.title}
                        </a>
                      )}
                    </h3>
                    {book.purchased && (
                      <span className="text-xl text-green-600 font-semibold">
                        ✅ 購入済み
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    ¥{book.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
