import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Speech from 'expo-speech';
import { Pause, Play } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable } from 'react-native';

import { Box } from '@/shared/ui/box';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

import { formatSeconds, pickAudio } from '../domain/pronunciation';
import type { WordAudio } from '../domain/word-details';

const AUDIO_LOAD_TIMEOUT_MS = 6000;

type PlayerLayoutProps = {
  label: string;
  isPlaying: boolean;
  onToggle: () => void;
  progress?: number;
  time?: string;
  isDisabled?: boolean;
};

function PlayerLayout({
  label,
  isPlaying,
  onToggle,
  progress,
  time,
  isDisabled = false,
}: PlayerLayoutProps) {
  return (
    <Box
      bg="background"
      borderRadius="l"
      padding="s"
      flexDirection="row"
      alignItems="center"
      gap="m"
    >
      <Pressable
        onPress={onToggle}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pausar pronúncia' : 'Ouvir pronúncia'}
        accessibilityState={{ disabled: isDisabled }}
      >
        <Box
          width={48}
          height={48}
          borderRadius="pill"
          bg="accent"
          alignItems="center"
          justifyContent="center"
          opacity={isDisabled ? 0.5 : 1}
        >
          <Icon icon={isPlaying ? Pause : Play} color="onAccent" filled />
        </Box>
      </Pressable>

      <Box flex={1} gap="s">
        <Box flexDirection="row" justifyContent="space-between">
          <Text variant="overline">{label}</Text>
          {time ? <Text variant="overline">{time}</Text> : null}
        </Box>
        {progress !== undefined ? (
          <Box height={4} borderRadius="pill" bg="progressTrack" overflow="hidden">
            <Box
              height={4}
              borderRadius="pill"
              bg="accent"
              width={`${Math.round(progress * 100)}%`}
            />
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

type AudioFilePlayerProps = {
  audio: WordAudio;
  onUnavailable: () => void;
};

function AudioFilePlayer({ audio, onUnavailable }: AudioFilePlayerProps) {
  const player = useAudioPlayer(audio.url);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true });
  }, []);

  useEffect(() => {
    if (status.isLoaded) {
      return;
    }

    const timeoutId = setTimeout(onUnavailable, AUDIO_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timeoutId);
  }, [status.isLoaded, onUnavailable]);

  const hasDuration = status.duration > 0;
  const hasFinished =
    status.didJustFinish || (hasDuration && status.currentTime >= status.duration);

  function toggle() {
    if (status.playing) {
      player.pause();
      return;
    }

    if (hasFinished) {
      player.seekTo(0);
    }
    player.play();
  }

  return (
    <PlayerLayout
      label={audio.accent ? `Pronúncia · ${audio.accent}` : 'Pronúncia'}
      isPlaying={status.playing}
      onToggle={toggle}
      isDisabled={!status.isLoaded}
      progress={hasDuration ? status.currentTime / status.duration : 0}
      time={
        status.isLoaded
          ? `${formatSeconds(status.currentTime)} / ${formatSeconds(status.duration)}`
          : 'Carregando…'
      }
    />
  );
}

function SpeechPlayer({ word }: { word: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(
    () => () => {
      Speech.stop();
    },
    [],
  );

  function toggle() {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    Speech.speak(word, {
      language: 'en-US',
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }

  return (
    <PlayerLayout label="Pronúncia · voz sintetizada" isPlaying={isSpeaking} onToggle={toggle} />
  );
}

export function PronunciationPlayer({ word, audios }: { word: string; audios: WordAudio[] }) {
  const audio = pickAudio(audios);
  const [isFileUnavailable, setIsFileUnavailable] = useState(false);
  const markFileUnavailable = useCallback(() => setIsFileUnavailable(true), []);

  if (!audio || isFileUnavailable) {
    return <SpeechPlayer word={word} />;
  }

  return <AudioFilePlayer key={audio.url} audio={audio} onUnavailable={markFileUnavailable} />;
}
