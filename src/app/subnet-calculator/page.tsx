import { generateToolMetadata } from '@/lib/metadata';
import ToolLayout from '@/components/tools/tool-layout';
import SubnetCalculatorUI from './_ui';

export const metadata = generateToolMetadata('subnet-calculator');

export default function Page() {
  return (
    <ToolLayout slug="subnet-calculator">
      <SubnetCalculatorUI />
    </ToolLayout>
  );
}
