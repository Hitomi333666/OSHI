// components/Hero.tsx
import Image from "next/image";
export default function Hero() {
  return (
    <div
      className="hero min-h-screen"
      style={{
        backgroundImage: "url(/bbq.jpg)",
      }}
    >
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl font-bold">愛猫あかさん</h1>
          <p className="mb-5">我が家の愛猫「あか」さんをご紹介します！</p>
          <a href="booklist" className="btn btn-primary">
            見てみたい♡
          </a>
        </div>
      </div>
    </div>
  );
}
