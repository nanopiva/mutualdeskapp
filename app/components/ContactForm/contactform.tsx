"use client";

import styles from "./contactform.module.css";
import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const formData = {
      name,
      email,
      message,
      subject,
    };

    try {
      const response = await fetch("/api/incoming_emails/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      if (response.status === 201) {
        console.log("Email sent successfully");
        setSubmitStatus("success");
        setName("");
        setEmail("");
        setMessage("");
        setSubject("");
      } else {
        const result = await response.json();
        console.log(result);
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error sending the form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.contactSection}>
      <h2 className={styles.contactTitle}>Don't hesitate to contact us</h2>
      <form className={styles.contactForm} onSubmit={onSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={subject}
            required
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={message}
            required
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
        {submitStatus === "success" && (
          <p className={styles.successMessage}>Message sent successfully!</p>
        )}
        {submitStatus === "error" && (
          <p className={styles.errorMessage}>
            Error sending message. Please try again.
          </p>
        )}
      </form>
    </section>
  );
}
