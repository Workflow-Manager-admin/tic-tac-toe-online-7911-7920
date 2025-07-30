import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders tic tac toe game status', () => {
  render(<App />);
  // Should show status bar for Player X's turn
  expect(screen.getByText(/Turn: Player X/i)).toBeInTheDocument();
});
