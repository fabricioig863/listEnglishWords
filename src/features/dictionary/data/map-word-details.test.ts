import { dictionaryResponseSchema, type DictionaryResponseDto } from './dictionary-api-schema';
import { mapWordDetails } from './map-word-details';

const HELLO_RESPONSE: DictionaryResponseDto = [
  {
    word: 'hello',
    phonetics: [
      { audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3' },
      {
        text: '/həˈləʊ/',
        audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/hello-uk.mp3',
      },
      { text: '/həˈloʊ/', audio: '' },
    ],
    meanings: [
      {
        partOfSpeech: 'interjection',
        definitions: [{ definition: 'A greeting.', example: 'Hello, everyone.' }],
      },
    ],
  },
];

const SET_RESPONSE: DictionaryResponseDto = [
  {
    word: 'set',
    phonetic: '/sɛt/',
    phonetics: [{ text: '/sɛt/', audio: 'https://example.com/set-us.mp3' }],
    meanings: [{ partOfSpeech: 'verb', definitions: [{ definition: 'To put something down.' }] }],
  },
  {
    word: 'set',
    phonetic: '/sɛt/',
    phonetics: [],
    meanings: [
      { partOfSpeech: 'noun', definitions: [{ definition: 'A collection of things.' }] },
      { partOfSpeech: 'verb', definitions: [{ definition: 'To fix firmly.' }] },
    ],
  },
];

describe('mapWordDetails', () => {
  it('splits phonetic texts and audios, deriving the accent from the URL', () => {
    const details = mapWordDetails(HELLO_RESPONSE);

    expect(details.phonetics).toEqual([
      { text: '/həˈləʊ/', accent: 'UK' },
      { text: '/həˈloʊ/', accent: null },
    ]);
    expect(details.audios).toEqual([
      { url: 'https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3', accent: 'AU' },
      { url: 'https://api.dictionaryapi.dev/media/pronunciations/en/hello-uk.mp3', accent: 'UK' },
    ]);
  });

  it('merges the same part of speech across entries, preserving order', () => {
    const details = mapWordDetails(SET_RESPONSE);

    expect(details.meanings.map((meaning) => meaning.partOfSpeech)).toEqual(['verb', 'noun']);
    expect(details.meanings[0].definitions.map((definition) => definition.text)).toEqual([
      'To put something down.',
      'To fix firmly.',
    ]);
  });

  it('deduplicates phonetics repeated across entries', () => {
    const details = mapWordDetails(SET_RESPONSE);

    expect(details.phonetics).toEqual([{ text: '/sɛt/', accent: 'US' }]);
  });

  it('represents a missing example as null', () => {
    const details = mapWordDetails(SET_RESPONSE);

    expect(details.meanings[0].definitions[0].example).toBeNull();
  });

  it('falls back to the entry phonetic when phonetics have no text', () => {
    const details = mapWordDetails([
      { word: 'test', phonetic: '/tɛst/', phonetics: [], meanings: [] },
    ]);

    expect(details.phonetics).toEqual([{ text: '/tɛst/', accent: null }]);
  });
});

describe('dictionaryResponseSchema', () => {
  it('accepts a response without optional fields', () => {
    const result = dictionaryResponseSchema.safeParse([
      {
        word: 'test',
        meanings: [{ partOfSpeech: 'noun', definitions: [{ definition: 'A trial.' }] }],
      },
    ]);

    expect(result.success).toBe(true);
    expect(result.data?.[0].phonetics).toEqual([]);
  });

  it.each([
    ['the 404 body', { title: 'No Definitions Found' }],
    ['an empty array', []],
    ['an entry without meanings', [{ word: 'test' }]],
  ])('rejects %s', (_, payload) => {
    expect(dictionaryResponseSchema.safeParse(payload).success).toBe(false);
  });
});
