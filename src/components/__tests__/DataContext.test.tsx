import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { DataProvider, useData } from '../DataContext';

function wrapper({ children }: { children: React.ReactNode }) {
  return <DataProvider>{children}</DataProvider>;
}

describe('DataContext', () => {
  it('adds a global material and creates an id', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    let createdId = '';
    act(() => {
      const created = result.current.addGlobalMaterial({
        name: 'Test',
        category: 'TestCat',
        unit: 'Stk',
      });
      createdId = created.id;
    });
    expect(createdId).toMatch(/mat_/);
  });
});
