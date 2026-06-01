import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import CorsTesterUI from './_ui';

export const metadata = generateToolMetadata('cors-tester');

export default function Page() {
  return (
    <ToolLayout slug="cors-tester">
      <CorsTesterUI />
    </ToolLayout>
  );
}
