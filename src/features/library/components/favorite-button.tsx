import { Heart } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { Box } from '@/shared/ui/box';
import { Icon } from '@/shared/ui/icon';

import type { WordSnapshot } from '../domain/library';
import { useIsFavorite, useToggleFavorite } from '../hooks/use-favorites';

export function FavoriteButton({ snapshot }: { snapshot: WordSnapshot | null }) {
  const isFavorite = useIsFavorite(snapshot?.word ?? '');
  const toggleFavorite = useToggleFavorite();

  return (
    <Pressable
      disabled={!snapshot}
      onPress={() => snapshot && toggleFavorite.mutate({ snapshot, isFavorite })}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      accessibilityState={{ selected: isFavorite, disabled: !snapshot }}
    >
      <Box
        width={44}
        height={44}
        borderRadius="pill"
        borderWidth={1}
        borderColor={isFavorite ? 'favoriteBorder' : 'border'}
        bg={isFavorite ? 'favoriteSoft' : 'surface'}
        alignItems="center"
        justifyContent="center"
        opacity={snapshot ? 1 : 0.4}
      >
        <Icon icon={Heart} color={isFavorite ? 'favorite' : 'text'} filled={isFavorite} />
      </Box>
    </Pressable>
  );
}
