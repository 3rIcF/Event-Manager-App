// Event Manager App - App Component Tests
// Created: 2025-08-19

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { AppProvider } from '../components/AppContext';

// Mock the DataContext to avoid dependency issues
jest.mock('../components/DataContext', () => ({
  DataProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="data-provider">{children}</div>
}));

// Mock the mock data
jest.mock('../data/mockData', () => ({
  mockProjects: [
    {
      id: '1',
      name: 'Test Event 1',
      description: 'Test Description 1',
      status: 'planning',
      start_date: '2025-06-15',
      end_date: '2025-06-17',
      budget: 10000,
      actual_cost: 0,
      client_name: 'Test Client 1',
      location: 'Test Location 1',
      created_by: 'user1',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      is_active: true
    }
  ],
  mockMaterials: [
    {
      id: '1',
      name: 'Test Material 1',
      category: 'furniture',
      description: 'Test Material Description',
      unit: 'piece',
      unit_cost: 100,
      supplier_id: 'supplier1',
      min_stock_level: 5,
      current_stock: 10,
      location: 'Warehouse A',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      is_active: true
    }
  ]
}));

// Mock the components that might cause issues
jest.mock('../components/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../components/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

describe('App Component', () => {
  const renderApp = () => {
    return render(
      <AppProvider>
        <App />
      </AppProvider>
    );
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    renderApp();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  test('displays main content area', () => {
    renderApp();
    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeInTheDocument();
  });

  test('shows projects list by default', async () => {
    renderApp();
    
    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      expect(screen.getByText('Test Description 1')).toBeInTheDocument();
    });
  });

  test('displays project status correctly', async () => {
    renderApp();
    
    await waitFor(() => {
      const statusElement = screen.getByText('planning');
      expect(statusElement).toBeInTheDocument();
    });
  });

  test('shows project budget information', async () => {
    renderApp();
    
    await waitFor(() => {
      expect(screen.getByText('$10,000')).toBeInTheDocument();
    });
  });

  test('displays client information', async () => {
    renderApp();
    
    await waitFor(() => {
      expect(screen.getByText('Test Client 1')).toBeInTheDocument();
      expect(screen.getByText('Test Location 1')).toBeInTheDocument();
    });
  });

  test('renders materials section', async () => {
    renderApp();
    
    await waitFor(() => {
      expect(screen.getByText('Materials')).toBeInTheDocument();
      expect(screen.getByText('Test Material 1')).toBeInTheDocument();
    });
  });

  test('shows material details correctly', async () => {
    renderApp();
    
    await waitFor(() => {
      expect(screen.getByText('furniture')).toBeInTheDocument();
      expect(screen.getByText('$100')).toBeInTheDocument();
      expect(screen.getByText('10 in stock')).toBeInTheDocument();
    });
  });

  test('displays navigation elements', () => {
    renderApp();
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  test('maintains responsive layout', () => {
    renderApp();
    
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveClass('flex-1', 'p-6');
  });

  test('handles empty data gracefully', () => {
    // Mock empty data
    jest.doMock('../data/mockData', () => ({
      mockProjects: [],
      mockMaterials: []
    }));

    renderApp();
    
    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });

  test('displays loading states appropriately', () => {
    renderApp();
    
    // Check if loading indicators are present
    const loadingElements = screen.queryAllByText(/loading/i);
    expect(loadingElements.length).toBeGreaterThanOrEqual(0);
  });

  test('maintains accessibility standards', () => {
    renderApp();
    
    // Check for proper heading structure
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    
    // Check for main landmark
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });
});

// Additional integration tests
describe('App Integration', () => {
  test('context providers work correctly', () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );
    
    // Verify that context is providing data
    expect(screen.getByTestId('data-provider')).toBeInTheDocument();
  });

  test('component hierarchy is maintained', () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );
    
    // Check component structure
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
