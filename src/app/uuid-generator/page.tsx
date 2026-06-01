import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import UuidGeneratorUI from './_ui';

export const metadata = generateToolMetadata('uuid-generator');

export default function Page() {
  return (
    <ToolLayout slug="uuid-generator">
      <UuidGeneratorUI />
    </ToolLayout>
  );
}
