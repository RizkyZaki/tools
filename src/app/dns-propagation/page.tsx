import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import DnsPropagationUI from './_ui';

export const metadata = generateToolMetadata('dns-propagation');

export default function Page() {
  return (
    <ToolLayout slug="dns-propagation">
      <DnsPropagationUI />
    </ToolLayout>
  );
}
