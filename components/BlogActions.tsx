// components/BlogActions.tsx
"use client";

import {
  postComment,
  toggleFavorite,
  postRating,
  getUserBlogInteraction,
} from "@/app/actions/blog";
import { useState, useTransition, useEffect } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai"; // ハートアイコン
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type BlogActionsProps = {
  blogId: string;
};

export default function BlogActions({ blogId }: BlogActionsProps) {
  const { isLoggedIn, avatar, nickname, id } = useAuth();

  const [isPending, startTransition] = useTransition();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [localFavorite, setLocalFavorite] = useState(false);
  const [showModal, setShowModal] = useState(false); // モーダル制御
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      getUserBlogInteraction(blogId, id).then((result) => {
        if (result.success) {
          setLocalFavorite(result.isFavorite);
          setRating(result.userRating);
        }
      });
    }
  }, [isLoggedIn]);

  const handleLoginRedirect = () => {
    sessionStorage.setItem("redirectAfterLogin", `/blog/${blogId}`);
    router.push("/login");
  };

  const handleToggleFavorite = () => {
    console.log(`UserId: ${id}`); // userIdの内容を確認

    if (!isLoggedIn) {
      setShowModal(true);
      return;
    }
    startTransition(async () => {
      await toggleFavorite(blogId, id);
      setLocalFavorite((prev) => !prev);
    });
  };

  const handleRatingClick = (newRating: number) => {
    if (!isLoggedIn) {
      setShowModal(true);
      return;
    }
    setRating(newRating);
    startTransition(async () => {
      await postRating(blogId, id, newRating);
    });
  };

  const handleCommentSubmit = () => {
    if (!isLoggedIn) {
      setShowModal(true);
      return;
    }
    startTransition(async () => {
      if (!comment.trim()) return;
      await postComment(blogId, id, comment);
      setComment("");
      // 画面の再描画をトリガーするためにページをリロード
      router.refresh();
    });
  };

  return (
    <>
      <section>
        {/* お気に入りと評価を横並びに */}
        <div className="mb-4 flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="rating flex items-center">
              {[...Array(5)].map((_, i) => (
                <input
                  key={i}
                  type="radio"
                  name="userRating"
                  className="mask mask-star-2 bg-yellow-500"
                  value={i}
                  checked={rating === i}
                  onChange={() => handleRatingClick(i)}
                />
              ))}
            </div>
            <button
              onClick={handleToggleFavorite}
              className="text-4xl cursor-pointer"
            >
              {localFavorite ? (
                <AiFillHeart className="text-red-500" />
              ) : (
                <AiOutlineHeart />
              )}
            </button>
          </div>
        </div>

        {/* コメント投稿 */}
        <section className="mt-2">
          <h2 className="text-2xl font-bold mb-4">コメントを投稿</h2>
          <textarea
            className="textarea textarea-bordered w-full mb-4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="コメントを入力..."
            rows={4}
          ></textarea>
          <button
            className="btn btn-primary mt-2"
            onClick={handleCommentSubmit}
            disabled={isPending}
          >
            コメントを投稿
          </button>
        </section>
      </section>

      {/* ログイン誘導モーダル */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">ログインが必要です</h3>
            <p className="py-4">
              評価、お気に入り、コメントを行うにはログインしてください。
            </p>
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
    </>
  );
}
