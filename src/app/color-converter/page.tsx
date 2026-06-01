import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import ColorConverterUI from './_ui';

export const metadata = generateToolMetadata('color-converter');

export default function Page() {
  return (
    <ToolLayout slug="color-converter">
      <ColorConverterUI />
    </ToolLayout>
  );
}
