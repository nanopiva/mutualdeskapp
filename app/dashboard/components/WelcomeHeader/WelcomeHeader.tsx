"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./WelcomeHeader.module.css";

export default function WelcomeHeader() {
  const [userName, setUserName] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: userData, error } = await supabase
          .from("users")
          .select("first_name")
          .eq("id", user.id)
          .single();

        if (!error && userData?.first_name) {
          setUserName(userData.first_name);
        }
      }
      setIsLoading(false);
    };

    getCurrentUser();

    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("morning");
    else if (hour < 18) setTimeOfDay("afternoon");
    else setTimeOfDay("evening");
  }, []);

  const getGreeting = () => {
    switch (timeOfDay) {
      case "morning":
        return "Good morning";
      case "afternoon":
        return "Good afternoon";
      case "evening":
        return "Good evening";
      default:
        return "Good morning";
    }
  };

  const getEmoji = () => {
    switch (timeOfDay) {
      case "morning":
        return "🌞";
      case "afternoon":
        return "☀️";
      case "evening":
        return "🌙";
      default:
        return "🌞";
    }
  };

  return (
    <header className={styles.welcomeHeader}>
      <h1 className={styles.greeting}>
        {isLoading ? (
          <div className={styles.greetingSkeleton}></div>
        ) : (
          <>
            {getGreeting()}
            {userName && <span className={styles.userName}>, {userName}</span>}!
            <span className={styles.emoji}> {getEmoji()}</span>
          </>
        )}
      </h1>
      <p className={styles.subtitle}>
        Here's what's happening in your creative space today.
      </p>
    </header>
  );
}
