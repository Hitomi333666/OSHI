// app/(auth)/logout/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem("token"); // トークンを削除
    router.push("/"); // ルート画面に遷移
  };

  return (
    <div className="flex items-center justify-center h-full py-6">
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center">Logout</h1>
          <p className="text-center">Are you sure you want to log out?</p>
          <div className="form-control mt-6">
            <button onClick={handleLogout} className="btn btn-primary">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
