import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import CaseConverterUI from './_ui';

export const metadata = generateToolMetadata('case-converter');

export default function Page() {
  return (
    <ToolLayout slug="case-converter">
      <CaseConverterUI />
    </ToolLayout>
  );
}
