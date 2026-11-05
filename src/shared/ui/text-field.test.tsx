import { fireEvent, screen } from '@testing-library/react-native';
import { Lock, Mail } from 'lucide-react-native';

import { renderWithProviders } from '@/test-utils/render';

import { TextField } from './text-field';

describe('TextField', () => {
  it('shows and hides the password', async () => {
    await renderWithProviders(<TextField label="Senha" icon={Lock} isPassword value="secret1" />);

    const input = screen.getByLabelText('Senha');
    expect(input).toHaveProp('secureTextEntry', true);

    await fireEvent.press(screen.getByRole('button', { name: 'Mostrar senha' }));

    expect(input).toHaveProp('secureTextEntry', false);
    expect(screen.getByRole('button', { name: 'Ocultar senha' })).toBeOnTheScreen();
  });

  it('renders the error as an accessible alert instead of the hint', async () => {
    await renderWithProviders(
      <TextField label="E-mail" icon={Mail} hint="Use seu e-mail" error="E-mail inválido." />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('E-mail inválido.');
    expect(screen.queryByText('Use seu e-mail')).not.toBeOnTheScreen();
  });
});
