import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import RupiahFormatterUI from './_ui';

export const metadata = generateToolMetadata('rupiah-formatter');

export default function Page() {
  return (
    <ToolLayout slug="rupiah-formatter">
      <RupiahFormatterUI />
    </ToolLayout>
  );
}
