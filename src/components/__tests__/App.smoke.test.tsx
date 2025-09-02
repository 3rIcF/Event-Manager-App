import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../App';

// Render the whole app and assert on a stable heading
test('renders app layout header', () => {
  render(<App />);
  expect(screen.getByText('Event Manager App')).toBeInTheDocument();
});
