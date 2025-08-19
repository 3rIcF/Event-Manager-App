import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { ServicesManagement } from '../ServicesManagement';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null })
    }
  },
  SupabaseAPI: {}
}));

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'manager'
  };

  return (
    <div data-testid="auth-provider">
      {children}
    </div>
  );
};

describe('ServicesManagement', () => {
  const renderWithAuth = (component: React.ReactElement) => {
    return render(
      <MockAuthProvider>
        {component}
      </MockAuthProvider>
    );
  };

  test('renders services management component', () => {
    renderWithAuth(<ServicesManagement />);
    
    expect(screen.getByText('Dienstleister-Management')).toBeInTheDocument();
    expect(screen.getByText('Services, Timeline, Briefings und Vertragsmanagement')).toBeInTheDocument();
  });

  test('displays service filters', () => {
    renderWithAuth(<ServicesManagement />);
    
    expect(screen.getByLabelText(/Kategorie:/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status:/)).toBeInTheDocument();
  });

  test('shows mock services data', () => {
    renderWithAuth(<ServicesManagement />);
    
    expect(screen.getByText('Catering für VIP-Bereich')).toBeInTheDocument();
    expect(screen.getByText('Bühnentechnik & Sound')).toBeInTheDocument();
    expect(screen.getByText('Sicherheitsdienst')).toBeInTheDocument();
  });

  test('can switch between view modes', async () => {
    renderWithAuth(<ServicesManagement />);
    
    // Switch to timeline view
    fireEvent.click(screen.getByText('Timeline'));
    expect(screen.getByText('Service Timeline')).toBeInTheDocument();
    
    // Switch to contracts view
    fireEvent.click(screen.getByText('Verträge'));
    expect(screen.getByText('Vertragsmanagement')).toBeInTheDocument();
    
    // Switch back to overview
    fireEvent.click(screen.getByText('Übersicht'));
    expect(screen.getByLabelText(/Kategorie:/)).toBeInTheDocument();
  });

  test('can generate briefing for service', async () => {
    // Mock window.alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    renderWithAuth(<ServicesManagement />);
    
    // Find and click briefing button (📝 button for services without briefing)
    const briefingButtons = screen.getAllByText('📝');
    if (briefingButtons.length > 0) {
      fireEvent.click(briefingButtons[0]);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          expect.stringContaining('Briefing für')
        );
      });
    }
    
    alertSpy.mockRestore();
  });

  test('filters services by category', async () => {
    renderWithAuth(<ServicesManagement />);
    
    // Change category filter to catering
    const categorySelect = screen.getByLabelText(/Kategorie:/) as HTMLSelectElement;
    fireEvent.change(categorySelect, { target: { value: 'catering' } });
    
    await waitFor(() => {
      expect(screen.getByText('Catering für VIP-Bereich')).toBeInTheDocument();
      // Technical services should not be visible
      expect(screen.queryByText('Bühnentechnik & Sound')).not.toBeInTheDocument();
    });
  });

  test('filters services by status', async () => {
    renderWithAuth(<ServicesManagement />);
    
    // Change status filter to confirmed
    const statusSelect = screen.getByLabelText(/Status:/) as HTMLSelectElement;
    fireEvent.change(statusSelect, { target: { value: 'confirmed' } });
    
    await waitFor(() => {
      expect(screen.getByText('Sicherheitsdienst')).toBeInTheDocument();
      // Other status services should not be visible
      expect(screen.queryByText('Bühnentechnik & Sound')).not.toBeInTheDocument();
    });
  });

  test('displays service details when clicking details button', async () => {
    renderWithAuth(<ServicesManagement />);
    
    // Click details button for first service
    const detailsButtons = screen.getAllByText('Details');
    if (detailsButtons.length > 0) {
      fireEvent.click(detailsButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('← Zurück')).toBeInTheDocument();
        expect(screen.getByText('Anbieter-Informationen')).toBeInTheDocument();
        expect(screen.getByText('Timeline')).toBeInTheDocument();
        expect(screen.getByText('Status-Management')).toBeInTheDocument();
      });
    }
  });
});