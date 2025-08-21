"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./ChangePasswordModal.module.css";

type Props = { onClose: () => void };

export default function ChangePasswordModal({ onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg("All fields are required");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setErrorMsg("User not found");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) {
        setErrorMsg("Current password is incorrect");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) {
        setErrorMsg(updateError.message);
        return;
      }

      alert("Password updated successfully");
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Change Password</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleChangePassword} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 8 characters)"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={styles.input}
            />
          </div>

          {errorMsg && <div className={styles.error}>{errorMsg}</div>}

          <div className={styles.buttons}>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    className="loader"
                    style={{
                      width: "18px",
                      height: "18px",
                      marginRight: "8px",
                    }}
                  ></div>
                  Updating...
                </div>
              ) : (
                "Update Password"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
