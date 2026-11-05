import { onlineManager } from '@tanstack/react-query';
import { cleanup, fireEvent, screen } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';

import { renderWithProviders } from '@/test-utils/render';

import { DictionaryError } from '../domain/dictionary-error';
import type { WordDetails } from '../domain/word-details';

import { WordDetailsScreen } from './word-details-screen';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));

const HELLO: WordDetails = {
  word: 'hello',
  phonetics: [{ text: '/həˈləʊ/', accent: 'UK' }],
  audios: [],
  meanings: [],
};

function renderScreen(word: string, getWordDetails: jest.Mock) {
  return renderWithProviders(<WordDetailsScreen word={word} />, {
    dependencies: { dictionaryRepository: { getWordDetails } },
  });
}

jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn() }));
jest.mock('expo-audio', () => ({
  setAudioModeAsync: jest.fn(),
  useAudioPlayer: jest.fn(() => ({ play: jest.fn(), pause: jest.fn(), seekTo: jest.fn() })),
  useAudioPlayerStatus: jest.fn(() => ({
    playing: false,
    currentTime: 0,
    duration: 0,
    didJustFinish: false,
  })),
}));

describe('WordDetailsScreen', () => {
  afterEach(async () => {
    await cleanup();
    onlineManager.setOnline(true);
  });

  it('mostra o esqueleto enquanto os significados carregam', async () => {
    await renderScreen(
      'hello',
      jest.fn(() => new Promise(() => {})),
    );

    expect(screen.getByTestId('meanings-skeleton')).toBeOnTheScreen();
    expect(screen.getByText('Buscando significados…')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'hello' })).toBeOnTheScreen();
  });

  it('avisa que está offline e não mostra o esqueleto', async () => {
    onlineManager.setOnline(false);
    const getWordDetails = jest.fn();

    await renderScreen('hello', getWordDetails);

    expect(await screen.findByText('Você está offline')).toBeOnTheScreen();
    expect(screen.queryByTestId('meanings-skeleton')).not.toBeOnTheScreen();
    expect(getWordDetails).not.toHaveBeenCalled();
  });

  it('mostra a palavra e a fonética com o sotaque', async () => {
    await renderScreen('hello', jest.fn().mockResolvedValue(HELLO));

    expect(await screen.findByText('/həˈləʊ/')).toBeOnTheScreen();
    expect(screen.getByText('UK')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'hello' })).toBeOnTheScreen();
  });

  it('informa a ausência de definição sem oferecer nova tentativa', async () => {
    await renderScreen('aalii', jest.fn().mockRejectedValue(new DictionaryError('not-found')));

    expect(await screen.findByText('Sem definição para esta palavra')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Pesquisar no Wiktionary' }));

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://en.wiktionary.org/wiki/aalii',
    );
  });

  it('permite tentar novamente após erro do servidor', async () => {
    const getWordDetails = jest.fn().mockRejectedValue(new DictionaryError('server'));
    await renderScreen('hello', getWordDetails);

    const retryButton = await screen.findByRole('button', { name: 'Tentar novamente' });
    getWordDetails.mockResolvedValue(HELLO);
    await fireEvent.press(retryButton);

    expect(await screen.findByText('/həˈləʊ/')).toBeOnTheScreen();
  });
});
