import styles from './Features.module.css';

const features = [
  {
    title: 'Smart Resume Parsing',
    description: 'Our AI extracts your skills, experience, and domain expertise with pinpoint accuracy.',
    icon: '📄'
  },
  {
    title: 'Automated Job Matching',
    description: 'We continuously scan thousands of job boards to find roles that perfectly align with your profile.',
    icon: '🎯'
  },
  {
    title: 'Pre-Drafted Emails',
    description: 'The system automatically writes a professional, tailored email for each application.',
    icon: '✉️'
  },
  {
    title: 'One-Click Apply',
    description: 'Review the match and hit send. No filling out lengthy forms or repetitive data entry.',
    icon: '⚡'
  }
];

export default function Features() {
  return (
    <section id="features" className={styles.featuresSection}>
      <div className={styles.header}>
        <h2>Why use our platform?</h2>
        <p>We eliminate the tedious parts of the job search so you can focus on interviews.</p>
      </div>
      <div className={styles.grid}>
        {features.map((feature, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.icon}>{feature.icon}</div>
            <h3 className={styles.cardTitle}>{feature.title}</h3>
            <p className={styles.cardDesc}>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
