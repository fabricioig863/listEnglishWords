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
  it('separa textos fonéticos e áudios, identificando o sotaque pela URL', () => {
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

  it('agrupa a mesma classe gramatical de entradas diferentes, preservando a ordem', () => {
    const details = mapWordDetails(SET_RESPONSE);

    expect(details.meanings.map((meaning) => meaning.partOfSpeech)).toEqual(['verb', 'noun']);
    expect(details.meanings[0].definitions.map((definition) => definition.text)).toEqual([
      'To put something down.',
      'To fix firmly.',
    ]);
  });

  it('deduplica a fonética repetida entre entradas', () => {
    const details = mapWordDetails(SET_RESPONSE);

    expect(details.phonetics).toEqual([{ text: '/sɛt/', accent: 'US' }]);
  });

  it('representa exemplo ausente como null', () => {
    const details = mapWordDetails(SET_RESPONSE);

    expect(details.meanings[0].definitions[0].example).toBeNull();
  });

  it('usa a fonética da entrada quando a lista de fonéticas não traz texto', () => {
    const details = mapWordDetails([
      { word: 'test', phonetic: '/tɛst/', phonetics: [], meanings: [] },
    ]);

    expect(details.phonetics).toEqual([{ text: '/tɛst/', accent: null }]);
  });
});

describe('dictionaryResponseSchema', () => {
  it('aceita resposta sem campos opcionais', () => {
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
    ['o corpo do 404', { title: 'No Definitions Found' }],
    ['um array vazio', []],
    ['uma entrada sem meanings', [{ word: 'test' }]],
  ])('rejeita %s', (_, payload) => {
    expect(dictionaryResponseSchema.safeParse(payload).success).toBe(false);
  });
});
