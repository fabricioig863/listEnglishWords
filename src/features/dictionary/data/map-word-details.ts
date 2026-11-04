import type { DictionaryResponseDto } from './dictionary-api-schema';
import type { Accent, Meaning, PhoneticText, WordAudio, WordDetails } from '../domain/word-details';

const ACCENT_IN_AUDIO_URL = /-(uk|us|au)\.mp3$/i;

function getAccentFromAudioUrl(url: string): Accent | null {
  const match = url.match(ACCENT_IN_AUDIO_URL);

  return match ? (match[1].toUpperCase() as Accent) : null;
}

export function mapWordDetails(entries: DictionaryResponseDto): WordDetails {
  const phonetics = new Map<string, PhoneticText>();
  const audios = new Map<string, WordAudio>();
  const meanings = new Map<string, Meaning>();

  for (const entry of entries) {
    for (const phonetic of entry.phonetics) {
      const audioUrl = phonetic.audio?.trim() || null;
      const accent = audioUrl ? getAccentFromAudioUrl(audioUrl) : null;
      const text = phonetic.text?.trim();

      if (text && !phonetics.has(text)) {
        phonetics.set(text, { text, accent });
      }

      if (audioUrl && !audios.has(audioUrl)) {
        audios.set(audioUrl, { url: audioUrl, accent });
      }
    }

    const entryPhonetic = entry.phonetic?.trim();
    if (entryPhonetic && !phonetics.has(entryPhonetic)) {
      phonetics.set(entryPhonetic, { text: entryPhonetic, accent: null });
    }

    for (const meaning of entry.meanings) {
      const group = meanings.get(meaning.partOfSpeech) ?? {
        partOfSpeech: meaning.partOfSpeech,
        definitions: [],
      };

      group.definitions.push(
        ...meaning.definitions.map((definition) => ({
          text: definition.definition,
          example: definition.example ?? null,
        })),
      );

      meanings.set(meaning.partOfSpeech, group);
    }
  }

  return {
    word: entries[0].word,
    phonetics: [...phonetics.values()],
    audios: [...audios.values()],
    meanings: [...meanings.values()],
  };
}
