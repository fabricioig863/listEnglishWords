import { CloudOff, SearchX, TriangleAlert, WifiOff, type LucideIcon } from 'lucide-react-native';

import { isDictionaryError, type DictionaryErrorKind } from '../domain/dictionary-error';

export type ErrorContent = {
  icon: LucideIcon;
  title: string;
  description: string;
  canRetry: boolean;
  showWiktionary: boolean;
};

export function getErrorContent(error: unknown, word: string): ErrorContent {
  const kind: DictionaryErrorKind | 'unknown' = isDictionaryError(error) ? error.kind : 'unknown';

  switch (kind) {
    case 'not-found':
      return {
        icon: SearchX,
        title: 'Sem definição para esta palavra',
        description: `“${word}” está na lista, mas o dicionário ainda não tem significados para ela. Isso é comum em palavras raras ou antigas.`,
        canRetry: false,
        showWiktionary: true,
      };
    case 'server':
      return {
        icon: CloudOff,
        title: 'O dicionário não respondeu',
        description: `O serviço de definições está instável para “${word}”. Tente novamente ou consulte o Wiktionary.`,
        canRetry: true,
        showWiktionary: true,
      };
    case 'network':
    case 'timeout':
      return {
        icon: WifiOff,
        title: 'Sem conexão',
        description: 'Verifique sua internet e tente novamente.',
        canRetry: true,
        showWiktionary: false,
      };
    case 'invalid-response':
    case 'unknown':
      return {
        icon: TriangleAlert,
        title: 'Não foi possível carregar a palavra',
        description: 'Recebemos uma resposta inesperada do dicionário.',
        canRetry: true,
        showWiktionary: true,
      };
  }
}
