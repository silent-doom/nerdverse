import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConceptBySlug, getAllPublishedConcepts, getRelatedConcepts } from '@/data/concepts';
import { getCategoryById } from '@/lib/constants/categories';
import ConceptSimulatorResolver from '@/components/interactive/ConceptSimulatorResolver';
import ConceptTelemetryChart from '@/components/analytics/ConceptTelemetryChart';
import Badge from '@/components/ui/Badge/Badge';
import Card from '@/components/ui/Card/Card';
import Icon from '@/components/common/Icon';
import styles from './ConceptDetail.module.css';

export async function generateStaticParams() {
  const all = getAllPublishedConcepts();
  return all.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const concept = getConceptBySlug(slug);
  if (!concept) return { title: 'Concept Not Found' };
  return {
    title: `${concept.title} — NerdVerse`,
    description: concept.summary,
  };
}

export default async function ConceptDetailPage({ params }) {
  const { slug } = await params;
  const concept = getConceptBySlug(slug);

  if (!concept) {
    notFound();
  }

  const category = getCategoryById(concept.category);
  const relatedConcepts = getRelatedConcepts(concept.slug);

  return (
    <article className={styles.detailPage}>
      {/* Top Header / Breadcrumbs */}
      <header className={styles.header}>
        <div className={styles.breadcrumbs}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link href="/concepts" className={styles.breadcrumbLink}>Concepts</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{concept.title}</span>
        </div>

        <div className={styles.metaRow}>
          {category && (
            <Badge variant="category" style={{ '--badge-color': category.color }}>
              <Icon name={category.iconName} size={12} />
              <span>{category.name}</span>
            </Badge>
          )}
          <Badge variant="difficulty" size="sm">
            {concept.difficulty}
          </Badge>
          <div className={styles.readTime}>
            <Icon name="clock" size={13} />
            <span>{concept.readTime} min read</span>
          </div>
        </div>

        <h1 className={styles.title}>{concept.title}</h1>
        <p className={styles.summary}>{concept.summary}</p>
      </header>

      {/* Main Interactive Lab Section */}
      {concept.interactiveType && (
        <section className={styles.labSection}>
          <ConceptSimulatorResolver type={concept.interactiveType} />
        </section>
      )}

      {/* Interactive Statistical Telemetry Graph & Historical Runs */}
      <ConceptTelemetryChart conceptSlug={concept.slug} conceptTitle={concept.title} />

      {/* Main Content Body */}
      <section className={styles.contentSection}>
        <div className={styles.contentCard}>
          <div className={styles.prose}>
            {concept.content.split('\n\n').map((block, idx) => {
              if (block.startsWith('## ')) {
                return <h2 key={idx} className={styles.h2}>{block.replace('## ', '')}</h2>;
              }
              if (block.startsWith('### ')) {
                return <h3 key={idx} className={styles.h3}>{block.replace('### ', '')}</h3>;
              }
              if (block.startsWith('- ')) {
                const items = block.split('\n').map((line) => line.replace('- ', ''));
                return (
                  <ul key={idx} className={styles.list}>
                    {items.map((item, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
                    ))}
                  </ul>
                );
              }
              return (
                <p
                  key={idx}
                  className={styles.paragraph}
                  dangerouslySetInnerHTML={{
                    __html: block
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/`([^`]+)`/g, '<code>$1</code>'),
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Sidebar / Quick Facts & Sources */}
        <aside className={styles.sidebar}>
          {concept.facts && concept.facts.length > 0 && (
            <Card variant="outline" className={styles.sidebarCard}>
              <div className={styles.sidebarHeader}>
                <Icon name="zap" size={16} color="var(--color-category-philosophy)" />
                <h3 className={styles.sidebarTitle}>Key Empirical Facts</h3>
              </div>
              <ul className={styles.factsList}>
                {concept.facts.map((fact, index) => (
                  <li key={index} className={styles.factItem}>
                    <span className={styles.factIndex}>{index + 1}</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {concept.sources && concept.sources.length > 0 && (
            <Card variant="outline" className={styles.sidebarCard}>
              <div className={styles.sidebarHeader}>
                <Icon name="layers" size={16} color="var(--color-brand-primary)" />
                <h3 className={styles.sidebarTitle}>Verified Citations</h3>
              </div>
              <ul className={styles.sourcesList}>
                {concept.sources.map((src, index) => (
                  <li key={index}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.sourceLink}
                    >
                      <span>{src.title}</span>
                      <Icon name="external-link" size={12} />
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </section>

      {/* Related Concepts Section */}
      {relatedConcepts.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>Explore Related Theories</h2>
          <div className={styles.relatedGrid}>
            {relatedConcepts.map((rel) => {
              const relCat = getCategoryById(rel.category);
              return (
                <Link key={rel.id} href={`/concepts/${rel.slug}`} className={styles.relatedCardLink}>
                  <Card variant="interactive" padding="md" className={styles.relatedCard}>
                    <div className={styles.relatedMeta}>
                      {relCat && (
                        <span className={styles.relatedCategory} style={{ color: relCat.color }}>
                          {relCat.name}
                        </span>
                      )}
                      <span className={styles.relatedDifficulty}>{rel.difficulty}</span>
                    </div>
                    <h3 className={styles.relatedCardTitle}>{rel.title}</h3>
                    <p className={styles.relatedSummary}>{rel.summary}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
