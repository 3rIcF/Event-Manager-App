import { cn } from '../../components/ui/utils';

describe('cn', () => {
  it('merges class names and tailwind utilities', () => {
    expect(cn('p-2', 'p-4', { hidden: false, block: true })).toContain('p-4');
    expect(cn('text-sm', { block: true })).toContain('block');
  });
});
