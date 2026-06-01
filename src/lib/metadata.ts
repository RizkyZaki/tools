import type { Metadata } from 'next';
import { tools } from './tools';

export function generateToolMetadata(slug: string): Metadata {
  const tool = tools.find((t) => t.slug === slug);

  if (!tool) {
    return { title: 'Tool Not Found | Zach Tools' };
  }

  const title = `${tool.name} | Zach Tools`;
  const description = tool.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Zach Tools',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}
