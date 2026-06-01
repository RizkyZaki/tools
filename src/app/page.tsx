import type { Metadata } from 'next';
import ToolsHome from '@/components/tools/home-page';

export const metadata: Metadata = {
  title: 'Developer Tools',
  description:
    'A focused collection of developer tools — free, fast, no sign-up required.',
};

type SearchParams = {
  category?: string | string[];
};

const ALL_CATEGORIES = 'all';

export default function Home({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const categoryParam = searchParams?.category;
  const initialCategory = Array.isArray(categoryParam)
    ? categoryParam[0]
    : categoryParam ?? ALL_CATEGORIES;

  return <ToolsHome initialCategory={initialCategory} />;
}
