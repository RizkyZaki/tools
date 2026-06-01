import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import DuplicateLineRemoverUI from './_ui';

export const metadata = generateToolMetadata('duplicate-line-remover');

export default function Page() {
  return (
    <ToolLayout slug="duplicate-line-remover">
      <DuplicateLineRemoverUI />
    </ToolLayout>
  );
}
