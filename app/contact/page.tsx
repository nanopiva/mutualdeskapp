import styles from "./page.module.css";
import Header from "../components/Header/header";
import IntroFrontPages from "../components/IntroFrontPages/intro";
import ContactForm from "../components/ContactForm/contactform";

export default function Contact() {
  return (
    <>
      <main className={styles.main}>
        <IntroFrontPages title="Contact" subtitle="How you can reach us" />
        <ContactForm />
      </main>
    </>
  );
}
