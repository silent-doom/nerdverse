import Link from 'next/link';
import styles from './Navigation.module.css';

const NAV_ITEMS = [
  { label: 'Concepts', href: '/concepts' },
  { label: 'Explore', href: '/explore' },
  { label: 'Categories', href: '/concepts?view=categories' },
];

/**
 * Desktop navigation links.
 */
export default function Navigation() {
  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={styles.link}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
