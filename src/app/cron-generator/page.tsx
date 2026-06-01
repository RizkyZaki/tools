import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import CronGeneratorUI from './_ui';

export const metadata = generateToolMetadata('cron-generator');

export default function Page() {
  return (
    <ToolLayout slug="cron-generator">
      <CronGeneratorUI />
    </ToolLayout>
  );
}
