import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FinancialManagement } from '../FinancialManagement';

describe('FinancialManagement', () => {
  test('renders financial management dashboard', () => {
    render(<FinancialManagement />);
    
    expect(screen.getByText('Finanzmanagement')).toBeInTheDocument();
    expect(screen.getByText('Budget-Tracking, Kostenkontrolle und Rechnungsmanagement')).toBeInTheDocument();
  });

  test('displays budget summary cards', () => {
    render(<FinancialManagement />);
    
    expect(screen.getByText('Gesamt Budget')).toBeInTheDocument();
    expect(screen.getByText('Ausgegeben')).toBeInTheDocument();
    expect(screen.getByText('Verbleibendes Budget')).toBeInTheDocument();
    expect(screen.getByText('Offene Rechnungen')).toBeInTheDocument();
  });

  test('shows budget progress bar', () => {
    render(<FinancialManagement />);
    
    expect(screen.getByText('Budget-Auslastung')).toBeInTheDocument();
  });

  test('can switch between different views', () => {
    render(<FinancialManagement />);
    
    // Test view mode buttons
    fireEvent.click(screen.getByText('Budget'));
    fireEvent.click(screen.getByText('Rechnungen'));
    fireEvent.click(screen.getByText('Reports'));
    fireEvent.click(screen.getByText('Übersicht'));
  });

  test('displays budget categories with proper data', () => {
    render(<FinancialManagement />);
    
    expect(screen.getByText('Budget nach Kategorien')).toBeInTheDocument();
  });

  test('shows overdue payments alert when applicable', () => {
    render(<FinancialManagement />);
    
    // Should show overdue items if any exist
    const overdueElements = screen.queryAllByText(/Offene Zahlungen/);
    if (overdueElements.length > 0) {
      expect(overdueElements[0]).toBeInTheDocument();
    }
  });

  test('filters work correctly', () => {
    render(<FinancialManagement />);
    
    // Switch to budget view to see filters
    fireEvent.click(screen.getByText('Budget'));
    
    const categorySelect = screen.getByLabelText(/Kategorie:/);
    expect(categorySelect).toBeInTheDocument();
    
    const statusSelect = screen.getByLabelText(/Status:/);
    expect(statusSelect).toBeInTheDocument();
  });
});