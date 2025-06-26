// components/Navbar.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext"; // ✅ カートを利用
export default function Navbar() {
  const router = useRouter();
  const { isLoggedIn, avatar, nickname, role } = useAuth();
  const { cartItems, setCartOpen } = useCart(); // ✅ カート情報を取得
  const cartItemCount = cartItems.length; // ✅ カート内のアイテム数
  const handleLoginRedirect = () => {
    sessionStorage.setItem("redirectAfterLogin", "/");
    router.push("/login");
  };
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link className="btn btn-ghost text-xl" href="/" passHref>
          素敵な食卓
        </Link>
      </div>
      <div className="flex-none">
        {/* 🛒 カートボタン */}
        <button
          onClick={() => setCartOpen(true)}
          className="btn btn-ghost btn-circle relative"
        >
          <div className="indicator">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293
2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2
2 0 014 0z"
              />
            </svg>
            {cartItemCount > 0 && (
              <span className="badge badge-sm indicator-item bg-red-500 text-white">
                {cartItemCount}
              </span>
            )}
          </div>
        </button>
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              {isLoggedIn ? (
                avatar ? (
                  <Image
                    src={avatar}
                    alt="User Avatar"
                    width={50}
                    height={50}
                  />
                ) : nickname ? (
                  <span className="text-2xl">
                    {nickname.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <Image
                    alt="Default Avatar"
                    src="/default-avatar.png"
                    width={50}
                    height={50}
                  />
                )
              ) : (
                <Image alt="avatar" src="/user.png" width={50} height={50} />
              )}
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-
3 w-30 p-2 shadow"
          >
            <li>
              <Link className="justify-between" href="/profile" passHref>
                Profile
              </Link>
            </li>
            {role === "admin" && (
              <li>
                <Link className="justify-between" href="/upload" passHref>
                  upload
                </Link>
              </li>
            )}
            <li>
              {isLoggedIn ? (
                <Link href="/logout" passHref>
                  Logout
                </Link>
              ) : (
                <button onClick={handleLoginRedirect}>Login</button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
