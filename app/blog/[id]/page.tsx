// app/blog/[id]/page.tsx
import { getArticle } from "@/app/actions/blog";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BlogPost } from "@/types/blog";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostPage({ params }: PageProps) {
  // `params`を非同期で解決
  const { id } = await params;

  // 記事データを取得
  const article: BlogPost | null = await getArticle(id);

  // 記事が見つからない場合は404を表示
  if (!article) {
    notFound();
  }

  const tags = article.tags
    ? // 「カンマ」または「スペース」で区切られたタグのリストを取得する
      article.tags.split(/[\s,]+/).filter((tag) => tag !== "")
    : [];

  return (
    <>
      <main className="py-10 px-6 max-w-4xl mx-auto">
        {/* 記事タイトル */}
        <h1 className="text-4xl font-bold mb-6">{article.title}</h1>

        {/* アイキャッチ画像 */}
        {article.eyecatch && (
          <div className="mb-6">
            <Image
              src={article.eyecatch.url}
              alt={article.title}
              width={article.eyecatch.width}
              height={article.eyecatch.height}
              className="rounded-lg"
              priority
            />
          </div>
        )}

        {/* タグ一覧 */}
        {tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <div key={index} className="badge badge-secondary">
                {tag}
              </div>
            ))}
          </div>
        )}

        {/* 記事本文 */}
        <div
          className="prose prose-lg"
          dangerouslySetInnerHTML={{ __html: article.content }}
        ></div>
      </main>
    </>
  );
}
