import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '@/test-utils/render';

import type { Meaning } from '../domain/word-details';

import { MeaningsSection } from './meanings-section';

const MEANINGS: Meaning[] = [
  {
    partOfSpeech: 'interjection',
    definitions: [{ text: 'A greeting.', example: 'Hello, everyone.' }],
  },
  {
    partOfSpeech: 'noun',
    definitions: [{ text: '"Hello!" or an equivalent greeting.', example: null }],
  },
];

describe('MeaningsSection', () => {
  it('mostra a quantidade de classes e a primeira classe selecionada', async () => {
    await renderWithProviders(<MeaningsSection meanings={MEANINGS} />);

    expect(screen.getByText('2 classes')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'interjection', selected: true })).toBeOnTheScreen();
    expect(screen.getByText('A greeting.')).toBeOnTheScreen();
    expect(screen.getByText('“Hello, everyone.”')).toBeOnTheScreen();
  });

  it('troca as definições ao selecionar outra classe', async () => {
    await renderWithProviders(<MeaningsSection meanings={MEANINGS} />);

    await fireEvent.press(screen.getByRole('tab', { name: 'noun' }));

    expect(screen.getByRole('tab', { name: 'noun', selected: true })).toBeOnTheScreen();
    expect(screen.getByText('"Hello!" or an equivalent greeting.')).toBeOnTheScreen();
    expect(screen.queryByText('A greeting.')).not.toBeOnTheScreen();
  });

  it('usa o singular quando há uma única classe', async () => {
    await renderWithProviders(<MeaningsSection meanings={[MEANINGS[0]]} />);

    expect(screen.getByText('1 classe')).toBeOnTheScreen();
  });

  it('avisa quando não há significados', async () => {
    await renderWithProviders(<MeaningsSection meanings={[]} />);

    expect(
      screen.getByText('O dicionário não trouxe significados para esta palavra.'),
    ).toBeOnTheScreen();
  });
});
