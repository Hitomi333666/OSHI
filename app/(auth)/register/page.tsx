// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "../../actions/auth";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    nickname: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // 成功メッセージ用ステート
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // エラーメッセージをリセット
    setSuccessMessage(""); // 成功メッセージをリセット

    try {
      await registerUser(form.username, form.password, form.nickname);
      setSuccessMessage("Registration successful! Redirecting...");
      setTimeout(() => {
        router.push("/login"); // 3秒後にリダイレクト
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-full py-6">
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center">Register</h1>

          {/* 成功メッセージ */}
          {successMessage && (
            <div className="alert alert-success shadow-lg">
              <div>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* エラーメッセージ */}
          {error && (
            <div className="alert alert-error shadow-lg">
              <div>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="input input-bordered"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input input-bordered"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Nickname</span>
              </label>
              <input
                type="text"
                placeholder="Nickname"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                className="input input-bordered"
                required
              />
            </div>

            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary">
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
