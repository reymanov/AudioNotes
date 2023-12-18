import { useEffect, useState } from "react";
import { AVPlaybackStatus, Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import { Recording } from "../types/Recording";

export const useAudioPlayback = (recording: Recording) => {
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [sound, setSound] = useState<Sound>();

  async function onPlaybackStatusUpdate(newStatus: AVPlaybackStatus) {
    setStatus(newStatus);

    if (newStatus.isLoaded && newStatus.didJustFinish) {
      await sound?.pauseAsync();
      await sound?.setPositionAsync(0);
    }
  }

  async function loadSound() {
    const { sound } = await Audio.Sound.createAsync(
      { uri: recording.uri },
      { progressUpdateIntervalMillis: 1000 / 60 },
      onPlaybackStatusUpdate
    );
    setSound(sound);
  }

  async function playSound() {
    if (!sound) return;
    await sound.replayAsync();
  }

  async function pauseSound() {
    if (!sound) return;
    await sound.pauseAsync();
  }

  useEffect(() => {
    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [recording]);

  const isPlaying = status?.isLoaded ? status.isPlaying : false;

  return {
    status,
    isPlaying,
    playSound,
    pauseSound,
  };
};
