import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import type { WordsRepository } from '@/features/words/domain/words-repository';
import { renderWithProviders } from '@/test-utils/render';

import { WordListScreen } from './word-list-screen';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

function renderScreen(listWords: jest.Mock) {
  const wordsRepository: WordsRepository = { listWords };

  return renderWithProviders(<WordListScreen />, { dependencies: { wordsRepository } });
}

describe('WordListScreen', () => {
  beforeEach(() => mockPush.mockClear());

  it('exibe as palavras da primeira página', async () => {
    await renderScreen(
      jest.fn().mockResolvedValue({ words: ['apple', 'azure'], nextCursor: null }),
    );

    expect(await screen.findByText('apple')).toBeOnTheScreen();
    expect(screen.getByText('azure')).toBeOnTheScreen();
  });

  it('navega para o detalhe ao tocar numa palavra', async () => {
    await renderScreen(jest.fn().mockResolvedValue({ words: ['apple'], nextCursor: null }));

    await fireEvent.press(await screen.findByRole('button', { name: 'apple' }));

    expect(mockPush).toHaveBeenCalledWith({ pathname: '/word/[word]', params: { word: 'apple' } });
  });

  it('permite tentar novamente após um erro', async () => {
    const listWords = jest
      .fn()
      .mockRejectedValueOnce(new Error('disk I/O error'))
      .mockResolvedValueOnce({ words: ['apple'], nextCursor: null });

    await renderScreen(listWords);
    await fireEvent.press(await screen.findByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('apple')).toBeOnTheScreen();
  });

  it('informa quando não há palavras', async () => {
    await renderScreen(jest.fn().mockResolvedValue({ words: [], nextCursor: null }));

    expect(await screen.findByText('Nenhuma palavra encontrada')).toBeOnTheScreen();
  });

  it('filtra a lista pelo termo digitado', async () => {
    const listWords = jest
      .fn()
      .mockResolvedValueOnce({ words: ['apple', 'hello'], nextCursor: null })
      .mockResolvedValueOnce({ words: ['hello'], nextCursor: null });

    await renderScreen(listWords);
    await screen.findByText('apple');

    await fireEvent.changeText(screen.getByLabelText('Buscar palavra em inglês'), 'HeL');

    expect(await screen.findByText('Resultados para “hel”')).toBeOnTheScreen();
    expect(listWords).toHaveBeenLastCalledWith(expect.objectContaining({ prefix: 'hel' }));
    await waitFor(() => expect(screen.queryByText('apple')).not.toBeOnTheScreen());
  });
});
