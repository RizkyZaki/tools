import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import RegexTesterUI from './_ui';

export const metadata = generateToolMetadata('regex-tester');

export default function Page() {
  return (
    <ToolLayout slug="regex-tester">
      <RegexTesterUI />
    </ToolLayout>
  );
}
