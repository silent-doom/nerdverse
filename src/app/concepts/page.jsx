import Link from 'next/link';
import { getAllPublishedConcepts } from '@/data/concepts';
import { CATEGORIES, getCategoryById } from '@/lib/constants/categories';
import Card from '@/components/ui/Card/Card';
import Badge from '@/components/ui/Badge/Badge';
import Icon from '@/components/common/Icon';
import styles from './ConceptsCatalog.module.css';

export const metadata = {
  title: 'All Concepts & Interactive Labs — NerdVerse',
  description: 'Explore our comprehensive index of scientific theories, philosophical paradoxes, mathematical proofs, and psychological laws.',
};

export default async function ConceptsPage({ searchParams }) {
  const params = await searchParams;
  const activeCategory = params?.category;
  const activeDifficulty = params?.difficulty;

  let allConcepts = getAllPublishedConcepts();

  if (activeCategory) {
    allConcepts = allConcepts.filter((c) => c.category === activeCategory);
  }

  if (activeDifficulty) {
    allConcepts = allConcepts.filter((c) => c.difficulty === activeDifficulty);
  }

  return (
    <div className={styles.container}>
      {/* Header Banner */}
      <header className={styles.header}>
        <div className={styles.badge}>
          <Icon name="layers" size={14} color="var(--color-brand-primary)" />
          <span>Scientific & Philosophical Index</span>
        </div>
        <h1 className={styles.title}>All Explorable Concepts</h1>
        <p className={styles.subtitle}>
          Interactive mental models, thought experiments, and mathematical paradoxes decoded with precision.
        </p>
      </header>

      {/* Filter Toolbar */}
      <div className={styles.filtersBar}>
        <div className={styles.categoryFilters}>
          <Link
            href="/concepts"
            className={`${styles.filterChip} ${!activeCategory ? styles.filterChipActive : ''}`}
          >
            All Disciplines ({getAllPublishedConcepts().length})
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/concepts?category=${cat.id}${activeDifficulty ? `&difficulty=${activeDifficulty}` : ''}`}
              className={`${styles.filterChip} ${activeCategory === cat.id ? styles.filterChipActive : ''}`}
            >
              <Icon name={cat.iconName} size={14} />
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Concepts Grid */}
      <div className={styles.grid}>
        {allConcepts.map((concept) => {
          const category = getCategoryById(concept.category);
          return (
            <Link key={concept.id} href={`/concepts/${concept.slug}`} className={styles.cardLink}>
              <Card variant="interactive" padding="lg" className={styles.card}>
                <div className={styles.cardHeader}>
                  {category && (
                    <Badge variant="category" style={{ '--badge-color': category.color }}>
                      <Icon name={category.iconName} size={12} />
                      <span>{category.name}</span>
                    </Badge>
                  )}
                  <Badge variant="difficulty" size="sm">
                    {concept.difficulty}
                  </Badge>
                </div>

                <h2 className={styles.conceptTitle}>{concept.title}</h2>
                <p className={styles.conceptSummary}>{concept.summary}</p>

                <div className={styles.cardFooter}>
                  <div className={styles.features}>
                    {concept.interactiveType && (
                      <span className={styles.interactivePill}>
                        <Icon name="zap" size={11} color="var(--color-category-math)" />
                        <span>Interactive Lab</span>
                      </span>
                    )}
                  </div>
                  <div className={styles.readTime}>
                    <Icon name="clock" size={12} />
                    <span>{concept.readTime} min read</span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
