import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils/render';

import { WordNavigationFooter } from './word-navigation-footer';

describe('WordNavigationFooter', () => {
  it('aciona voltar e próximo', async () => {
    const onBack = jest.fn();
    const onNext = jest.fn();
    await renderWithProviders(
      <WordNavigationFooter onBack={onBack} onNext={onNext} isNextDisabled={false} />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Próximo' }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('desabilita o próximo no fim da lista', async () => {
    const onNext = jest.fn();
    await renderWithProviders(
      <WordNavigationFooter onBack={jest.fn()} onNext={onNext} isNextDisabled />,
    );

    const nextButton = screen.getByRole('button', { name: 'Próximo' });
    await fireEvent.press(nextButton);

    expect(nextButton).toBeDisabled();
    expect(onNext).not.toHaveBeenCalled();
  });
});
