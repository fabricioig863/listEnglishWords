import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';

import { useAccountMenu } from '@/features/auth/hooks/use-account-menu';
import { AppHeader } from '@/shared/ui/app-header';
import { Box } from '@/shared/ui/box';
import { Screen } from '@/shared/ui/screen';
import { SegmentedTab } from '@/shared/ui/segmented-tab';

export default function TabsLayout() {
  const openAccountMenu = useAccountMenu();

  return (
    <Screen>
      <Tabs>
        <Box paddingHorizontal="screen" paddingTop="s" gap="m">
          <AppHeader onPressAccount={openAccountMenu} />
        </Box>

        <TabList asChild>
          <Box
            flexDirection="row"
            marginTop="m"
            marginHorizontal="screen"
            padding="xs"
            gap="xs"
            borderRadius="m"
            bg="segmentedBackground"
          >
            <TabTrigger name="index" href="/" asChild>
              <SegmentedTab label="Palavras" />
            </TabTrigger>
            <TabTrigger name="history" href="/history" asChild>
              <SegmentedTab label="Histórico" />
            </TabTrigger>
            <TabTrigger name="favorites" href="/favorites" asChild>
              <SegmentedTab label="Favoritos" />
            </TabTrigger>
          </Box>
        </TabList>

        <TabSlot />
      </Tabs>
    </Screen>
  );
}
