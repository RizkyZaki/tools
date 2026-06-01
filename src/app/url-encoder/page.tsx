import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import UrlEncoderUI from './_ui';

export const metadata = generateToolMetadata('url-encoder');

export default function Page() {
  return (
    <ToolLayout slug="url-encoder">
      <UrlEncoderUI />
    </ToolLayout>
  );
}
