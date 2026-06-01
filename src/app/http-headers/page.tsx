import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import HttpHeadersUI from './_ui';

export const metadata = generateToolMetadata('http-headers');

export default function Page() {
  return (
    <ToolLayout slug="http-headers">
      <HttpHeadersUI />
    </ToolLayout>
  );
}
