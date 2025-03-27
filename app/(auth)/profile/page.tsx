// app/(auth)/profile/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { fetchUserProfile, updateUserNickname } from "../../actions/auth";

function ProfileContent() {
  const [nickname, setNickname] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // 成功メッセージ
  const [errorMessage, setErrorMessage] = useState(""); // エラーメッセージ
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        sessionStorage.setItem("redirectAfterLogin", "/profile");
        router.push("/login");
        return;
      }

      try {
        const result = await fetchUserProfile(token);
        if (result.success) {
          setNickname("nickname" in result ? result.nickname : ""); // nickname が存在しない場合は空文字
          setIsLoggedIn(true);
        } else {
          sessionStorage.setItem("redirectAfterLogin", "/profile");
          router.push("/login");
        }
      } catch (error) {
        sessionStorage.setItem("redirectAfterLogin", "/profile");
        router.push("/login");
      }
    };

    loadProfile();
  }, [router]);

  const handleNicknameChange = async () => {
    const token = sessionStorage.getItem("token");
    setSuccessMessage(""); // メッセージリセット
    setErrorMessage(""); // メッセージリセット

    try {
      const result = await updateUserNickname(token!, newNickname);
      if (!result.success || !result.updatedUser) {
        setErrorMessage(
          result.message ? result.message : "Failed to update nickname."
        );
        return;
      }
      setNickname(result.updatedUser.nickname || "");
      setNewNickname("");
      setSuccessMessage("Nickname updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000); // 3秒後に自動消去
    } catch {
      setErrorMessage("Failed to update nickname.");
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="card w-full max-w-lg mx-auto bg-base-100 shadow-xl">
      <div className="card-body">
        <h1 className="card-title text-2xl font-bold">Profile Page</h1>

        {/* 成功メッセージ */}
        {successMessage && (
          <div className="alert alert-success shadow-lg mt-4">
            <span>{successMessage}</span>
          </div>
        )}

        {/* エラーメッセージ */}
        {errorMessage && (
          <div className="alert alert-error shadow-lg mt-4">
            <span>{errorMessage}</span>
          </div>
        )}

        <p className="mt-4">
          Current Nickname: <span className="font-medium">{nickname}</span>
        </p>

        <div className="form-control mt-6">
          <label className="label">
            <span className="label-text">New Nickname</span>
          </label>
          <input
            type="text"
            placeholder="Enter new nickname"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            className="input input-bordered"
          />
          <button
            onClick={handleNicknameChange}
            className="btn btn-primary mt-4"
          >
            Update Nickname
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-8 bg-base-200">
        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-screen bg-base-200">
              <div className="flex flex-col items-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
                <p className="text-xl font-bold mt-4">Loading...</p>
              </div>
            </div>
          }
        >
          <ProfileContent />
        </Suspense>
      </div>
    </div>
  );
}
