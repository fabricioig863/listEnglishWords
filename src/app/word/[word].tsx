import { useLocalSearchParams, useRouter } from 'expo-router';

import { WordNavigationFooter } from '@/features/dictionary/components/word-navigation-footer';
import { WordDetailsScreen } from '@/features/dictionary/screens/word-details-screen';
import { useNextWord } from '@/features/words/hooks/use-next-word';

export default function WordDetailsRoute() {
  const router = useRouter();
  const { word = '', q = '' } = useLocalSearchParams<{ word: string; q?: string }>();
  const { data: nextWord } = useNextWord(word, q);

  function goToNextWord() {
    if (nextWord) {
      router.replace({ pathname: '/word/[word]', params: { word: nextWord, q } });
    }
  }

  return (
    <WordDetailsScreen
      key={word}
      word={word}
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
