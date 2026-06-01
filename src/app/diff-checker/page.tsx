import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import DiffCheckerUI from './_ui';

export const metadata = generateToolMetadata('diff-checker');

export default function Page() {
  return (
    <ToolLayout slug="diff-checker">
      <DiffCheckerUI />
    </ToolLayout>
  );
}
