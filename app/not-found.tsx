// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-full py-6">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-error">404</h1>
        <p className="mt-4 text-lg text-base-content">
          ページが見つかりませんでした。
        </p>
        <p className="mt-2 text-sm text-neutral">
          お探しのページが存在しないか、URLが間違っている可能性があります。
        </p>
        <div className="mt-6">
          <Link href="/" passHref className="btn btn-primary">
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
