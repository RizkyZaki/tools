import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import SslCheckerUI from './_ui';

export const metadata = generateToolMetadata('ssl-checker');

export default function Page() {
  return (
    <ToolLayout slug="ssl-checker">
      <SslCheckerUI />
    </ToolLayout>
  );
}
