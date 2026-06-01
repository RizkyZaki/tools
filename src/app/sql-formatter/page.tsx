import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import SqlFormatterUI from './_ui';

export const metadata = generateToolMetadata('sql-formatter');

export default function Page() {
  return (
    <ToolLayout slug="sql-formatter">
      <SqlFormatterUI />
    </ToolLayout>
  );
}
