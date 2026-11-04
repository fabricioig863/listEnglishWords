import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '../test-utils/render';
import { Text } from '../ui/text';

describe('ambiente de testes', () => {
  it('renderiza um componente React Native', async () => {
    await renderWithProviders(<Text>Olá, Jest</Text>);
    expect(screen.getByText('Olá, Jest')).toBeOnTheScreen();
  });

  it('expõe um QueryClient isolado por teste', async () => {
    const { queryClient } = await renderWithProviders(<Text>Olá, Jest</Text>);
    expect(queryClient.getQueryData(['key'])).toBeUndefined();
  });
});
