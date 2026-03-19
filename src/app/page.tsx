import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import SearchAgent from '../components/SearchAgent';
import HowItWorksVideo from '../components/HowItWorksVideo';
import Features from '../components/Features';
import Footer from '../components/Footer';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.mainContainer}>
      <Navbar />
      <main style={{ position: 'relative' }}>
        <Hero />
        <SearchAgent />
        <HowItWorksVideo />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
