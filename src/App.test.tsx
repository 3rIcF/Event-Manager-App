import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
  });

  test('displays global dashboard by default', () => {
    render(<App />);
    const dashboardElement = screen.getByText(/Event Manager/i);
    expect(dashboardElement).toBeInTheDocument();
  });

  test('shows project wizard when new project button is clicked', () => {
    render(<App />);
    // Test wird erweitert sobald UI verfügbar ist
  });
});