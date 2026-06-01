import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import LoremIpsumUI from './_ui';

export const metadata = generateToolMetadata('lorem-ipsum');

export default function Page() {
  return (
    <ToolLayout slug="lorem-ipsum">
      <LoremIpsumUI />
    </ToolLayout>
  );
}
