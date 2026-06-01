import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import JwtDebuggerUI from './_ui';

export const metadata = generateToolMetadata('jwt-debugger');

export default function Page() {
  return (
    <ToolLayout slug="jwt-debugger">
      <JwtDebuggerUI />
    </ToolLayout>
  );
}
