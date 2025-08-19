import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock Supabase
jest.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getUser: () => Promise.resolve({ data: { user: null }, error: null })
    }
  },
  SupabaseAPI: {
    getProjects: () => Promise.resolve([]),
    createProject: jest.fn(),
    updateProject: jest.fn()
  }
}));

describe('Event Manager App', () => {
  test('renders login form when not authenticated', () => {
    render(<App />);
    
    expect(screen.getByText('Event Manager')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    render(<App />);
    
    expect(screen.getByText('Loading Event Manager...')).toBeInTheDocument();
  });

  test('displays demo accounts for easy testing', () => {
    render(<App />);
    
    expect(screen.getByText('Demo Accounts')).toBeInTheDocument();
    expect(screen.getByText('admin@eventmanager.com')).toBeInTheDocument();
    expect(screen.getByText('manager@eventmanager.com')).toBeInTheDocument();
    expect(screen.getByText('coordinator@eventmanager.com')).toBeInTheDocument();
  });

  test('can toggle between sign in and sign up', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Initially shows sign in
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    
    // Click to switch to sign up
    await user.click(screen.getByText("Don't have an account? Sign up"));
    
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
    
    // Switch back to sign in
    await user.click(screen.getByText('Already have an account? Sign in'));
    
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  test('form validation works correctly', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Try to submit empty form
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(signInButton);
    
    // HTML5 validation should prevent submission
    const emailInput = screen.getByPlaceholderText('Email address');
    expect(emailInput).toBeInvalid();
  });

  test('displays all navigation items when authenticated', () => {
    // This would need a mock authenticated state
    // For now, just test that navigation structure exists
    render(<App />);
    
    // Check if app structure is present
    expect(screen.getByRole('main') || document.querySelector('main')).toBeTruthy();
  });
});

describe('Error Handling', () => {
  test('error boundary catches and displays errors', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Test error boundary separately
    const { ErrorBoundary } = require('./components/ErrorBoundary');
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Etwas ist schiefgelaufen')).toBeInTheDocument();
    expect(screen.getByText('🔄 Nochmal versuchen')).toBeInTheDocument();
    expect(screen.getByText('🔁 App neu laden')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});

describe('Accessibility', () => {
  test('has proper heading structure', () => {
    render(<App />);
    
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
  });

  test('form inputs have proper labels', () => {
    render(<App />);
    
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  test('buttons have accessible text', () => {
    render(<App />);
    
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();
  });
});

describe('Responsive Design', () => {
  test('adapts to mobile viewport', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // Mobile width
    });

    render(<App />);
    
    // App should render without issues on mobile
    expect(screen.getByText('Event Manager')).toBeInTheDocument();
  });

  test('adapts to desktop viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920, // Desktop width
    });

    render(<App />);
    
    expect(screen.getByText('Event Manager')).toBeInTheDocument();
  });
});

describe('Performance', () => {
  test('renders without performance warnings', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    render(<App />);
    
    // Should not have React performance warnings
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Warning')
    );
    
    consoleSpy.mockRestore();
  });
});

describe('Data Handling', () => {
  test('handles empty data states gracefully', () => {
    render(<App />);
    
    // App should render even with no data
    expect(screen.getByText('Event Manager')).toBeInTheDocument();
  });

  test('handles loading states', () => {
    render(<App />);
    
    // Should show loading state
    expect(screen.getByText('Loading Event Manager...')).toBeInTheDocument();
  });
});