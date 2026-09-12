import Link from 'next/link';
import styles from './page.module.css';
import { CATEGORIES } from '@/lib/constants/categories';
import { getFeaturedConcepts } from '@/data/concepts';
import Card from '@/components/ui/Card/Card';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/common/Icon';
import SpacetimeHeroCanvas from '@/components/3d/SpacetimeHeroCanvas';

export default function HomePage() {
  const featured = getFeaturedConcepts();

  return (
    <>
      {/* 3D Spacetime Hero Section */}
      <section className={styles.hero}>
        <SpacetimeHeroCanvas />
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>
            <Icon name="atom" size={14} color="var(--color-brand-primary)" />
            <span>3D WebGL Scientific Knowledge Engine</span>
          </div>

          <h1 className={styles.heroTitle}>
            Explore the Universe,{' '}
            <span className={styles.heroAccent}>One Concept at a Time</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Rigorous, interactive 3D visual models of paradoxes, quantum mechanics, spacetime theories, and cognitive psychology.
          </p>

          <div className={styles.heroCtas}>
            <Link href="/concepts">
              <Button size="lg" variant="primary">
                <span>Start Exploring</span>
                <Icon name="arrow-right" size={16} />
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="secondary" size="lg">
                <Icon name="network" size={16} />
                <span>3D Knowledge Constellation</span>
              </Button>
            </Link>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>5+</span>
              <span className={styles.statLabel}>3D Interactive Labs</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>7</span>
              <span className={styles.statLabel}>Disciplines</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>WebGL</span>
              <span className={styles.statLabel}>Physics Accelerated</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Concepts */}
      <section className={styles.featured}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionHeading}>Featured 3D Interactive Labs</h2>
            <p className={styles.sectionSubtitle}>
              Directly manipulate the variables of famous mathematical proofs and physics thought experiments.
            </p>
          </div>

          <div className={styles.conceptGrid}>
            {featured.map((concept) => {
              const category = CATEGORIES.find((c) => c.id === concept.category);
              return (
                <Link
                  key={concept.slug}
                  href={`/concepts/${concept.slug}`}
                  className={styles.conceptCardLink}
                >
                  <Card variant="interactive" padding="md" className={styles.conceptCard}>
                    <div className={styles.conceptCardInner}>
                      <div className={styles.conceptCardHeader}>
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

                      <h3 className={styles.conceptCardTitle}>{concept.title}</h3>
                      <p className={styles.conceptCardSummary}>{concept.summary}</p>

                      <div className={styles.conceptCardFooter}>
                        <div className={styles.readTime}>
                          <Icon name="clock" size={13} />
                          <span>{concept.readTime} min read</span>
                        </div>
                        <div className={styles.exploreAction}>
                          <span>Open 3D Lab</span>
                          <Icon name="arrow-right" size={14} />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.categories}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionHeading}>Browse by Scientific Discipline</h2>
            <p className={styles.sectionSubtitle}>
              Structured academic taxonomies spanning theoretical physics to algorithmic computation.
            </p>
          </div>

          <div className={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/concepts?category=${cat.slug}`}
                className={styles.categoryCardLink}
              >
                <Card variant="interactive" padding="md" className={styles.catCard}>
                  <div className={styles.categoryCardInner}>
                    <div
                      className={styles.categoryIconBadge}
                      style={{ backgroundColor: `${cat.color}20`, borderColor: cat.color, color: cat.color }}
                    >
                      <Icon name={cat.iconName} size={20} color={cat.color} />
                    </div>
                    <h3 className={styles.categoryName}>{cat.name}</h3>
                    <p className={styles.categoryDesc}>{cat.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className={styles.howItWorks}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionHeading}>The NerdVerse Methodology</h2>
            <p className={styles.sectionSubtitle}>
              Moving beyond passive reading into dynamic conceptual inquiry.
            </p>
          </div>

          <div className={styles.steps}>
            {[
              {
                num: '01',
                icon: 'search',
                title: 'Discover & Query',
                desc: 'Explore topological connections between paradoxes, formulas, and cognitive laws in our indexed knowledge base.',
              },
              {
                num: '02',
                icon: 'atom',
                title: '3D Simulation & Stress-Test',
                desc: 'Adjust variables in real time. Run 3D rotational mechanics, Bloch sphere quantum collapse, and wormhole geodesics.',
              },
              {
                num: '03',
                icon: 'network',
                title: 'Constellation & Connect',
                desc: 'Trace cross-disciplinary relationships in the 3D knowledge graph with verifiable academic citations.',
              },
            ].map((step) => (
              <div key={step.num} className={styles.step}>
                <div className={styles.stepHeader}>
                  <span className={styles.stepNum}>{step.num}</span>
                  <div className={styles.stepIconBadge}>
                    <Icon name={step.icon} size={16} color="var(--color-brand-primary)" />
                  </div>
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <div className={styles.ctaInner}>
              <h2 className={styles.ctaTitle}>Ready to explore the laws of reality?</h2>
              <p className={styles.ctaSubtitle}>
                Dive into 3D interactive simulations of physics, logic, and philosophy.
              </p>
              <Link href="/concepts">
                <Button size="lg" variant="primary">
                  <span>Enter Concept Library</span>
                  <Icon name="arrow-right" size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
