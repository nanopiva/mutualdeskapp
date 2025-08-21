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
      <div className={styles.contactHeader}>
        <h2 className={styles.contactTitle}>Get in Touch</h2>
        <p className={styles.contactSubtitle}>We'd love to hear from you</p>
      </div>
      <form className={styles.contactForm} onSubmit={onSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.formInput}
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
              className={styles.formInput}
            />
          </div>
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
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message">Your Message</label>
          <textarea
            id="message"
            name="message"
            value={message}
            required
            onChange={(e) => setMessage(e.target.value)}
            className={styles.formTextarea}
          ></textarea>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className={styles.buttonContent}>
              <span className={styles.spinner}></span>
              Sending...
            </span>
          ) : (
            "Send Message"
          )}
        </button>

        {submitStatus === "success" && (
          <div className={styles.statusMessage}>
            <svg className={styles.statusIcon} viewBox="0 0 20 20">
              <path d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z" />
            </svg>
            Message sent successfully!
          </div>
        )}

        {submitStatus === "error" && (
          <div className={styles.statusMessageError}>
            <svg className={styles.statusIcon} viewBox="0 0 20 20">
              <path d="M11.469,10l7.08-7.08c0.406-0.406,0.406-1.064,0-1.469c-0.406-0.406-1.063-0.406-1.469,0L10,8.53l-7.081-7.08c-0.406-0.406-1.064-0.406-1.469,0c-0.406,0.406-0.406,1.063,0,1.469L8.531,10L1.45,17.081c-0.406,0.406-0.406,1.064,0,1.469c0.203,0.203,0.469,0.304,0.735,0.304c0.266,0,0.531-0.101,0.735-0.304L10,11.469l7.08,7.081c0.203,0.203,0.469,0.304,0.735,0.304c0.267,0,0.532-0.101,0.735-0.304c0.406-0.406,0.406-1.064,0-1.469L11.469,10z" />
            </svg>
            Error sending message. Please try again.
          </div>
        )}
      </form>
    </section>
  );
}
