import { useRouter } from 'expo-router';
import { SearchX, TriangleAlert } from 'lucide-react-native';
import { ActivityIndicator } from 'react-native';

import { Box } from '@/shared/ui/box';
import { StateMessage } from '@/shared/ui/state-message';

import { WordGrid } from '../components/word-grid';
import { useWordList } from '../hooks/use-word-list';

export function WordListScreen() {
  const router = useRouter();
  const {
    data: words = [],
    isPending,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useWordList();

  function handleEndReached() {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }

  function handlePressWord(word: string) {
    router.push({ pathname: '/word/[word]', params: { word } });
  }

  if (isPending) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center">
        <ActivityIndicator accessibilityLabel="Carregando palavras" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box flex={1}>
        <StateMessage
          icon={TriangleAlert}
          title="Não foi possível carregar as palavras"
          actionLabel="Tentar novamente"
          onAction={() => refetch()}
        />
      </Box>
    );
  }

  if (words.length === 0) {
    return (
      <Box flex={1}>
        <StateMessage icon={SearchX} title="Nenhuma palavra encontrada" />
      </Box>
    );
  }

  return (
    <Box flex={1}>
      <WordGrid
        words={words}
        isFetchingNextPage={isFetchingNextPage}
        onEndReached={handleEndReached}
        onPressWord={handlePressWord}
      />
    </Box>
  );
}
