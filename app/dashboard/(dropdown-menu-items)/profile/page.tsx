"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import AvatarIcon from "../../components/AvatarIcon/AvatarIcon";
import styles from "./page.module.css";
import ChangePasswordModal from "./ChangePasswordModal";

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());
  const [currentAvatarExt, setCurrentAvatarExt] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("No authenticated user:", userError);
          setLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("first_name, last_name")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setLoading(false);
          return;
        }

        setUser(user);
        setFormData({
          first_name: profile?.first_name || "",
          last_name: profile?.last_name || "",
          email: user.email || "",
        });

        const { data: files, error: listError } = await supabase.storage
          .from("profilepictures")
          .list(user.id);

        if (!listError && files?.length) {
          const profileFile = files.find((f) => f.name.startsWith("profile."));
          if (profileFile) {
            const ext = profileFile.name.split(".").pop();
            setCurrentAvatarExt(ext || null);
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [supabase]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setUpdating(true);

      if (!user) {
        console.error("User is null");
        return;
      }

      if (selectedFile) {
        const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const filePath = `${user.id}/profile.${ext}`;

        const { data: existingFiles } = await supabase.storage
          .from("profilepictures")
          .list(user.id);

        if (existingFiles?.length) {
          for (const file of existingFiles) {
            if (file.name.startsWith("profile.")) {
              await supabase.storage
                .from("profilepictures")
                .remove([`${user.id}/${file.name}`]);
            }
          }
        }

        const { error: uploadError } = await supabase.storage
          .from("profilepictures")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        setAvatarTimestamp(Date.now());
        setCurrentAvatarExt(ext);
      }

      const { error: profileError } = await supabase
        .from("users")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setUpdating(false);
    }
  };

  const profilePictureURL = selectedFile
    ? URL.createObjectURL(selectedFile)
    : user && currentAvatarExt
      ? `https://kckpcncvhqcxfvzinkto.supabase.co/storage/v1/object/public/profilepictures/${user.id}/profile.${currentAvatarExt}?t=${avatarTimestamp}`
      : "";

  if (loading)
    return (
      <div className={styles.profilePage}>
        <div className={styles.loadingContainer}>
          <div
            className="loader"
            style={{ width: "40px", height: "40px" }}
          ></div>
        </div>
      </div>
    );

  if (!user) return <p>You need to log in to view this page.</p>;

  return (
    <div className={styles.profilePage}>
      <h1 className={styles.pageTitle}>Profile</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroupAvatar}>
          <label htmlFor="profile_picture" className={styles.avatarLabel}>
            <button
              type="button"
              className={styles.avatarButton}
              onClick={handleAvatarClick}
            >
              <AvatarIcon
                pictureURL={profilePictureURL}
                firstLetterBackup={formData.first_name.charAt(0)}
                secondLetterBackup={formData.last_name.charAt(0)}
              />
              <span className={styles.avatarOverlay}>
                <span className={styles.editMessage}>
                  Change profile picture
                </span>
                <span className={styles.editIcon}>✏️</span>
              </span>
            </button>
          </label>
          <input
            type="file"
            id="profile_picture"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="first_name" className={styles.label}>
            First Name
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="last_name" className={styles.label}>
            Last Name
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <div className={styles.emailDisplay}>{formData.email}</div>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={updating}
        >
          {updating ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className="loader"
                style={{ width: "18px", height: "18px", marginRight: "8px" }}
              ></div>
              Updating...
            </div>
          ) : (
            "Update Profile"
          )}
        </button>
      </form>

      <button
        className={styles.changePasswordButton}
        onClick={() => setPasswordModalOpen(true)}
      >
        Change Password
      </button>

      {passwordModalOpen && (
        <ChangePasswordModal onClose={() => setPasswordModalOpen(false)} />
      )}
    </div>
  );
};

export default ProfilePage;
