import Link from 'next/link';
import styles from './page.module.css';
import { CATEGORIES } from '@/lib/constants/categories';
import { getFeaturedConcepts } from '@/data/concepts';
import Card from '@/components/ui/Card/Card';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/common/Icon';

export default function HomePage() {
  const featured = getFeaturedConcepts();

  return (
    <>
      {/* Neo-Brutalist Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>
            <Icon name="atom" size={16} />
            <span>Interactive Learning Engine</span>
          </div>

          <h1 className={styles.heroTitle}>
            Learn Complex Ideas <br />
            <span className={styles.heroAccent}>By Playing With Them</span>
          </h1>

          <p className={styles.heroSubtitle}>
            No jargon. No confusing math. Just literal, interactive thought experiments you can poke, prod, and break to understand how reality works.
          </p>

          <div className={styles.heroCtas}>
            <Link href="/concepts">
              <Button size="lg" variant="primary">
                <span>View Concept Catalog</span>
                <Icon name="arrow-right" size={16} />
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="secondary" size="lg">
                <Icon name="network" size={16} />
                <span>Knowledge Map</span>
              </Button>
            </Link>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>5+</span>
              <span className={styles.statLabel}>Playgrounds</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>Metaphor-Based</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNumber}>0%</span>
              <span className={styles.statLabel}>Boring Lectures</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Concepts */}
      <section className={styles.featured}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionHeading}>Featured Interactive Labs</h2>
            <p className={styles.sectionSubtitle}>
              Stop reading about theories and start testing them. Open a lab and see what happens.
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
                          <Icon name="clock" size={14} />
                          <span>{concept.readTime} min activity</span>
                        </div>
                        <div className={styles.exploreAction}>
                          <span>Open Lab</span>
                          <Icon name="arrow-right" size={16} />
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
            <h2 className={styles.sectionHeading}>Browse by Discipline</h2>
            <p className={styles.sectionSubtitle}>
              Find exactly what you want to learn, from philosophy to physics.
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
                    <div className={styles.categoryIconBadge}>
                      <Icon name={cat.iconName} size={22} color="var(--color-brand-primary)" />
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
            <h2 className={styles.sectionHeading}>How We Teach</h2>
            <p className={styles.sectionSubtitle}>
              We believe metaphors &gt; math equations.
            </p>
          </div>

          <div className={styles.steps}>
            {[
              {
                num: '01',
                icon: 'search',
                title: 'Literal Metaphors',
                desc: 'If an experiment involves a cat in a box, we give you a cat in a box. Not a glowing blue sphere representing a particle.',
              },
              {
                num: '02',
                icon: 'atom',
                title: 'Play to Learn',
                desc: 'Tweak variables and watch the simulation react in real-time. Make mistakes, cause paradoxes, and see why they break.',
              },
              {
                num: '03',
                icon: 'network',
                title: 'Connect the Dots',
                desc: 'See how everything relates. Jump from a psychology concept to a physics rule using our structural knowledge graph.',
              },
            ].map((step) => (
              <div key={step.num} className={styles.step}>
                <div className={styles.stepHeader}>
                  <span className={styles.stepNum}>{step.num}</span>
                  <div className={styles.stepIconBadge}>
                    <Icon name={step.icon} size={20} color="#1A1A1A" />
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
              <h2 className={styles.ctaTitle}>Ready to Break Reality?</h2>
              <p className={styles.ctaSubtitle}>
                Start poking around our interactive playgrounds.
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
