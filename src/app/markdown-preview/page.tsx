import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import MarkdownPreviewUI from './_ui';

export const metadata = generateToolMetadata('markdown-preview');

export default function Page() {
  return (
    <ToolLayout slug="markdown-preview">
      <MarkdownPreviewUI />
    </ToolLayout>
  );
}
