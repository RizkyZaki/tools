import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import TimestampConverterUI from './_ui';

export const metadata = generateToolMetadata('timestamp-converter');

export default function Page() {
  return (
    <ToolLayout slug="timestamp-converter">
      <TimestampConverterUI />
    </ToolLayout>
  );
}
