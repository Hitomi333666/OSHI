// app/page.tsx
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Slider from "@/components/Slider";
import { getBlogPosts } from "@/app/actions/blog";

export default async function Home() {
  const posts = await getBlogPosts();

  return <div className="flex flex-col "></div>;
}
