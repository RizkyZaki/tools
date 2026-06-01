import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import QrGeneratorUI from './_ui';

export const metadata = generateToolMetadata('qr-generator');

export default function Page() {
  return (
    <ToolLayout slug="qr-generator">
      <QrGeneratorUI />
    </ToolLayout>
  );
}
