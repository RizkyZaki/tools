import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import WhoisUI from './_ui';

export const metadata = generateToolMetadata('whois');

export default function Page() {
  return (
    <ToolLayout slug="whois">
      <WhoisUI />
    </ToolLayout>
  );
}
