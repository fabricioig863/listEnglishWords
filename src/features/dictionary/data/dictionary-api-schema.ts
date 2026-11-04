import { z } from 'zod';

const phoneticSchema = z.object({
  text: z.string().optional(),
  audio: z.string().optional(),
});

const definitionSchema = z.object({
  definition: z.string(),
  example: z.string().optional(),
});

const meaningSchema = z.object({
  partOfSpeech: z.string(),
  definitions: z.array(definitionSchema),
});

const entrySchema = z.object({
  word: z.string(),
  phonetic: z.string().optional(),
  phonetics: z.array(phoneticSchema).default([]),
  meanings: z.array(meaningSchema),
});

export const dictionaryResponseSchema = z.array(entrySchema).min(1);

export type DictionaryResponseDto = z.infer<typeof dictionaryResponseSchema>;
