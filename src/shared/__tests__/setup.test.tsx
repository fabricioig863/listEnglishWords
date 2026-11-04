import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

describe('ambiente de testes', () => {
  it('renderiza um componente React Native', async () => {
    await render(<Text>Olá, Jest</Text>);

    expect(screen.getByText('Olá, Jest')).toBeOnTheScreen();
  });
});
