import { getSession } from '@/lib/sessions';
import Link from 'next/link';
import styles from './page.module.css';

export default async function SessionPage({ params }) {
  const session = await getSession(params.slug);

  if (!session) {
    return (
      <main className={styles.page}>
        <p>Session not found.</p>
        <Link href="/" className={styles.back}>← back</Link>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← back</Link>
        <h1 className={styles.title}>{session.title}</h1>
      </header>

      <div className={styles.grid}>
        {session.photos.map((src, i) => (
          <div key={i} className={styles.item}>
            <img src={src} alt="" draggable={false} />
          </div>
        ))}
      </div>
    </main>
  );
}
