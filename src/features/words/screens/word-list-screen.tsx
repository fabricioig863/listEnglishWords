import { useRouter } from 'expo-router';
import { SearchX, TriangleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { Box } from '@/shared/ui/box';
import { SearchInput } from '@/shared/ui/search-input';
import { StateMessage } from '@/shared/ui/state-message';
import { Text } from '@/shared/ui/text';

import { WordGrid } from '../components/word-grid';
import { normalizePrefix } from '../domain/search-prefix';
import { useWordList } from '../hooks/use-word-list';

const SEARCH_DEBOUNCE_MS = 300;

export function WordListScreen() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedTerm = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS);
  const searchPrefix = normalizePrefix(debouncedTerm);

  const {
    data: words = [],
    isPending,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useWordList(debouncedTerm);

  function handleEndReached() {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }

  function handlePressWord(word: string) {
    router.push({
      pathname: '/word/[word]',
      params: searchPrefix ? { word, q: searchPrefix } : { word },
    });
  }

  function renderContent() {
    if (isPending) {
      return (
        <Box flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator accessibilityLabel="Carregando palavras" />
        </Box>
      );
    }

    if (isError) {
      return (
        <StateMessage
          icon={TriangleAlert}
          title="Não foi possível carregar as palavras"
          primaryAction={{ label: 'Tentar novamente', onPress: () => refetch() }}
        />
      );
    }

    if (words.length === 0) {
      return (
        <StateMessage
          icon={SearchX}
          title="Nenhuma palavra encontrada"
          description={searchPrefix ? `Nenhuma palavra começa com “${searchPrefix}”.` : undefined}
        />
      );
    }

    return (
      <WordGrid
        words={words}
        isFetchingNextPage={isFetchingNextPage}
        onEndReached={handleEndReached}
        onPressWord={handlePressWord}
      />
    );
  }

  return (
    <Box flex={1}>
      <Box paddingHorizontal="screen" paddingTop="m" gap="m">
        <SearchInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Buscar palavra em inglês"
        />
        {searchPrefix ? <Text variant="labelStrong">Resultados para “{searchPrefix}”</Text> : null}
      </Box>

      <Box flex={1} marginTop="m">
        {renderContent()}
      </Box>
    </Box>
  );
}
