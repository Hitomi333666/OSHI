// app/(store)/book/[id]/BookClient.tsx
"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getUserBuyBooks } from "@/app/actions/books";

type BookProps = {
  book: {
    title: string;
    description: string;
    price: number;
    imageUrls: string[];
  } | null;
  bookId: string;
};
export default function BookClient({ book, bookId }: BookProps) {
  const router = useRouter();
  const { addToCart, setCartOpen } = useCart();
  const { isLoggedIn, id } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isBought, setIsBought] = useState(false);
  // ✅ useEffect をコンポーネントの最上部に配置
  useEffect(() => {
    if (!isLoggedIn || !bookId || !id) return; // ログインしていない場合は実行しない
    getUserBuyBooks(bookId, id).then((result) => {
      if (result.success) {
        setIsBought(result.bought);
      }
    });
  }, [isLoggedIn, bookId, id]);
  // ✅ 本が null の場合の処理（useEffect より後に書く）
  if (!book) {
    return (
      <p className="text-center mt-6 text-red-500">
        書籍が見つかりませんでした
      </p>
    );
  }
  const handleLoginRedirect = () => {
    sessionStorage.setItem("redirectAfterLogin", `/book/${bookId}`);
    router.push("/login");
  };
  const handleAddToCart = () => {
    if (!isLoggedIn) {
      setShowModal(true);
      return;
    }
    const newCartItem = {
      id: bookId,
      title: book.title,
      price: book.price,
      imageUrl: book.imageUrls?.[0] || "",
    };
    addToCart(newCartItem);
    setCartOpen(true);
  };
  return (
    <div>
      <div className="pt-6 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8">
        <div className="mx-auto max-w-2xl sm:px-6 lg:max-w-full">
          {book.imageUrls.length ? (
            <Image
              alt={book.title}
              src={book.imageUrls[0]}
              width={500}
              height={500}
              className="w-full h-auto max-h-[500px] object-contain"
            />
          ) : (
            <div
              className="w-full h-[500px] bg-gray-200 flex items-center justifycenter
text-gray-500"
            >
              画像はありません
            </div>
          )}
        </div>
        <div
          className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:max-w-full
lg:px-8 lg:pb-24 lg:pt-16"
        >
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {book.title}
          </h1>
          <p className="text-3xl tracking-tight text-gray-900 mt-2">
            ¥{book.price}
          </p>
          <div className="py-6 border-t border-gray-200 mt-6">
            <h3 className="text-sm font-medium text-gray-900">書籍の説明</h3>
            <p className="mt-2 text-base text-gray-900">{book.description}</p>
          </div>
          <div className="mt-6 flex gap-4">
            {isBought ? (
              <button className="btn btn-primary w-full btn-disabled">
                購入済みです
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="btn btn-primary w-full"
              >
                カートに追加
              </button>
            )}
          </div>
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => router.push("/booklist")}
              className="btn btn-outline btn-secondary"
            >
              一覧に戻る
            </button>
          </div>
        </div>
      </div>
      {/* ログイン誘導モーダル */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">ログインが必要です</h3>
            <p className="py-4">購入ご希望の方はログインしてください。</p>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleLoginRedirect}>
                ログインページへ
              </button>
              <button className="btn" onClick={() => setShowModal(false)}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
