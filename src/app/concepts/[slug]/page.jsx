import { notFound } from 'next/navigation';
import { getConceptBySlug, getAllPublishedConcepts, getRelatedConcepts } from '@/data/concepts';
import { getCategoryById } from '@/lib/constants/categories';
import ConceptDetailClient from './ConceptDetailClient';

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
    <ConceptDetailClient
      concept={concept}
      category={category}
      relatedConcepts={relatedConcepts}
    />
  );
}
