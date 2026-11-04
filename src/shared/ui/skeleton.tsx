import type { DimensionValue } from 'react-native';

import type { Theme } from '@/shared/theme/theme';

import { Box } from './box';

type SkeletonProps = {
  width: DimensionValue;
  height: number;
  radius?: keyof Theme['borderRadii'];
  tone?: 'strong' | 'soft';
};

export function Skeleton({ width, height, radius = 'pill', tone = 'strong' }: SkeletonProps) {
  return (
    <Box
      width={width}
      height={height}
      borderRadius={radius}
      bg={tone === 'strong' ? 'skeleton' : 'skeletonSoft'}
    />
  );
}
