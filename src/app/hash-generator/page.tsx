import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import HashGeneratorUI from './_ui';

export const metadata = generateToolMetadata('hash-generator');

export default function Page() {
  return (
    <ToolLayout slug="hash-generator">
      <HashGeneratorUI />
    </ToolLayout>
  );
}
