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

  const allPublished = getAllPublishedConcepts();

  // Compute concept counts per category dynamically
  const categoryCounts = allPublished.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});

  let allConcepts = allPublished;

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
        <Link href="/explore" className={styles.exploreGraphBannerBtn}>
          <Icon name="network" size={15} color="#38bdf8" />
          <span>Switch to 3D Knowledge Graph ({allPublished.length} Nodes) →</span>
        </Link>
      </header>

      {/* Filter Toolbar */}
      <div id="disciplines" className={styles.filtersBar}>
        <div className={styles.filterBarHeader}>
          <div className={styles.filterBarTitleBox}>
            <span className={styles.filterBarLabel}>Scientific Disciplines</span>
            <span className={styles.filterBarCounter}>
              Showing <strong>{allConcepts.length}</strong> of {allPublished.length} concepts
            </span>
          </div>
          {activeCategory && (
            <Link
              href={`/concepts${activeDifficulty ? `?difficulty=${activeDifficulty}` : ''}`}
              className={styles.clearFilterBtn}
            >
              <Icon name="x" size={12} />
              <span>Reset Filter</span>
            </Link>
          )}
        </div>

        <div className={styles.categoryFilters}>
          <Link
            href={`/concepts${activeDifficulty ? `?difficulty=${activeDifficulty}` : ''}`}
            className={`${styles.filterChip} ${!activeCategory ? styles.filterChipActive : ''}`}
          >
            <div className={styles.chipContent}>
              <span className={styles.chipIcon}>
                <Icon name="layers" size={14} />
              </span>
              <span>All Disciplines</span>
            </div>
            <span className={styles.chipCount}>{allPublished.length}</span>
          </Link>
          {CATEGORIES.filter((cat) => (categoryCounts[cat.id] || 0) > 0).map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isActive = activeCategory === cat.id;

            return (
              <Link
                key={cat.id}
                href={`/concepts?category=${cat.id}${activeDifficulty ? `&difficulty=${activeDifficulty}` : ''}`}
                className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ''}`}
              >
                <div className={styles.chipContent}>
                  <span className={styles.chipIcon}>
                    <Icon name={cat.iconName} size={14} />
                  </span>
                  <span>{cat.name}</span>
                </div>
                <span className={styles.chipCount}>{count}</span>
              </Link>
            );
          })}
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
