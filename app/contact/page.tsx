import styles from "./page.module.css";
import Header from "../components/Header/header";
import IntroFrontPages from "../components/IntroFrontPages/intro";
import ContactForm from "../components/ContactForm/contactform";

export default function Contact() {
  return (
    <div className={styles.contactContainer}>
      <Header />
      <IntroFrontPages title="Contact" subtitle="How you can contact us" />
      <ContactForm />
    </div>
  );
}
