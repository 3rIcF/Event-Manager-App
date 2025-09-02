import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GlobalDashboard } from '../GlobalDashboard';
import { AppProvider } from '../AppContext';

function renderWithProvider(ui: React.ReactElement) {
  return render(<AppProvider>{ui}</AppProvider>);
}

describe('GlobalDashboard', () => {
  it('shows welcome header and new project button', () => {
    const onNewProject = jest.fn();
    renderWithProvider(<GlobalDashboard onNewProject={onNewProject} />);
    expect(screen.getByText('Willkommen im Event Manager')).toBeInTheDocument();
    const button = screen.getAllByText('Neues Projekt')[0];
    fireEvent.click(button);
    expect(onNewProject).toHaveBeenCalled();
  });
});
