import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import CsvJsonUI from './_ui';

export const metadata = generateToolMetadata('csv-json');

export default function Page() {
  return (
    <ToolLayout slug="csv-json">
      <CsvJsonUI />
    </ToolLayout>
  );
}
