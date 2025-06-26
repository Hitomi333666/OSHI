// app/(auth)/profile/page.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchUserProfile, updateUserNickname } from "@/app/actions/auth";
import { Cropper, ReactCropperElement } from "react-cropper";
import "./cropper.css";
import { uploadAvatar } from "@/app/actions/avatar";
import { useAuth } from "@/contexts/AuthContext"; // Context を使用するために追加;
function ProfileContent() {
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cropImage, setCropImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false); // アップロード中かど  うかのフラグ;
  const cropperRef = useRef<ReactCropperElement | null>(null);
  const router = useRouter();
  const { setLoggedIn } = useAuth(); // contextの更新用
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
        if (result.success && result.user) {
          setNickname(result.user.nickname || "");
          setAvatarUrl(result.user.avatar || "");
          setIsLoggedIn(true);
        } else {
          router.push("/login");
        }
      } catch (error) {
        router.push("/login");
      }
    };
    loadProfile();
  }, [router]);
  const handleNicknameChange = async () => {
    const token = sessionStorage.getItem("token");
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const result = await updateUserNickname(token!, nickname);
      if (!result.success || !result.updatedUser) {
        setErrorMessage(result.message || "Failed to update nickname.");
        return;
      }
      setSuccessMessage("Nickname updated successfully!");
    } catch {
      setErrorMessage("Failed to update nickname.");
    }
  };
  const handleAvatarUpload = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    if (!cropperRef.current || !isLoggedIn) {
      setErrorMessage("Please select an image.");
      return;
    }
    const cropper = cropperRef.current.cropper;
    const canvas = cropper.getCroppedCanvas(); // 正しく Cropper インスタンス    から取得;
    if (!canvas) {
      setErrorMessage("Failed to get cropped image.");
      return;
    }
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) {
      setErrorMessage("Failed to create image blob.");
      return;
    }
    setIsUploading(true); // アップロード開始
    const token = sessionStorage.getItem("token");
    const signedUrl = await uploadAvatar(token!, blob);
    if (!signedUrl) {
      setErrorMessage("Failed to upload avatar.");
    } else {
      setAvatarUrl(signedUrl);
      setLoggedIn(true, signedUrl); // context の avatar を更新
      setSuccessMessage("Avatar updated successfully!");
    }
    setIsUploading(false); // アップロード完了
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropImage(file);
    }
  };
  if (!isLoggedIn) {
    return null;
  }
  return (
    <div
      className="card w-full max-w-lg mx-auto bg-base-100 shadow-xl mt-
4"
    >
      <div className="card-body">
        <h1 className="card-title text-2xl font-bold">Profile Page</h1>
        {successMessage && (
          <div className="alert alert-success shadow-lg mt-4">
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="alert alert-error shadow-lg mt-4">
            <span>{errorMessage}</span>
          </div>
        )}
        <div className="form-control mt-6">
          <label className="label">
            <span className="label-text">Nickname</span>
          </label>
          <input
            type="text"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="input input-bordered"
          />
          <button
            onClick={handleNicknameChange}
            className="btn btn-primary mt-4"
          >
            Update Nickname
          </button>
        </div>
        <div className="mt-6">
          <label className="label">
            <span className="label-text">Change Avatar</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input file-input-bordered file-input-primary wfull
max-w-xs"
          />
          {cropImage && (
            <div className="mt-4">
              <Cropper
                ref={cropperRef}
                src={URL.createObjectURL(cropImage)}
                style={{ height: 300, width: "100%" }}
                aspectRatio={1}
                guides={false}
                cropBoxResizable={false}
                viewMode={1}
                background={false}
              />
              <button
                onClick={handleAvatarUpload}
                className="btn btn-success mt-4"
                disabled={isUploading} // 二重送信防止
              >
                {isUploading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Upload Avatar"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default ProfileContent;
