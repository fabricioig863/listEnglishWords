import { useLocalSearchParams } from 'expo-router';

import { WordDetailsScreen } from '@/features/dictionary/screens/word-details-screen';

export default function WordDetailsRoute() {
  const { word = '' } = useLocalSearchParams<{ word: string }>();

  return <WordDetailsScreen word={word} />;
}
