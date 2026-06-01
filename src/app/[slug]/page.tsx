import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/tool-layout';
import { tools } from '@/lib/tools';
import { generateToolMetadata } from '@/lib/metadata';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  return generateToolMetadata(slug);
}

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export default async function ToolPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) notFound();

  return (
    <ToolLayout slug={slug}>
      <div className="flex flex-col items-center justify-center rounded-xl border border-white/8 bg-white/[0.02] py-24 text-center">
        <div className="mb-3 text-3xl opacity-20">🔧</div>
        <p className="text-sm text-white/40">This tool is coming soon.</p>
      </div>
    </ToolLayout>
  );
}
