import styles from "./page.module.css";
import Header from "../components/Header/header";
import IntroFrontPages from "../components/IntroFrontPages/intro";
import AboutItem from "../components/AboutItem/aboutitem";
import AboutLogo from "../../public/About.svg";
import PrinciplesLogo from "../../public/PrinciplesLogo.svg";

export default function About() {
  return (
    <div className={styles.aboutContainer}>
      <main className={styles.main}>
        <IntroFrontPages
          title="About"
          subtitle="What are our goals and our values"
        />

        <AboutItem
          image={AboutLogo}
          alt="Team working logo"
          title="Our Goals"
          description={
            <div>
              <p>
                At MultiDesk, our mission is to empower individuals and teams to
                work together seamlessly. We offer a platform that allows users
                to edit documents in real-time and communicate effortlessly
                through built-in chat features.
              </p>
              <p>
                Our focus is on simplicity and ease of use, so everyone can
                collaborate efficiently, no matter their technical skill level.
                Whether you're working on a project with colleagues or
                brainstorming ideas with a group, MultiDesk makes teamwork
                easier, faster, and more productive.
              </p>
            </div>
          }
        />

        <AboutItem
          image={PrinciplesLogo}
          alt="Core values logo"
          title="Principles and Values"
          description={
            <div>
              <p>
                At MultiDesk, our core values drive everything we do. We believe
                in creating a platform that empowers users through:
              </p>
              <ul className={styles.valuesList}>
                <li>
                  <strong className={styles.strongWord}>Simplicity:</strong> We
                  are committed to providing a straightforward and intuitive
                  experience. MultiDesk is designed to be easy to use for
                  everyone, allowing teams to focus on their work without
                  unnecessary technical barriers.
                </li>
                <li>
                  <strong className={styles.strongWord}>Collaboration:</strong>{" "}
                  Teamwork is at the heart of what we offer. Our platform
                  enables seamless real-time document editing and communication,
                  so users can co-create and collaborate with efficiency and
                  ease, no matter where they are.
                </li>
                <li>
                  <strong className={styles.strongWord}>Innovation:</strong> We
                  are dedicated to continuous improvement. MultiDesk evolves
                  with the needs of our users, ensuring we provide the best
                  possible tools for productivity and teamwork in an
                  ever-changing digital landscape.
                </li>
              </ul>
              <p>
                These principles guide our mission to create a collaborative
                space where simplicity and efficiency enable people to work
                together without limits.
              </p>
            </div>
          }
        />
      </main>
    </div>
  );
}
