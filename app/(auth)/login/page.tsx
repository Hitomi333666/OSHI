// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/app/actions/auth"; // server action をインポート
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { setLoggedIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // server action を呼び出す
      const result = await loginUser(username, password);

      if (!result.success) {
        setError(result.message || "Login failed"); // エラーメッセージを設定
        return;
      }

      if (result.token) {
        setLoggedIn(true, result.avatar || "", result.nickname || "");

        // トークンをセッションストレージに保存
        sessionStorage.setItem("token", result.token);

        // リダイレクト先を取得し、遷移
        const redirectTo = sessionStorage.getItem("redirectAfterLogin") || "/";
        sessionStorage.removeItem("redirectAfterLogin"); // リダイレクト先をクリア
        router.push(redirectTo);
      }
    } catch (err: any) {
      setError("Unexpected error occurred during login");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center h-full py-6">
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center">Login</h1>

          {error && (
            <div className="alert alert-error shadow-lg">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-control">
              <label htmlFor="username" className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input input-bordered"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-control">
              <label htmlFor="password" className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary">
                Login
              </button>
            </div>
          </form>

          <p className="text-center">
            <span className="text-sm">Don’t have an account?</span>{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
