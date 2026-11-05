import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';

import { WordNavigationFooter } from '@/features/dictionary/components/word-navigation-footer';
import { isDictionaryError } from '@/features/dictionary/domain/dictionary-error';
import type { WordDetails } from '@/features/dictionary/domain/word-details';
import { useWordDetails } from '@/features/dictionary/hooks/use-word-details';
import { WordDetailsScreen } from '@/features/dictionary/screens/word-details-screen';
import { FavoriteButton } from '@/features/library/components/favorite-button';
import type { WordSnapshot } from '@/features/library/domain/library';
import { useRecordView } from '@/features/library/hooks/use-history';
import { useNextWord } from '@/features/words/hooks/use-next-word';

function toWordSnapshot(
  word: string,
  details: WordDetails | undefined,
  error: unknown,
): WordSnapshot | null {
  if (details) {
    const firstMeaning = details.meanings[0];

    return {
      word,
      phonetic: details.phonetics[0]?.text ?? null,
      partOfSpeech: firstMeaning?.partOfSpeech ?? null,
      firstDefinition: firstMeaning?.definitions[0]?.text ?? null,
      hasDefinition: details.meanings.length > 0,
    };
  }

  if (isDictionaryError(error) && error.kind === 'not-found') {
    return {
      word,
      phonetic: null,
      partOfSpeech: null,
      firstDefinition: null,
      hasDefinition: false,
    };
  }

  return null;
}

export default function WordDetailsRoute() {
  const router = useRouter();
  const { word = '', q = '' } = useLocalSearchParams<{ word: string; q?: string }>();
  const { data: nextWord } = useNextWord(word, q);
  const { data: details, error } = useWordDetails(word);
  const snapshot = useMemo(() => toWordSnapshot(word, details, error), [word, details, error]);

  useRecordView(snapshot);

  function goToNextWord() {
    if (nextWord) {
      router.replace({ pathname: '/word/[word]', params: { word: nextWord, q } });
    }
  }

  return (
    <WordDetailsScreen
      key={word}
      word={word}
      headerAction={<FavoriteButton snapshot={snapshot} />}
      footer={
        <WordNavigationFooter
          onBack={() => router.back()}
          onNext={goToNextWord}
          isNextDisabled={!nextWord}
        />
      }
    />
  );
}
