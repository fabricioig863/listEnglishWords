import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ArrowLeft, ExternalLink } from 'lucide-react-native';
import { ActivityIndicator, ScrollView } from 'react-native';

import type { Theme } from '@/shared/theme/theme';
import { Box } from '@/shared/ui/box';
import { Card } from '@/shared/ui/card';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { StateMessage } from '@/shared/ui/state-message';
import { Text } from '@/shared/ui/text';

import { HighlightedWord } from '../components/highlighted-word';
import { MeaningsSection } from '../components/meanings-section';
import { PhoneticChips } from '../components/phonetic-chips';
import { useWordDetails } from '../hooks/use-word-details';

import { getErrorContent } from './get-error-content';

type WordDetailsScreenProps = {
  word: string;
};

export function WordDetailsScreen({ word }: WordDetailsScreenProps) {
  const router = useRouter();
  const { spacing } = useTheme<Theme>();
  const { data, error, isError, isFetching, refetch } = useWordDetails(word);

  function openWiktionary() {
    WebBrowser.openBrowserAsync(`https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`);
  }

  function renderBody() {
    if (isError) {
      const content = getErrorContent(error, word);

      return (
        <StateMessage
          icon={content.icon}
          title={content.title}
          description={content.description}
          primaryAction={
            content.canRetry ? { label: 'Tentar novamente', onPress: () => refetch() } : undefined
          }
          secondaryAction={
            content.showWiktionary
              ? { label: 'Pesquisar no Wiktionary', icon: ExternalLink, onPress: openWiktionary }
              : undefined
          }
        />
      );
    }

    return data ? <MeaningsSection meanings={data.meanings} /> : null;
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Box flex={1} paddingHorizontal="screen" paddingTop="s">
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <IconButton
            icon={ArrowLeft}
            accessibilityLabel="Voltar para a lista"
            onPress={() => router.back()}
          />
          {isFetching ? (
            <Box flexDirection="row" alignItems="center" gap="s" accessibilityRole="progressbar">
              <ActivityIndicator size="small" />
              <Text variant="overline">Buscando significados…</Text>
            </Box>
          ) : null}
          <Box width={44} />
        </Box>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: spacing.l,
            paddingBottom: spacing.xl,
            gap: spacing.xl,
          }}
        >
          <Card>
            <HighlightedWord word={data?.word ?? word} />
            {data ? <PhoneticChips phonetics={data.phonetics} /> : null}
          </Card>

          {renderBody()}
        </ScrollView>
      </Box>
    </Screen>
  );
}
