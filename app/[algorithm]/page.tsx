import { notFound } from 'next/navigation';
import { ALGORITHM_BY_SLUG } from '@/data/algorithms';
import { CONTENT } from '@/data/content/index';
import { AlgorithmSlug } from '@/types';
import Header from '@/components/layout/Header';
import TabsContainer from '@/components/tabs/TabsContainer';

interface Props {
  params: { algorithm: string };
}

export default function AlgorithmPage({ params }: Props) {
  const slug = params.algorithm as AlgorithmSlug;
  const meta = ALGORITHM_BY_SLUG[slug];
  const content = CONTENT[slug];

  if (!meta || !content) notFound();

  return (
    <>
      <Header alg={meta} />
      <TabsContainer content={content} meta={meta} />
    </>
  );
}

export function generateStaticParams() {
  return Object.keys(CONTENT).map((slug) => ({ algorithm: slug }));
}
