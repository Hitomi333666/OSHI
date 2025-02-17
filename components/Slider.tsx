// components/Slider.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { BlogPost } from "@/types/blog";
import Link from "next/link";

type SliderProps = {
  posts: BlogPost[];
};

export default function Carousel({ posts }: SliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? posts.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === posts.length - 1 ? 0 : prevIndex + 1
    );
  };

  // 自動移動のためのタイマー設定
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000); // 5秒ごとに移動

    return () => clearInterval(interval); // コンポーネントがアンマウントされたときにクリーンアップ
  }, [activeIndex]);

  return (
    <div className="relative h-64 overflow-hidden p-4 rounded-lg">
      {/* スライドの内容 */}
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {posts.map((post) => (
          <div key={post.id} className="flex-shrink-0 w-full h-full relative">
            <div className="relative w-full h-64">
              <Image
                src={post.eyecatch.url}
                alt={post.title}
                fill
                style={{
                  objectFit: "cover",
                }}
                className="rounded-lg"
                priority={true}
              />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <Link
                href={`/blog/${post.id}`}
                className="btn btn-outline btn-secondary mt-4 text-lg font-bold bg-black bg-opacity-30"
              >
                {post.title}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ナビゲーションボタン */}
      <button
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-60 text-white btn-circle"
        onClick={handlePrev}
      >
        &lt;
      </button>
      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-60 text-white btn-circle"
        onClick={handleNext}
      >
        &gt;
      </button>

      {/* インジケーター */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {posts.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              index === activeIndex ? "bg-white" : "bg-gray-400"
            }`}
            onClick={() => setActiveIndex(index)}
          ></div>
        ))}
      </div>
    </div>
  );
}
