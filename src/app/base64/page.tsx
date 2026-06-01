import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import Base64UI from './_ui';

export const metadata = generateToolMetadata('base64');

export default function Page() {
  return (
    <ToolLayout slug="base64">
      <Base64UI />
    </ToolLayout>
  );
}
