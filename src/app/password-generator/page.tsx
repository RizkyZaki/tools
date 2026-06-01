import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import PasswordGeneratorUI from './_ui';

export const metadata = generateToolMetadata('password-generator');

export default function Page() {
  return (
    <ToolLayout slug="password-generator">
      <PasswordGeneratorUI />
    </ToolLayout>
  );
}
