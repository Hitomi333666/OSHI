// app/(store)/upload/page.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchUserProfile } from "@/app/actions/auth";
import { listBooks, deleteBook } from "@/app/actions/books";
function UploadPage() {
  const [books, setBooks] = useState<
    { id: string; title: string; price: number }[]
  >([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false); // 🔹 アップロード中の状態管理
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // 🔹 削除モーダル
  の管理;
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null); // 🔹 削除対象
  の書籍ID;
  const fileInputRef = useRef<HTMLInputElement>(null); // 🔹 ファイル選択リセット用
  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      const result = await fetchUserProfile(token);
      if (result.user && (!result.success || result.user.role !== "admin")) {
        router.push("/");
        return;
      }
      // 書籍一覧を取得
      const bookList = await listBooks();
      setBooks(bookList);
      setLoading(false);
    };
    checkAuth();
  }, [router]);
  // 🔹 削除モーダルを開く
  const openDeleteModal = (bookId: string) => {
    setDeleteTarget(bookId);
    setIsDeleteModalOpen(true);
  };
  // 🔹 DaisyUI のモーダルから削除実行
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleteModalOpen(false); // モーダルを閉じる
    const success = await deleteBook(deleteTarget);
    if (success) {
      setBooks(books.filter((book) => book.id !== deleteTarget));
    } else {
      setErrorMessage("削除に失敗しました");
    }
    setDeleteTarget(null);
  };
  const handleUpload = async () => {
    if (
      !selectedFiles ||
      selectedFiles.length === 0 ||
      title.trim() === "" ||
      description.trim().length < 10 ||
      price === ""
    ) {
      setErrorMessage("すべての項目を正しく入力してください");
      return;
    }
    setErrorMessage("");
    setIsUploading(true); // 🔹 アップロード開始時にボタンを非活性に
    const formData = new FormData();
    for (const file of Array.from(selectedFiles)) {
      formData.append("files", file);
    }
    formData.append("title", title);
    formData.append("price", String(price));
    formData.append("description", description);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      // 🔹 HTTP ステータスチェック
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          // JSON レスポンスの場合
          const errorData = await response.json();
          setErrorMessage(`サーバーエラー: ${JSON.stringify(errorData)}`);
        } else {
          // HTML の場合、タグを解析し日本語メッセージを抽出
          const errorText = await response.text();
          console.log(errorText);
          setErrorMessage(`アクセスエラー：Zscaler`);
        }
        return;
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error("アップロードに失敗しました");
      }
      setBooks([...books, { id: result.bookId, title, price: Number(price) }]);
      // 🔹 ファイル選択をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFiles(null);
      setTitle("");
      setDescription("");
      setPrice("");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("予期しないエラーが発生しました");
      }
    } finally {
      setIsUploading(false); // 🔹 アップロード完了時にボタンを有効化
    }
  };
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">書籍管理</h1>
      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">書籍一覧</h2>
        {loading ? (
          <p>読み込み中...</p>
        ) : books.length === 0 ? (
          <p>書籍は登録されていません。</p>
        ) : (
          <ul className="list-disc pl-4">
            {books.map((book) => (
              <li key={book.id} className="flex justify-between items-center">
                <span>
                  {book.title} - ¥{book.price}
                </span>
                <button
                  className="btn btn-error btn-sm"
                  onClick={() => openDeleteModal(book.id)}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">書籍のアップロード</h2>
        <fieldset className="fieldset">
          <legend className="fieldset-legend text-sm">
            　複数選択できます
          </legend>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png"
            multiple
            onChange={(e) => setSelectedFiles(e.target.files)}
            className="file-input file-input-bordered file-input-primary w-full mb-2"
          />
        </fieldset>
        <input
          type="text"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input input-bordered w-full mb-2"
        />
        <textarea
          placeholder="説明 (10文字以上)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea textarea-bordered w-full mb-2"
        />
        <input
          type="number"
          placeholder="価格 (円)"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value !== "" ? Number(e.target.value) : "")
          }
          className="input input-bordered w-full mb-2"
        />
        <button
          onClick={handleUpload}
          className="btn btn-primary w-full"
          disabled={isUploading} // 🔹 アップロード中はボタンを無効化
        >
          {isUploading ? "アップロード中..." : "アップロード"}
        </button>
      </div>
      {/* 🔹 DaisyUI の削除モーダル */}
      {isDeleteModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">本当に削除しますか？</h3>
            <p className="py-4">この操作は取り消せません。</p>
            <div className="modal-action">
              <button className="btn btn-error" onClick={handleDelete}>
                削除
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default UploadPage;
