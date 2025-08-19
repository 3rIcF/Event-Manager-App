import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useApp } from '../AppContext';

describe('AppContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider>{children}</AppProvider>
  );

  test('provides initial state', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    
    expect(result.current.currentProject).toBeNull();
    expect(result.current.projects).toHaveLength(3); // Mock projects
    expect(result.current.globalView).toBe('dashboard');
    expect(result.current.projectView).toBe('dashboard');
  });

  test('can set current project', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    
    act(() => {
      result.current.setCurrentProject(result.current.projects[0]);
    });

    expect(result.current.currentProject).toEqual(result.current.projects[0]);
  });

  test('can add new project', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    
    const newProject = {
      id: '4',
      name: 'Test Event',
      startDate: '2025-12-01',
      endDate: '2025-12-01',
      location: 'Test Location',
      status: 'idea' as const,
      responsible: 'Test User'
    };

    act(() => {
      result.current.addProject(newProject);
    });

    expect(result.current.projects).toHaveLength(4);
    expect(result.current.projects[3]).toEqual(newProject);
  });

  test('can update project', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    
    act(() => {
      result.current.updateProject('1', { name: 'Updated Event Name' });
    });

    const updatedProject = result.current.projects.find(p => p.id === '1');
    expect(updatedProject?.name).toBe('Updated Event Name');
  });

  test('throws error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => {
      renderHook(() => useApp());
    }).toThrow('useApp must be used within AppProvider');
    
    consoleSpy.mockRestore();
  });
});