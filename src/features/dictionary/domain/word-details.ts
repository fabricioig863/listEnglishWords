export type Accent = 'UK' | 'US' | 'AU';

export type PhoneticText = {
  text: string;
  accent: Accent | null;
};

export type WordAudio = {
  url: string;
  accent: Accent | null;
};

export type Definition = {
  text: string;
  example: string | null;
};

export type Meaning = {
  partOfSpeech: string;
  definitions: Definition[];
};

export type WordDetails = {
  word: string;
  phonetics: PhoneticText[];
  audios: WordAudio[];
  meanings: Meaning[];
};
