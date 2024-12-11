"use client";

import styles from "./contactform.module.css";
import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

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
        body: JSON.stringify(formData), // Enviar el JSON con los datos del formulario
      });

      if (!response.ok) {
        const errorData = await response.json(); // Intenta parsear JSON solo si hay error
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      if (response.status === 201) {
        console.log("Correo enviado correctamente");
      } else {
        const result = await response.json();
        console.log(result);
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  };
  return (
    <section className={styles.contactSection}>
      <h2>Dont hesitate in contact us</h2>
      <form className={styles.contactForm} onSubmit={onSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
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
            required
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            required
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>
        <button type="submit" className={styles.submitBtn}>
          Send Message
        </button>
      </form>
    </section>
  );
}

{
  /*
    <form onSubmit={onSubmit} classNameName={styles.contactformContainer}>
      <input onChange={(e) => setName(e.target.value)} type="text" />
      Name
      <input onChange={(e) => setEmail(e.target.value)} type="email" />
      Email
      <textarea onChange={(e) => setMessage(e.target.value)}></textarea>
      <button type="submit">Submit</button>
    </form>
  );
  */
}
